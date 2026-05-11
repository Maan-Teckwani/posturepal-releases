import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { usePoseDetector } from '../hooks/usePoseDetector';

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

const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];

const Dashboard = () => {
  const { videoRef, isReady, error } = useWebcam();
  const { detectPose, isLoaded } = usePoseDetector();

  const [liveData, setLiveData] = useState({ score: null, signals: null, isCalibrated: false, alertActive: false, cooldownActive: false });
  const { score, signals, isCalibrated, alertActive, cooldownActive } = liveData;

  const canvasRef = useRef(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [cameraName, setCameraName] = useState('');
  
  const [userData, setUserData] = useState({ username: 'You', xp: 0, level: 1 });

  const [calibrationState, setCalibrationState] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const latestKeypointsRef = useRef(null);

  // Receive background scoring and pause state
  useEffect(() => {
    if (window.api) {
      if (window.api.onScoreUpdate) {
        window.api.onScoreUpdate(async (data) => {
          setLiveData(data);
          const xp = await window.api.getXP();
          if (xp) setUserData(prev => ({ ...prev, xp: xp.total, level: xp.level }));
        });
      }
      if (window.api.onDetectionToggle) {
        window.api.onDetectionToggle((pausedState) => {
          setIsPaused(pausedState);
        });
      }
    }
  }, []);

  // Load User Data
  useEffect(() => {
    const loadData = async () => {
      if (window.api) {
        let username = await window.api.getData('username');
        if (!username) username = 'You';
        const xp = await window.api.getXP();
        setUserData({
          username,
          xp: xp?.total || 0,
          level: xp?.level || 1
        });
      }
    };
    loadData();
  }, []);

  // Update camera name
  useEffect(() => {
    if (isReady && videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getVideoTracks();
      if (tracks.length > 0) {
        setCameraName(tracks[0].label);
      }
    }
  }, [isReady, videoRef]);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoSize({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
    }
  };

  const drawKeypoints = useCallback((keypoints) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const pointsToDraw = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear', 'left_shoulder', 'right_shoulder'];
    
    keypoints.forEach(kp => {
      if (pointsToDraw.includes(kp.name) && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  }, []);

  // Local detection loop solely for UI dot rendering
  useEffect(() => {
    let intervalId;
    if (isLoaded && isReady && !isPaused) {
      intervalId = setInterval(async () => {
        if (videoRef.current) {
          const kps = await detectPose(videoRef.current);
          if (kps) {
            latestKeypointsRef.current = kps;
            drawKeypoints(kps);
          }
        }
      }, 500); 
    } else {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded, isReady, isPaused, detectPose, drawKeypoints]);

  const startCalibration = () => {
    setCalibrationState('counting');
    setCountdown(3);
    
    let currentCount = 3;
    const interval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(interval);
        if (latestKeypointsRef.current) {
          const baseline = calculateRatios(latestKeypointsRef.current);
          if (baseline) {
            window.api.setData('calibration', baseline);
            window.api.notifyCalibration(baseline);
          }
        }
        setCalibrationState('calibrated');
        setTimeout(() => setCalibrationState('idle'), 2000);
      }
    }, 1000);
  };

  const handlePauseToggle = () => {
    if (window.api && window.api.pauseDetection) {
      window.api.pauseDetection();
    }
  };

  let alertMessage = '';
  if (isPaused) {
    // Hidden from top text, shown in overlay
  } else if (isCalibrated && signals && score !== null && score < 60) {
    const badSignals = [];
    if (!signals.head.ok) badSignals.push({ type: 'head', severity: signals.head.delta / 0.08 });
    if (!signals.shoulders.ok) badSignals.push({ type: 'shoulders', severity: signals.shoulders.delta / 0.08 });
    if (!signals.distance.ok) {
      const severity = signals.distance.tooClose ? signals.distance.delta / 0.10 : Math.abs(signals.distance.delta) / 0.15;
      badSignals.push({ type: 'distance', severity, tooClose: signals.distance.tooClose, tooFar: signals.distance.tooFar });
    }

    if (badSignals.length > 0) {
      badSignals.sort((a, b) => b.severity - a.severity);
      const worst = badSignals[0];
      
      if (worst.type === 'head') {
        alertMessage = "Lift your head up 👆";
      } else if (worst.type === 'shoulders') {
        alertMessage = "Relax your shoulders 💪";
      } else if (worst.type === 'distance') {
        if (worst.tooClose) alertMessage = "Move back from the screen 🖥️";
        else if (worst.tooFar) alertMessage = "Move closer to the screen";
      }
    } else {
      alertMessage = "Fix your posture! 🪑";
    }
  }

  const navigateToSettings = () => {
    const settingsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Settings');
    if (settingsBtn) settingsBtn.click();
  };

  const levelIndex = Math.max(0, Math.min(userData.level - 1, XP_THRESHOLDS.length - 1));
  const nextThreshold = XP_THRESHOLDS[levelIndex + 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];

  const scoreColor = (score !== null && score >= 60 && !isPaused) ? '#4caf50' : '#f44336';

  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'black', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
      
      {error && (
        <div style={{ position: 'absolute', top: '20px', zIndex: 10, color: '#f44336', backgroundColor: '#ffebee', padding: '15px', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {!isLoaded && !error && (
        <div style={{ position: 'absolute', top: '20px', zIndex: 10, color: '#61dafb', backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '8px' }}>
          Loading AI model...
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          onLoadedMetadata={handleVideoLoaded}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transform: 'scaleX(-1)'
          }} 
        />
        
        {videoSize.width > 0 && videoSize.height > 0 && (
          <canvas
            ref={canvasRef}
            width={videoSize.width}
            height={videoSize.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'scaleX(-1)',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none'
            }}
          />
        )}

        {isPaused && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0,0,0,0.7)', padding: '20px 40px', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
            Detection Paused
          </div>
        )}
      </div>

      {/* User info card (top left) */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'white', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 5 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffe0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
          🦐
        </div>
        <div>
          <div style={{ color: '#121212', fontWeight: 'bold', fontSize: '16px' }}>{userData.username}</div>
          <div style={{ color: '#7a7a7a', fontSize: '12px', marginBottom: '4px' }}>lvl {userData.level}</div>
          <div style={{ width: '100px', height: '6px', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(userData.xp / nextThreshold) * 100}%`, height: '100%', backgroundColor: '#4caf50' }} />
          </div>
          <div style={{ color: '#7a7a7a', fontSize: '10px', marginTop: '4px' }}>{userData.xp} / {nextThreshold} XP</div>
        </div>
      </div>

      {/* Posture breakdown panel (top right) */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'white', borderRadius: '12px', padding: '20px', width: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 5, color: '#121212' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
          <span>Head</span>
          <span>{(!isCalibrated || !signals || isPaused) ? '—' : (signals.head.ok ? '✅' : '❌')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
          <span>Shoulders</span>
          <span>{(!isCalibrated || !signals || isPaused) ? '—' : (signals.shoulders.ok ? '✅' : '❌')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
          <span>Screen distance</span>
          <span>
            {(!isCalibrated || !signals || isPaused) ? '—' : (
              signals.distance.ok ? 'Good ✅' : (signals.distance.tooClose ? 'Too close ❌' : 'Too far ❌')
            )}
          </span>
        </div>
        
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>SCORE:</span>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: isPaused ? '#888' : scoreColor }}>
            {(score !== null && !isPaused) ? score : '—'}
          </span>
        </div>

        {calibrationState === 'idle' && !isCalibrated && (
          <div style={{ fontSize: '12px', color: '#ff9800', textAlign: 'center', marginBottom: '10px', animation: 'pulse 1.5s infinite' }}>
            Sit up straight, then click Calibrate
          </div>
        )}
        
        {calibrationState === 'counting' && (
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2196f3', textAlign: 'center', marginBottom: '10px' }}>
            Calibrating in {countdown}...
          </div>
        )}

        {calibrationState === 'calibrated' && (
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4caf50', textAlign: 'center', marginBottom: '10px' }}>
            Calibrated ✓
          </div>
        )}

        <button 
          onClick={startCalibration}
          disabled={!isLoaded || !isReady || !latestKeypointsRef.current || calibrationState === 'counting' || isPaused}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'white',
            color: '#2196f3',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: (!isLoaded || !isReady || !latestKeypointsRef.current || calibrationState === 'counting' || isPaused) ? 'not-allowed' : 'pointer',
            opacity: (!isLoaded || !isReady || !latestKeypointsRef.current || calibrationState === 'counting' || isPaused) ? 0.5 : 1
          }}
        >
          {isCalibrated ? 'Recalibrate' : 'Calibrate'}
        </button>
      </div>

      {/* Alert text overlay */}
      {alertMessage && (
        <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '24px', fontWeight: 'bold', textShadow: '0px 2px 10px rgba(0,0,0,0.8)', zIndex: 5, textAlign: 'center', width: '100%' }}>
          {alertMessage}
        </div>
      )}

      {/* Status indicator */}
      {!isPaused && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
          {alertActive ? (
            <div style={{ backgroundColor: '#f44336', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>Alert active</div>
          ) : cooldownActive ? (
            <div style={{ backgroundColor: '#7a7a7a', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>Cooldown</div>
          ) : (
            <div style={{ backgroundColor: '#4caf50', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>Monitoring</div>
          )}
        </div>
      )}

      {/* Camera label (bottom left) */}
      {cameraName && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', zIndex: 5 }}>
          {cameraName}
        </div>
      )}

      {/* Bottom controls (bottom right) */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 5 }}>
        <button 
          onClick={handlePauseToggle}
          style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}
          title={isPaused ? "Resume Detection" : "Pause Detection"}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <button 
          onClick={navigateToSettings}
          style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
