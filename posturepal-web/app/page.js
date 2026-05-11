'use client';

import React, { useState, useEffect } from 'react';

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK || '#';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
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
    <>
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
          <div style={{ fontWeight: 700, fontSize: '18px' }}>PosturePal 🦐</div>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 500 }}>
            <a href="#benefits" style={{ textDecoration: 'none', color: 'var(--black)' }}>Benefits</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--black)' }}>How it works</a>
            <a href="#pricing" style={{ textDecoration: 'none', color: 'var(--black)' }}>Pricing</a>
            <a href="#faq" style={{ textDecoration: 'none', color: 'var(--black)' }}>FAQ</a>
          </div>
          <a href={STRIPE_LINK} className="neo-btn" style={{ fontSize: '13px', padding: '10px 20px' }}>
            Get PosturePal — $17
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-cream" style={{ padding: '80px 0 0 0', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: '1 1 55%', paddingRight: '60px', minWidth: '300px' }}>
            <div className="neo-tag fade-up">AI-POWERED POSTURE COACH</div>
            <h1 className="fade-up fade-up-delay-1" style={{ fontSize: '72px', margin: '20px 0' }}>Stop sitting like a shrimp.</h1>
            <p className="fade-up fade-up-delay-2" style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '480px' }}>
              PosturePal watches your posture while you work. Get a popup the moment you slouch. Fix it in seconds — without leaving your desk.
            </p>
            <div className="hero-buttons fade-up fade-up-delay-3" style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
              <a href={STRIPE_LINK} className="neo-btn">Get PosturePal — $17</a>
              <a href="#how-it-works" className="neo-btn outline">See how it works ↓</a>
            </div>
            <div className="fade-up fade-up-delay-4" style={{ marginTop: '20px', display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span>✓ One-time payment</span>
              <span>✓ Mac, Windows & Linux</span>
              <span>✓ Works offline</span>
            </div>
          </div>
          
          <div style={{ flex: '1 1 45%', minWidth: '300px', display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <div className="neo-card" style={{ width: '100%', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 4s ease-in-out infinite', padding: 0, overflow: 'hidden', flexDirection: 'column' }}>
              <div style={{ width: '100%', padding: '10px 16px', background: '#e0e0e0', borderBottom: '2px solid var(--black)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }}></div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: 600, fontFamily: 'sans-serif' }}>PosturePal</div>
              </div>
              <div style={{ width: '100%', flex: 1, background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px', textShadow: '0 0 10px rgba(212, 245, 122, 0.5)' }}>SCORE: 87</div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', fontSize: '14px', fontWeight: 600 }}>
                  <span>✓ Head</span>
                  <span>✓ Shoulders</span>
                  <span>✓ Distance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER / MARQUEE STRIP */}
      <div style={{ background: 'var(--black)', color: 'var(--white)', padding: '14px 0', borderTop: '2px solid var(--black)', borderBottom: '2px solid var(--black)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: 'fit-content', animation: 'marquee 20s linear infinite' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', gap: '40px', paddingRight: '40px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
              <span>✦ WORKS WHILE YOU CODE</span>
              <span>✦ FULLY OFFLINE</span>
              <span>✦ 3-SECOND ALERTS</span>
              <span>✦ CALIBRATED TO YOU</span>
              <span>✦ MAC · WINDOWS · LINUX</span>
              <span>✦ $17 ONE-TIME</span>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <section id="benefits" className="bg-cream">
        <div className="container">
          <div className="neo-tag">THE PROBLEM</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', maxWidth: '600px', marginBottom: '48px' }}>Bad posture is silently wrecking you.</h2>
          
          <div className="grid-3">
            <div className="neo-card scroll-fade">
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🤕</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Space Grotesk, sans-serif' }}>Neck and back pain</h3>
              <p style={{ color: 'var(--muted)' }}>Hours of forward head posture adds up to chronic pain by your 30s.</p>
            </div>
            <div className="neo-card scroll-fade" style={{ background: 'var(--accent)' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>😴</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Space Grotesk, sans-serif' }}>Lower energy</h3>
              <p style={{ color: 'var(--black)' }}>Slouching compresses your lungs, reduces oxygen, and kills your focus.</p>
            </div>
            <div className="neo-card scroll-fade">
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>💸</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', fontFamily: 'Space Grotesk, sans-serif' }}>Doctor bills</h3>
              <p style={{ color: 'var(--muted)' }}>The average physio visit costs more than PosturePal. Forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-white">
        <div className="container">
          <div className="neo-tag">HOW IT WORKS</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '56px' }}>Three steps. Five seconds to set up.</h2>
          
          <div className="grid-3">
            {[
              { num: "01", title: "Open & Calibrate", desc: "Sit up straight and click Calibrate. PosturePal memorizes your perfect posture in 3 seconds.", tag: "3 seconds" },
              { num: "02", title: "Close the app", desc: "PosturePal hides to your system tray and watches silently while you work, code, or browse.", tag: "Always running" },
              { num: "03", title: "Get nudged", desc: "The moment you slouch for 3 seconds, a popup appears. See yourself. Fix it. It disappears.", tag: "Instant feedback" }
            ].map((step, i) => (
              <div key={i} className="neo-card scroll-fade" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '20px', fontFamily: 'Instrument Serif', fontSize: '120px', color: '#f0ece3', zIndex: 0, pointerEvents: 'none', lineHeight: 1 }}>{step.num}</div>
                <div style={{ position: 'relative', zIndex: 1, marginTop: '40px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h3>
                  <p style={{ color: 'var(--muted)' }}>{step.desc}</p>
                  <div className="neo-tag" style={{ marginTop: '20px', marginBottom: 0 }}>{step.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-cream">
        <div className="container">
          <div className="neo-tag">FEATURES</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Everything you need, nothing you don't.</h2>
          
          <div className="grid-2">
            {[
              { icon: "🎯", title: "Calibrated to YOU", desc: "Set your baseline once. Scoring is relative to YOUR perfect posture, not a generic average." },
              { icon: "🔴", title: "Three signal breakdown", desc: "Head position, shoulder slouch, and screen distance tracked as three independent signals." },
              { icon: "🔔", title: "3-second alert", desc: "Popup appears after just 3 seconds of bad posture. The fastest feedback loop possible." },
              { icon: "📊", title: "Session analytics", desc: "Daily, weekly, and monthly charts of your posture score. See trends over time." },
              { icon: "🏆", title: "XP & leaderboard", desc: "Earn XP for every minute of good posture. Level up from Shrimp to PosturePal Master." },
              { icon: "🔒", title: "Fully offline AI", desc: "MoveNet runs on your device. Zero webcam footage ever leaves your computer. Ever." }
            ].map((f, i) => (
              <div key={i} className="neo-card scroll-fade" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--accent)', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="bg-white" style={{ overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: '48px' }}>
          <div className="neo-tag">TESTIMONIALS</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Real people. Actual backs.</h2>
        </div>
        
        <div style={{ display: 'flex', width: 'fit-content', animation: 'marquee 30s linear infinite' }}>
          {[1, 2].map(group => (
            <div key={group} style={{ display: 'flex', gap: '24px', paddingRight: '24px', paddingLeft: group === 1 ? '40px' : '0' }}>
              {[
                { quote: "It's like having a very annoying but very helpful physical therapist on my monitor.", name: "Sarah J." },
                { quote: "The offline privacy is what sold me. The fact that it actually fixed my neck pain is a bonus.", name: "Mark T." },
                { quote: "I didn't realize how much I was leaning forward until PosturePal caught me 20 times on day one.", name: "Elena R." },
                { quote: "Best $17 I've ever spent. The gamification makes me actually want to sit up straight.", name: "David K." },
                { quote: "My chiropractor asked what I changed. I told him I bought a $17 app. He was not amused.", name: "Priya M." },
                { quote: "Three weeks in and my afternoon headaches are basically gone. Coincidence? I think not.", name: "James L." }
              ].map((t, i) => (
                <div key={i} className="neo-card" style={{ width: '300px', flexShrink: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: '16px', marginBottom: '16px', lineHeight: 1.5 }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'black', color: 'white', borderRadius: '50%', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.name.split(' ')[0][0]}{t.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                      <div style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '2px' }}>★★★★★</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="bg-cream" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="neo-tag">PRICING</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '16px' }}>One price. Forever yours.</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '48px' }}>No subscription. No upsells. Pay once, use forever.</p>
          
          <div className="neo-card scroll-fade" style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--accent)', border: '2px solid black', boxShadow: '8px 8px 0 black', padding: '48px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: '96px', lineHeight: 1, fontWeight: 400 }}>$17</span>
              <span style={{ fontSize: '14px', fontWeight: 700, marginLeft: '4px', marginTop: '16px' }}>USD</span>
            </div>
            
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', margin: '12px 0 32px' }}>One-time payment — no subscription, ever.</p>
            
            <div style={{ textAlign: 'left', margin: '0 auto 32px', maxWidth: '280px' }}>
              {[
                "✓ Lifetime license (2 devices)",
                "✓ Mac, Windows & Linux",
                "✓ All future updates free",
                "✓ Fully offline — no account needed",
                "✓ Session analytics & leaderboard"
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.15)', fontSize: '15px' }}>
                  {feature}
                </div>
              ))}
            </div>
            
            <a href={STRIPE_LINK} className="neo-btn" style={{ width: '100%', fontSize: '16px', justifyContent: 'center' }}>Get PosturePal Now →</a>
            
            <div style={{ marginTop: '16px', fontSize: '13px', display: 'flex', justifyContent: 'center', gap: '16px', fontWeight: 600 }}>
              <span>🔒 Secure payment</span>
              <span>|</span>
              <span>14-day money-back guarantee</span>
            </div>
          </div>
          
          <p className="scroll-fade" style={{ marginTop: '20px', fontStyle: 'italic', color: 'var(--muted)' }}>Cheaper than one physio appointment.</p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="bg-white">
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="neo-tag">FAQ</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Questions answered.</h2>
          
          <div className="scroll-fade">
            {[
              { q: "Does it work on Mac, Windows, and Linux?", a: "Yes, PosturePal ships as a native installer for all three platforms." },
              { q: "Does my webcam footage get uploaded anywhere?", a: "Never. All AI processing happens on your device. No footage leaves your computer." },
              { q: "What if I wear glasses or have a beard?", a: "MoveNet tracks skeletal keypoints, not facial features — glasses and facial hair don't affect accuracy." },
              { q: "Can I use it on two computers?", a: "Yes, the $17 license covers 2 devices." },
              { q: "What if I want a refund?", a: "Email us within 14 days, no questions asked." },
              { q: "Does it work in the dark?", a: "You need reasonable lighting for the webcam. A standard desk lamp is enough." }
            ].map((faq, i) => (
              <div key={i} style={{ border: '2px solid black', marginBottom: '-2px', position: 'relative' }}>
                <div 
                  onClick={() => toggleFaq(i)}
                  style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '16px', cursor: 'pointer', background: openFaq === i ? 'var(--accent)' : 'var(--white)', transition: 'background 0.2s' }}
                >
                  {faq.q}
                  <span style={{ fontSize: '20px', fontWeight: 300 }}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, borderTop: '2px solid black', background: 'white' }}>
                    <p style={{ marginTop: '20px' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / FOOTER SECTION */}
      <section className="bg-black" style={{ color: 'white', padding: '100px 24px 60px', textAlign: 'center' }}>
        <div className="container scroll-fade">
          <h2 style={{ fontSize: '64px', color: 'white', marginBottom: '32px' }}>Your back will thank you.</h2>
          <a href={STRIPE_LINK} className="neo-btn accent" style={{ fontSize: '16px', padding: '18px 40px' }}>Get PosturePal for $17</a>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px', fontSize: '14px' }}>One-time payment. Lifetime license.</p>
          
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '60px 0 40px' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>PosturePal 🦐</div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
              <a href="#benefits" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Benefits</a>
              <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>How it works</a>
              <a href="#pricing" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Pricing</a>
              <a href="#faq" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>FAQ</a>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2025 PosturePal</div>
          </div>
        </div>
      </section>
    </>
  );
}
