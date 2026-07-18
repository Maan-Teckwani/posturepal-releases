'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DownloadHub from '../_components/DownloadHub';

const MiniNav = () => (
  <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--paper)', borderBottom: '1px solid var(--line)', height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--ink)' }}>
        <div style={{ fontWeight: 600, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>back to home</div>
      </Link>
      <a href="mailto:support@posturepal.io" style={{ textDecoration: 'none', color: 'var(--ink)', fontSize: '14px', fontWeight: 600 }}>Need help?</a>
    </div>
  </nav>
);

const PageFooter = () => (
  <footer style={{ borderTop: '1px solid var(--line)', padding: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: 'var(--muted)', background: 'var(--wash)' }}>
    © 2026 PosturePal. Your spine is safe.
  </footer>
);

function UnauthorizedPage({ message }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <MiniNav />

      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
          <div className="card card--shadow" style={{ padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Link expired or not found</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
              {message || 'This confirmation link has expired or is invalid.'} Your license key was sent to your email immediately after purchase — check your inbox and spam folder.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Link href="/" className="btn btn-accent">
                Back to Home
              </Link>
              <a href="mailto:support@posturepal.io" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'underline' }}>
                Contact support
              </a>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
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
  const downloadRef = useRef(null);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const scrollToDownload = () => {
    downloadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (pageStatus === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--ink)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontWeight: 600, fontSize: '15px' }}>Verifying your purchase...</div>
      </div>
    );
  }

  if (pageStatus === 'unauthorized') {
    return <UnauthorizedPage message={errorMessage} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <MiniNav />

      <section style={{ padding: '48px 24px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '760px', width: '100%' }}>

          {/* HERO */}
          <div className="scroll-fade" style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="pill"><span className="pill-dot" />Payment successful</div>
            <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', margin: '16px 0 12px', lineHeight: 1.1 }}>You&apos;re all set.</h1>
            <p style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '520px', margin: '0 auto' }}>
              Your spine thanks you. Copy your license key, then grab the app for your platform below.
            </p>
          </div>

          {/* LICENSE KEY CARD */}
          <div className="card card--shadow scroll-fade" style={{ marginBottom: '40px', padding: '28px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Your License Key</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
              Activates PosturePal on up to 2 devices. Keep it safe.
            </p>
            <div style={{
              background: 'var(--accent-soft)', border: 'var(--border)', borderRadius: 'var(--radius-md)',
              padding: '16px 16px', fontSize: '20px', letterSpacing: '4px',
              textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700,
              color: 'var(--forest)', marginBottom: '14px', userSelect: 'all'
            }}>
              {licenseKey}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleCopy}
                className={copied ? 'btn btn-accent' : 'btn btn-forest'}
                style={{ padding: '12px 28px', fontSize: '14px', cursor: 'pointer' }}
              >
                {copied ? '✓ Copied!' : 'Copy License Key'}
              </button>
              <button
                onClick={scrollToDownload}
                className="btn btn-accent"
                style={{ padding: '12px 28px', fontSize: '14px', cursor: 'pointer' }}
              >
                ↓ Download the app
              </button>
            </div>
          </div>

          {/* DOWNLOAD SECTION */}
          <div ref={downloadRef} id="download" className="scroll-fade" style={{ scrollMarginTop: '80px', marginBottom: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '6px' }}>Download the app</h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                We&apos;ve picked your platform automatically — switch tabs if it&apos;s wrong.
              </p>
            </div>
            <DownloadHub />
          </div>

          {/* NEXT STEPS */}
          <div className="scroll-fade" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>Then activate &amp; calibrate</h2>
            <div className="grid-2">
              {/* Activate */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔑</div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>1. Activate</h3>
                <p style={{ color: 'var(--muted)', flex: 1, fontSize: '14px', lineHeight: 1.7 }}>
                  Launch PosturePal, allow camera access, and paste your license key on the activation screen.
                </p>
                <div style={{ background: 'var(--wash)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center', fontSize: '13px', fontWeight: 600, marginTop: '18px' }}>
                  No account needed
                </div>
              </div>

              {/* Calibrate */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>2. Calibrate</h3>
                <p style={{ color: 'var(--muted)', flex: 1, fontSize: '14px', lineHeight: 1.7 }}>
                  Sit up straight for 3 seconds — the AI learns your baseline. Then let it run quietly in the background.
                </p>
                <div style={{ color: 'var(--emerald)', fontWeight: 600, fontSize: '13px', marginTop: '18px', textAlign: 'center' }}>
                  Your posture guardian is live 👁️
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <PageFooter />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--paper)', fontWeight: 600 }}>
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
