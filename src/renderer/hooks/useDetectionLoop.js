import { useState, useEffect, useRef } from 'react';

export const useDetectionLoop = ({ videoRef, detectPose, isLoaded, isReady, onScore }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const onScoreRef = useRef(onScore);
  const detectPoseRef = useRef(detectPose);
  
  useEffect(() => {
    onScoreRef.current = onScore;
    detectPoseRef.current = detectPose;
  }, [onScore, detectPose]);

  useEffect(() => {
    let intervalId = null;

    const tick = async () => {
      if (!videoRef.current || !isLoaded || !isReady || isPaused) return;
      
      const keypoints = await detectPoseRef.current(videoRef.current);
      if (keypoints) {
        onScoreRef.current(keypoints);
      }
    };

    if (isLoaded && isReady && !isPaused) {
      setIsRunning(true);
      intervalId = setInterval(tick, 500);
    } else {
      setIsRunning(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [videoRef, isLoaded, isReady, isPaused]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  return { isRunning: isRunning && !isPaused, pause, resume };
};
