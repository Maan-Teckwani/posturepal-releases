'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const WaitlistForm = ({ buttonText = "Join Waitlist", style = {} }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    if (!supabase) {
      console.warn('Supabase not configured. Simulating success.');
      setStatus('loading');
      setTimeout(() => setStatus('success'), 1000);
      return;
    }

    setStatus('loading');
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .insert([{ email }]);

      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error('Waitlist error:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ background: 'var(--accent)', color: 'var(--black)', padding: '14px 20px', fontWeight: 700, border: '2px solid var(--black)', display: 'inline-block', ...style }}>
        ✓ The group chat has been notified. You're on the list!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap', ...style }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        style={{
          flex: '1',
          minWidth: '200px',
          padding: '14px 16px',
          border: '2px solid var(--black)',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '15px',
          outline: 'none',
          boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.05)',
          color: 'var(--black)'
        }}
      />
      <button
        type="submit"
        className="neo-btn accent"
        disabled={status === 'loading'}
        style={{ opacity: status === 'loading' ? 0.7 : 1, whiteSpace: 'nowrap' }}
      >
        {status === 'loading' ? 'Joining...' : buttonText}
      </button>
      {status === 'error' && (
        <div style={{ width: '100%', color: '#ef4444', fontSize: '13px', marginTop: '4px', fontWeight: 600 }}>
          Something went wrong. The group chat rejected it. Try again.
        </div>
      )}
    </form>
  );
};

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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>PosturePal</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>your spine's intervention app</div>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 500 }}>
            <a href="#benefits" style={{ textDecoration: 'none', color: 'var(--black)' }}>Benefits</a>
            <a href="#intervention" style={{ textDecoration: 'none', color: 'var(--black)' }}>The Chat</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--black)' }}>How it works</a>
            <a href="#pricing" style={{ textDecoration: 'none', color: 'var(--black)' }}>Waitlist</a>
            <a href="#faq" style={{ textDecoration: 'none', color: 'var(--black)' }}>FAQ</a>
          </div>
          <div className="nav-links">
            <a href="#pricing" className="neo-btn" style={{ fontSize: '13px', padding: '10px 20px', background: 'var(--accent)', color: 'var(--black)' }}>
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-cream" style={{ padding: '80px 0 0 0', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: '1 1 55%', paddingRight: '60px', minWidth: '300px' }}>
            <div className="neo-tag fade-up">YOUR NECK ASKED US TO INTERVENE</div>
            <h1 className="fade-up fade-up-delay-1" style={{ fontSize: '76px', margin: '20px 0 0 0', lineHeight: 1.1 }}>Your spine has a group chat.</h1>
            <div className="fade-up fade-up-delay-1" style={{ fontSize: '40px', fontFamily: 'Instrument Serif', fontStyle: 'italic', marginBottom: '20px', fontWeight: 400 }}>It's not looking good in there.</div>
            <p className="fade-up fade-up-delay-2" style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '480px', marginBottom: '32px' }}>
              PosturePal uses your webcam and on-device AI to catch you slouching before your body files a formal complaint.
              <strong> We're launching soon. Get on the waitlist.</strong>
            </p>

            <div className="fade-up fade-up-delay-3" style={{ maxWidth: '420px' }}>
              <WaitlistForm buttonText="Join Waitlist" />
            </div>

            <div className="fade-up fade-up-delay-4" style={{ marginTop: '20px', display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span>✓ Mac, Windows & Linux</span>
              <span>✓ 100% Offline AI</span>
            </div>
          </div>

          <div style={{ flex: '1 1 45%', minWidth: '300px', display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '60px' }}>
            <div style={{ animation: 'float 4s ease-in-out infinite', width: '100%', maxWidth: '380px' }}>
              <div className="neo-card" style={{ width: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '0' }}>
                <div style={{ padding: '16px', borderBottom: '2px solid var(--black)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '-4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#8b5a2b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '-8px', border: '1px solid white' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '-8px', border: '1px solid white' }}>👁</div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginLeft: '-8px', border: '1px solid white' }}></div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>🧠 The Body Collective</div>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Neck 🟤</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>he's doing the goblin lean again</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:41 AM</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Lower Back 🔴</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>I can't keep carrying this team</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:41 AM</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Eyes 👁</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>3 inches from the monitor btw<br />just thought you should know</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:42 AM</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>You</div>
                    <div style={{ background: 'var(--black)', color: 'var(--white)', padding: '8px 12px', borderRadius: '12px', borderTopRightRadius: '0', maxWidth: '85%' }}>I'm fine</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginRight: '4px' }}>9:42 AM</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '3px' }}>Shoulders 🟡</div>
                    <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '12px', borderTopLeftRadius: '0', maxWidth: '85%' }}>he is NOT fine</div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px', marginLeft: '4px' }}>9:42 AM</div>
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderTop: '2px solid var(--black)', background: '#fafafa' }}>
                  <div style={{ background: '#e5e7eb', borderRadius: '20px', padding: '8px 16px', color: 'var(--muted)', fontSize: '13px' }}>Type a message...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER / MARQUEE STRIP */}
      <div style={{ background: 'var(--black)', color: 'var(--white)', padding: '16px 0', borderTop: '2px solid var(--black)', borderBottom: '2px solid var(--black)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', width: 'fit-content', animation: 'marquee 20s linear infinite' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '80px', paddingRight: '80px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> NO SUBSCRIPTIONS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> MAC · WINDOWS · LINUX</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> 100% OFFLINE</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: 'var(--accent)' }}>✦</span> ON-DEVICE AI</span>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <section id="benefits" className="bg-cream">
        <div className="container">
          <div className="neo-tag">THE SITUATION</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', maxWidth: '600px', marginBottom: '16px' }}>The group chat is not happy.</h2>
          <p className="scroll-fade" style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '48px', maxWidth: '600px' }}>Your body parts have been in crisis mode for months. Here's what they're saying.</p>

          <div className="grid-3">
            <div className="neo-card scroll-fade" style={{ background: 'var(--accent)' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🤕</div>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Neck is done.</h3>
              <div style={{ borderLeft: '3px solid black', paddingLeft: '12px', fontStyle: 'italic', fontSize: '14px', marginBottom: '12px', color: 'black' }}>
                "this is the 47th goblin lean today. I'm filing HR."<br />— Neck, 2:34 PM
              </div>
              <p style={{ color: 'var(--muted)' }}>Forward head posture adds 10 lbs of pressure per inch of tilt. Your neck is doing the work of a structural beam.</p>
            </div>
            <div className="neo-card scroll-fade" style={{ background: 'var(--white)' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>💀</div>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Lower Back has left the chat.</h3>
              <div style={{ borderLeft: '3px solid black', paddingLeft: '12px', fontStyle: 'italic', fontSize: '14px', marginBottom: '12px', color: 'black' }}>
                "carrying the whole team again. don't @ me."<br />— Lower Back, on read
              </div>
              <p style={{ color: 'var(--muted)' }}>Slouching compresses your lumbar discs and reduces oxygen to your brain. The fog you feel at 3pm? That's Lower Back's revenge.</p>
            </div>
            <div className="neo-card scroll-fade" style={{ background: 'var(--white)' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>👁️</div>
              <h3 style={{ fontSize: '20px', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Eyes filed a formal complaint.</h3>
              <div style={{ borderLeft: '3px solid black', paddingLeft: '12px', fontStyle: 'italic', fontSize: '14px', marginBottom: '12px', color: 'black' }}>
                "2.5 inches from the monitor. this is not a drill."<br />— Eyes, sent with high importance
              </div>
              <p style={{ color: 'var(--muted)' }}>Screen distance affects both eye strain and posture. Too close and your whole upper body collapses forward to compensate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW INTERVENTION SECTION */}
      <section id="intervention" className="bg-white">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="neo-tag">EXHIBIT A</div>
            <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '16px' }}>The full conversation.</h2>
            <p className="scroll-fade" style={{ fontSize: '17px', color: 'var(--muted)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto' }}>
              Recovered from your spine's group chat. Posted with permission (they insisted).
            </p>
          </div>

          <div className="scroll-fade" style={{ maxWidth: '600px', margin: '0 auto', background: '#f5f5f5', border: '2px solid black', boxShadow: '6px 6px 0 black', borderRadius: '0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Chat header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', paddingBottom: '16px', borderBottom: '2px solid black' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💬</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>🧠 The Body Collective</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Neck, Lower Back, Eyes, Shoulders, and You</div>
              </div>
            </div>

            {/* Date divider */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <div style={{ background: 'rgba(0,0,0,0.08)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>Today 9:41 AM</div>
            </div>

            {/* Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Neck 🟤</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>ok so are we going to talk about what's happening</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Lower Back 🔴</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>I've been trying to raise this for MONTHS</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>the disc compression alone. I can't even</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Eyes 👁</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>not to alarm anyone but we are approximately 2.5 inches from the monitor</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Shoulders 🟡</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>I've been up around my ears since the standup call</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Neck 🟤</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>the goblin lean is getting worse btw. this is day 3</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <div style={{ background: 'black', color: 'white', borderRadius: '12px 0 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '70%' }}>I'm literally fine guys</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Lower Back 🔴</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>he said fine</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>HE SAID FINE</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Eyes 👁</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>reminder that I've sent 14 strain alerts this week. unopened.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Shoulders 🟡</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>we have collectively decided to schedule an intervention</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>Neck 🟤</div>
                <div style={{ background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '0 12px 12px 12px', padding: '10px 14px', fontSize: '14px', maxWidth: '80%', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>PosturePal starts now. we already downloaded it.</div>
              </div>

              {/* Typing indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Neck 🟤 is typing
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#999', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out both' }}></div>
                    <div style={{ width: '6px', height: '6px', background: '#999', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
                    <div style={{ width: '6px', height: '6px', background: '#999', borderRadius: '50%', animation: 'typingDot 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <p className="scroll-fade" style={{ textAlign: 'center', fontSize: '15px', fontStyle: 'italic', color: 'var(--muted)', marginTop: '24px', marginBottom: '24px' }}>
            Sound familiar? PosturePal stages the intervention your body has been planning.
          </p>
          <div className="scroll-fade" style={{ display: 'flex', justifyContent: 'center' }}>
            <WaitlistForm buttonText="Get on the waitlist" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-cream">
        <div className="container">
          <div className="neo-tag">THE INTERVENTION PLAN</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '56px' }}>Three steps. The group chat goes quiet.</h2>

          <div className="grid-3">
            {[
              { num: "01", title: "Sit up straight. Click Calibrate.", desc: "PosturePal memorizes what good posture looks like for YOU in 3 seconds. This becomes the reference point — your body's peace treaty.", tag: "3 seconds" },
              { num: "02", title: "Go back to ignoring your spine.", desc: "PosturePal hides to your system tray and watches silently. Work. Code. Doom scroll. It doesn't judge. It just watches.", tag: "Always running" },
              { num: "03", title: "The popup arrives. The group chat calms down.", desc: "3 seconds of bad posture and a popup appears showing you exactly what the group chat is complaining about. Fix it. Done.", tag: "Instant feedback" }
            ].map((step, i) => (
              <div key={i} className="neo-card scroll-fade" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--accent)',
                  color: 'var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  marginBottom: '24px',
                  border: '2px solid var(--black)',
                  boxShadow: '3px 3px 0 var(--black)'
                }}>
                  {step.num}
                </div>
                <div>
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
      <section id="features" className="bg-white">
        <div className="container">
          <div className="neo-tag">WHAT POSTUREPAL TELLS THE GROUP CHAT</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Everything you need, nothing you don't.</h2>

          <div className="grid-2">
            {[
              { icon: "🎯", title: "Calibrated to your goblin lean", desc: "Sets your personal baseline. Scores relative to YOUR posture, not some ergonomics textbook written by someone who has never coded at 2am." },
              { icon: "🔴", title: "Three signals. Three complaints resolved.", desc: "Head position, shoulder hunch, and screen distance tracked independently. The group chat gets specific — so should your fixes." },
              { icon: "🔔", title: "3-second intervention timer", desc: "Neck gets nervous after 3 seconds of bad posture. The popup appears. You see yourself. You fix it. Neck stands down." },
              { icon: "📊", title: "Evidence for the group chat", desc: "Daily, weekly, monthly charts. Show Lower Back the progress. He's skeptical but he'll come around." },
              { icon: "🏆", title: "XP for good behavior", desc: "Earn XP every minute the group chat has nothing to complain about. Level up from Shrimp to PosturePal Master. Yes, really." },
              { icon: "🔒", title: "No data leaves your device. Ever.", desc: "The AI runs locally. Your webcam feed never touches a server. Eyes was very insistent about this one." }
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
      <section id="testimonials" className="bg-cream" style={{ overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: '48px' }}>
          <div className="neo-tag">OTHER PEOPLE'S GROUP CHATS</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Real people. Very relieved spines.</h2>
        </div>

        <div style={{ display: 'flex', width: 'fit-content', animation: 'marquee 30s linear infinite' }}>
          {[1, 2].map(group => (
            <div key={group} style={{ display: 'flex', gap: '24px', paddingRight: '24px', paddingLeft: group === 1 ? '40px' : '0' }}>
              {[
                { quote: "I opened PosturePal as a joke and my neck has been suspiciously quiet ever since.", name: "Sarah J." },
                { quote: "The popup caught me doing the goblin lean 11 times on day one. I thought I had good posture. I was wrong. Lower Back knew.", name: "Mark T." },
                { quote: "My chiropractor asked what changed. I said a $17 app staged an intervention. He did not find it as funny as I did.", name: "Elena R." },
                { quote: "Best money I've spent this year. My spine has finally left the group chat. Well. It's on mute at least.", name: "David K." },
                { quote: "Three weeks in and my afternoon headaches are gone. Coincidence? Shoulders says no.", name: "Priya M." },
                { quote: "PosturePal is the only coworker who gives me honest feedback without scheduling a meeting about it.", name: "James L." }
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

      {/* WAITLIST SECTION (Formally Pricing) */}
      <section id="pricing" className="bg-white" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="neo-tag">WAITLIST</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '16px' }}>The group chat is currently at capacity.</h2>
          <p className="scroll-fade" style={{ color: 'var(--muted)', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto' }}>We're rolling out invites soon. Drop your email to reserve your spot. No spam, just a heads up when you can finally mute your spine.</p>

          <div className="neo-card scroll-fade" style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--accent)', border: '2px solid black', boxShadow: '8px 8px 0 black', padding: '48px', textAlign: 'center' }}>

            <p style={{ fontSize: '16px', color: 'var(--black)', fontWeight: 700, margin: '12px 0 24px' }}>Get early access.</p>

            <div style={{ textAlign: 'left', margin: '0 auto 32px', maxWidth: '280px' }}>
              {[
                "✓ Early bird invite",
                "✓ Lifetime license discount",
                "✓ Beta tester perks",
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.15)', fontSize: '15px' }}>
                  {feature}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <WaitlistForm buttonText="Reserve spot →" style={{ justifyContent: 'center' }} />
            </div>
          </div>

          <p className="scroll-fade" style={{ marginTop: '20px', fontStyle: 'italic', color: 'var(--muted)' }}>Lower Back has reviewed this list and strongly encourages you to join it.</p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="bg-cream">
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="neo-tag">QUESTIONS THE GROUP CHAT HAD</div>
          <h2 className="scroll-fade" style={{ fontSize: '52px', marginBottom: '48px' }}>Questions answered.</h2>

          <div className="scroll-fade">
            {[
              { q: "When are you launching?", a: "Very soon. We're polishing up the intervention logic so it's perfectly calibrated. You'll get an email as soon as we open the doors." },
              { q: "Does my webcam footage get sent anywhere?", a: "Never. All AI processing happens on your device. Eyes was personally involved in this decision and will not budge." },
              { q: "Does it work on Mac, Windows, and Linux?", a: "Yes. The group chat does not discriminate by operating system." },
              { q: "What if I wear glasses or have a beard?", a: "PosturePal tracks skeletal keypoints — shoulders, ears, nose — not facial features. Glasses and beards are irrelevant. Neck doesn't care what you look like, only how you sit." },
              { q: "Can I use it on two computers?", a: "Yes. The license covers 2 devices. Lower Back travels with you." },
              { q: "Will there be a subscription?", a: "No. It will be a one-time purchase. No subscription drama." }
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
          <h2 style={{ fontSize: '64px', color: 'white', marginBottom: '32px' }}>Your neck asked us to intervene.</h2>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
            <WaitlistForm buttonText="Get on the waitlist" />
          </div>

          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px', fontSize: '14px' }}>We're launching soon. Join the list to finally put the group chat on mute.</p>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '60px 0 40px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>PosturePal 🦐</div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
              <a href="#benefits" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Benefits</a>
              <a href="#intervention" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>The Chat</a>
              <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>How it works</a>
              <a href="#pricing" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Waitlist</a>
              <a href="#faq" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>FAQ</a>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2025 PosturePal</div>
          </div>
        </div>
      </section>
    </>
  );
}
