import React, { useState } from 'react';

const License = ({ onActivated }) => {
  const [key, setKey] = useState('');
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

  const handleActivate = async () => {
    if (key.length !== 19) {
      setStatus({ loading: false, message: 'Invalid format. Use XXXX-XXXX-XXXX-XXXX', type: 'error' });
      return;
    }
    setStatus({ loading: true, message: 'Activating...', type: 'info' });
    
    if (window.api && window.api.validateLicense) {
      const res = await window.api.validateLicense(key);
      if (res.valid) {
        setStatus({ loading: false, message: '✓ Activated! Launching...', type: 'success' });
        setTimeout(() => {
          onActivated();
        }, 1500);
      } else {
        setStatus({ loading: false, message: res.message || 'Invalid license key.', type: 'error' });
      }
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--cream)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--black)', fontFamily: "'Space Grotesk', sans-serif" }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '64px', marginBottom: '10px' }}>PosturePal 🦐</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '40px', fontWeight: 'bold' }}>Enter your license key to continue.</p>
      
      <div style={{ backgroundColor: 'var(--white)', padding: '40px', border: 'var(--border)', boxShadow: 'var(--shadow-md)', textAlign: 'center', width: '400px' }}>
        <input 
          type="text" 
          value={key} 
          onChange={handleChange} 
          placeholder="XXXX-XXXX-XXXX-XXXX"
          style={{ width: '100%', padding: '15px', fontSize: '20px', textAlign: 'center', letterSpacing: '2px', backgroundColor: 'var(--white)', border: 'var(--border)', color: 'var(--black)', outline: 'none', marginBottom: '20px', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 'bold' }}
        />
        <button 
          onClick={handleActivate}
          disabled={status.loading || key.length < 19}
          className="neo-btn"
          style={{ width: '100%', padding: '15px', fontSize: '16px', opacity: (status.loading || key.length < 19) ? 0.5 : 1, boxSizing: 'border-box', backgroundColor: 'var(--accent)', color: 'var(--black)' }}
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
