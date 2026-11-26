import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { profileData } from '../../data/portfolioData';

/**
 * CredentialsPage.jsx — Chapter 03
 * Physical Dossier Page: Expandable experience/education/hackathon milestones,
 * print action, and clean PDF export.
 */
export default function CredentialsPage() {
  const [expandedIndex, setExpandedIndex] = useState(0); // first item expanded by default

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 w-full">
      {/* Physical Sheet Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08] font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <span className="text-cyan-300 font-semibold tracking-wider uppercase">
            CHAPTER 03 // OFFICIAL CREDENTIALS
          </span>
        </div>
        <div className="tracking-widest uppercase text-slate-500">
          DOCUMENT RECORD // VERIFIED TRAJECTORY
        </div>
      </div>

      {/* Header with Title and PDF / Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Engineering Milestones &amp; Academic Background
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Official operational track record, hackathon honors, and verified technical education
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-11 px-3.5 py-2 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Print Credentials Sheet"
          >
            <span>Print Sheet</span>
            <span>⎙</span>
          </button>

          <a
            href={profileData.cvPath}
            download
            className="min-h-11 px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-150 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <span>Download CV (PDF)</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      {/* Expandable Milestones List */}
      <div className="space-y-3.5">
        {profileData.credentials.map((cred, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-[#14181f] border-cyan-400/40 shadow-lg'
                  : 'bg-[#11151a] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                aria-expanded={isExpanded}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-display text-lg sm:text-xl font-bold text-white">
                      {cred.role}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                      {cred.period}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    {cred.organization}
                  </div>
                </div>

                <div className="pt-1 text-slate-400 font-mono text-sm">
                  {isExpanded ? '−' : '+'}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-white/[0.06] text-sm text-slate-300 leading-relaxed space-y-2">
                      <p>{cred.detail}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Operational Background Callout Sheet */}
      <div className="p-5 rounded-xl bg-[#101419] border border-white/[0.07] space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold uppercase">
          <span>// OPERATIONAL INVARIANT</span>
          <span>·</span>
          <span>WHY THREE YEARS OF BRANCH MANAGEMENT MATTERS</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Before transitioning to full-stack engineering, 3 years managing branch operations, client risk assessments, and logistics taught me that real software systems must handle failures gracefully. I design software with deterministic fallbacks, strict database transactions, and human-in-the-loop validation.
        </p>
      </div>
    </div>
  );
}
