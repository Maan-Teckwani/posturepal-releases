import { useState, useEffect } from 'react';

function getKeypoint(keypoints, name) {
  return keypoints.find(kp => kp.name === name);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const usePostureScore = (keypoints) => {
  const [baseline, setBaseline] = useState(null);
  const [score, setScore] = useState(null);
  const [signals, setSignals] = useState(null);
  const [isCalibrated, setIsCalibrated] = useState(false);

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

  const calculateRatios = (kps) => {
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
  };

  useEffect(() => {
    if (!keypoints || !baseline) {
      setScore(null);
      setSignals(null);
      return;
    }
    
    const currentRatios = calculateRatios(keypoints);
    if (!currentRatios) {
      setScore(null);
      setSignals(null);
      return;
    }
    
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

    setScore(finalScore);
    setSignals({
      head: { ok: headOk, delta: headDelta },
      shoulders: { ok: shouldersOk, delta: neckDelta },
      distance: { ok: distanceOk, delta: distanceDelta, tooClose, tooFar }
    });
  }, [keypoints, baseline]);

  const calibrate = (kps) => {
    const ratios = calculateRatios(kps);
    if (ratios) {
      setBaseline(ratios);
      setIsCalibrated(true);
      if (window.api) {
        window.api.setData('calibration', ratios);
      }
    }
  };

  return { 
    score, 
    signals, 
    calibrate, 
    isCalibrated, 
    baseline 
  };
};
