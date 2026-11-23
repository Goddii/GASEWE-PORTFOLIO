import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroStage from './components/IntroStage';
import DossierStage from './components/DossierStage';

/**
 * App.jsx — Master Root Component
 * Unified, zero-flash transition between Opening Sequence and Dossier Stage.
 * The Dossier Stage is pre-rendered underneath so cross-fading the video reveals
 * the physical dossier interior instantaneously without any blank frame or stutter.
 */
export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleReplayIntro = useCallback(() => {
    setShowIntro(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#0c0f12] text-slate-100 overflow-x-hidden">
      {/* 1. The Interactive Physical Dossier Stage (Always mounted & ready) */}
      <div className="relative w-full min-h-screen z-10">
        <DossierStage onReplayIntro={handleReplayIntro} />
      </div>

      {/* 2. The Pinned Opening Video Stage (Overlaid on top, cross-fades out cleanly) */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 overflow-hidden bg-[#0c0f12]"
          >
            <IntroStage onTransitionComplete={handleIntroComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
