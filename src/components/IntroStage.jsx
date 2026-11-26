import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IntroStage.jsx
 * Pinned Full-Viewport Opening Sequence.
 * - Video: Folder_opening_revealing_portfolio_6fd612b4.mp4 / video_1.mp4
 * - Poster: HERO IMAGE_2K.jpg (zero-flash frame 00:00)
 * - Buttery smooth scroll-trigger: scrolling down or clicking starts smooth forward playback.
 * - Seamless cross-fade into the open dossier interior stage without blank flashes or stutter.
 */
export default function IntroStage({ onTransitionComplete }) {
  const videoRef = useRef(null);
  const hasTransitionedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoSource, setVideoSource] = useState('');

  useEffect(() => {
    const useCompactVideo = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    setVideoSource(useCompactVideo ? '/video_1.mp4' : '/Folder_video1.mp4');
  }, []);

  // Transition trigger with guard against duplicate triggers
  const triggerTransition = useCallback(() => {
    if (hasTransitionedRef.current) return;
    hasTransitionedRef.current = true;
    if (onTransitionComplete) {
      onTransitionComplete();
    }
  }, [onTransitionComplete]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      triggerTransition();
    }
  }, [triggerTransition]);

  // Handle video play on scroll or interaction
  useEffect(() => {
    const handleScrollOrWheel = (e) => {
      if (hasTransitionedRef.current) return;
      const vid = videoRef.current;
      if (vid) {
        if (vid.paused) {
          vid.play().catch(() => {});
          setIsPlaying(true);
        }
        // If user scrolls aggressively, accelerate playback rate smoothly
        if (e && e.deltaY && e.deltaY > 50) {
          vid.playbackRate = 1.75;
        }
      }
    };

    window.addEventListener('scroll', handleScrollOrWheel, { passive: true });
    window.addEventListener('wheel', handleScrollOrWheel, { passive: true });
    window.addEventListener('touchmove', handleScrollOrWheel, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrWheel);
      window.removeEventListener('wheel', handleScrollOrWheel);
      window.removeEventListener('touchmove', handleScrollOrWheel);
    };
  }, []);

  // Click on stage triggers smooth auto-play
  const handleStageClick = () => {
    const vid = videoRef.current;
    if (vid && !hasTransitionedRef.current) {
      if (vid.paused) {
        vid.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;

    const dur = vid.duration || 8.0;
    const cur = vid.currentTime;
    setProgress(Math.min(1, cur / (dur * 0.95)));

    // When footage enters the interior dossier close-up (approx 6.8s of 8.0s)
    if (cur >= 6.8 && !hasTransitionedRef.current) {
      triggerTransition();
    }
  };

  const handleVideoEnded = () => {
    triggerTransition();
  };

  return (
    <div className="intro-stage relative w-full overflow-hidden bg-[#0c0f12]">
      {/* Full-Bleed Video Element */}
      <video
        ref={videoRef}
        src={videoSource || undefined}
        poster="/HERO%20IMAGE_2K.jpg"
        muted
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onClick={handleStageClick}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer select-none"
        style={{ filter: 'brightness(0.98)' }}
      />

      {/* Top-Right: Skip Intro Button */}
      <div className="intro-stage__skip absolute z-40">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerTransition();
          }}
          className="group flex min-h-11 items-center gap-1.5 px-3.5 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 hover:border-cyan-400/40 text-xs font-mono tracking-wider text-slate-300 hover:text-cyan-300 transition-all duration-200 backdrop-blur-md shadow-xl cursor-pointer"
          aria-label="Skip to Chapter 01 Dossier"
        >
          <span>SKIP INTRO</span>
          <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform duration-200">
            →
          </span>
        </button>
      </div>

      {/* Center/Bottom Play Interaction Cue (fades out as video advances) */}
      <AnimatePresence>
        {!isPlaying && progress < 0.1 && (
          <motion.button
            type="button"
            aria-label="Scroll or tap to open the dossier"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            onClick={handleStageClick}
            className="intro-stage__cue absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-white/15 backdrop-blur-md text-xs font-mono tracking-wider text-slate-200 hover:text-cyan-300 hover:border-cyan-400/40 transition-all shadow-xl">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              <span>Scroll or Tap to Open Dossier</span>
            </div>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-4 h-6 rounded-full border border-slate-500/60 flex items-start justify-center p-1"
            >
              <div className="w-1 h-1.5 rounded-full bg-cyan-400" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Subtle Vignette Gradient to blend with slate palette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 65%, rgba(12,15,18,0.75) 100%)',
        }}
      />

      {/* Bottom Progress Bar */}
      <div className="intro-stage__progress absolute left-0 right-0 h-[2px] bg-white/10 z-30 pointer-events-none">
        <div
          className="h-full bg-cyan-400 transition-all duration-150 ease-out shadow-[0_0_8px_#00f0ff]"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
