'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const PRICE = 299;

const Reveal = ({ children, variant = 'fadeUp', delay = 0, style = {} }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-80px' });
  const variants = {
    fadeUp:     { hidden: { opacity: 0, y: 24 },                                        visible: { opacity: 1, y: 0 } },
    slideLeft:  { hidden: { opacity: 0, x: -40 },                                       visible: { opacity: 1, x: 0 } },
    slideRight: { hidden: { opacity: 0, x: 40 },                                        visible: { opacity: 1, x: 0 } },
    scaleBlur:  { hidden: { opacity: 0, scale: 0.96, filter: 'blur(4px)' },             visible: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[variant]}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
};

const ROTATING_STRINGS = [
  'hitting auto accept on Claude',
  'your deep work session',
  'your upcoming deadline',
  'your 4-hour long YouTube binge',
];

const RotatingText = () => {
  const [index, setIndex] = React.useState(0);
  
  React.useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % ROTATING_STRINGS.length), 2200);
    return () => clearInterval(t);
  }, []);

return(
  <span style={{ display: 'inline', position: 'relative' }}>
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        // REMOVE y animation completely to fix the weird visual clipping
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }} // Clean, quick fade transition
        style={{ 
          display: 'inline', 
          color: 'var(--accent)', 
          background: 'var(--black)', 
          padding: '4px 8px',           // Slightly enhanced padding for a cleaner pill/tag look
          marginLeft: '6px',            // Gives a clean separation from "Back to"
          borderRadius: '3px',          // Slightly rounds the edges for a neo-brutalist finish
          lineHeight: '2.1',
          boxDecorationBreak: 'clone',   
          WebkitBoxDecorationBreak: 'clone'
        }}
      >
        {ROTATING_STRINGS[index]}
      </motion.span>
    </AnimatePresence>
  </span>
);
};

const VideoDemo = ({ src }) => {
  const videoRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const wantsToPlayRef = React.useRef(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let loaded = false;

    const onCanPlay = () => { if (wantsToPlayRef.current) video.play().catch(() => {}); };
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    const loadObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !loaded) { video.src = src; loaded = true; loadObs.disconnect(); }
      },
      { rootMargin: '400px' }
    );
    const playObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { wantsToPlayRef.current = true;  if (loaded) video.play().catch(() => {}); }
        else                  { wantsToPlayRef.current = false; video.pause(); }
      },
      { threshold: 0.3 }
    );

    loadObs.observe(container);
    playObs.observe(video);
    return () => {
      loadObs.disconnect(); playObs.disconnect();
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { wantsToPlayRef.current = true;  video.play().catch(() => {}); }
    else              { wantsToPlayRef.current = false; video.pause(); }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', width: '100%', border: '2px solid var(--black)', boxShadow: '6px 6px 0 var(--black)', background: '#111', overflow: 'hidden' }}
    >
      <video ref={videoRef} muted loop playsInline style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div
        onClick={togglePlay}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          background: hovered ? 'rgba(0,0,0,0.18)' : 'transparent',
          transition: 'background 0.15s ease',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
      >
        <div style={{
          width: '56px', height: '56px',
          background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '4px 4px 0 var(--black)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0.85)',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
        }}>
          {isPlaying ? (
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ width: '4px', height: '18px', background: 'var(--black)' }} />
              <div style={{ width: '4px', height: '18px', background: 'var(--black)' }} />
            </div>
          ) : (
            <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '16px solid var(--black)', marginLeft: '3px' }} />
          )}
        </div>
      </div>
    </div>
  );
};

const CheckoutModal = ({ onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName, email } = form;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) { setError('All fields are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    setError('');
    onSubmit(form);
  };

  const field = (label, key, type, placeholder) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{label}</label>
      <input
        type={type} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: '100%', padding: '12px', border: '2px solid var(--black)', background: 'var(--white)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--cream)', border: '2px solid var(--black)', boxShadow: '8px 8px 0 var(--black)', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: 300, lineHeight: 1 }}>×</button>
        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', marginBottom: '6px' }}>Almost there.</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>Your license key will be shown instantly after payment.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>{field('First Name', 'firstName', 'text', 'Jane')}</div>
            <div>{field('Last Name', 'lastName', 'text', 'Doe')}</div>
          </div>
          {field('Email', 'email', 'email', 'jane@example.com')}
          {error && <div style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '14px', marginTop: '-4px' }}>{error}</div>}
          <button type="submit" disabled={loading} className="neo-btn accent" style={{ width: '100%', fontSize: '15px', padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : `Proceed to Payment — Rs. ${PRICE}`}
          </button>
          <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginTop: '12px' }}>Secure payment via Razorpay</p>
        </form>
      </div>
    </div>
  );
};

const RazorpayButton = ({ buttonText = `Buy Now — Rs. ${PRICE}` }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  const loadRazorpayScript = () => new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Browser environment required.'));
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script.')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay script.'));
    document.body.appendChild(script);
  });

  const handleFormSubmit = async ({ firstName, lastName, email }) => {
    setLoading(true);
    setError(null);
    try {
      await loadRazorpayScript();
      const createOrderResponse = await fetch('/api/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: PRICE * 100, customer: { first_name: firstName, last_name: lastName, email } })
      });
      if (!createOrderResponse.ok) {
        const err = await createOrderResponse.json().catch(() => null);
        throw new Error(err?.error || 'Unable to create payment order.');
      }
      const order = await createOrderResponse.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, currency: order.currency,
        name: 'PosturePal', description: 'PosturePal Lifetime License',
        order_id: order.order_id,
        prefill: { name: `${firstName} ${lastName}`, email },
        theme: { color: '#000000' },
        modal: { ondismiss: () => { setError('Payment cancelled. You can try again anytime.'); setLoading(false); } },
        handler: async function (response) {
          setProcessingPayment(true);
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature })
            });
            if (!verifyRes.ok) throw new Error('Payment could not be verified.');
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error(verifyData.message || 'Payment verification failed.');
            const genRes = await fetch('/api/generate-license', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payment_id: response.razorpay_payment_id, email, first_name: firstName, last_name: lastName })
            });
            if (!genRes.ok) throw new Error('License generation failed. Your key will be emailed to you.');
            const genData = await genRes.json();
            if (!genData.success) throw new Error(genData.error || 'License generation failed. Your key will be emailed to you.');
            window.location.href = `/success?token=${encodeURIComponent(genData.sessionToken)}`;
          } catch (err) {
            setProcessingPayment(false);
            setError(err.message || 'Something went wrong. Check your email for the license key.');
            setLoading(false);
          }
        }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => { setError('Payment failed. Please try again.'); setLoading(false); });
      setShowModal(false);
      razorpay.open();
    } catch (err) {
      setError(err?.message || 'Unable to start checkout.');
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && <CheckoutModal onSubmit={handleFormSubmit} onClose={() => { setShowModal(false); setLoading(false); }} loading={loading} />}
      {processingPayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <style>{`@keyframes pp-spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ background: 'var(--cream)', border: '2px solid var(--black)', boxShadow: '8px 8px 0 var(--black)', padding: '32px 36px', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '3px solid var(--black)', borderTopColor: 'var(--accent)', animation: 'pp-spin 0.8s linear infinite', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Processing payment...</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>PosturePal Lifetime License</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'monospace', flexShrink: 0 }}>Rs. {PRICE}</div>
            </div>
            <div style={{ height: '1px', background: 'var(--black)' }} />
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>Verifying your payment and generating your license key. Please don't close this window.</p>
          </div>
        </div>
      )}
      <button onClick={() => { setError(null); setShowModal(true); }} className="neo-btn accent" style={{ fontSize: '16px', padding: '16px 32px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
        {buttonText}
      </button>
      {error && <div style={{ marginTop: '12px', color: '#b91c1c', fontSize: '14px', maxWidth: '420px' }}>{error}</div>}
    </>
  );
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      {/* NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)', borderBottom: '2px solid var(--black)', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', gap: '10px' }}>
            <img src="/Logo.png" alt="PosturePal logo" style={{ width: '75px', height: '75px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1.1 }}>PosturePal</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginTop: '2px', letterSpacing: '0.02em' }}>AI powered posture detection</div>
            </div>
          </a>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 500 }}>
            <a href="#benefits" style={{ textDecoration: 'none', color: 'var(--black)' }}>Benefits</a>
            <a href="#features-demo" style={{ textDecoration: 'none', color: 'var(--black)' }}>Features</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: 'var(--black)' }}>How it works</a>
            <a href="#pricing-card" style={{ textDecoration: 'none', color: 'var(--black)' }}>Buy</a>
            <a href="#faq" style={{ textDecoration: 'none', color: 'var(--black)' }}>FAQ</a>
          </div>
          <div className="nav-links">
            <a href="#pricing-card" className="neo-btn" style={{ fontSize: '13px', padding: '10px 20px', background: 'var(--accent)', color: 'var(--black)' }}>
              Buy Now — Rs. {PRICE}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-cream" style={{ padding: '36px 24px 56px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(56px, 10vw, 112px)', fontWeight: 900, lineHeight: 0.9, WebkitTextStroke: '3px var(--black)', color: 'transparent', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '8px' }}
          >
            FIX YOUR
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '36px' }}
          >
            <motion.div
              whileHover={{ x: -4, y: -4, boxShadow: '10px 10px 0 var(--black)' }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ display: 'inline-block', background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '6px 6px 0 var(--black)', padding: '4px 24px 10px', cursor: 'default' }}
            >
              <div style={{ fontSize: 'clamp(56px, 10vw, 112px)', fontWeight: 900, lineHeight: 0.95, color: 'var(--black)', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif' }}>
                POSTURE!
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '17px', color: 'var(--muted)', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.75 }}
          >
            PosturePal turns your laptop's webcam into a quiet posture coach that nudges you before the ache sets in. Quiet. Offline. One payment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <a href="#pricing-card" className="neo-btn accent" style={{ fontSize: '16px', padding: '16px 32px', textDecoration: 'none' }}>
              Get PosturePal →
            </a>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="bg-cream">
        <div className="container">
          <div className="neo-tag">THE PROBLEM</div>
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '52px', maxWidth: '600px', marginBottom: '48px' }}>Most people don't notice until it's too late.</h2>
          </Reveal>
          <div className="grid-3">
            {[
              { stat: '8+', label: 'hours at a desk, every day', tag: 'AND COUNTING' },
              { stat: '+50 lbs', label: 'of extra pressure forced onto your neck when you slouch', tag: 'THE ENTIRE TIME' },
              { stat: 'Weeks', label: 'before you start feeling the damage', tag: 'NO WARNING' },
            ].map((card, i) => (
              <Reveal key={i} variant="fadeUp" delay={i * 0.08}>
                <div className="neo-card" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', height: '100%' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>{card.stat}</div>
                  <div style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.4 }}>{card.label}</div>
                  <div className="neo-tag" style={{ marginTop: 'auto', marginBottom: 0 }}>{card.tag}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
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

      {/* FEATURE DEMOS */}
      <section id="features-demo" className="bg-white">
        <div className="container">
          <div className="neo-tag">SEE IT IN ACTION</div>
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '52px', marginBottom: '56px' }}>What PosturePal does.</h2>
          </Reveal>

          {/* Row 1: video left, text right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '64px', marginBottom: '80px', flexWrap: 'wrap' }}>
            <Reveal variant="slideLeft" style={{ flex: '1 1 46%', minWidth: '280px' }}>
              <VideoDemo src="/demo-posture-score.mp4" />
            </Reveal>
            <Reveal variant="slideRight" style={{ flex: '1 1 46%', minWidth: '280px' }}>
              <div>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>01</div>
                <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '34px', marginBottom: '12px', lineHeight: 1.15 }}>Know your score.</h3>
                <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '20px', maxWidth: '400px' }}>AI analyzes your sitting position and scores it 0–100 in real time. Always know exactly where you stand.</p>
                {['Real-time AI posture analysis', 'Score from 0 to 100, updated live', 'Tells you exactly what to adjust'].map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '15px', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--black)', color: 'var(--accent)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 700 }}>✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Row 2: text left, video right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '64px', marginBottom: '80px', flexWrap: 'wrap' }}>
            <Reveal variant="slideLeft" style={{ flex: '1 1 320px', minWidth: '280px' }}>
              <div>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>02</div>
                <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '34px', marginBottom: '12px', lineHeight: 1.15 }}>Get nudged before it hurts.</h3>
                <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '20px', maxWidth: '400px' }}>Runs silently. The moment your posture drops, a small notification appears. One glance, one adjustment.</p>
                {['Runs silently in the background', 'Non-intrusive desktop notification', 'One glance to correct and move on'].map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '15px', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--black)', color: 'var(--accent)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 700 }}>✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal variant="slideRight" style={{ flex: '1 1 46%', minWidth: '280px' }}>
              <VideoDemo src="/demo-slouch-alerts.mp4" />
            </Reveal>
          </div>

          {/* Row 3: video left, text right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap' }}>
            <Reveal variant="slideLeft" style={{ flex: '1 1 46%', minWidth: '280px' }}>
              <VideoDemo src="/demo-progress.mp4" />
            </Reveal>
            <Reveal variant="slideRight" style={{ flex: '1 1 46%', minWidth: '280px' }}>
              <div>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent)', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>03</div>
                <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '34px', marginBottom: '12px', lineHeight: 1.15 }}>Track your improvement.</h3>
                <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '20px', maxWidth: '400px' }}>See exactly how much time you spend in good vs bad posture — daily and weekly — so improvement is visible.</p>
                {['Good vs bad posture time split', 'Daily and weekly score trends', 'Long-term progress tracking'].map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '15px', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--black)', color: 'var(--accent)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 700 }}>✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-cream">
        <div className="container">
          <div className="neo-tag">HOW IT WORKS</div>
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '52px', marginBottom: '56px' }}>Three steps.</h2>
          </Reveal>
          <div className="grid-3">
            {[
              { num: '01', title: 'Sit up. Click Calibrate.' },
              { num: '02', title: null },
              { num: '03', title: 'Pop-up arrives. You fix it.' },
            ].map((step, i) => (
              <Reveal key={i} variant="fadeUp" delay={i * 0.08}>
                <div className="neo-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--accent)', color: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, marginBottom: '24px', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>{step.num}</div>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', lineHeight: '1.4' }}>
                    {step.num === '02' ? <>Back to {" "}<RotatingText /></> : step.title}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-white" style={{ overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: '48px' }}>
          <div className="neo-tag">WHAT USERS SAY</div>
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '52px', marginBottom: '48px' }}>Real people. Less back pain.</h2>
          </Reveal>
        </div>
        <div style={{ display: 'flex', width: 'fit-content', animation: 'marquee 30s linear infinite' }}>
          {[1, 2].map(group => (
            <div key={group} style={{ display: 'flex', gap: '24px', paddingRight: '24px', paddingLeft: group === 1 ? '40px' : '0' }}>
              {[
                { quote: "I opened PosturePal as a joke. My neck has been quiet ever since.", name: "Sarah J." },
                { quote: "It caught me slouching 11 times on day one. I thought I had good posture.", name: "Mark T." },
                { quote: "My chiropractor asked what changed. I told him I have an AI watching my posture.", name: "Elena R." },
                { quote: "Best money I've spent this year. Back pain is practically gone after three weeks.", name: "David K." },
                { quote: "Three weeks in and my afternoon headaches are gone.", name: "Priya M." },
                { quote: "The only app that gives me honest feedback without scheduling a meeting.", name: "James L." },
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

      {/* COMPARISON */}
      <section id="compare" className="bg-cream">
        <div className="container">
          <div className="neo-tag">WHY POSTUREPAL</div>
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '52px', marginBottom: '16px' }}>Cheaper than a chiropractor. Smarter than a lumbar pillow.</h2>
          </Reveal>
          <p style={{ fontSize: '17px', color: 'var(--muted)', marginBottom: '48px', maxWidth: '560px' }}>Most solutions are expensive, passive, or require you to remember to use them.</p>
          <div className="grid-3">
            {[
              {
                tag: 'RECURRING COST', title: 'Physiotherapy / Chiro',
                bullets: ['Rs. 1,500–4,000 per session', 'Fixes symptoms, not the habit', 'Requires regular appointments', 'No reminders between visits'],
                accent: false,
              },
              {
                tag: 'EXPENSIVE & PASSIVE', title: 'Ergonomic Furniture',
                bullets: ['Rs. 15,000–80,000+ upfront', 'No alerts when you slouch', 'Easy to ignore over time', 'Adjusts your setup, not your behavior'],
                accent: false,
              },
              {
                tag: 'JUST RIGHT', title: 'PosturePal',
                bullets: ['One-time Rs. 299', 'Active alerts the moment you slouch', 'Always running in the background', '100% offline — no subscription'],
                accent: true,
              },
            ].map((col, i) => (
              <Reveal key={i} variant="fadeUp" delay={i * 0.08}>
                <div className="neo-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', background: col.accent ? 'var(--accent)' : 'var(--white)', boxShadow: col.accent ? '8px 8px 0 var(--black)' : 'var(--shadow-md)' }}>
                  <div className="neo-tag" style={{ background: col.accent ? 'var(--black)' : 'var(--accent)', color: col.accent ? 'var(--accent)' : 'var(--black)' }}>{col.tag}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{col.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {col.bullets.map((b, j) => (
                      <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '14px' }}>
                        <span style={{ color: col.accent ? 'var(--black)' : 'var(--muted)', fontWeight: 700, flexShrink: 0 }}>{col.accent ? '✓' : '—'}</span>
                        <span style={{ color: col.accent ? 'var(--black)' : 'var(--muted)' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                  {col.accent && (
                    <a href="#pricing-card" className="neo-btn" style={{ marginTop: 'auto', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                      Get PosturePal →
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-white" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="neo-tag">BUY NOW</div>
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '52px', marginBottom: '16px' }}>One payment. Lifetime access.</h2>
          </Reveal>
          <p style={{ color: 'var(--muted)', marginBottom: '48px', maxWidth: '480px', margin: '0 auto 48px auto' }}>
            No subscription. No recurring fees. License key shown instantly after payment.
          </p>
          <Reveal variant="fadeUp">
            <div id="pricing-card" className="neo-card" style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--accent)', border: '2px solid black', boxShadow: '8px 8px 0 black', padding: '48px', textAlign: 'center', scrollMarginTop: '80px' }}>
              <p style={{ fontSize: '16px', color: 'var(--black)', fontWeight: 700, margin: '12px 0 24px' }}>Lifetime License — Rs. {PRICE}</p>
              <div style={{ textAlign: 'left', margin: '0 auto 32px', maxWidth: '280px' }}>
                {[
                  '✓ Lifetime license — not a subscription',
                  '✓ 2 devices',
                  '✓ 100% offline AI',
                  '✓ Webcam footage stays on your device',
                  '✓ License key shown instantly',
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.15)', fontSize: '15px' }}>
                    {feature}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RazorpayButton buttonText={`Pay Rs. ${PRICE} →`} />
              </div>
              <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>Secure payment via Razorpay.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-cream">
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="neo-tag">FAQ</div>
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '52px', marginBottom: '48px' }}>Questions answered.</h2>
          </Reveal>
          <Reveal variant="fadeUp">
            <div>
              {[
                { q: "Is it available now?", a: "Yes. Buy it, download it, done." },
                { q: "Does my webcam footage get sent anywhere?", a: "No. All processing is on-device. Nothing leaves your machine." },
                { q: "Does it work on Mac, Windows, and Linux?", a: "Yes, all three." },
                { q: "What if I wear glasses or have a beard?", a: "PosturePal tracks skeletal points — shoulders, ears, nose — not your face. Glasses and beards are irrelevant." },
                { q: "Can I use it on two computers?", a: "Yes. Your license covers 2 devices." },
                { q: "Is this a subscription?", a: "No. One payment, lifetime access." },
              ].map((faq, i) => (
                <div key={i} style={{ border: '2px solid black', marginBottom: '-2px', position: 'relative' }}>
                  <div
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
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
          </Reveal>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="bg-black" style={{ color: 'white', padding: '100px 24px 60px', textAlign: 'center' }}>
        <div className="container">
          <Reveal variant="scaleBlur">
            <h2 style={{ fontSize: '64px', color: 'white', marginBottom: '32px' }}>Stop hurting. Start sitting right.</h2>
          </Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
            <a href="#pricing-card" className="neo-btn accent" style={{ fontSize: '16px', padding: '16px 32px', whiteSpace: 'nowrap', display: 'inline-block', textDecoration: 'none' }}>
              Buy Now — Rs. {PRICE}
            </a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '16px', fontSize: '14px' }}>
            One payment. Lifetime access. Works offline.
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '60px 0 40px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>PosturePal</div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
              <a href="#benefits" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Benefits</a>
              <a href="#features-demo" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Features</a>
              <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>How it works</a>
              <a href="#pricing-card" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Buy</a>
              <a href="#faq" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>FAQ</a>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2026 PosturePal</div>
          </div>
        </div>
      </section>
    </>
  );
}
