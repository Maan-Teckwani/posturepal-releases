import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { usePoseDetector } from '../contexts/PoseDetectorContext';

function getKeypoint(keypoints, name) {
  return keypoints.find(kp => kp.name === name);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calculateRatios(kps, vWidth) {
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
    neckRatio: (shoulderMid.y - earMid.y) / shoulderWidth,
    shoulderTiltDelta: Math.abs(leftShoulder.y - rightShoulder.y) / shoulderWidth,
    faceToFrameRatio: faceWidth / vWidth,
    distanceRatioB: eyeDist / shoulderWidth
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
  const [trialInfo, setTrialInfo] = useState(null);

  const [calibrationState, setCalibrationState] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const latestKeypointsRef = useRef(null);
  const signalsRef = useRef(null);
  const isCalibratedRef = useRef(false);

  useEffect(() => { signalsRef.current = signals; }, [signals]);
  useEffect(() => { isCalibratedRef.current = isCalibrated; }, [isCalibrated]);

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
      if (window.api.onXPUpdate) {
        window.api.onXPUpdate((xp) => {
          setUserData(prev => ({ ...prev, xp: xp.total, level: xp.level }));
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

  // Trial countdown: read status on mount and refresh every 30 minutes.
  useEffect(() => {
    if (!window.api?.trialStatus) return;
    let cancelled = false;
    const tick = async () => {
      const info = await window.api.trialStatus();
      if (!cancelled) setTrialInfo(info);
    };
    tick();
    const t = setInterval(tick, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const trialBadgeText = (() => {
    if (!trialInfo || trialInfo.state !== 'active') return null;
    const ms = trialInfo.remainingMs || 0;
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor(ms / (60 * 60 * 1000));
    if (days >= 1) return `Free trial — ${days} day${days === 1 ? '' : 's'} remaining`;
    if (hours >= 1) return `Free trial — last day · ${hours}h left`;
    return 'Free trial — ending soon';
  })();

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

    // Each landmark is colored by the signal(s) that govern it. Pre-calibration
    // we have no judgment to render, so dots stay neutral gray.
    const sig = signalsRef.current;
    const calibrated = isCalibratedRef.current;
    const colorFor = (name) => {
      if (!calibrated || !sig) return '#9ca3af';
      let ok = true;
      if (name === 'nose' || name === 'left_eye' || name === 'right_eye') {
        ok = sig.headForward?.ok !== false && sig.headDown?.ok !== false;
      } else if (name === 'left_ear' || name === 'right_ear') {
        ok = sig.headTilt?.ok !== false;
      } else if (name === 'left_shoulder' || name === 'right_shoulder') {
        ok = sig.shoulders?.ok !== false;
      }
      return ok ? '#22c55e' : '#ef4444';
    };

    keypoints.forEach(kp => {
      if (pointsToDraw.includes(kp.name) && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colorFor(kp.name);
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
        if (latestKeypointsRef.current && videoRef.current) {
          const kps = latestKeypointsRef.current;
          const vWidth = videoRef.current.videoWidth;
          
          const required = ['nose','left_eye','right_eye','left_ear','right_ear','left_shoulder','right_shoulder'];
          const allVisible = required.every(name => {
            const kp = kps.find(k => k.name === name);
            return kp && kp.score > 0.35;
          });

          if (!allVisible) {
            alert('Move closer to the camera or improve lighting — shoulders must be visible.');
            setCalibrationState('idle');
            return;
          }

          const baseline = calculateRatios(kps, vWidth);
          if (baseline) {
            window.api.setData('calibration', baseline);
            window.api.notifyCalibration(baseline);
            setCalibrationState('calibrated');
            setTimeout(() => setCalibrationState('idle'), 2000);
          } else {
            alert('Failed to compute calibration baseline.');
            setCalibrationState('idle');
          }
        } else {
          setCalibrationState('idle');
        }
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
  } else if (isCalibrated && signals) {
    const bad = [];
    if (!signals.headDown.ok)    bad.push({ key: 'headDown',    delta: signals.headDown.delta,    msg: 'Lift your chin up 👆' });
    if (!signals.distance.ok)    bad.push({ key: 'distance',    delta: 0.5,                       msg: signals.distance.tooClose ? 'Move away from the screen 🖥️' : 'Move closer to the screen' });
    if (!signals.headForward.ok) bad.push({ key: 'headForward', delta: signals.headForward.delta, msg: 'Pull your head back 🐢' });
    if (!signals.shoulders.ok)   bad.push({ key: 'shoulders',   delta: signals.shoulders.delta,   msg: 'Relax your shoulders 💪' });
    if (!signals.headTilt.ok)    bad.push({ key: 'headTilt',    delta: signals.headTilt.delta,    msg: 'Level your head ↔️' });

    if (bad.length > 0) {
      bad.sort((a, b) => b.delta - a.delta);
      alertMessage = bad[0].msg;
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
        <div style={{ position: 'absolute', top: '20px', zIndex: 10, backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '15px', color: 'red', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {!isLoaded && !error && (
        <div style={{ position: 'absolute', top: '20px', zIndex: 10, backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '15px', fontWeight: 'bold' }}>
          Loading AI model...
        </div>
      )}

      <div style={{
        position: 'relative',
        aspectRatio: videoSize.width > 0 ? `${videoSize.width} / ${videoSize.height}` : '4 / 3',
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
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
              pointerEvents: 'none'
            }}
          />
        )}

        {isPaused && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-lg)', padding: '20px 40px', fontSize: '24px', fontWeight: 'bold', color: 'var(--black)', fontFamily: "'Instrument Serif', serif" }}>
            Detection Paused
          </div>
        )}
      </div>

      {/* User info card (top left) */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', zIndex: 5 }}>
        <div style={{ backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent)', border: 'var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
            🦐
          </div>
          <div>
            <div style={{ color: 'var(--black)', fontWeight: 'bold', fontSize: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>{userData.username}</div>
            <div style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>LVL {userData.level}</div>
            <div style={{ width: '100px', height: '10px', backgroundColor: 'var(--cream)', border: 'var(--border)' }}>
              <div style={{ width: `${(userData.xp / nextThreshold) * 100}%`, height: '100%', backgroundColor: 'var(--black)' }} />
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>{userData.xp} / {nextThreshold} XP</div>
          </div>
        </div>
        {trialBadgeText && (
          <div style={{ backgroundColor: '#d4f57a', border: 'var(--border)', boxShadow: 'var(--shadow-sm)', color: 'var(--black)', padding: '6px 12px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em' }}>
            {trialBadgeText}
          </div>
        )}
      </div>

      {/* Posture breakdown panel (top right) */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', width: '220px', zIndex: 5, color: 'var(--black)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          <span>Head Forward</span>
          <span>{(!isCalibrated || !signals || isPaused) ? '—' : (signals.headForward.ok ? '✅' : '❌')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          <span>Head Down</span>
          <span>{(!isCalibrated || !signals || isPaused) ? '—' : (signals.headDown.ok ? '✅' : '❌')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          <span>Head Tilt</span>
          <span>{(!isCalibrated || !signals || isPaused) ? '—' : (signals.headTilt.ok ? '✅' : '❌')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          <span>Shoulders</span>
          <span>{(!isCalibrated || !signals || isPaused) ? '—' : (signals.shoulders.ok ? '✅' : '❌')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          <span>Distance</span>
          <span>
            {(!isCalibrated || !signals || isPaused) ? '—' : (
              signals.distance.ok ? 'Good ✅' : (signals.distance.tooClose ? 'Close ❌' : 'Far ❌')
            )}
          </span>
        </div>
        
        <div style={{ borderTop: 'var(--border)', paddingTop: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>SCORE:</span>
          <span style={{ fontSize: '36px', fontFamily: "'Instrument Serif', serif", color: isPaused ? 'var(--muted)' : 'var(--black)' }}>
            {(score !== null && !isPaused) ? score : '—'}
          </span>
        </div>

        {calibrationState === 'idle' && !isCalibrated && (
          <div style={{ fontSize: '12px', color: 'var(--black)', backgroundColor: 'var(--accent)', border: 'var(--border)', padding: '5px', textAlign: 'center', marginBottom: '10px', animation: 'pulse 1.5s infinite', fontWeight: 'bold' }}>
            Sit up straight, then calibrate
          </div>
        )}
        
        {calibrationState === 'counting' && (
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--black)', backgroundColor: 'var(--white)', border: 'var(--border)', padding: '5px', textAlign: 'center', marginBottom: '10px' }}>
            Calibrating in {countdown}...
          </div>
        )}

        {calibrationState === 'calibrated' && (
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--black)', backgroundColor: 'var(--accent)', border: 'var(--border)', padding: '5px', textAlign: 'center', marginBottom: '10px' }}>
            Calibrated ✓
          </div>
        )}

        <button 
          onClick={startCalibration}
          disabled={!isLoaded || !isReady || !latestKeypointsRef.current || calibrationState === 'counting' || isPaused}
          className="neo-btn"
          style={{
            width: '100%',
            opacity: (!isLoaded || !isReady || !latestKeypointsRef.current || calibrationState === 'counting' || isPaused) ? 0.5 : 1
          }}
        >
          {isCalibrated ? 'RECALIBRATE' : 'CALIBRATE'}
        </button>
      </div>

      {/* Alert text overlay */}
      {alertMessage && (
        <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '15px 30px', color: 'var(--black)', fontSize: '28px', fontFamily: "'Instrument Serif', serif", zIndex: 5, textAlign: 'center' }}>
          {alertMessage}
        </div>
      )}

      {/* Status indicator */}
      {!isPaused && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
          {alertActive ? (
            <div style={{ backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-sm)', color: 'red', padding: '6px 16px', fontSize: '14px', fontWeight: 'bold' }}>ALERT ACTIVE</div>
          ) : cooldownActive ? (
            <div style={{ backgroundColor: 'var(--gray)', border: 'var(--border)', boxShadow: 'var(--shadow-sm)', color: 'var(--muted)', padding: '6px 16px', fontSize: '14px', fontWeight: 'bold' }}>COOLDOWN</div>
          ) : (
            <div style={{ backgroundColor: 'var(--accent)', border: 'var(--border)', boxShadow: 'var(--shadow-sm)', color: 'var(--black)', padding: '6px 16px', fontSize: '14px', fontWeight: 'bold' }}>MONITORING</div>
          )}
        </div>
      )}

      {/* Camera label (bottom left) */}
      {cameraName && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-sm)', color: 'var(--black)', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', zIndex: 5 }}>
          {cameraName}
        </div>
      )}

      {/* Bottom controls (bottom right) */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 5 }}>
        <button 
          onClick={handlePauseToggle}
          style={{ width: '44px', height: '44px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-sm)', color: 'var(--black)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}
          title={isPaused ? "Resume Detection" : "Pause Detection"}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
