'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DownloadHub from '../_components/DownloadHub';

const MiniNav = ({ showHelp = false }) => (
  <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--paper)', borderBottom: '1px solid var(--line)', height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--ink)' }}>
        <div style={{ fontWeight: 600, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>back to home</div>
      </Link>
      {showHelp && (
        <a href="mailto:support@posturepal.io" style={{ textDecoration: 'none', color: 'var(--ink)', fontSize: '14px', fontWeight: 600 }}>Need help?</a>
      )}
    </div>
  </nav>
);

function DownloadContent() {
  const searchParams = useSearchParams();
  // Backwards-compatible: accept either ?trial_key= or the older ?token=.
  const trialKey = (searchParams.get('trial_key') || searchParams.get('token') || '').toUpperCase();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = () => {
    if (!trialKey) return;
    navigator.clipboard.writeText(trialKey).then(() => setCopied(true)).catch(() => {});
  };

  if (!trialKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
        <MiniNav />
        <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
          <div className="card card--shadow" style={{ padding: '48px', maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>No trial key found</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.7 }}>
              Start your free trial to get a trial key and download link.
            </p>
            <a href="/individuals#pricing-ind" className="btn btn-accent">
              Start Free Trial
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      <MiniNav showHelp />

      <section style={{ padding: '48px 24px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '720px', width: '100%' }}>

          {/* HERO */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="pill"><span className="pill-dot" />Your free trial key is ready</div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '14px 0 12px', lineHeight: 1.1 }}>Download PosturePal &amp; paste your key.</h1>
            <p style={{ fontSize: '17px', color: 'var(--muted)', maxWidth: '520px', margin: '0 auto' }}>
              Your 21-day trial timer starts the moment you activate the key inside the app.
            </p>
          </div>

          {/* TRIAL KEY CARD */}
          <div className="card card--shadow" style={{ padding: '28px', marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Your Free Trial Key</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '18px' }}>
              Copy this. You&apos;ll paste it into PosturePal after installing.
            </p>
            <div style={{
              background: 'var(--accent-soft)', border: 'var(--border)', borderRadius: 'var(--radius-md)',
              padding: '18px 16px', fontSize: '22px', letterSpacing: '4px',
              textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700,
              color: 'var(--forest)', marginBottom: '14px', userSelect: 'all'
            }}>
              {trialKey}
            </div>
            <button
              onClick={handleCopy}
              className={copied ? 'btn btn-accent' : 'btn btn-forest'}
              style={{ padding: '12px 28px', fontSize: '14px', cursor: 'pointer' }}
            >
              {copied ? '✓ Copied!' : 'Copy Trial Key'}
            </button>
          </div>

          {/* SECTION HEADING */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>Download the app</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              We&apos;ve picked your platform automatically — switch tabs if it&apos;s wrong.
            </p>
          </div>

          {/* DOWNLOAD HUB (Windows / Mac tabs + install guide) */}
          <div style={{ marginBottom: '36px' }}>
            <DownloadHub />
          </div>

          {/* AFTER-INSTALL REMINDER */}
          <div className="card" style={{ padding: '24px 28px', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
            <div style={{
              background: 'var(--forest)', color: 'var(--accent)',
              borderRadius: 'var(--radius-sm)',
              width: '44px', height: '44px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0,
            }}>
              →
            </div>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>After installing, paste your trial key</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                Launch PosturePal, allow camera access, and paste the trial key shown above on the activation screen.
                Your 21-day trial starts immediately.
              </p>
            </div>
          </div>

        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: 'var(--muted)', background: 'var(--wash)' }}>
        © 2026 PosturePal. Your spine is safe.
      </footer>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--paper)', fontWeight: 600 }}>
        Loading...
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
