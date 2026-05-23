import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

/*
 * Loads the MoveNet model exactly once and keeps it alive for the entire
 * lifetime of the app. Previously the model lived inside the Dashboard
 * component, so navigating to Analytics/Leaderboard/Settings unmounted the
 * Dashboard and disposed the detector — forcing a slow "Loading AI model..."
 * reload every time the user came back. The provider sits above the screen
 * router and never unmounts, so the model loads a single time.
 */
const PoseDetectorContext = createContext({ detectPose: async () => null, isLoaded: false });

export const PoseDetectorProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const detectorRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        await tf.ready();
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true
          }
        );
        if (isMounted) {
          detectorRef.current = detector;
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load MoveNet model:', err);
      }
    };

    loadModel();

    // Intentionally no detector.dispose() here — the model is meant to persist
    // for the whole session. The provider only unmounts when the app closes.
    return () => {
      isMounted = false;
    };
  }, []);

  const detectPose = useCallback(async (videoElement) => {
    if (!detectorRef.current || !videoElement) return null;
    try {
      const poses = await detectorRef.current.estimatePoses(videoElement, {
        maxPoses: 1,
        flipHorizontal: false
      });
      if (poses.length > 0) {
        return poses[0].keypoints;
      }
    } catch (err) {
      console.error('Error during pose detection:', err);
    }
    return null;
  }, []);

  return (
    <PoseDetectorContext.Provider value={{ detectPose, isLoaded }}>
      {children}
    </PoseDetectorContext.Provider>
  );
};

export const usePoseDetector = () => useContext(PoseDetectorContext);
