import React, { useState, useEffect } from 'react';
import Dashboard from './screens/Dashboard';
import Analytics from './screens/Analytics';
import Leaderboard from './screens/Leaderboard';
import Settings from './screens/Settings';
import License from './screens/License';
import { PoseDetectorProvider } from './contexts/PoseDetectorContext';

// Auth/access modes the app can be in:
//   loading     — startup probe in flight
//   licensed    — paid license active; full app
//   trialActive — free trial active; full app + countdown badge
//   trialExpired— trial used and ended; show License in trial-expired mode
//   unlicensed  — no token and no key; show License in default mode
//   reconnect   — trial cached but offline grace window exhausted
const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [authState, setAuthState] = useState({ mode: 'loading' });

  const [updateState, setUpdateState] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const probe = async () => {
    if (!window.api) { setAuthState({ mode: 'unlicensed' }); return; }
    const license = await window.api.getLicense();
    if (license) { setAuthState({ mode: 'licensed' }); return; }

    const status = window.api.trialStatus ? await window.api.trialStatus() : { state: 'none' };
    if (status.state === 'none') { setAuthState({ mode: 'unlicensed' }); return; }

    // We have cached trial state — confirm with the server.
    if (window.api.trialRevalidate) {
      const v = await window.api.trialRevalidate();
      if (v?.status === 'converted') { setAuthState({ mode: 'licensed' }); return; }
      if (v?.valid && v?.status === 'active') { setAuthState({ mode: 'trialActive' }); return; }
      if (v?.status === 'offline-too-long') { setAuthState({ mode: 'reconnect' }); return; }
      setAuthState({ mode: 'trialExpired' });
      return;
    }
    // No revalidate API — fall back to local cache.
    if (status.state === 'active') setAuthState({ mode: 'trialActive' });
    else if (status.state === 'expired') setAuthState({ mode: 'trialExpired' });
    else setAuthState({ mode: 'unlicensed' });
  };

  // Called by License.jsx after a successful activation. The IPC response tells
  // us which bucket the new key landed in so we can route to the right screen.
  const handleActivated = (res) => {
    if (res?.type === 'paid') {
      setAuthState({ mode: 'licensed' });
    } else if (res?.type === 'trial') {
      setAuthState({ mode: 'trialActive' });
    } else {
      // Legacy callers without a response object — re-probe to find out.
      probe();
    }
  };

  useEffect(() => {
    if (!window.api) { setAuthState({ mode: 'unlicensed' }); return; }

    if (window.api.onUpdateAvailable) {
      window.api.onUpdateAvailable(info => { setUpdateInfo(info); setUpdateState('available'); });
      window.api.onUpdateProgress(pct => { setDownloadProgress(pct); setUpdateState('downloading'); });
      window.api.onUpdateReady(() => setUpdateState('ready'));
    }

    probe();
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

  const fullscreenMessage = (title, body, action = null) => (
    <div style={{ color: 'var(--black)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--cream)', fontFamily: "'Space Grotesk', sans-serif", padding: '24px', textAlign: 'center', gap: '16px' }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '40px', maxWidth: '560px' }}>{title}</div>
      <div style={{ color: 'var(--muted)', fontWeight: 600, maxWidth: '480px', lineHeight: 1.6 }}>{body}</div>
      {action}
    </div>
  );

  if (authState.mode === 'loading') {
    return <div style={{ color: 'var(--black)', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--cream)', fontWeight: 'bold' }}>Loading...</div>;
  }

  if (authState.mode === 'reconnect') {
    return fullscreenMessage(
      "Let's reconnect.",
      "We need to check in with the server to continue your free trial. Connect to the internet and reopen PosturePal.",
      <button
        className="neo-btn"
        onClick={probe}
        style={{ padding: '12px 24px', backgroundColor: 'var(--accent)', color: 'var(--black)', cursor: 'pointer' }}
      >
        Try again
      </button>
    );
  }

  if (authState.mode === 'trialExpired') {
    return <License mode="trial-expired" onActivated={handleActivated} />;
  }

  if (authState.mode === 'unlicensed') {
    return <License onActivated={handleActivated} />;
  }

  // licensed or trialActive → full app
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
