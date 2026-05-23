import React, { useState, useEffect } from 'react';
import Dashboard from './screens/Dashboard';
import Analytics from './screens/Analytics';
import Leaderboard from './screens/Leaderboard';
import Settings from './screens/Settings';
import License from './screens/License';
import { PoseDetectorProvider } from './contexts/PoseDetectorContext';

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLicensed, setIsLicensed] = useState(null);
  
  const [updateState, setUpdateState] = useState(null); // null | 'available' | 'downloading' | 'ready'
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (window.api && window.api.getLicense) {
      window.api.getLicense().then(key => {
        setIsLicensed(!!key);
      });
      
      if (window.api.onUpdateAvailable) {
        window.api.onUpdateAvailable(info => {
          setUpdateInfo(info);
          setUpdateState('available');
        });
        window.api.onUpdateProgress(pct => {
          setDownloadProgress(pct);
          setUpdateState('downloading');
        });
        window.api.onUpdateReady(() => {
          setUpdateState('ready');
        });
      }
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

  if (isLicensed === null) return <div style={{ color: 'var(--black)', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--cream)', fontWeight: 'bold' }}>Loading...</div>;
  if (!isLicensed) return <License onActivated={() => setIsLicensed(true)} />;

  return (
    <PoseDetectorProvider>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--cream)', color: 'var(--black)' }}>

      {updateState === 'available' && (
        <div style={{
          background: '#d4f57a', borderBottom: '2px solid black',
          padding: '10px 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          fontSize: 13, fontWeight: 500, color: 'black'
        }}>
          <span>⬆ Update available: v{updateInfo?.version}</span>
          <button onClick={() => window.api.downloadUpdate()}
            style={{ background: 'black', color: 'white', border: 'none',
                    padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>
            Download
          </button>
        </div>
      )}

      {updateState === 'downloading' && (
        <div style={{
          background: '#f5f0e8', borderBottom: '2px solid black',
          padding: '10px 20px', fontSize: 13, color: 'black'
        }}>
          Downloading update... {downloadProgress}%
          <div style={{ height: 4, background: '#e0e0e0', marginTop: 6 }}>
            <div style={{ height: '100%', width: `${downloadProgress}%`,
                          background: 'black', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {updateState === 'ready' && (
        <div style={{
          background: '#d4f57a', borderBottom: '2px solid black',
          padding: '10px 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          fontSize: 13, fontWeight: 500, color: 'black'
        }}>
          <span>✓ Update ready to install</span>
          <button onClick={() => window.api.installUpdate()}
            style={{ background: 'black', color: 'white', border: 'none',
                    padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>
            Restart & Install
          </button>
        </div>
      )}

      <div style={{ display: 'flex', backgroundColor: 'var(--white)', borderBottom: 'var(--border)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: activeTab === tab ? 'var(--accent)' : 'transparent',
              border: 'none',
              borderRight: 'var(--border)',
              color: 'var(--black)',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : '500',
              outline: 'none',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {renderScreen()}
      </div>
    </div>
    </PoseDetectorProvider>
  );
};

export default App;
