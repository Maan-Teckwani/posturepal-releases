import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

export const usePoseDetector = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const detectorRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        await tf.ready();
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        };
        const detector = await poseDetection.createDetector(model, detectorConfig);
        
        if (isMounted) {
          detectorRef.current = detector;
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load MoveNet model:", err);
      }
    };

    loadModel();

    return () => {
      isMounted = false;
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  const detectPose = async (videoElement) => {
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
      console.error("Error during pose detection:", err);
    }
    return null;
  };

  return { detectPose, isLoaded };
};
