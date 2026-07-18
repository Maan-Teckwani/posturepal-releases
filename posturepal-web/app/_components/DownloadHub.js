'use client';

import React, { useState, useEffect } from 'react';

const WIN_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL_WIN ||
  'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-Setup.exe';

const MAC_ARM_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL_MAC_ARM ||
  'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-arm64.dmg';

const MAC_X64_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL_MAC_X64 ||
  'https://github.com/Maan-Teckwani/posturepal-releases/releases/latest/download/PosturePal-x64.dmg';

function triggerDownload(url) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function detectOs() {
  if (typeof navigator === 'undefined') return 'win';
  const ua = navigator.userAgent || '';
  if (/Mac/i.test(ua)) return 'mac';
  if (/Win/i.test(ua)) return 'win';
  return 'win';
}

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? 'var(--forest)' : 'transparent',
        color: active ? 'var(--paper-on-dark)' : 'var(--muted)',
        border: 'none',
        padding: '14px 16px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ onClick, children, sub }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-accent"
      style={{
        width: '100%',
        padding: '18px 24px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        lineHeight: 1.2,
        whiteSpace: 'normal',
      }}
    >
      <span style={{ fontWeight: 700 }}>{children}</span>
      {sub && (
        <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.75 }}>{sub}</span>
      )}
    </button>
  );
}

function SecondaryButton({ onClick, children, sub }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-ghost"
      style={{
        width: '100%',
        padding: '14px 24px',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        lineHeight: 1.2,
        whiteSpace: 'normal',
      }}
    >
      <span style={{ fontWeight: 600 }}>{children}</span>
      {sub && (
        <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.7 }}>{sub}</span>
      )}
    </button>
  );
}

export default function DownloadHub({ showInstallGuide = true }) {
  const [os, setOs] = useState('win'); // 'win' | 'mac'

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOs(detectOs());
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {/* DOWNLOAD CARD */}
      <div
        className="card card--shadow"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: showInstallGuide ? '24px' : '0',
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
          <Tab active={os === 'win'} onClick={() => setOs('win')}>
            Windows
          </Tab>
          <Tab active={os === 'mac'} onClick={() => setOs('mac')}>
            Mac
          </Tab>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 28px 32px' }}>
          {os === 'win' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <PrimaryButton
                onClick={() => triggerDownload(WIN_URL)}
                sub="Windows 10 or 11 · ~150 MB"
              >
                ⬇  Download for Windows
              </PrimaryButton>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  textAlign: 'center',
                  margin: '6px 0 0',
                  lineHeight: 1.5,
                }}
              >
                Installs as <strong>PosturePal-Setup.exe</strong>. See the install guide below if Windows shows a SmartScreen warning.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--muted)',
                  marginBottom: '2px',
                }}
              >
                Which Mac do you have?
              </div>
              <PrimaryButton
                onClick={() => triggerDownload(MAC_ARM_URL)}
                sub="M1 · M2 · M3 · M4 (most Macs from late 2020 onward)"
              >
                ⬇  Apple Silicon
              </PrimaryButton>
              <SecondaryButton
                onClick={() => triggerDownload(MAC_X64_URL)}
                sub="Pre-2020 Intel-based Macs"
              >
                ⬇  Intel Mac
              </SecondaryButton>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  textAlign: 'center',
                  margin: '6px 0 0',
                  lineHeight: 1.5,
                }}
              >
                Not sure? Open <strong>Apple menu → About This Mac</strong>. If it says
                {' '}<strong>Apple M1/M2/M3/M4</strong>, pick the first one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* INSTALL GUIDE */}
      {showInstallGuide && (
        <div
          className="dark-band"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
          }}
        >
          {os === 'win' ? (
            <>
              <div className="kicker" style={{ marginBottom: '14px' }}>Windows install guide</div>
              <h3 style={{ fontSize: '22px', marginBottom: '12px', lineHeight: 1.25 }}>
                About the &quot;Windows protected your PC&quot; warning
              </h3>
              <p style={{ color: 'var(--sage)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                PosturePal is a small indie app. Without an expensive code-signing certificate, Windows SmartScreen flags it as
                {' '}<em>&quot;Unknown publisher&quot;</em>. The app is safe — it runs 100% on-device and never uploads your webcam or data.
              </p>

              <ol style={{ color: 'var(--paper-on-dark)', fontSize: '14px', lineHeight: 1.85, paddingLeft: '20px', margin: 0 }}>
                <li>Double-click <strong>PosturePal-Setup.exe</strong>.</li>
                <li>If the blue <em>&quot;Windows protected your PC&quot;</em> screen appears, click <strong style={{ color: 'var(--accent)' }}>More info</strong>.</li>
                <li>Click the <strong style={{ color: 'var(--accent)' }}>Run anyway</strong> button.</li>
                <li>Follow the installer prompts. Launch PosturePal from the Start Menu.</li>
              </ol>
            </>
          ) : (
            <>
              <div className="kicker" style={{ marginBottom: '14px' }}>Mac install guide</div>
              <h3 style={{ fontSize: '22px', marginBottom: '12px', lineHeight: 1.25 }}>
                Getting past macOS Gatekeeper
              </h3>
              <p style={{ color: 'var(--sage)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                We haven&apos;t yet signed PosturePal with an Apple Developer certificate, so macOS will show a Gatekeeper warning
                on first launch. The app is safe — it runs entirely on your device and never uploads anything.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px', fontWeight: 700, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
                }}>
                  If you see &quot;cannot be opened because the developer cannot be verified&quot;
                </div>
                <ol style={{ color: 'var(--paper-on-dark)', fontSize: '14px', lineHeight: 1.85, paddingLeft: '20px', margin: 0 }}>
                  <li>Open the <strong>.dmg</strong> and drag PosturePal into <strong>Applications</strong>.</li>
                  <li>Open the Applications folder, <strong>right-click</strong> PosturePal → <strong style={{ color: 'var(--accent)' }}>Open</strong>.</li>
                  <li>Click <strong style={{ color: 'var(--accent)' }}>Open</strong> again in the dialog.</li>
                  <li>Allow camera access when prompted.</li>
                </ol>
              </div>

              <div>
                <div style={{
                  fontSize: '12px', fontWeight: 700, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
                }}>
                  If you see &quot;PosturePal is damaged and can&apos;t be opened&quot;
                </div>
                <p style={{ color: 'var(--sage)', fontSize: '13.5px', lineHeight: 1.7, marginBottom: '10px' }}>
                  macOS added a quarantine tag to the download. Open <strong>Terminal</strong> (⌘ + Space → &quot;Terminal&quot;)
                  and paste this, then press Enter:
                </p>
                <pre style={{
                  background: 'rgba(243,240,231,0.07)',
                  border: '1px solid rgba(243,240,231,0.2)',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: 'var(--accent)',
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  overflowX: 'auto',
                  margin: 0,
                  borderRadius: '8px',
                }}>
                  xattr -dr com.apple.quarantine /Applications/PosturePal.app
                </pre>
              </div>
            </>
          )}

          <p style={{
            color: 'var(--sage)', fontSize: '12px',
            margin: '20px 0 0', lineHeight: 1.6,
          }}>
            Stuck? Email{' '}
            <a href="mailto:maanteckwani@gmail.com" style={{ color: 'var(--accent)' }}>maanteckwani@gmail.com</a>.
          </p>
        </div>
      )}
    </div>
  );
}
