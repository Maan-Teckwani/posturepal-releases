import React, { useState, useEffect } from 'react';
import { syncLeaderboard } from '../leaderboardSync';

const Settings = () => {
  const [settings, setSettings] = useState({
    threshold: 60,
    alertDelay: 3,
    cooldown: 5,
    runOnStartup: true,
    cameraId: ''
  });

  const [displayName, setDisplayName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [nameStatus, setNameStatus] = useState('');
  const [cameras, setCameras] = useState([]);

  // Lifetime activation panel state.
  const [licenseInfo, setLicenseInfo] = useState({ mode: 'loading' }); // loading | paid | trial | none
  const [lifetimeKey, setLifetimeKey] = useState('');
  const [lifetimeStatus, setLifetimeStatus] = useState({ loading: false, message: '', type: '' });

  useEffect(() => {
    const loadSettings = async () => {
      if (window.api) {
        const s = await window.api.getData('settings');
        if (s) {
          if (s.alertDelay !== undefined && s.alertDelay < 5) s.alertDelay = 5;
          setSettings(prev => ({ ...prev, ...s }));
        }
        const name = await window.api.getData('username');
        if (name) {
          setDisplayName(name);
          setSavedName(name);
        }
        const license = await window.api.getLicense?.();
        if (license) {
          setLicenseInfo({ mode: 'paid' });
        } else {
          const trial = await window.api.trialStatus?.();
          if (trial?.state === 'active') setLicenseInfo({ mode: 'trial', remainingMs: trial.remainingMs });
          else setLicenseInfo({ mode: 'none' });
        }
      }
    };
    loadSettings();
  }, []);

  const formatLifetimeKey = (value) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) parts.push(clean.substring(i, i + 4));
    return parts.join('-').substring(0, 19);
  };

  const handleLifetimeKeyChange = (e) => {
    setLifetimeKey(formatLifetimeKey(e.target.value));
    setLifetimeStatus({ loading: false, message: '', type: '' });
  };

  const handleActivateLifetime = async () => {
    if (lifetimeKey.length !== 19) {
      setLifetimeStatus({ loading: false, message: 'Invalid format. Use XXXX-XXXX-XXXX-XXXX', type: 'error' });
      return;
    }
    if (!window.api?.validateLicense) {
      setLifetimeStatus({ loading: false, message: 'App not ready.', type: 'error' });
      return;
    }
    setLifetimeStatus({ loading: true, message: 'Activating...', type: 'info' });
    try {
      const res = await window.api.validateLicense(lifetimeKey);
      if (res?.valid) {
        setLifetimeStatus({ loading: false, message: '✓ Lifetime access activated! Restarting...', type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setLifetimeStatus({
          loading: false,
          message: 'That lifetime license key was not recognized. Make sure you copied the key you received after paying Rs. 299 on posturepal.in.',
          type: 'error'
        });
      }
    } catch (err) {
      setLifetimeStatus({ loading: false, message: 'Activation failed. Please try again.', type: 'error' });
    }
  };

  const openBuyPage = () => {
    if (window.api?.openBuyPage) window.api.openBuyPage();
  };

  // Camera labels are blank on Windows until the page has been granted camera
  // permission at least once. We do a throwaway getUserMedia to coax the labels
  // out, then enumerate. The stream is stopped immediately — only main-window
  // detection should keep a camera open.
  useEffect(() => {
    const loadCameras = async () => {
      try {
        let list = await navigator.mediaDevices.enumerateDevices();
        const hasLabels = list.some(d => d.kind === 'videoinput' && d.label);
        if (!hasLabels) {
          try {
            const probe = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            probe.getTracks().forEach(t => t.stop());
            list = await navigator.mediaDevices.enumerateDevices();
          } catch {}
        }
        setCameras(list.filter(d => d.kind === 'videoinput'));
      } catch (err) {
        console.error('enumerateDevices failed:', err);
      }
    };
    loadCameras();
    const handler = () => loadCameras();
    navigator.mediaDevices.addEventListener?.('devicechange', handler);
    return () => navigator.mediaDevices.removeEventListener?.('devicechange', handler);
  }, []);

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (window.api) {
      window.api.setData('settings', newSettings);
    }
  };

  const handleCameraChange = (cameraId) => {
    handleChange('cameraId', cameraId);
    if (window.api && window.api.notifyCameraChanged) {
      window.api.notifyCameraChanged(cameraId || null);
    }
  };

  const handleNameChange = (e) => {
    setDisplayName(e.target.value.replace(/[^A-Za-z0-9 _-]/g, '').substring(0, 20));
    setNameStatus('');
  };

  const saveDisplayName = async () => {
    const name = displayName.trim();
    if (!name) {
      setNameStatus('Display name cannot be empty.');
      return;
    }
    if (window.api) {
      await window.api.setData('username', name);
      // Rename the existing leaderboard row in place rather than waiting for
      // the next background sync (which would otherwise be up to 2 min away).
      await syncLeaderboard();
    }
    setDisplayName(name);
    setSavedName(name);
    setNameStatus('Saved ✓');
    setTimeout(() => setNameStatus(''), 2500);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', color: 'var(--black)', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif" }}>
      <h2 style={{ marginBottom: '40px', fontFamily: "'Instrument Serif', serif", fontSize: '48px' }}>Settings</h2>

      {licenseInfo.mode === 'paid' && (
        <div style={{ marginBottom: '30px', backgroundColor: '#d4f57a', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '6px' }}>LIFETIME ACCESS</div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>✓ Active on this device. Thanks for supporting PosturePal.</div>
        </div>
      )}

      {licenseInfo.mode === 'trial' && (
        <div style={{ marginBottom: '30px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '6px' }}>UPGRADE</div>
          <label style={{ marginBottom: '8px', fontSize: '18px', color: 'var(--black)', fontWeight: 'bold' }}>
            Activate Lifetime Access
          </label>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.6 }}>
            Already paid Rs. 299 on the website? Paste the lifetime license key below to remove the trial timer permanently.
          </p>
          <input
            type="text"
            value={lifetimeKey}
            onChange={handleLifetimeKeyChange}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            style={{ width: '100%', padding: '14px', fontSize: '18px', textAlign: 'center', letterSpacing: '2px', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleActivateLifetime}
              disabled={lifetimeStatus.loading || lifetimeKey.length !== 19}
              className="neo-btn"
              style={{ flex: 1, padding: '12px', fontSize: '15px', backgroundColor: 'var(--accent)', color: 'var(--black)', opacity: (lifetimeStatus.loading || lifetimeKey.length !== 19) ? 0.5 : 1 }}
            >
              {lifetimeStatus.loading ? 'ACTIVATING...' : 'ACTIVATE LIFETIME ACCESS'}
            </button>
            <button
              onClick={openBuyPage}
              className="neo-btn"
              style={{ padding: '12px 16px', fontSize: '13px', backgroundColor: 'var(--white)', color: 'var(--black)' }}
            >
              Buy at posturepal.in
            </button>
          </div>
          {lifetimeStatus.message && (
            <div style={{ marginTop: '12px', fontWeight: 'bold', fontSize: '13px', color: lifetimeStatus.type === 'success' ? '#4caf50' : lifetimeStatus.type === 'error' ? 'red' : 'var(--black)' }}>
              {lifetimeStatus.message}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '30px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: 'var(--black)', fontWeight: 'bold' }}>
          Display name
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={displayName}
            onChange={handleNameChange}
            placeholder="Your name"
            maxLength={20}
            style={{ flex: 1, padding: '12px', fontSize: '16px', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
          />
          <button
            onClick={saveDisplayName}
            disabled={!displayName.trim() || displayName.trim() === savedName}
            className="neo-btn"
            style={{ padding: '12px 20px', backgroundColor: 'var(--accent)', color: 'var(--black)', opacity: (!displayName.trim() || displayName.trim() === savedName) ? 0.5 : 1 }}
          >
            SAVE
          </button>
        </div>
        {nameStatus && (
          <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '13px', color: nameStatus.startsWith('Saved') ? '#4caf50' : 'red' }}>
            {nameStatus}
          </div>
        )}
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--muted)', fontWeight: 'bold' }}>
          This name is stored on your device and shown on the dashboard and leaderboard.
        </div>
      </div>

      <div style={{ marginBottom: '30px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: 'var(--black)', fontWeight: 'bold' }}>
          Camera
        </label>
        <select
          value={settings.cameraId || ''}
          onChange={(e) => handleCameraChange(e.target.value)}
          style={{ padding: '12px', fontSize: '14px', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold', cursor: 'pointer' }}
        >
          <option value="">System default</option>
          {cameras.map((cam, i) => (
            <option key={cam.deviceId || i} value={cam.deviceId}>
              {cam.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--muted)', fontWeight: 'bold' }}>
          PosturePal works with any USB or built-in webcam. Selection applies immediately.
        </div>
      </div>

      <div style={{ marginBottom: '30px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: 'var(--black)', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
          <input
            type="checkbox"
            checked={settings.runOnStartup}
            onChange={(e) => {
              handleChange('runOnStartup', e.target.checked);
              if (window.api && window.api.setLoginItem) {
                window.api.setLoginItem(e.target.checked);
              }
            }}
            style={{ marginRight: '10px', cursor: 'pointer', width: '20px', height: '20px', accentColor: 'var(--accent)' }}
          />
          Run on system startup
        </label>
      </div>
      
      <div style={{ marginBottom: '30px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: 'var(--black)', fontWeight: 'bold' }}>
          Alert after <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '24px' }}>{settings.alertDelay}</span> seconds of bad posture
        </label>
        <input 
          type="range" 
          min="5"
          max="60"
          value={settings.alertDelay} 
          onChange={(e) => handleChange('alertDelay', Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--black)' }}
        />
      </div>

      <div style={{ marginBottom: '30px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: 'var(--black)', fontWeight: 'bold' }}>
          Wait <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '24px' }}>{settings.cooldown}</span>s before next alert
        </label>
        <input 
          type="range" 
          min="30" 
          max="120" 
          value={settings.cooldown} 
          onChange={(e) => handleChange('cooldown', Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--black)' }}
        />
      </div>
    </div>
  );
};

export default Settings;
