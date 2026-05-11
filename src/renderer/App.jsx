import React, { useState, useEffect } from 'react';
import Dashboard from './screens/Dashboard';
import Analytics from './screens/Analytics';
import Leaderboard from './screens/Leaderboard';
import Settings from './screens/Settings';
import License from './screens/License';

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLicensed, setIsLicensed] = useState(null);

  useEffect(() => {
    // In development, skip the license screen
    if (process.env.NODE_ENV === 'development') {
      setIsLicensed(true);
      return;
    }
    
    if (window.api && window.api.getLicense) {
      window.api.getLicense().then(key => {
        setIsLicensed(!!key);
      });
    } else {
      setIsLicensed(false);
    }
  }, []);

  const renderScreen = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Analytics': return <Analytics />;
      case 'Leaderboard': return <Leaderboard />;
      case 'Settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const tabs = ['Dashboard', 'Analytics', 'Leaderboard', 'Settings'];

  if (isLicensed === null) return <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e1e' }}>Loading...</div>;
  if (!isLicensed) return <License onActivated={() => setIsLicensed(true)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff' }}>
      <div style={{ display: 'flex', backgroundColor: '#2d2d2d', borderBottom: '1px solid #3d3d3d' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '15px 0',
              backgroundColor: activeTab === tab ? '#3d3d3d' : 'transparent',
              border: 'none',
              color: activeTab === tab ? '#61dafb' : '#b0b0b0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              outline: 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
