import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { syncLeaderboard } from './leaderboardSync';

let baseline = null;
let settings = { threshold: 60, alertDelay: 3, cooldown: 60 };

let alertActive = false;
let badMs = 0;
let goodMs = 0;
let cooldownActive = false;
let intervalId = null;
let detector = null;
let videoElement = null;

let isPaused = false;
let currentSession = {
  id: Date.now(),
  startTime: Date.now(),
  scores: [],
  goodSeconds: 0,
  badSeconds: 0,
  alertsFired: 0,
  xpEarned: 0
};

// Per-minute XP aggregation state
let minuteScoreSum = 0;
let minuteTickCount = 0;
let goodStreakMinutes = 0;

const GOOD_POSTURE_SCORE = 70; // score at/above which a minute counts toward a streak

let lastRecordedScore = null;
let lastRecordedSignals = null;
let recordingIntervalId = null;
let saveIntervalId = null;
let leaderboardIntervalId = null;

function getKeypoint(keypoints, name) {
  return keypoints.find(kp => kp.name === name);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calculateRatios(kps, vWidth) {
  if (!kps || !vWidth) return null;
  const nose = getKeypoint(kps, 'nose');
  const leftEar = getKeypoint(kps, 'left_ear');
  const rightEar = getKeypoint(kps, 'right_ear');
  const leftEye = getKeypoint(kps, 'left_eye');
  const rightEye = getKeypoint(kps, 'right_eye');
  const leftShoulder = getKeypoint(kps, 'left_shoulder');
  const rightShoulder = getKeypoint(kps, 'right_shoulder');

  if (!nose || !leftEar || !rightEar || !leftEye || !rightEye || !leftShoulder || !rightShoulder) return null;

  const earMid = midpoint(leftEar, rightEar);
  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const shoulderWidth = dist(leftShoulder, rightShoulder);
  const eyeDist = dist(leftEye, rightEye);
  const faceWidth = dist(leftEar, rightEar);

  if (shoulderWidth === 0 || vWidth === 0) return null;

  return {
    headForwardRatio: (shoulderMid.x - earMid.x) / shoulderWidth,
    noseToShoulderRatio: (shoulderMid.y - nose.y) / shoulderWidth,
    earTiltDelta: Math.abs(leftEar.y - rightEar.y) / shoulderWidth,
    neckRatio: (shoulderMid.y - earMid.y) / shoulderWidth,
    shoulderTiltDelta: Math.abs(leftShoulder.y - rightShoulder.y) / shoulderWidth,
    faceToFrameRatio: faceWidth / vWidth,
    distanceRatioB: eyeDist / shoulderWidth
  };
}

let scoreHistory = [];
const HISTORY_SIZE = 8;

// Per-signal rolling window of raw bad/good flags. A signal only flips to
// ok=false once at least HYSTERESIS_BAD of the last HYSTERESIS_WINDOW frames
// were bad, which prevents a single noisy detection from triggering an alert.
const HYSTERESIS_WINDOW = 5;
const HYSTERESIS_BAD = 3;
const rawSignalHistory = {
  headForward: [],
  headDown: [],
  headTilt: [],
  shoulders: [],
  distance: []
};
function pushSignal(name, raw) {
  const arr = rawSignalHistory[name];
  arr.push(raw);
  if (arr.length > HYSTERESIS_WINDOW) arr.shift();
  const badCount = arr.reduce((n, b) => n + (b ? 1 : 0), 0);
  return badCount >= HYSTERESIS_BAD;
}

function scorePosture(keypoints, videoWidth) {
  if (!keypoints || !baseline || !videoWidth) return { score: null, signals: null };
  const currentRatios = calculateRatios(keypoints, videoWidth);
  if (!currentRatios) return { score: null, signals: null };

  const distanceDeltaA = currentRatios.faceToFrameRatio - baseline.faceToFrameRatio;
  const distanceDeltaB = currentRatios.distanceRatioB - baseline.distanceRatioB;
  const tooClose = distanceDeltaA > 0.06 || distanceDeltaB > 0.07;
  const tooFar = distanceDeltaA < -0.08 && distanceDeltaB < -0.06;
  const distanceRawBad = tooClose;

  const headForwardDelta = Math.abs(currentRatios.headForwardRatio - baseline.headForwardRatio);
  const headForwardRawBad = headForwardDelta > 0.09;

  const headDownDelta = baseline.noseToShoulderRatio - currentRatios.noseToShoulderRatio;
  const headDownRawBad = headDownDelta > 0.10;

  // Slightly looser than the old 0.06 cutoff — natural side-glances shouldn't fire.
  const baseline_earTiltDelta = baseline.earTiltDelta || 0;
  const headTiltRawBad = (currentRatios.earTiltDelta - baseline_earTiltDelta) > 0.08;

  // Shoulders: slouch-down fires at 0.15 (was 0.05); tilt fires at 0.12 (was 0.04).
  // Older calibration baselines lack shoulderTiltDelta — fall back to 0.
  const neckDelta = baseline.neckRatio - currentRatios.neckRatio;
  const shoulderDropBad = neckDelta > 0.125;
  const baseline_shoulderTilt = baseline.shoulderTiltDelta || 0;
  const shoulderTiltDelta = currentRatios.shoulderTiltDelta - baseline_shoulderTilt;
  const shoulderTiltBad = shoulderTiltDelta > 0.10;
  const shouldersRawBad = shoulderDropBad || shoulderTiltBad;

  // Hysteresis: only flip signals once raw bad has persisted across frames.
  const headForwardBad = pushSignal('headForward', headForwardRawBad);
  const headDownBad    = pushSignal('headDown',    headDownRawBad);
  const headTiltBad    = pushSignal('headTilt',    headTiltRawBad);
  const shouldersBad   = pushSignal('shoulders',   shouldersRawBad);
  const distanceBad    = pushSignal('distance',    distanceRawBad);

  const headForwardScore = Math.min(100, Math.max(0, 100 - (headForwardDelta / 0.09) * 25));
  const headDownScore    = Math.min(100, Math.max(0, 100 - (headDownDelta    / 0.10) * 30));
  const headTiltScore    = Math.min(100, Math.max(0, 100 - (headTiltBad ? 20 : 0)));
  // Score uses the worse of the two shoulder checks so the displayed score
  // reflects whichever issue is bigger.
  const shoulderDropScore = Math.min(100, Math.max(0, 100 - (neckDelta / 0.125) * 25));
  const shoulderTiltScore = Math.min(100, Math.max(0, 100 - (shoulderTiltDelta / 0.10) * 25));
  const shouldersScore   = Math.min(shoulderDropScore, shoulderTiltScore);
  const distanceScore    = Math.min(100, Math.max(0, 100 - (distanceBad ? 30 : 0)));

  const rawScore = Math.round(
    headForwardScore * 0.20 +
    headDownScore    * 0.25 +
    headTiltScore    * 0.10 +
    shouldersScore   * 0.25 +
    distanceScore    * 0.20
  );

  scoreHistory.push(rawScore);
  if (scoreHistory.length > HISTORY_SIZE) {
    scoreHistory.shift();
  }
  const smoothedScore = Math.round(scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length);

  return {
    score: smoothedScore,
    signals: {
      headForward: { ok: !headForwardBad, delta: headForwardDelta },
      headDown:    { ok: !headDownBad,    delta: headDownDelta },
      headTilt:    { ok: !headTiltBad,    delta: currentRatios.earTiltDelta },
      shoulders:   { ok: !shouldersBad,   delta: Math.max(neckDelta, shoulderTiltDelta), drop: neckDelta, tilt: shoulderTiltDelta },
      distance:    { ok: !distanceBad,    tooClose, tooFar, deltaA: distanceDeltaA, deltaB: distanceDeltaB }
    }
  };
}

// Awards XP and keeps a running tally on the current session for analytics.
function awardXP(amount) {
  if (!amount || amount <= 0) return;
  currentSession.xpEarned = (currentSession.xpEarned || 0) + amount;
  if (window.api && window.api.addXP) window.api.addXP(amount);
}

/*
 * XP metric (v2): posture quality is evaluated once per minute of active use.
 *  - Base XP scales linearly with the minute's average score (0 -> 0, 100 -> 10).
 *  - A streak bonus rewards sustained good posture: every consecutive minute at
 *    or above GOOD_POSTURE_SCORE adds an extra point, capped at +15/min.
 *  - Recovery bonuses (awarded elsewhere) reward fixing posture after an alert.
 * This makes XP a meaningful evaluation of how well — and how consistently —
 * the user holds good posture, rather than a flat reward for time spent.
 */
function awardMinuteXP(avgScore) {
  let xp = Math.round(avgScore / 10);
  if (avgScore >= GOOD_POSTURE_SCORE) {
    goodStreakMinutes += 1;
    xp += Math.min(goodStreakMinutes, 15);
  } else {
    goodStreakMinutes = 0;
  }
  awardXP(xp);
}

function startSessionRecording() {
  if (recordingIntervalId) clearInterval(recordingIntervalId);
  recordingIntervalId = setInterval(() => {
    if (lastRecordedScore === null || isPaused) return;

    // Record which posture signals are currently failing for this data point.
    const issues = [];
    if (lastRecordedSignals) {
      if (!lastRecordedSignals.headForward.ok) issues.push('headForward');
      if (!lastRecordedSignals.headDown.ok)    issues.push('headDown');
      if (!lastRecordedSignals.headTilt.ok)    issues.push('headTilt');
      if (!lastRecordedSignals.shoulders.ok)   issues.push('shoulders');
      if (!lastRecordedSignals.distance.ok)    issues.push('distance');
    }
    currentSession.scores.push({ timestamp: Date.now(), score: lastRecordedScore, issues });

    if (lastRecordedScore >= settings.threshold) {
      currentSession.goodSeconds += 30;
    } else {
      currentSession.badSeconds += 30;
    }

    // Two 30s ticks make one minute — evaluate XP on each completed minute.
    minuteScoreSum += lastRecordedScore;
    minuteTickCount += 1;
    if (minuteTickCount >= 2) {
      awardMinuteXP(minuteScoreSum / minuteTickCount);
      minuteScoreSum = 0;
      minuteTickCount = 0;
    }
  }, 30000);

  if (saveIntervalId) clearInterval(saveIntervalId);
  saveIntervalId = setInterval(() => {
    if (window.api && window.api.saveSession) {
      window.api.saveSession(currentSession);
    }
  }, 60000);

  if (leaderboardIntervalId) clearInterval(leaderboardIntervalId);
  leaderboardIntervalId = setInterval(syncLeaderboard, 120000);
}

function runDetection() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(async () => {
    if (window.api) {
      const s = await window.api.getData('settings');
      if (s) settings = { ...settings, ...s };
    }

    if (!baseline) {
      if (window.api) window.api.sendScore({ score: null, signals: null, isCalibrated: false, alertActive, cooldownActive });
      return;
    }

    if (!detector || !videoElement) return;

    const poses = await detector.estimatePoses(videoElement, { maxPoses: 1, flipHorizontal: false });
    if (poses.length === 0) {
      if (window.api) window.api.sendScore({ score: null, signals: null, isCalibrated: true, alertActive, cooldownActive });
      if (window.api && window.api.sendKeypoints) {
        window.api.sendKeypoints({ keypoints: null, videoWidth: videoElement.videoWidth, videoHeight: videoElement.videoHeight });
      }
      return;
    }

    const keypoints = poses[0].keypoints;
    const { score, signals } = scorePosture(keypoints, videoElement.videoWidth);
    lastRecordedScore = score;
    lastRecordedSignals = signals;
    if (window.api) window.api.sendScore({ score, signals, isCalibrated: true, alertActive, cooldownActive });
    if (window.api && window.api.sendKeypoints) {
      window.api.sendKeypoints({ keypoints, videoWidth: videoElement.videoWidth, videoHeight: videoElement.videoHeight });
    }

    if (score === null) return;

    const allGood = signals.headForward.ok && 
                    signals.headDown.ok && 
                    signals.headTilt.ok && 
                    signals.shoulders.ok && 
                    signals.distance.ok;

    // Alerts now fire on per-signal state: any signal red for alertDelay seconds
    // triggers an alert. The overall score is only used for analytics/XP.
    if (!alertActive) {
      if (!allGood) {
        badMs += 500;
        const alertDelayMs = (settings.alertDelay || 3) * 1000;

        if (badMs >= alertDelayMs && !cooldownActive) {
          alertActive = true;
          currentSession.alertsFired += 1;
          if (window.api) window.api.showAlert({ score, signals });

          cooldownActive = true;
          setTimeout(() => {
            cooldownActive = false;
          }, (settings.cooldown || 60) * 1000);
        }
      } else {
        badMs = 0;
      }
    } else {
      // Alert is currently active
      if (window.api) window.api.showAlert({ score, signals });

      if (allGood) {
        goodMs += 500;
        if (goodMs >= 3000) {
          if (window.api) window.api.hideAlert();
          alertActive = false;
          goodMs = 0;
          badMs = 0;
          awardXP(20); // recovery bonus for correcting posture after an alert
        }
      } else {
        goodMs = 0;
      }
    }
  }, 500);
}

async function acquireVideoStream(cameraId) {
  if (cameraId) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cameraId } },
        audio: false
      });
    } catch (err) {
      if (err && err.name === 'OverconstrainedError') {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      throw err;
    }
  }
  return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
}

async function switchCamera(cameraId) {
  if (!videoElement) return;
  if (videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(t => t.stop());
    videoElement.srcObject = null;
  }
  try {
    const stream = await acquireVideoStream(cameraId);
    videoElement.srcObject = stream;
    await new Promise(resolve => videoElement.onloadedmetadata = resolve);
    videoElement.play();
  } catch (err) {
    console.error('Camera switch failed:', err);
  }
}

async function startBackground() {
  videoElement = document.getElementById('video');
  // On macOS the background window can boot before the user has granted camera
  // access via the Dashboard. Poll until the stream comes through instead of
  // giving up — once permission is granted, scoring kicks in automatically.
  let stream = null;
  while (!stream) {
    try {
      let cameraId = null;
      if (window.api) {
        const s = await window.api.getData('settings');
        if (s && s.cameraId) cameraId = s.cameraId;
      }
      stream = await acquireVideoStream(cameraId);
    } catch (err) {
      console.warn('Background webcam not ready, retrying:', err?.message || err);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  videoElement.srcObject = stream;
  await new Promise(resolve => videoElement.onloadedmetadata = resolve);
  videoElement.play();

  await tf.ready();
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true
  };
  detector = await poseDetection.createDetector(model, detectorConfig);

  if (window.api) {
    baseline = await window.api.getData('calibration');
    const savedSettings = await window.api.getData('settings');
    if (savedSettings) {
      settings = { ...settings, ...savedSettings };
    }

    window.api.onCalibrationUpdated((newBaseline) => {
      baseline = newBaseline;
    });

    if (window.api.onCameraChanged) {
      window.api.onCameraChanged((cameraId) => {
        switchCamera(cameraId);
      });
    }

    window.api.onDetectionToggle((paused) => {
      isPaused = paused;
      if (isPaused) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (alertActive) {
          window.api.hideAlert();
          alertActive = false;
          badMs = 0;
          goodMs = 0;
        }
        if (window.api.saveSession) window.api.saveSession(currentSession);
        window.api.sendScore({ score: null, signals: null, isCalibrated: true, alertActive: false, cooldownActive: false, isPaused: true });
      } else {
        runDetection();
      }
    });

    window.api.onAppQuitting(async () => {
      // Persist the final session and push the latest XP to the leaderboard
      // before the app exits, then tell the main process it is safe to quit.
      try {
        if (window.api.saveSession) await window.api.saveSession(currentSession);
        await syncLeaderboard();
      } catch (err) {
        console.error('Quit sync failed:', err);
      }
      if (window.api.quitReady) window.api.quitReady();
    });
  }

  startSessionRecording();
  runDetection();
  syncLeaderboard();
}

startBackground();
