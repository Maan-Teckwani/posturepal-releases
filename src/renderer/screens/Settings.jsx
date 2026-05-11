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
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', color: '#fff', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '40px', color: '#61dafb' }}>Settings</h2>

      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: '#e0e0e0', display: 'flex', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={settings.runOnStartup}
            onChange={(e) => {
              handleChange('runOnStartup', e.target.checked);
              if (window.api && window.api.setLoginItem) {
                window.api.setLoginItem(e.target.checked);
              }
            }}
            style={{ marginRight: '10px', cursor: 'pointer', width: '16px', height: '16px' }}
          />
          Run on system startup
        </label>
      </div>
      
      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: '#e0e0e0' }}>
          Alert me when score drops below <strong>{settings.threshold}</strong>
        </label>
        <input 
          type="range" 
          min="40" 
          max="80" 
          value={settings.threshold} 
          onChange={(e) => handleChange('threshold', Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: '#e0e0e0' }}>
          Alert after <strong>{settings.alertDelay}</strong> seconds of bad posture
        </label>
        <input 
          type="range" 
          min="1" 
          max="15" 
          value={settings.alertDelay} 
          onChange={(e) => handleChange('alertDelay', Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column' }}>
        <label style={{ marginBottom: '10px', fontSize: '16px', color: '#e0e0e0' }}>
          Wait <strong>{settings.cooldown}</strong>s before next alert
        </label>
        <input 
          type="range" 
          min="30" 
          max="120" 
          value={settings.cooldown} 
          onChange={(e) => handleChange('cooldown', Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default Settings;
