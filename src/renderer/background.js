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

function calculateRatios(kps) {
  if (!kps) return null;
  const nose = getKeypoint(kps, 'nose');
  const leftEar = getKeypoint(kps, 'left_ear');
  const rightEar = getKeypoint(kps, 'right_ear');
  const leftEye = getKeypoint(kps, 'left_eye');
  const rightEye = getKeypoint(kps, 'right_eye');
  const leftShoulder = getKeypoint(kps, 'left_shoulder');
  const rightShoulder = getKeypoint(kps, 'right_shoulder');

  if (!nose || !leftEar || !rightEar || !leftEye || !rightEye || !leftShoulder || !rightShoulder) return null;

  const minConfidence = 0.3;
  if (nose.score < minConfidence || leftEar.score < minConfidence || rightEar.score < minConfidence || 
      leftEye.score < minConfidence || rightEye.score < minConfidence || 
      leftShoulder.score < minConfidence || rightShoulder.score < minConfidence) {
    return null;
  }

  const earMid = midpoint(leftEar, rightEar);
  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const shoulderWidth = dist(leftShoulder, rightShoulder);
  const eyeDistance = dist(leftEye, rightEye);

  if (shoulderWidth === 0) return null;

  return {
    headForwardRatio: (earMid.x - shoulderMid.x) / shoulderWidth,
    neckRatio: (shoulderMid.y - earMid.y) / shoulderWidth,
    distanceRatio: eyeDistance / shoulderWidth
  };
}

function scorePosture(keypoints) {
  if (!keypoints || !baseline) return { score: null, signals: null };
  const currentRatios = calculateRatios(keypoints);
  if (!currentRatios) return { score: null, signals: null };
  
  const headDelta = Math.abs(currentRatios.headForwardRatio - baseline.headForwardRatio);
  const neckDelta = baseline.neckRatio - currentRatios.neckRatio;
  const distanceDelta = currentRatios.distanceRatio - baseline.distanceRatio;

  const headOk = headDelta <= 0.08;
  const shouldersOk = neckDelta <= 0.08;
  const tooClose = distanceDelta > 0.10;
  const tooFar = distanceDelta < -0.15;
  const distanceOk = !tooClose && !tooFar;

  const headScore = Math.max(0, Math.min(100, 100 - (headDelta / 0.08) * 40));
  const neckScore = Math.max(0, Math.min(100, 100 - (neckDelta / 0.08) * 40));
  const distanceScore = Math.max(0, Math.min(100, 100 - (distanceDelta / 0.10) * 20));

  const finalScore = Math.round((headScore * 0.4) + (neckScore * 0.4) + (distanceScore * 0.2));

  return {
    score: finalScore,
    signals: {
      head: { ok: headOk, delta: headDelta },
      shoulders: { ok: shouldersOk, delta: neckDelta },
      distance: { ok: distanceOk, delta: distanceDelta, tooClose, tooFar }
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

    const { score, signals } = scorePosture(poses[0].keypoints);
    lastRecordedScore = score;
    if (window.api) window.api.sendScore({ score, signals, isCalibrated: true, alertActive, cooldownActive });

    if (score === null) return;

    if (score < settings.threshold) {
      goodMs = 0;
      if (!cooldownActive && !alertActive) {
        badMs += 500;
      }
      
      const alertDelayMs = (settings.alertDelay || 3) * 1000;
      if (badMs >= alertDelayMs && !alertActive && !cooldownActive) {
        alertActive = true;
        currentSession.alertsFired += 1;
        if (window.api) window.api.showAlert({ score, signals });
        
        cooldownActive = true;
        setTimeout(() => {
          cooldownActive = false;
        }, (settings.cooldown || 60) * 1000);
      } else if (alertActive) {
        if (window.api) window.api.showAlert({ score, signals });
      }
    } else {
      badMs = 0;
      if (alertActive) {
        goodMs += 500;
        if (window.api) window.api.showAlert({ score, signals });
        if (goodMs >= 3000) {
          if (window.api) window.api.hideAlert();
          alertActive = false;
          goodMs = 0;
          if (window.api.addXP) window.api.addXP(25);
        }
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
