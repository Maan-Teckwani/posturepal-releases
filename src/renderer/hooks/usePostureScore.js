import { useState, useEffect, useRef } from 'react';

const DEBUG = false;

function getKeypoint(keypoints, name) {
  return keypoints.find(kp => kp.name === name);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const usePostureScore = (keypoints, videoWidth, videoHeight) => {
  const [baseline, setBaseline] = useState(null);
  const [score, setScore] = useState(null);
  const [signals, setSignals] = useState(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const scoreHistory = useRef([]);
  const HISTORY_SIZE = 4;

  useEffect(() => {
    let isMounted = true;
    const loadCalibration = async () => {
      if (window.api) {
        const savedBaseline = await window.api.getData('calibration');
        if (savedBaseline && isMounted) {
          setBaseline(savedBaseline);
          setIsCalibrated(true);
        }
      }
    };
    loadCalibration();
    return () => { isMounted = false; };
  }, []);

  const calculateRatios = (kps, vWidth) => {
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
      neckRatio: (shoulderMid.y - earMid.y) / shoulderWidth, // Actually unused in new logic if we rely only on ears for tilt, but keeping it as requested for shoulders
      faceToFrameRatio: faceWidth / vWidth,
      distanceRatioB: eyeDist / shoulderWidth
    };
  };

  useEffect(() => {
    if (!keypoints || !baseline || !videoWidth) {
      setScore(null);
      setSignals(null);
      return;
    }
    
    const currentRatios = calculateRatios(keypoints, videoWidth);
    if (!currentRatios) {
      setScore(null);
      setSignals(null);
      return;
    }
    
    // Signal 1: Distance
    const distanceDeltaA = currentRatios.faceToFrameRatio - baseline.faceToFrameRatio;
    const distanceDeltaB = currentRatios.distanceRatioB - baseline.distanceRatioB;
    const tooClose = distanceDeltaA > 0.06 || distanceDeltaB > 0.07;
    const tooFar = distanceDeltaA < -0.08 && distanceDeltaB < -0.06;
    const distanceBad = tooClose;
    
    // Signal 2A: Head Forward
    const headForwardDelta = Math.abs(currentRatios.headForwardRatio - baseline.headForwardRatio);
    const headForwardBad = headForwardDelta > 0.09;

    // Signal 2B: Head Down
    const headDownDelta = baseline.noseToShoulderRatio - currentRatios.noseToShoulderRatio;
    const headDownBad = headDownDelta > 0.10;

    // Signal 2C: Head Tilt
    const baseline_earTiltDelta = baseline.earTiltDelta || 0;
    const headTiltBad = (currentRatios.earTiltDelta - baseline_earTiltDelta) > 0.06;

    // Signal 3: Shoulders (Neck Ratio)
    const neckDelta = baseline.neckRatio - currentRatios.neckRatio;
    const shouldersBad = neckDelta > 0.13;

    if (DEBUG) {
      window.__postureDebug = { 
        ratios: currentRatios, 
        baseline, 
        deltas: { distanceDeltaA, distanceDeltaB, headForwardDelta, headDownDelta, earTiltDelta: currentRatios.earTiltDelta, neckDelta } 
      };
    }

    const headForwardScore = Math.max(0, 100 - (headForwardDelta / 0.09) * 25);
    const headDownScore    = Math.max(0, 100 - (headDownDelta    / 0.10) * 30);
    const headTiltScore    = Math.max(0, 100 - (headTiltBad ? 20 : 0));
    const shouldersScore   = Math.max(0, 100 - (neckDelta        / 0.13) * 25);
    const distanceScore    = Math.max(0, 100 - (distanceBad ? 30 : 0));

    const rawScore = Math.round(
      headForwardScore * 0.20 +
      headDownScore    * 0.30 +
      headTiltScore    * 0.10 +
      shouldersScore   * 0.20 +
      distanceScore    * 0.20
    );

    scoreHistory.current.push(rawScore);
    if (scoreHistory.current.length > HISTORY_SIZE) {
      scoreHistory.current.shift();
    }
    const smoothedScore = Math.round(
      scoreHistory.current.reduce((a, b) => a + b, 0) / scoreHistory.current.length
    );

    setScore(smoothedScore);
    setSignals({
      headForward: { ok: !headForwardBad, delta: headForwardDelta },
      headDown:    { ok: !headDownBad,    delta: headDownDelta },
      headTilt:    { ok: !headTiltBad,    delta: currentRatios.earTiltDelta },
      shoulders:   { ok: !shouldersBad,   delta: neckDelta },
      distance:    { ok: !distanceBad,    tooClose, tooFar, deltaA: distanceDeltaA, deltaB: distanceDeltaB }
    });
  }, [keypoints, baseline, videoWidth]);

  const calibrate = (kps, vWidth) => {
    const required = ['nose','left_eye','right_eye','left_ear','right_ear','left_shoulder','right_shoulder'];
    const allVisible = required.every(name => {
      const kp = kps.find(k => k.name === name);
      return kp && kp.score > 0.35;
    });

    if (!allVisible) {
      return { success: false, message: 'Move closer to the camera or improve lighting — shoulders must be visible.' };
    }

    const ratios = calculateRatios(kps, vWidth);
    if (ratios) {
      setBaseline(ratios);
      setIsCalibrated(true);
      scoreHistory.current = []; // reset history
      if (window.api) {
        window.api.setData('calibration', ratios);
      }
      return { success: true };
    }
    return { success: false, message: 'Failed to compute calibration baseline.' };
  };

  return { 
    score, 
    signals, 
    calibrate, 
    isCalibrated, 
    baseline 
  };
};
