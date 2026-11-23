import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chapters, profileData } from '../data/portfolioData';
import DossierPage from './pages/DossierPage';
import CaseFilesPage from './pages/CaseFilesPage';
import CredentialsPage from './pages/CredentialsPage';
import DispatchPage from './pages/DispatchPage';

/**
 * DossierStage.jsx
 * Expansive Physical Dossier Page System.
 * - Stretches across the full width of the screen (no squeezed or cramped containers).
 * - Perfectly fitted dossier interior backdrop (dossier-interior.jpg) with architectural grid.
 * - Staggered physical index tabs and lower folder pocket sleeve.
 * - Strict technical cyan (#00f0ff) and dark slate (#0c0f12 / #14181f) palette.
 */
export default function DossierStage({ onReplayIntro }) {
  const [activeTab, setActiveTab] = useState('dossier');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  // Safe tab selection with transition lock to prevent rapid-click glitches
  const handleSelectTab = (tabKey) => {
    if (tabKey === activeTab || isTransitioning) return;
    setIsTransitioning(true);
    setActiveTab(tabKey);
  };

  // Physical Page Motion Variants (Tucking into & Pulling out of the dossier sleeve)
  const pageVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        // Page slides UP out of the dossier pocket slot into reading elevation
        initial: {
          y: 80,
          scale: 0.98,
          opacity: 0,
        },
        animate: {
          y: 0,
          scale: 1,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 280,
            damping: 28,
            mass: 0.85,
          },
        },
        // Page visibly slides DOWN back into the dossier pocket before exit
        exit: {
          y: 70,
          scale: 0.98,
          opacity: 0,
          transition: {
            duration: 0.26,
            ease: [0.32, 0, 0.67, 0], // accelerating tuck-in
          },
        },
      };

  return (
    <div className="relative min-h-screen w-full bg-[#0c0f12] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* ============================================================
          PERFECTLY FITTED DOSSIER INTERIOR BACKGROUND HOUSING
          ============================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0c0f12]">
        {/* Authentic high-res render of the open dossier interior */}
        <img
          src="/dossier-interior.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-40 lg:opacity-50"
          style={{ filter: 'brightness(0.7) contrast(1.15) saturate(0.95)' }}
        />
        {/* Architectural cutting mat blueprint grid */}
        <div className="absolute inset-0 architectural-grid opacity-25" />
        {/* Vignette edge blending */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(12,15,18,0.85) 92%)',
          }}
        />
      </div>

      {/* ============================================================
          FULL-WIDTH HEADER NAVIGATION & IDENTITY WATERMARK
          ============================================================ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0c0f12]/95 backdrop-blur-md">
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          
          {/* Identity Watermark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectTab('dossier')}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform duration-200 shadow-[0_0_8px_#00f0ff]" />
                <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-slate-200 group-hover:text-cyan-300 transition-colors">
                  GASEWE
                </span>
                <span className="text-slate-600 font-mono text-xs">|</span>
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider hidden sm:inline">
                  GODWIN ODHIAMBO
                </span>
              </div>
            </button>
          </div>

          {/* Action Utilities: Replay Intro & Download CV */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 border border-white/10 rounded transition-all duration-150 cursor-pointer bg-white/[0.02]"
              title="Replay folder opening intro sequence"
            >
              <span>↺</span>
              <span className="hidden sm:inline">Replay Intro</span>
            </button>

            <a
              href={profileData.cvPath}
              download
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono text-slate-200 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 hover:border-cyan-400/70 rounded transition-all duration-150 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              <span>Download CV</span>
              <span className="text-cyan-400">↓</span>
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================
          EXPANSIVE DOSSIER CHASSIS & DOCUMENT CHAMBER
          ============================================================ */}
      <main className="relative z-10 max-w-[1720px] w-full mx-auto px-3 sm:px-6 md:px-8 lg:px-12 py-5 sm:py-8 flex-1 flex flex-col justify-start">
        
        {/* DOSSIER FOLDER HOUSING */}
        <div className="w-full relative flex flex-col">
          
          {/* PHYSICAL DOSSIER INDEX TABS (Folder Top) */}
          <div className="flex items-end space-x-1.5 sm:space-x-3 overflow-x-auto no-scrollbar pt-2 px-1 sm:px-3 z-20">
            {chapters.map((ch) => {
              const isActive = activeTab === ch.key;
              return (
                <button
                  key={ch.key}
                  type="button"
                  onClick={() => handleSelectTab(ch.key)}
                  disabled={isTransitioning}
                  className={`group relative px-4 sm:px-6 py-3 rounded-t-xl font-mono text-xs sm:text-sm tracking-wider uppercase transition-all duration-150 whitespace-nowrap cursor-pointer select-none border-t border-l border-r ${
                    isActive
                      ? 'bg-[#14181f] text-cyan-300 border-white/[0.15] z-30 shadow-[0_-6px_18px_rgba(0,0,0,0.65)] -mb-[1px] font-semibold'
                      : 'bg-[#0f1217]/95 text-slate-400 hover:text-slate-200 border-white/[0.06] hover:bg-[#12161d] z-10'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  {/* Active Technical Cyan Accent Strip on Tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute top-0 left-0 right-0 h-[2.5px] bg-cyan-400 shadow-[0_0_12px_#00f0ff]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-semibold ${
                        isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    >
                      {ch.id}
                    </span>
                    <span>{ch.title.replace(/^\d+\s*/, '')}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PHYSICAL DOSSIER CHAMBER & FULL-WIDTH ACTIVE SHEET */}
          <div className="relative w-full rounded-b-2xl rounded-tr-2xl bg-[#0f1318]/96 border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-3 sm:p-5 md:p-7 overflow-hidden min-h-[640px]">
            
            {/* Dossier Interior Technical Graphic Accents */}
            <div className="absolute top-3.5 right-6 font-mono text-[9px] text-slate-600 tracking-widest uppercase pointer-events-none select-none hidden sm:block">
              DOSSIER FILE // ODHIAMBO-KE-SYS
            </div>
            <div className="absolute top-3.5 left-6 font-mono text-[9px] text-slate-600 tracking-widest uppercase pointer-events-none select-none hidden sm:block">
              + REG. 001/2026 // FULL-STACK PRODUCTION DOSSIER
            </div>

            {/* Active Physical Page Sheet with Store/Reveal Choreography */}
            <div className="relative w-full min-h-full">
              <AnimatePresence
                mode="wait"
                onExitComplete={() => setIsTransitioning(false)}
              >
                <motion.div
                  key={activeTab}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full rounded-xl bg-[#14181f]/98 border border-white/[0.1] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)] p-6 sm:p-10 lg:p-12 relative overflow-hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
                  }}
                >
                  {/* Subtle Top Paper Edge Binding Line */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

                  {/* Render the Active Chapter Page Component (Expansive Full Width) */}
                  {activeTab === 'dossier' && (
                    <DossierPage onNavigate={handleSelectTab} />
                  )}
                  {activeTab === 'casefiles' && <CaseFilesPage />}
                  {activeTab === 'credentials' && <CredentialsPage />}
                  {activeTab === 'dispatch' && <DispatchPage />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Physical Dossier Bottom Pocket Lip / Slot Overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 h-6 sm:h-10 pointer-events-none bg-gradient-to-t from-[#0e1217] via-[#0e1217]/95 to-transparent border-t border-white/[0.05] z-20"
              aria-hidden="true"
            />
          </div>
        </div>
      </main>

      {/* ============================================================
          FOOTER WATERMARK & SYSTEM TELEMETRY
          ============================================================ */}
      <footer className="relative z-10 w-full border-t border-white/[0.07] bg-[#0c0f12] py-5">
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} Godwin Otieno Odhiambo · Nairobi, Kenya.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onReplayIntro}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>↺</span>
              <span>Replay Opening Stage</span>
            </button>
            <span>·</span>
            <span>EXPANSIVE PHYSICAL DOSSIER v2.7</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
