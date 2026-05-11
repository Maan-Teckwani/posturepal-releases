"use client";

import React, { useState } from 'react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const paymentLink = "https://rzp.io/l/your_payment_link_placeholder";

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-black flex justify-between items-center px-6 py-4">
        <div className="font-bold text-xl">PosturePal 🦐</div>
        <div className="hidden md:flex gap-8 font-medium">
          <a href="#benefits" className="hover:underline underline-offset-4">Benefits</a>
          <a href="#how-it-works" className="hover:underline underline-offset-4">How it works</a>
          <a href="#pricing" className="hover:underline underline-offset-4">Pricing</a>
          <a href="#faq" className="hover:underline underline-offset-4">FAQ</a>
        </div>
        <a href={paymentLink} className="neo-btn" style={{ padding: '8px 16px', fontSize: '14px' }}>
          Get PosturePal — $17
        </a>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col md:flex-row items-center justify-center px-6 py-12 max-w-7xl mx-auto gap-12">
        <div className="flex-1 space-y-6">
          <div className="neo-tag">AI-POWERED POSTURE COACH</div>
          <h1 style={{ fontSize: '72px', lineHeight: 1.1 }}>Stop sitting like a shrimp.</h1>
          <p className="text-xl text-gray-700 max-w-lg">
            PosturePal watches your posture while you work. Get a popup the moment you slouch. Fix it in seconds — without leaving your desk.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <a href={paymentLink} className="neo-btn">Get PosturePal — $17</a>
            <a href="#how-it-works" className="neo-btn neo-btn-outline" style={{ background: 'transparent', color: 'var(--black)' }}>See how it works ↓</a>
          </div>
          <div className="pt-2 text-sm font-medium text-gray-600">
            ✓ One-time payment &nbsp;&nbsp; ✓ Mac, Windows & Linux &nbsp;&nbsp; ✓ Works offline
          </div>
        </div>
        <div className="flex-1 w-full flex justify-center md:justify-end">
          <div className="neo-card w-full max-w-md aspect-[4/3] flex items-center justify-center bg-white">
            <span className="text-[120px]">🖥️</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="benefits" className="bg-white py-24 px-6 border-y-2 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="neo-tag mb-6">THE PROBLEM</div>
          <h2 style={{ fontSize: '56px', marginBottom: '48px' }}>Bad posture is silently wrecking you.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="neo-card p-8">
              <div className="text-4xl mb-4">🤕</div>
              <h3 className="text-2xl font-bold mb-3 font-sans">Neck and back pain</h3>
              <p>Hours of forward head posture adds up to chronic pain by your 30s.</p>
            </div>
            <div className="neo-card p-8">
              <div className="text-4xl mb-4">😴</div>
              <h3 className="text-2xl font-bold mb-3 font-sans">Lower energy</h3>
              <p>Slouching compresses your lungs, reduces oxygen, kills your focus.</p>
            </div>
            <div className="neo-card p-8">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-2xl font-bold mb-3 font-sans">Doctor bills</h3>
              <p>The average physio visit costs more than PosturePal. Forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="neo-tag mb-6">HOW IT WORKS</div>
          <h2 style={{ fontSize: '56px', marginBottom: '48px' }}>Three steps. Five seconds to set up.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="neo-card p-8 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 text-[120px] font-serif text-gray-100 leading-none z-0">01</div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 font-sans mt-8">Open & Calibrate</h3>
                <p>Sit up straight and click Calibrate. PosturePal memorizes your perfect posture in 3 seconds.</p>
              </div>
            </div>
            <div className="neo-card p-8 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 text-[120px] font-serif text-gray-100 leading-none z-0">02</div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 font-sans mt-8">Close the app</h3>
                <p>PosturePal hides to your system tray and watches silently while you work, code, or browse.</p>
              </div>
            </div>
            <div className="neo-card p-8 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 text-[120px] font-serif text-gray-100 leading-none z-0">03</div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 font-sans mt-8">Get nudged</h3>
                <p>The moment you slouch for 3 seconds, a popup appears. See yourself. Fix it. It disappears.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 px-6 border-y-2 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="neo-tag mb-6">FEATURES</div>
          <h2 style={{ fontSize: '56px', marginBottom: '48px' }}>Everything you need, nothing you don't.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="neo-card p-6 flex gap-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-bold mb-1 font-sans">Calibrated to YOU</h3>
                <p className="text-sm">Set your baseline once. Scoring is relative to your perfect posture, not a generic model.</p>
              </div>
            </div>
            <div className="neo-card p-6 flex gap-4">
              <div className="text-2xl">🔴</div>
              <div>
                <h3 className="font-bold mb-1 font-sans">Three signal breakdown</h3>
                <p className="text-sm">Head position, shoulder slouch, and screen distance tracked independently.</p>
              </div>
            </div>
            <div className="neo-card p-6 flex gap-4">
              <div className="text-2xl">🔔</div>
              <div>
                <h3 className="font-bold mb-1 font-sans">3-second alert</h3>
                <p className="text-sm">Popup appears after just 3 seconds of bad posture. Instant feedback loop.</p>
              </div>
            </div>
            <div className="neo-card p-6 flex gap-4">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-bold mb-1 font-sans">Session analytics</h3>
                <p className="text-sm">See your posture score over time. Daily, weekly, monthly charts.</p>
              </div>
            </div>
            <div className="neo-card p-6 flex gap-4">
              <div className="text-2xl">🏆</div>
              <div>
                <h3 className="font-bold mb-1 font-sans">XP & leaderboard</h3>
                <p className="text-sm">Earn XP for every minute of good posture. Level up. Beat your friends.</p>
              </div>
            </div>
            <div className="neo-card p-6 flex gap-4">
              <div className="text-2xl">🔒</div>
              <div>
                <h3 className="font-bold mb-1 font-sans">Fully offline</h3>
                <p className="text-sm">AI runs on your device. No webcam footage ever leaves your computer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-250px * 6 - 2rem * 6)); }
          }
          .marquee { display: flex; gap: 2rem; width: max-content; animation: scroll 20s linear infinite; }
          .marquee:hover { animation-play-state: paused; }
        `}} />
        <div className="px-6 max-w-7xl mx-auto mb-12">
          <div className="neo-tag mb-6">TESTIMONIALS</div>
          <h2 style={{ fontSize: '56px' }}>Real people. Actual backs.</h2>
        </div>
        <div className="marquee pl-6">
          {[
            { name: "Sarah J.", text: "It's like having a very annoying but very helpful physical therapist on my monitor." },
            { name: "Mark T.", text: "The offline privacy is what sold me. The fact that it actually fixed my neck pain is a bonus." },
            { name: "Elena R.", text: "I didn't realize how much I was leaning forward until PosturePal caught me 20 times on day one." },
            { name: "David K.", text: "Best $17 I've ever spent. The gamification makes me actually want to sit up straight." },
            { name: "Chloe M.", text: "Unbelievably fast. No lag, doesn't slow down my code editor at all." },
            { name: "James L.", text: "I uninstalled my subscription posture app for this. One time payment is the way." },
            // Duplicates for seamless scroll
            { name: "Sarah J.", text: "It's like having a very annoying but very helpful physical therapist on my monitor." },
            { name: "Mark T.", text: "The offline privacy is what sold me. The fact that it actually fixed my neck pain is a bonus." },
            { name: "Elena R.", text: "I didn't realize how much I was leaning forward until PosturePal caught me 20 times on day one." },
          ].map((t, i) => (
            <div key={i} className="neo-card p-6 w-[300px] flex-shrink-0 flex flex-col justify-between">
              <p className="font-serif italic text-lg mb-4">"{t.text}"</p>
              <p className="font-bold font-sans">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-24 px-6 border-y-2 border-black flex justify-center">
        <div className="max-w-3xl w-full flex flex-col items-center text-center">
          <div className="neo-tag mb-6">PRICING</div>
          <h2 style={{ fontSize: '56px', marginBottom: '48px' }}>One price. Forever yours.</h2>
          
          <div className="neo-card p-10 md:p-14 w-full max-w-lg" style={{ backgroundColor: 'var(--accent)' }}>
            <div style={{ fontSize: '80px', fontFamily: '"Instrument Serif", serif', lineHeight: 1 }}>$17</div>
            <p className="font-bold mt-2 mb-8">One-time payment — no subscription, ever.</p>
            
            <div className="text-left space-y-4 mb-10 font-medium">
              <p>✓ Lifetime license (2 devices)</p>
              <p>✓ Mac, Windows & Linux</p>
              <p>✓ All future updates free</p>
              <p>✓ Fully offline — no account needed</p>
              <p>✓ Session analytics & leaderboard</p>
            </div>

            <a href={paymentLink} className="neo-btn w-full text-center py-4 text-lg">Get PosturePal Now →</a>
            <p className="text-sm mt-4 font-bold">🔒 Secure payment via Razorpay &nbsp;&nbsp;|&nbsp;&nbsp; 14-day money-back guarantee</p>
          </div>
          <p className="mt-6 font-bold text-gray-500">Cheaper than one physio appointment.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="neo-tag mb-6">FAQ</div>
          <h2 style={{ fontSize: '56px', marginBottom: '48px' }}>Questions answered.</h2>
          
          <div className="space-y-4">
            {[
              { q: "Does it work on Mac, Windows, and Linux?", a: "Yes, PosturePal ships as a native installer for all three platforms." },
              { q: "Does my webcam footage get uploaded anywhere?", a: "Never. All AI processing happens on your device. No footage leaves your computer." },
              { q: "What if I wear glasses or have a beard?", a: "MoveNet tracks skeletal keypoints, not facial features — glasses and facial hair don't affect accuracy." },
              { q: "Can I use it on two computers?", a: "Yes, the $17 license covers 2 devices." },
              { q: "What if I want a refund?", a: "Email us within 14 days, no questions asked." },
              { q: "Does it work in the dark?", a: "You need reasonable lighting for the webcam. A standard desk lamp is enough." }
            ].map((faq, i) => (
              <div key={i} className="neo-card overflow-hidden cursor-pointer" onClick={() => toggleFaq(i)}>
                <div className="p-6 flex justify-between items-center font-bold text-lg select-none">
                  {faq.q}
                  <span className="text-2xl">{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && (
                  <div className="px-6 pb-6 pt-0 border-t-2 border-black bg-white select-none">
                    <p className="mt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Footer */}
      <section className="bg-black text-white pt-32 pb-12 px-6 flex flex-col items-center text-center">
        <h2 style={{ fontSize: '72px', marginBottom: '40px' }}>Your back will thank you.</h2>
        <a href={paymentLink} className="neo-btn mb-32" style={{ backgroundColor: 'var(--accent)', color: 'var(--black)' }}>Get PosturePal for $17</a>
        
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center pt-8 border-t-2 border-gray-800 text-sm font-medium gap-4">
          <div className="font-bold text-lg">PosturePal 🦐</div>
          <div className="flex gap-6">
            <a href="#benefits" className="hover:text-gray-400">Benefits</a>
            <a href="#pricing" className="hover:text-gray-400">Pricing</a>
            <a href="#faq" className="hover:text-gray-400">FAQ</a>
            <a href="#" className="hover:text-gray-400">Contact</a>
          </div>
          <div>© 2025 PosturePal</div>
        </div>
      </section>
    </div>
  );
}
