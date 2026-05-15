'use client';

import React, { useState, useEffect } from 'react';

export default function SuccessPage() {
  const [os, setOs] = useState('unknown');

  const downloadLinks = {
    mac: process.env.NEXT_PUBLIC_DOWNLOAD_URL_MAC || 'https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest/download/PosturePal.dmg',
    win: process.env.NEXT_PUBLIC_DOWNLOAD_URL_WIN || 'https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest/download/PosturePal-Setup.exe',
    linux: process.env.NEXT_PUBLIC_DOWNLOAD_URL_LINUX || 'https://github.com/YOUR_USERNAME/posturepal-releases/releases/latest/download/PosturePal.AppImage'
  };

  useEffect(() => {
    // Basic OS detection for the download button
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') !== -1) setOs('mac');
    else if (userAgent.indexOf('win') !== -1) setOs('win');
    else if (userAgent.indexOf('linux') !== -1) setOs('linux');
    
    // Add scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-fade').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--white)',
        borderBottom: '2px solid var(--black)',
        height: '64px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none', color: 'var(--black)' }}>
            <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px', letterSpacing: '0.02em' }}>back to home</div>
          </a>
          <div className="nav-links">
            <a href="mailto:support@posturepal.io" style={{ textDecoration: 'none', color: 'var(--black)', fontSize: '14px', fontWeight: 600 }}>Need help?</a>
          </div>
        </div>
      </nav>

      {/* SUCCESS HERO */}
      <section style={{ padding: '80px 24px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          
          <div className="scroll-fade" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="neo-tag" style={{ background: '#d4f57a' }}>PAYMENT SUCCESSFUL</div>
            <h1 style={{ fontSize: '64px', margin: '20px 0', lineHeight: 1.1 }}>The group chat is at peace.</h1>
            <p style={{ fontSize: '20px', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto' }}>
              Your spine thanks you. A receipt and your license key have been sent to your email.
            </p>
          </div>

          {/* LICENSE KEY CARD */}
          <div className="neo-card scroll-fade" style={{ background: 'var(--white)', marginBottom: '48px', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>Check your inbox</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '24px' }}>
              Your PosturePal license key and download links have been emailed to you. If you do not see it within a few minutes, check your spam folder.
            </p>

            <div style={{ 
              background: '#f5f5f5', 
              border: '2px solid var(--black)', 
              padding: '24px 28px', 
              fontSize: '18px', 
              fontFamily: 'Inter, sans-serif', 
              fontWeight: '600', 
              letterSpacing: '1px',
              maxWidth: '560px',
              margin: '0 auto',
              boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.05)'
            }}>
              Your license key is on the way to your email address.
            </div>

            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '16px' }}>*The same license works on up to 2 devices.</p>
          </div>

          {/* DOWNLOAD & SETUP */}
          <div className="scroll-fade">
            <h2 style={{ fontSize: '32px', marginBottom: '24px', textAlign: 'center' }}>Next Steps</h2>
            
            <div className="grid-3">
              <div className="neo-card" style={{ background: 'var(--accent)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>1️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>Download</h3>
                <p style={{ color: 'var(--black)', marginBottom: '24px', flex: 1 }}>Get the PosturePal app for your operating system.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a href={downloadLinks.mac} target="_blank" rel="noopener noreferrer" className="neo-btn" style={{ background: 'var(--white)', textAlign: 'center', textDecoration: 'none', color: 'var(--black)', padding: '12px' }}>
                    {os === 'mac' ? '★ Download for Mac' : 'Download for Mac'}
                  </a>
                  <a href={downloadLinks.win} target="_blank" rel="noopener noreferrer" className="neo-btn" style={{ background: 'var(--white)', textAlign: 'center', textDecoration: 'none', color: 'var(--black)', padding: '12px' }}>
                    {os === 'win' ? '★ Download for Windows' : 'Download for Windows'}
                  </a>
                </div>
              </div>

              <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>2️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>Install & Activate</h3>
                <p style={{ color: 'var(--muted)', flex: 1 }}>Open the app, grant camera permissions, and paste your license key when prompted.</p>
                <div style={{ background: '#f5f5f5', border: '2px solid black', padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600, marginTop: '24px' }}>
                  No account needed.
                </div>
              </div>

              <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>3️⃣</div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>Calibrate</h3>
                <p style={{ color: 'var(--muted)', flex: 1 }}>Sit up straight for 3 seconds. The AI will learn your baseline. Then, let it run in the background.</p>
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', marginTop: '24px' }}>
                  The group chat is watching 👁️
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      
      {/* FOOTER */}
      <footer style={{ borderTop: '2px solid var(--black)', padding: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 600, background: 'var(--white)' }}>
        © 2026 PosturePal. Your spine is safe.
      </footer>
    </div>
  );
}
