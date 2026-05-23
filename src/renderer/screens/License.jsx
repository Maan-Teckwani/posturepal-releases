import React, { useState } from 'react';
import { syncLeaderboard } from '../leaderboardSync';

const License = ({ onActivated }) => {
  const [key, setKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const formatKey = (value) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join('-').substring(0, 19);
  };

  const handleChange = (e) => {
    setKey(formatKey(e.target.value));
  };

  const handleNameChange = (e) => {
    // Allow letters, numbers, spaces and a few separators; cap length.
    setDisplayName(e.target.value.replace(/[^A-Za-z0-9 _-]/g, '').substring(0, 20));
  };

  const handleActivate = async () => {
    const name = displayName.trim();
    if (!name) {
      setStatus({ loading: false, message: 'Please enter a display name.', type: 'error' });
      return;
    }
    if (key.length !== 19) {
      setStatus({ loading: false, message: 'Invalid format. Use XXXX-XXXX-XXXX-XXXX', type: 'error' });
      return;
    }
    if (!window.api || !window.api.validateLicense) {
      setStatus({ loading: false, message: 'App not ready. Please restart PosturePal.', type: 'error' });
      return;
    }
    setStatus({ loading: true, message: 'Activating...', type: 'info' });

    try {
      const res = await window.api.validateLicense(key);
      if (res && res.valid) {
        await window.api.setData('username', name);

        // Register this user on the global leaderboard right away so they
        // appear even before any XP has been earned.
        await syncLeaderboard();

        setStatus({ loading: false, message: '✓ Activated! Launching...', type: 'success' });
        setTimeout(() => {
          onActivated();
        }, 1500);
      } else {
        setStatus({ loading: false, message: (res && res.message) || 'Invalid license key.', type: 'error' });
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Activation failed. Please try again.', type: 'error' });
    }
  };

  const canActivate = !status.loading && key.length === 19 && displayName.trim().length > 0;

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--cream)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--black)', fontFamily: "'Space Grotesk', sans-serif" }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '64px', marginBottom: '10px' }}>PosturePal 🦐</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '40px', fontWeight: 'bold' }}>Pick a display name and enter your license key to continue.</p>

      <div style={{ backgroundColor: 'var(--white)', padding: '40px', border: 'var(--border)', boxShadow: 'var(--shadow-md)', textAlign: 'center', width: '400px' }}>
        <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
          DISPLAY NAME
        </label>
        <input
          type="text"
          value={displayName}
          onChange={handleNameChange}
          placeholder="e.g. Maan"
          maxLength={20}
          style={{ width: '100%', padding: '15px', fontSize: '18px', textAlign: 'center', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
        />

        <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
          LICENSE KEY
        </label>
        <input
          type="text"
          value={key}
          onChange={handleChange}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          style={{ width: '100%', padding: '15px', fontSize: '20px', textAlign: 'center', letterSpacing: '2px', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
        />
        <button
          onClick={handleActivate}
          disabled={!canActivate}
          className="neo-btn"
          style={{ width: '100%', padding: '15px', fontSize: '16px', opacity: canActivate ? 1 : 0.5, boxSizing: 'border-box', backgroundColor: 'var(--accent)', color: 'var(--black)' }}
        >
          {status.loading ? 'ACTIVATING...' : 'ACTIVATE LICENSE'}
        </button>

        {status.message && (
          <div style={{ marginTop: '20px', fontWeight: 'bold', color: status.type === 'success' ? '#4caf50' : status.type === 'error' ? 'red' : 'var(--black)' }}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default License;
