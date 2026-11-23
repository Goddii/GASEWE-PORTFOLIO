import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { caseFiles } from '../../data/portfolioData';
import SystemFlowDiagram from '../SystemFlowDiagram';

/**
 * CaseFilesPage.jsx — Chapter 02
 * Physical Dossier Page: Production project sheets.
 * Clicking a project pulls out its full detailed dossier case file with:
 * - Animated system architecture flow simulation
 * - Direct live application link (where live)
 * - Verified GitHub repository links
 * - Deep engineering challenge and trade-off notes
 */
export default function CaseFilesPage() {
  const [selectedCaseSlug, setSelectedCaseSlug] = useState(null);
  const [filter, setFilter] = useState('all');

  const selectedCase = caseFiles.find((c) => c.slug === selectedCaseSlug);

  const categories = [
    { id: 'all', label: 'All Case Files' },
    { id: 'ai', label: 'AI & Multi-Agent' },
    { id: 'fintech', label: 'Fintech & Payments' },
    { id: 'commerce', label: 'Commerce & Ops' },
  ];

  const filteredCases =
    filter === 'all'
      ? caseFiles
      : caseFiles.filter((c) =>
          filter === 'commerce'
            ? c.category === 'commerce' || c.category === 'ops' || c.category === 'services' || c.category === 'fullstack'
            : c.category === filter
        );

  // Navigate to next case study
  const handleNextCase = (currentSlug) => {
    const currentIndex = caseFiles.findIndex((c) => c.slug === currentSlug);
    const nextIndex = (currentIndex + 1) % caseFiles.length;
    setSelectedCaseSlug(caseFiles[nextIndex].slug);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Physical Sheet Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08] font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-300 font-semibold tracking-wider uppercase">
            CHAPTER 02 // PRODUCTION CASE FILES
          </span>
        </div>
        <div className="tracking-widest uppercase text-slate-500">
          INDEX // 06 PRODUCTION ARCHITECTURES
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================
            VIEW A: DETAILED PROJECT CASE FILE SHEET (WHEN SELECTED)
            ============================================================ */}
        {selectedCase ? (
          <motion.div
            key={selectedCase.slug}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Top Back Action & Telemetry */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
              <button
                type="button"
                onClick={() => setSelectedCaseSlug(null)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-cyan-300 transition-all cursor-pointer"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Return to Case Files Index</span>
              </button>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                <span>STATUS // PRODUCTION VERIFIED</span>
                <span>·</span>
                <span className="text-cyan-400">{selectedCase.id}</span>
              </div>
            </div>

            {/* Case File Header Stage */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 font-semibold uppercase">
                  {selectedCase.award ? selectedCase.award : selectedCase.meta}
                </span>
                <span className="font-mono text-xs text-slate-400 uppercase">
                  Discipline // {selectedCase.category}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                {selectedCase.name}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-4xl">
                {selectedCase.tagline}
              </p>
            </div>

            {/* Primary Action Buttons (Live Link + Repositories) */}
            <div className="p-4 rounded-xl bg-[#101419] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {selectedCase.live && (
                  <a
                    href={selectedCase.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-150 flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] group"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
                    </span>
                    <span>Launch Live Site</span>
                    <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                )}

                {selectedCase.repos?.map((repo, i) => (
                  <a
                    key={i}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-md bg-slate-800/90 hover:bg-slate-700/90 border border-white/10 hover:border-cyan-400/40 text-slate-200 font-mono text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-150 flex items-center gap-2"
                  >
                    <span>{repo.label === 'GitHub' ? 'GitHub Repository' : `${repo.label} Repo`}</span>
                    <span>↗</span>
                  </a>
                ))}
              </div>

              {selectedCase.metrics?.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  {selectedCase.metrics.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500">{m.label}:</span>
                      <span className="text-slate-200 font-semibold">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media Banner / Artifact Screenshot */}
            {selectedCase.image && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/[0.08] bg-slate-950 shadow-2xl">
                <img
                  src={selectedCase.image}
                  alt={`${selectedCase.name} system preview`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[10px] text-cyan-300 uppercase">
                  VERIFIED PRODUCTION SCREENSHOT // {selectedCase.id}
                </div>
              </div>
            )}

            {/* Interactive System Flow Animation (if project has flow) */}
            {selectedCase.flow && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <h3 className="font-display text-xl font-bold text-white">
                    System Architecture &amp; Execution Pipeline
                  </h3>
                </div>
                <SystemFlowDiagram flow={selectedCase.flow} />
              </div>
            )}

            {/* Detailed Architecture Breakdown Sections */}
            <div className="space-y-6 pt-4 border-t border-white/[0.08]">
              {/* Section 00: Overview & Problem */}
              <div className="p-6 rounded-xl bg-[#101419] border border-white/[0.06] space-y-3">
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold">
                  01 // The Operational Challenge
                </span>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {selectedCase.problem || selectedCase.description}
                </p>
              </div>

              {/* Section 02: Solution & Personal Contribution */}
              <div className="p-6 rounded-xl bg-[#101419] border border-white/[0.06] space-y-3">
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold">
                  02 // Engineered Solution &amp; Personal Contribution
                </span>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {selectedCase.myContribution || selectedCase.solution || selectedCase.overview}
                </p>
              </div>

              {/* Section 03: Challenges & Trade-offs */}
              {selectedCase.challenges && (
                <div className="p-6 rounded-xl bg-[#101419] border border-white/[0.06] space-y-3">
                  <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold">
                    03 // Architecture Trade-offs &amp; Edge Cases
                  </span>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {selectedCase.challenges}
                  </p>
                </div>
              )}

              {/* Section 04: Verified Technology Stack */}
              <div className="p-6 rounded-xl bg-[#101419] border border-white/[0.06] space-y-3">
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold">
                  04 // Verified Technology Stack
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedCase.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-md bg-[#161c24] border border-white/10 text-xs font-mono text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sequential Exhibition Step: Next Project */}
            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedCaseSlug(null)}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <span>←</span>
                <span>Back to Case Files</span>
              </button>

              <button
                type="button"
                onClick={() => handleNextCase(selectedCase.slug)}
                className="group px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Inspect Next Case File</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ============================================================
             VIEW B: CATALOG GRID OF CASE FILES (DEFAULT VIEW)
             ============================================================ */
          <motion.div
            key="case-files-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Header Description & Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Engineering Deployments &amp; Case Studies
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Click any case file to examine its architecture flow, live deployment, and code
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#11151a] border border-white/[0.06]">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilter(cat.id)}
                    className={`px-3 py-1 rounded text-xs font-mono tracking-wider transition-all duration-150 cursor-pointer ${
                      filter === cat.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-medium'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Grid of Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCases.map((caseItem) => (
                <article
                  key={caseItem.slug}
                  onClick={() => setSelectedCaseSlug(caseItem.slug)}
                  className="group rounded-xl bg-[#14181f] border border-white/[0.08] hover:border-cyan-400/50 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xl cursor-pointer"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 border-b border-white/[0.06]">
                      <img
                        src={caseItem.image}
                        alt={caseItem.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[10px] text-cyan-300 uppercase">
                        {caseItem.id}
                      </div>
                      {caseItem.award && (
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 font-mono text-[10px] text-cyan-300 font-semibold uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                          <span>🏆</span>
                          <span>1st Place National</span>
                        </div>
                      )}
                      {caseItem.live && (
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-cyan-950/80 backdrop-blur-md border border-cyan-400/40 font-mono text-[10px] text-cyan-300 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>LIVE SITE</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {caseItem.name}
                        </h3>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 uppercase">
                          {caseItem.category}
                        </span>
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                        {caseItem.tagline}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {caseItem.stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded bg-[#1c232d] text-[11px] font-mono text-slate-300 border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                        {caseItem.stack.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500">
                            +{caseItem.stack.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Open Detail Indicator */}
                  <div className="px-5 py-3 border-t border-white/[0.06] bg-[#101419] flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 group-hover:underline flex items-center gap-1.5 font-medium">
                      <span>Open Case Study &amp; System Flow</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                    <span className="text-slate-500">
                      {caseItem.flow ? '⚡ Interactive Flow' : 'Verified Code'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
