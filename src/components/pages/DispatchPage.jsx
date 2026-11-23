import React, { useState } from 'react';
import { profileData } from '../../data/portfolioData';

/**
 * DispatchPage.jsx — Chapter 04
 * Physical Dossier Page: Direct message dispatch form plus one-click copy
 * for email, GitHub, and LinkedIn.
 */
export default function DispatchPage() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${profileData.email}`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);

    // Simulate clean dispatch transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="space-y-10 w-full">
      {/* Physical Sheet Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08] font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <span className="text-cyan-300 font-semibold tracking-wider uppercase">
            CHAPTER 04 // COMMUNICATION DISPATCH
          </span>
        </div>
        <div className="tracking-widest uppercase text-slate-500">
          CHANNEL // DIRECT ENCRYPTED ENDPOINT
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Direct Message Form */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Transmit an Engineering Brief
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Send a project scope, contract opportunity, or engineering inquiry
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-cyan-950/20 border border-cyan-400/40 text-center space-y-3">
              <span className="w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-400 inline-flex items-center justify-center font-mono text-base">
                ✓
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Dispatch Transmitted Successfully
              </h3>
              <p className="text-xs font-mono text-slate-300 max-w-sm mx-auto">
                Thank you, {formData.name}. Your message has been logged. Godwin typically responds within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="mt-2 px-4 py-1.5 rounded text-xs font-mono text-cyan-300 hover:underline"
              >
                Send another dispatch →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block font-mono text-xs text-slate-400">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Elena Vance"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101419] border border-white/10 focus:border-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block font-mono text-xs text-slate-400">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#101419] border border-white/10 focus:border-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="block font-mono text-xs text-slate-400">
                  Subject / Scope
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Full-Stack Role / AI Automation Build"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101419] border border-white/10 focus:border-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="block font-mono text-xs text-slate-400">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your architecture requirements, timeline, or team role..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#101419] border border-white/10 focus:border-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.25)] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Transmitting...' : 'Dispatch Message'}</span>
                <span>→</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Endpoints */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              Direct Communication Endpoints
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Immediate contact channels and verified professional profiles
            </p>
          </div>

          {/* Copyable Email Box */}
          <div className="p-5 rounded-xl bg-[#14181f] border border-white/[0.08] space-y-3">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Primary Electronic Mail
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-mono text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <span>{profileData.email}</span>
                <span className="text-xs">{copied ? '✓ Copied' : '📋 Copy'}</span>
              </button>
              <a
                href={`mailto:${profileData.email}`}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-white/10 transition-colors"
              >
                Mailto ↗
              </a>
            </div>
          </div>

          {/* External Social Profiles */}
          <div className="space-y-2.5">
            <a
              href={profileData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#14181f] border border-white/[0.08] hover:border-cyan-400/40 flex items-center justify-between text-xs font-mono text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition-colors" />
                <span className="font-semibold">GitHub Profile &amp; Repositories</span>
              </div>
              <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">↗</span>
            </a>

            <a
              href={profileData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#14181f] border border-white/[0.08] hover:border-cyan-400/40 flex items-center justify-between text-xs font-mono text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-cyan-400 transition-colors" />
                <span className="font-semibold">LinkedIn Professional Network</span>
              </div>
              <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">↗</span>
            </a>
          </div>

          {/* Location & Timezone Summary */}
          <div className="p-4 rounded-xl bg-[#101419] border border-white/[0.06] text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold uppercase">
              Location &amp; Working Hours
            </div>
            <div>Based in Nairobi, Kenya (UTC+3 / East Africa Time).</div>
            <div>Equipped for high-bandwidth remote collaboration across EU, US, and African timezones.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
