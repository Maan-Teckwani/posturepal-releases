'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const PRICE = 299;

// Render overlays at document.body so a transformed ancestor (e.g. a GSAP-animated
// Reveal wrapper) can't trap our position:fixed modal off-center. This keeps every
// trial/buy modal perfectly centered over a dimmed full-page backdrop.
const Portal = ({ children }) =>
  typeof document === 'undefined' ? null : createPortal(children, document.body);

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
        className="field-input"
      />
    </div>
  );

  return (
    <Portal>
      <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,22,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'var(--paper)', border: 'var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative' }}>
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: 300, lineHeight: 1, color: 'var(--muted)' }}>×</button>
          <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>Almost there.</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>Your license key will be shown instantly after payment.</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>{field('First Name', 'firstName', 'text', 'Jane')}</div>
              <div>{field('Last Name', 'lastName', 'text', 'Doe')}</div>
            </div>
            {field('Email', 'email', 'email', 'jane@example.com')}
            {error && <div style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '14px', marginTop: '-4px' }}>{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', fontSize: '15px', padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : `Proceed to Payment — Rs. ${PRICE}`}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginTop: '12px' }}>Secure payment via Razorpay</p>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export const RazorpayButton = ({ buttonText = `Buy Now — Rs. ${PRICE}`, style = {} }) => {
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
        <Portal>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,22,0.7)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <style>{`@keyframes pp-spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ background: 'var(--paper)', border: 'var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '32px 36px', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '3px solid var(--ink)', borderTopColor: 'var(--accent)', animation: 'pp-spin 0.8s linear infinite', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Processing payment...</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>PosturePal Lifetime License</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'monospace', flexShrink: 0 }}>Rs. {PRICE}</div>
              </div>
              <div style={{ height: '1px', background: 'var(--line)' }} />
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>Verifying your payment and generating your license key. Please don&apos;t close this window.</p>
            </div>
          </div>
        </Portal>
      )}
      <button onClick={() => { setError(null); setShowModal(true); }} className="btn btn-accent" style={{ whiteSpace: 'nowrap', cursor: 'pointer', ...style }}>
        {buttonText}
      </button>
      {error && <div style={{ marginTop: '12px', color: '#b91c1c', fontSize: '14px', maxWidth: '420px' }}>{error}</div>}
    </>
  );
};

const TrialSignupModal = ({ onSubmit, onClose, loading }) => {
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
        className="field-input"
      />
    </div>
  );

  return (
    <Portal>
      <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,22,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'var(--paper)', border: 'var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '40px', maxWidth: '440px', width: '100%', position: 'relative' }}>
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: 300, lineHeight: 1, color: 'var(--muted)' }}>×</button>
          <div className="pill" style={{ marginBottom: '12px' }}>21-day free trial</div>
          <h2 style={{ fontSize: '28px', marginBottom: '6px' }}>Start your trial.</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>No credit card required. Full access for 21 days.</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>{field('First Name', 'firstName', 'text', 'Jane')}</div>
              <div>{field('Last Name', 'lastName', 'text', 'Doe')}</div>
            </div>
            {field('Email', 'email', 'email', 'jane@example.com')}
            {error && <div style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '14px', marginTop: '-4px' }}>{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', fontSize: '15px', padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Starting trial...' : 'Start Free Trial →'}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginTop: '12px' }}>Timer starts when you launch the app (within 24h of signup).</p>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export const TrialButton = ({ buttonText = 'Start Free Trial', variant = 'accent', style = {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async ({ firstName, lastName, email }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Could not start trial.');
      }
      window.location.href = `/download?trial_key=${encodeURIComponent(data.trial_key)}`;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Could not start trial.');
    }
  };

  const btnClass = variant === 'accent' ? 'btn btn-accent' : 'btn btn-ghost';
  return (
    <>
      {showModal && <TrialSignupModal onSubmit={handleSubmit} onClose={() => { setShowModal(false); setLoading(false); }} loading={loading} />}
      <button onClick={() => { setError(null); setShowModal(true); }} className={btnClass} style={{ whiteSpace: 'nowrap', cursor: 'pointer', ...style }}>
        {buttonText}
      </button>
      {error && <div style={{ marginTop: '12px', color: '#b91c1c', fontSize: '14px', maxWidth: '420px' }}>{error}</div>}
    </>
  );
};
