import React, { useState } from 'react';
import { syncLeaderboard } from '../leaderboardSync';

const License = ({ onActivated, mode = 'default' }) => {
  const isExpired = mode === 'trial-expired';

  // Trial-expired users default to the Lifetime tab; everyone else lands on
  // Free Trial since that's the most common entry path.
  const [tab, setTab] = useState(isExpired ? 'lifetime' : 'trial');

  const [displayName, setDisplayName] = useState('');
  const [trialKey, setTrialKey] = useState('');
  const [lifetimeKey, setLifetimeKey] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const formatKey = (value) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) parts.push(clean.substring(i, i + 4));
    return parts.join('-').substring(0, 19);
  };

  const handleNameChange = (e) => {
    setDisplayName(e.target.value.replace(/[^A-Za-z0-9 _-]/g, '').substring(0, 20));
  };

  const formatTrialRemaining = (ms) => {
    if (!ms || ms <= 0) return '0 days';
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (days >= 1) return `${days} day${days === 1 ? '' : 's'}`;
    const hours = Math.max(1, Math.floor(ms / (60 * 60 * 1000)));
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  };

  const validateAndActivate = async () => {
    const name = displayName.trim();
    if (!name) {
      setStatus({ loading: false, message: 'Please enter a display name.', type: 'error' });
      return;
    }

    const key = tab === 'trial' ? trialKey : lifetimeKey;
    if (key.length !== 19) {
      setStatus({ loading: false, message: 'Invalid format. Use XXXX-XXXX-XXXX-XXXX', type: 'error' });
      return;
    }

    if (!window.api) {
      setStatus({ loading: false, message: 'App not ready. Please restart PosturePal.', type: 'error' });
      return;
    }

    setStatus({ loading: true, message: 'Activating...', type: 'info' });

    try {
      let res;
      if (tab === 'trial') {
        if (!window.api.validateTrialKey) {
          setStatus({ loading: false, message: 'Trial activation not supported by this build. Please update.', type: 'error' });
          return;
        }
        res = await window.api.validateTrialKey(key);
      } else {
        res = await window.api.validateLicense(key);
      }

      if (res && res.valid) {
        await window.api.setData('username', name);
        await syncLeaderboard();
        const successMsg = res.type === 'trial'
          ? `✓ Free trial activated! ${formatTrialRemaining(res.remaining_ms)} remaining. Launching...`
          : '✓ Lifetime license activated! Launching...';
        setStatus({ loading: false, message: successMsg, type: 'success' });
        setTimeout(() => onActivated(res), 1800);
      } else {
        setStatus({ loading: false, message: (res && res.message) || 'Invalid key.', type: 'error' });
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Activation failed. Please try again.', type: 'error' });
    }
  };

  const openBuyPage = () => {
    if (window.api && window.api.openBuyPage) window.api.openBuyPage();
  };

  const switchTab = (next) => {
    if (tab === next) return;
    setTab(next);
    setStatus({ loading: false, message: '', type: '' });
  };

  const activeKey = tab === 'trial' ? trialKey : lifetimeKey;
  const canActivate = !status.loading && activeKey.length === 19 && displayName.trim().length > 0;

  const headline = isExpired ? 'Your free trial has ended.' : 'PosturePal 🦐';
  const subhead = isExpired
    ? 'Get lifetime access for Rs. 299, or paste a paid license key you already own.'
    : 'Pick a display name, then activate with your free trial key or your lifetime license key.';

  const tabBtn = (id, label) => (
    <button
      onClick={() => switchTab(id)}
      style={{
        flex: 1,
        padding: '12px 14px',
        border: 'var(--border)',
        borderBottom: tab === id ? 'none' : 'var(--border)',
        background: tab === id ? 'var(--accent)' : 'var(--white)',
        color: 'var(--black)',
        fontWeight: 700,
        fontSize: '14px',
        fontFamily: "'Space Grotesk', sans-serif",
        cursor: 'pointer',
        outline: 'none',
        marginBottom: tab === id ? '-2px' : '0',
        position: 'relative',
        zIndex: tab === id ? 2 : 1,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--cream)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--black)', fontFamily: "'Space Grotesk', sans-serif", padding: '24px', boxSizing: 'border-box', overflowY: 'auto' }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: isExpired ? '52px' : '64px', marginBottom: '10px', textAlign: 'center', maxWidth: '720px' }}>{headline}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '28px', fontWeight: 'bold', textAlign: 'center', maxWidth: '520px' }}>{subhead}</p>

      {isExpired && (
        <div style={{ backgroundColor: 'var(--white)', padding: '24px', border: 'var(--border)', boxShadow: 'var(--shadow-md)', textAlign: 'center', width: '440px', maxWidth: '100%', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: '4px' }}>LIFETIME LICENSE</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '40px', lineHeight: 1, marginBottom: '12px' }}>Rs. 299</div>
          <button
            onClick={openBuyPage}
            className="neo-btn"
            style={{ width: '100%', padding: '12px', fontSize: '14px', backgroundColor: 'var(--accent)', color: 'var(--black)', boxSizing: 'border-box' }}
          >
            GET LIFETIME ACCESS →
          </button>
        </div>
      )}

      <div style={{ width: '440px', maxWidth: '100%' }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '0' }}>
          {tabBtn('trial', 'Free Trial')}
          {tabBtn('lifetime', 'Lifetime License')}
        </div>

        {/* Panel */}
        <div style={{ backgroundColor: 'var(--white)', padding: '32px', border: 'var(--border)', boxShadow: 'var(--shadow-md)', boxSizing: 'border-box' }}>
          <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
            DISPLAY NAME
          </label>
          <input
            type="text"
            value={displayName}
            onChange={handleNameChange}
            placeholder="e.g. Maan"
            maxLength={20}
            style={{ width: '100%', padding: '14px', fontSize: '17px', textAlign: 'center', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', marginBottom: '18px', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
          />

          {tab === 'trial' ? (
            <>
              <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                FREE TRIAL KEY
              </label>
              <input
                type="text"
                value={trialKey}
                onChange={(e) => setTrialKey(formatKey(e.target.value))}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                style={{ width: '100%', padding: '14px', fontSize: '18px', textAlign: 'center', letterSpacing: '2px', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
              />
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 16px', textAlign: 'center' }}>
                From your <strong>posturepal.in/download</strong> page after signing up for the free trial.
              </p>
            </>
          ) : (
            <>
              <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                LIFETIME LICENSE KEY
              </label>
              <input
                type="text"
                value={lifetimeKey}
                onChange={(e) => setLifetimeKey(formatKey(e.target.value))}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                style={{ width: '100%', padding: '14px', fontSize: '18px', textAlign: 'center', letterSpacing: '2px', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', marginBottom: '8px', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
              />
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 16px', textAlign: 'center' }}>
                From the <strong>posturepal.in/success</strong> page after paying Rs. 299.
              </p>
            </>
          )}

          <button
            onClick={validateAndActivate}
            disabled={!canActivate}
            className="neo-btn"
            style={{ width: '100%', padding: '14px', fontSize: '15px', opacity: canActivate ? 1 : 0.5, boxSizing: 'border-box', backgroundColor: 'var(--accent)', color: 'var(--black)' }}
          >
            {status.loading
              ? 'ACTIVATING...'
              : tab === 'trial' ? 'ACTIVATE FREE TRIAL' : 'ACTIVATE LIFETIME'}
          </button>

          {status.message && (
            <div style={{ marginTop: '18px', fontWeight: 'bold', fontSize: '13px', textAlign: 'center', lineHeight: 1.5, color: status.type === 'success' ? '#4caf50' : status.type === 'error' ? '#c62828' : 'var(--black)' }}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default License;
