import { useState, useEffect, useRef } from 'react';

async function acquireStream(cameraId) {
  // If a specific deviceId is selected, request it via `exact` so the browser
  // doesn't silently fall back to a different camera. If that device is no
  // longer plugged in we surface the OverconstrainedError and retry with the
  // system default, which keeps the app usable when the chosen webcam vanishes.
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

export const useWebcam = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        let cameraId = null;
        if (window.api) {
          const s = await window.api.getData('settings');
          if (s && s.cameraId) cameraId = s.cameraId;
        }
        const stream = await acquireStream(cameraId);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!cancelled) setIsReady(true);
          };
        }
      } catch (err) {
        if (!cancelled) setError("Camera permission denied or device not found: " + err.message);
      }
    };

    setIsReady(false);
    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [version]);

  useEffect(() => {
    if (!window.api || !window.api.onCameraChanged) return;
    window.api.onCameraChanged(() => setVersion(v => v + 1));
  }, []);

  return { videoRef, isReady, error };
};
