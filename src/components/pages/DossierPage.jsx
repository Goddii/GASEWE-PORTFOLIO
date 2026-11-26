import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { profileData } from '../../data/portfolioData';

/**
 * DossierPage.jsx — Chapter 01
 * Expansive Physical Dossier Page: Executive summary, developer positioning,
 * live telemetry strip, interactive stack filter pills, and navigation triggers.
 * Styled in dark slate (#0c0f12 / #14181f) + technical cyan (#00f0ff).
 */
export default function DossierPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const prefersReducedMotion = useReducedMotion();

  // Filter skills based on selected category
  const activeCategoryObj = profileData.stackCategories.find(
    (c) => c.id === selectedCategory
  );
  const displayedSkills =
    selectedCategory === 'all'
      ? profileData.stackCategories
          .filter((c) => c.skills)
          .flatMap((c) => c.skills)
      : activeCategoryObj?.skills || [];

  return (
    <div className="space-y-8 sm:space-y-12 w-full">
      {/* Physical Sheet Header Stamping */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08] font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <span className="text-cyan-300 font-semibold tracking-wider uppercase">
            CHAPTER 01 // EXECUTIVE DOSSIER
          </span>
        </div>
        <div className="tracking-widest uppercase text-slate-500">
          DOCUMENT SPECIFICATION // GASEWE-2026-SYS
        </div>
      </div>

      {/* Full-Width Telemetry Strip */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#101419]/90 border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
          </span>
          <span className="text-slate-300">
            <strong className="text-white">SYSTEM STATUS:</strong> {profileData.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400">
          <span>
            <strong className="text-slate-300">LOCATION:</strong> {profileData.location}
          </span>
          <span className="text-slate-700">|</span>
          <span>
            <strong className="text-slate-300">TIMEZONE:</strong> {profileData.timezone}
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-cyan-400 font-medium">
            1ST PLACE NATIONAL CHAMPION · JITUME TECH CHALLENGE
          </span>
        </div>
      </div>

      {/* Main Positioning & Executive Narrative (Expansive 12-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-8 space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            Architecting deterministic multi-agent AI pipelines &amp; real-world fintech systems.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed font-normal max-w-5xl">
            {profileData.executiveSummary}
          </p>

          <div className="p-5 sm:p-6 rounded-xl bg-[#101419] border-l-2 border-cyan-400 border-r border-t border-b border-white/[0.06] text-sm sm:text-base text-slate-300 leading-relaxed italic shadow-inner">
            "{profileData.operationalPhilosophy}"
          </div>

          {/* Direct Physical Navigation Triggers to other pages */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('casefiles')}
              className="min-h-11 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-150 flex items-center gap-2.5 shadow-[0_0_25px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <span>Pull Out 02 Case Files</span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('credentials')}
              className="min-h-11 px-6 py-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-white/10 hover:border-cyan-400/40 text-slate-200 font-mono text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-150 flex items-center gap-2.5 cursor-pointer"
            >
              <span>Inspect 03 Credentials</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        {/* Quantitative Milestone Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {profileData.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#101419]/90 border border-white/[0.07] hover:border-cyan-400/40 transition-colors shadow-md"
            >
              <span className="block font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-1.5">
                {m.label}
              </span>
              <span className="block font-display text-xl sm:text-2xl font-bold text-slate-100">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Capabilities & Stack Pills */}
      <div className="space-y-5 pt-8 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Technical Capabilities &amp; System Invariants
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Filter verified architecture tiers and engineering technologies
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#0e1217] border border-white/[0.08]">
            {profileData.stackCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-11 px-3.5 py-1.5 rounded-md text-xs font-mono tracking-wider transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-medium shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          {displayedSkills.map((skill, index) => (
            <motion.span
              key={`${skill}-${index}`}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.18,
                delay: prefersReducedMotion ? 0 : index * 0.01,
              }}
              className="px-3.5 py-2 rounded-lg bg-[#161c24] border border-white/[0.08] hover:border-cyan-400/50 text-xs font-mono text-slate-200 flex items-center gap-2 group transition-colors shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 group-hover:bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <span>{skill}</span>
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
