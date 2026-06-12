import { useState, useEffect, useRef, useCallback } from 'react';

// MoveNet Lightning consumes a 192x192 input, so 640x480 @ 15fps is plenty for
// accurate landmarks. Constraining drops the camera's default 1280x720@30fps
// (~110 MB/s pixel bandwidth) to ~28 MB/s, which materially shrinks the video
// element's backing-store memory and decoding work in this renderer.
const VIDEO_CONSTRAINTS = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  frameRate: { ideal: 15, max: 15 }
};

async function acquireStream(cameraId) {
  // If a specific deviceId is selected, request it via `exact` so the browser
  // doesn't silently fall back to a different camera. If that device is no
  // longer plugged in we surface the OverconstrainedError and retry with the
  // system default, which keeps the app usable when the chosen webcam vanishes.
  if (cameraId) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cameraId }, ...VIDEO_CONSTRAINTS },
        audio: false
      });
    } catch (err) {
      if (err && err.name === 'OverconstrainedError') {
        return await navigator.mediaDevices.getUserMedia({ video: { ...VIDEO_CONSTRAINTS }, audio: false });
      }
      throw err;
    }
  }
  return await navigator.mediaDevices.getUserMedia({ video: { ...VIDEO_CONSTRAINTS }, audio: false });
}

export const useWebcam = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  // 'unknown' | 'not-determined' | 'granted' | 'denied' | 'restricted'
  // Drives the Dashboard permission UI on macOS.
  const [permissionState, setPermissionState] = useState('unknown');
  const [version, setVersion] = useState(0);

  const requestPermission = useCallback(async () => {
    if (!window.api?.requestCameraAccess) return true;
    const granted = await window.api.requestCameraAccess();
    setPermissionState(granted ? 'granted' : 'denied');
    if (granted) setVersion(v => v + 1);
    return granted;
  }, []);

  const openSystemSettings = useCallback(() => {
    if (window.api?.openCameraSystemSettings) window.api.openCameraSystemSettings();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        // macOS gate: getUserMedia silently fails on macOS until the OS-level
        // camera entitlement is granted. Check status first, and if the user
        // has never been asked, trigger the system dialog now so they have a
        // chance to allow access from inside our app.
        if (window.api?.getCameraAccessStatus) {
          const status = await window.api.getCameraAccessStatus();
          if (cancelled) return;
          setPermissionState(status);
          if (status === 'not-determined') {
            const granted = await window.api.requestCameraAccess();
            if (cancelled) return;
            setPermissionState(granted ? 'granted' : 'denied');
            if (!granted) return;
          } else if (status === 'denied' || status === 'restricted') {
            return;
          }
        }

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
        if (cancelled) return;
        // NotAllowedError == user blocked the OS dialog; reflect that in
        // permissionState so the UI shows the "Open System Settings" path.
        if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
          setPermissionState('denied');
        }
        setError("Camera permission denied or device not found: " + err.message);
      }
    };

    setIsReady(false);
    setError(null);
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

  return { videoRef, isReady, error, permissionState, requestPermission, openSystemSettings };
};
