'use client';

import React from 'react';

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
      style={{ position: 'relative', width: '100%', background: 'var(--forest-deep)', overflow: 'hidden' }}
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
          background: 'var(--accent)', border: 'var(--border)', borderRadius: '10px', boxShadow: 'var(--shadow-btn)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scale(1)' : 'scale(0.85)',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
        }}>
          {isPlaying ? (
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ width: '4px', height: '18px', background: 'var(--ink)' }} />
              <div style={{ width: '4px', height: '18px', background: 'var(--ink)' }} />
            </div>
          ) : (
            <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '16px solid var(--ink)', marginLeft: '3px' }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDemo;
