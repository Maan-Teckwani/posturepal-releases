import React, { createContext, useContext, useEffect, useState } from 'react';

/*
 * Single-pipeline architecture: pose detection runs only in the hidden
 * background window. This context subscribes to keypoints over IPC so the
 * Dashboard can render the skeleton overlay without loading TensorFlow.js into
 * the main window's renderer (which previously cost ~250 MB of duplicate
 * model + WebGL context). isReady flips true on the first keypoint payload.
 */
const PoseDetectorContext = createContext({ keypoints: null, videoSize: null, isReady: false });

export const PoseDetectorProvider = ({ children }) => {
  const [keypoints, setKeypoints] = useState(null);
  const [videoSize, setVideoSize] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!window.api || !window.api.onKeypointsUpdate) return;
    window.api.onKeypointsUpdate((data) => {
      if (!data) return;
      setKeypoints(data.keypoints || null);
      if (data.videoWidth && data.videoHeight) {
        setVideoSize({ width: data.videoWidth, height: data.videoHeight });
      }
      if (!isReady) setIsReady(true);
    });
  }, []);

  return (
    <PoseDetectorContext.Provider value={{ keypoints, videoSize, isReady }}>
      {children}
    </PoseDetectorContext.Provider>
  );
};

export const usePoseDetector = () => useContext(PoseDetectorContext);
