'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const downloadLinks = {
  mac: process.env.NEXT_PUBLIC_DOWNLOAD_URL_MAC || 'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal.dmg',
  win: process.env.NEXT_PUBLIC_DOWNLOAD_URL_WIN || 'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-Setup.exe',
};

function UnauthorizedPage({ message }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)',
        borderBottom: '2px solid var(--black)', height: '64px',
        display: 'flex', alignItems: 'center', padding: '0 24px'
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--black)' }}>
            <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>back to home</div>
          </a>
          <a href="mailto:support@posturepal.io" style={{ textDecoration: 'none', color: 'var(--black)', fontSize: '14px', fontWeight: 600 }}>Need help?</a>
        </div>
      </nav>

      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
          <div className="neo-card" style={{ background: 'var(--white)', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Link expired or not found</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
              {message || 'This confirmation link has expired or is invalid.'} Your license key was sent to your email immediately after purchase — check your inbox and spam folder.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <a href="/" className="neo-btn accent" style={{ textDecoration: 'none', padding: '14px 32px' }}>
                Back to Home
              </a>
              <a href="mailto:support@posturepal.io" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'underline' }}>
                Contact support
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '2px solid var(--black)', padding: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 600, background: 'var(--white)' }}>
        © 2026 PosturePal. Your spine is safe.
      </footer>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [pageStatus, setPageStatus] = useState('loading');
  const [licenseKey, setLicenseKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [os, setOs] = useState('unknown');
  const smartscreenRef = useRef(null);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) setOs('mac');
    else if (ua.includes('win')) setOs('win');
  }, []);

  useEffect(() => {
    if (!token) {
      setPageStatus('unauthorized');
      setErrorMessage('No valid session token found.');
      return;
    }

    fetch('/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.licenseKey) {
          setLicenseKey(data.licenseKey);
          setPageStatus('authorized');
        } else {
          setErrorMessage(data.error || '');
          setPageStatus('unauthorized');
        }
      })
      .catch(() => {
        setErrorMessage('');
        setPageStatus('unauthorized');
      });
  }, [token]);

  useEffect(() => {
    if (pageStatus !== 'authorized') return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.scroll-fade').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pageStatus]);

  const handleCopy = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWindowsDownload = () => {
    const link = document.createElement('a');
    link.href = downloadLinks.win;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      smartscreenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  };

  if (pageStatus === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--black)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontWeight: 600, fontSize: '15px' }}>Verifying your purchase...</div>
      </div>
    );
  }

  if (pageStatus === 'unauthorized') {
    return <UnauthorizedPage message={errorMessage} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)',
        borderBottom: '2px solid var(--black)', height: '64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px'
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none', color: 'var(--black)' }}>
            <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>back to home</div>
          </a>
          <a href="mailto:support@posturepal.io" style={{ textDecoration: 'none', color: 'var(--black)', fontSize: '14px', fontWeight: 600 }}>Need help?</a>
        </div>
      </nav>

      <section style={{ padding: '80px 24px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>

          {/* HERO */}
          <div className="scroll-fade" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="neo-tag" style={{ background: '#d4f57a', display: 'inline-block' }}>PAYMENT SUCCESSFUL</div>
            <h1 style={{ fontSize: '64px', margin: '20px 0', lineHeight: 1.1 }}>The group chat is at peace.</h1>
            <p style={{ fontSize: '20px', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto' }}>
              Your spine thanks you. Copy your license key below.
            </p>
          </div>

          {/* LICENSE KEY CARD */}
          <div className="neo-card scroll-fade" style={{ background: 'var(--white)', marginBottom: '48px', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Your License Key</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              This key activates PosturePal on up to 2 devices.
            </p>
            <div style={{
              background: '#d4f57a', border: '2px solid var(--black)',
              padding: '24px 20px', fontSize: '28px', letterSpacing: '8px',
              textAlign: 'center', fontFamily: 'monospace', fontWeight: 700,
              marginBottom: '16px', userSelect: 'all'
            }}>
              {licenseKey}
            </div>
            <button
              onClick={handleCopy}
              className="neo-btn"
              style={{
                background: copied ? '#d4f57a' : 'var(--black)',
                color: copied ? 'var(--black)' : 'var(--white)',
                border: '2px solid var(--black)',
                padding: '12px 32px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.2s, color 0.2s'
              }}
            >
              {copied ? '✓ Copied!' : 'Copy License Key'}
            </button>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '16px' }}>
              Keep this key safe — you'll need it to activate the app.
            </p>
          </div>

          {/* NEXT STEPS */}
          <div className="scroll-fade" style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', textAlign: 'center' }}>Next Steps</h2>
            <div className="grid-3">
              {/* Download */}
              <div className="neo-card" style={{ background: 'var(--accent)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>1️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Download</h3>
                <p style={{ color: 'var(--black)', marginBottom: '24px', flex: 1 }}>
                  Get the PosturePal app for your operating system.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a
                    href={downloadLinks.mac}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-btn"
                    style={{ background: 'var(--white)', textAlign: 'center', textDecoration: 'none', color: 'var(--black)', padding: '12px', display: 'block' }}
                  >
                    {os === 'mac' ? '★ Download for Mac' : 'Download for Mac'}
                  </a>
                  <button
                    onClick={handleWindowsDownload}
                    className="neo-btn"
                    style={{ background: 'var(--white)', textAlign: 'center', color: 'var(--black)', padding: '12px', display: 'block', width: '100%', cursor: 'pointer' }}
                  >
                    {os === 'win' ? '★ Download for Windows' : 'Download for Windows'}
                  </button>
                  {os === 'win' && (
                    <p style={{ fontSize: '11px', color: 'var(--black)', textAlign: 'center', fontWeight: 600, marginTop: '4px' }}>
                      ↓ See the install guide below
                    </p>
                  )}
                </div>
              </div>

              {/* Activate */}
              <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>2️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Activate</h3>
                <p style={{ color: 'var(--muted)', flex: 1 }}>
                  Open the app, grant camera permissions, and paste your license key when prompted.
                </p>
                <div style={{ background: '#f5f5f5', border: '2px solid black', padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600, marginTop: '24px' }}>
                  No account needed.
                </div>
              </div>

              {/* Calibrate */}
              <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>3️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Calibrate</h3>
                <p style={{ color: 'var(--muted)', flex: 1 }}>
                  Sit up straight for 3 seconds. The AI learns your baseline. Then let it run in the background.
                </p>
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', marginTop: '24px' }}>
                  The group chat is watching 👁️
                </div>
              </div>
            </div>
          </div>

          {/* MAC GATEKEEPER NOTE */}
          <div className="scroll-fade" style={{ marginBottom: '32px' }}>
            <div style={{
              background: 'var(--white)', border: '2px solid var(--black)',
              boxShadow: '6px 6px 0 var(--black)', padding: '28px'
            }}>
              <div className="neo-tag" style={{ background: 'var(--accent)', marginBottom: '12px' }}>
                MAC USERS
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>🍎 First-launch on macOS</h3>
              <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                The first time you open PosturePal on a Mac, macOS Gatekeeper may say "PosturePal cannot be opened because the developer cannot be verified." This is normal for indie apps without an Apple Developer signature. <strong style={{ color: 'var(--black)' }}>Right-click the PosturePal app in your Applications folder → choose <em>Open</em> → click <em>Open</em> in the dialog.</strong> You only need to do this once.
              </p>
            </div>
          </div>

          {/* SMARTSCREEN SECURITY SECTION */}
          <div ref={smartscreenRef} id="smartscreen-guide" style={{ scrollMarginTop: '80px' }}>

            {/* REASSURANCE CARD */}
            <div className="scroll-fade" style={{ marginBottom: '32px' }}>
              <div style={{
                background: 'var(--black)', border: '2px solid var(--black)',
                boxShadow: '8px 8px 0 var(--accent)', padding: '40px'
              }}>
                <div className="neo-tag" style={{ background: 'var(--accent)', marginBottom: '20px' }}>
                  WINDOWS SECURITY NOTE
                </div>
                <h2 style={{ fontSize: '28px', color: 'var(--white)', marginBottom: '16px' }}>
                  🔒 A Quick Note on Privacy-First Software
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '16px', lineHeight: 1.8, maxWidth: '680px' }}>
                  PosturePal runs <strong style={{ color: 'var(--accent)' }}>100% on-device AI</strong>. Your webcam feed never leaves your computer, and we never collect or track your data. Because we are a completely independent, privacy-focused app and do not bundle corporate tracking telemetry, Windows SmartScreen might flag the installer as an "Unknown Publisher" on your first run. <strong style={{ color: 'var(--accent)' }}>Don't worry — this is completely normal for indie desktop software!</strong> Follow the 3 steps below to install safely.
                </p>
              </div>
            </div>

            {/* BYPASS GUIDE */}
            <div className="scroll-fade">
              <h2 style={{ fontSize: '28px', marginBottom: '24px', textAlign: 'center' }}>
                How to Bypass the SmartScreen Warning
              </h2>
              <div className="grid-3">

                {/* Step 1 */}
                <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'var(--accent)', border: '2px solid var(--black)',
                      width: '40px', height: '40px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0,
                      boxShadow: '2px 2px 0 var(--black)'
                    }}>1</div>
                    <div style={{ fontSize: '28px' }}>⬇️</div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Download & Open</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', flex: 1, lineHeight: 1.6 }}>
                    Download and run the <strong>PosturePal-Setup.exe</strong> file. Windows will show a blue security screen — that's expected.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'var(--accent)', border: '2px solid var(--black)',
                      width: '40px', height: '40px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0,
                      boxShadow: '2px 2px 0 var(--black)'
                    }}>2</div>
                    <div style={{ fontSize: '28px' }}>ℹ️</div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Click 'More Info'</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', flex: 1, lineHeight: 1.6 }}>
                    When the Windows security screen appears, click the small underlined <strong>'More info'</strong> link right under the description text.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="neo-card" style={{ background: 'var(--accent)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: 'var(--black)', border: '2px solid var(--black)',
                      width: '40px', height: '40px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0,
                      color: 'var(--accent)', boxShadow: '2px 2px 0 var(--black)'
                    }}>3</div>
                    <div style={{ fontSize: '28px' }}>✅</div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Click 'Run Anyway'</h3>
                  <p style={{ color: 'var(--black)', fontSize: '14px', flex: 1, lineHeight: 1.6 }}>
                    A new button will appear at the bottom that says <strong>'Run anyway'</strong>. Click it to launch the setup wizard safely. You're in!
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <footer style={{ borderTop: '2px solid var(--black)', padding: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 600, background: 'var(--white)' }}>
        © 2026 PosturePal. Your spine is safe.
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cream)', fontWeight: 600 }}>
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
