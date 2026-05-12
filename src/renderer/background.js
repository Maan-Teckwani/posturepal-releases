import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

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
  alertsFired: 0
};

let goodMinutes = 0;
let lastRecordedScore = null;
let recordingIntervalId = null;
let saveIntervalId = null;

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
    faceToFrameRatio: faceWidth / vWidth,
    distanceRatioB: eyeDist / shoulderWidth
  };
}

let scoreHistory = [];
const HISTORY_SIZE = 4;

function scorePosture(keypoints, videoWidth) {
  if (!keypoints || !baseline || !videoWidth) return { score: null, signals: null };
  const currentRatios = calculateRatios(keypoints, videoWidth);
  if (!currentRatios) return { score: null, signals: null };
  
  const distanceDeltaA = currentRatios.faceToFrameRatio - baseline.faceToFrameRatio;
  const distanceDeltaB = currentRatios.distanceRatioB - baseline.distanceRatioB;
  const tooClose = distanceDeltaA > 0.06 || distanceDeltaB > 0.07;
  const tooFar = distanceDeltaA < -0.08 && distanceDeltaB < -0.06;
  const distanceBad = tooClose;
  
  const headForwardDelta = Math.abs(currentRatios.headForwardRatio - baseline.headForwardRatio);
  const headForwardBad = headForwardDelta > 0.09;

  const headDownDelta = baseline.noseToShoulderRatio - currentRatios.noseToShoulderRatio;
  const headDownBad = headDownDelta > 0.10;

  const baseline_earTiltDelta = baseline.earTiltDelta || 0;
  const headTiltBad = (currentRatios.earTiltDelta - baseline_earTiltDelta) > 0.06;

  const neckDelta = baseline.neckRatio - currentRatios.neckRatio;
  const shouldersBad = neckDelta > 0.08;

  const headForwardScore = Math.min(100, Math.max(0, 100 - (headForwardDelta / 0.09) * 25));
  const headDownScore    = Math.min(100, Math.max(0, 100 - (headDownDelta    / 0.10) * 30));
  const headTiltScore    = Math.min(100, Math.max(0, 100 - (headTiltBad ? 20 : 0)));
  const shouldersScore   = Math.min(100, Math.max(0, 100 - (neckDelta        / 0.08) * 25));
  const distanceScore    = Math.min(100, Math.max(0, 100 - (distanceBad ? 30 : 0)));

  const rawScore = Math.round(
    headForwardScore * 0.20 +
    headDownScore    * 0.30 +
    headTiltScore    * 0.10 +
    shouldersScore   * 0.20 +
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
      shoulders:   { ok: !shouldersBad,   delta: neckDelta },
      distance:    { ok: !distanceBad,    tooClose, tooFar, deltaA: distanceDeltaA, deltaB: distanceDeltaB }
    }
  };
}

function startSessionRecording() {
  if (recordingIntervalId) clearInterval(recordingIntervalId);
  recordingIntervalId = setInterval(() => {
    if (lastRecordedScore !== null && !isPaused) {
      currentSession.scores.push({ timestamp: Date.now(), score: lastRecordedScore });
      if (lastRecordedScore >= settings.threshold) {
        currentSession.goodSeconds += 30;
        goodMinutes += 0.5;
        if (goodMinutes >= 1) {
          if (window.api && window.api.addXP) window.api.addXP(10);
          goodMinutes = 0;
        }
      } else {
        currentSession.badSeconds += 30;
      }
    }
  }, 30000);

  if (saveIntervalId) clearInterval(saveIntervalId);
  saveIntervalId = setInterval(() => {
    if (window.api && window.api.saveSession) {
      window.api.saveSession(currentSession);
    }
  }, 60000);
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
      return;
    }

    const { score, signals } = scorePosture(poses[0].keypoints, videoElement.videoWidth);
    lastRecordedScore = score;
    if (window.api) window.api.sendScore({ score, signals, isCalibrated: true, alertActive, cooldownActive });

    if (score === null) return;

    const allGood = signals.headForward.ok && 
                    signals.headDown.ok && 
                    signals.headTilt.ok && 
                    signals.shoulders.ok && 
                    signals.distance.ok;

    if (!alertActive) {
      if (score < settings.threshold) {
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
          if (window.api.addXP) window.api.addXP(25);
        }
      } else {
        goodMs = 0;
      }
    }
  }, 500);
}

async function startBackground() {
  videoElement = document.getElementById('video');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videoElement.srcObject = stream;
    await new Promise(resolve => videoElement.onloadedmetadata = resolve);
    videoElement.play();
  } catch (err) {
    console.error('Background webcam error:', err);
    return;
  }

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

    window.api.onAppQuitting(() => {
      if (window.api.saveSession) window.api.saveSession(currentSession);
    });
  }

  startSessionRecording();
  runDetection();
}

startBackground();
