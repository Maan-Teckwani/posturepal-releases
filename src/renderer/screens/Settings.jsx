import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    threshold: 60,
    alertDelay: 3,
    cooldown: 5,
    runOnStartup: false
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (window.api) {
        const s = await window.api.getData('settings');
        if (s) {
          setSettings(prev => ({ ...prev, ...s }));
        }
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (window.api) {
      window.api.setData('settings', newSettings);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', color: 'var(--black)', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif" }}>
      <h2 style={{ marginBottom: '40px', fontFamily: "'Instrument Serif', serif", fontSize: '48px' }}>Settings</h2>

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
          Alert me when score drops below <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '24px' }}>{settings.threshold}</span>
        </label>
        <input 
          type="range" 
          min="40" 
          max="80" 
          value={settings.threshold} 
          onChange={(e) => handleChange('threshold', Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--black)' }}
        />
      </div>

      <div style={{ marginBottom: '30px', backgroundColor: 'var(--white)', border: 'var(--border)', boxShadow: 'var(--shadow-md)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: 'var(--black)', fontWeight: 'bold' }}>
          Alert after <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '24px' }}>{settings.alertDelay}</span> seconds of bad posture
        </label>
        <input 
          type="range" 
          min="1" 
          max="15" 
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
