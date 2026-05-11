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
    <div style={{ height: '100%', width: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
      <h1 style={{ color: '#61dafb', marginBottom: '10px' }}>PosturePal 🦐</h1>
      <p style={{ color: '#aaa', marginBottom: '40px' }}>Enter your license key to continue.</p>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '40px', borderRadius: '12px', textAlign: 'center', width: '400px' }}>
        <input 
          type="text" 
          value={key} 
          onChange={handleChange} 
          placeholder="XXXX-XXXX-XXXX-XXXX"
          style={{ width: '100%', padding: '15px', fontSize: '20px', textAlign: 'center', letterSpacing: '2px', backgroundColor: '#333', border: '1px solid #555', color: 'white', borderRadius: '8px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
        />
        <button 
          onClick={handleActivate}
          disabled={status.loading || key.length < 19}
          style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '8px', cursor: (status.loading || key.length < 19) ? 'not-allowed' : 'pointer', opacity: (status.loading || key.length < 19) ? 0.5 : 1, boxSizing: 'border-box' }}
        >
          {status.loading ? 'Activating...' : 'Activate License'}
        </button>

        {status.message && (
          <div style={{ marginTop: '20px', color: status.type === 'success' ? '#4caf50' : status.type === 'error' ? '#f44336' : '#61dafb' }}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default License;
