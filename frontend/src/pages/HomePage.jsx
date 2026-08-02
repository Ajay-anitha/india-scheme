import React from 'react';
import SearchBar from '../components/SearchBar';
import CategoryCards from '../components/CategoryCards';
import AIAssistant from '../components/AIAssistant';

/**
 * Production Clean Homepage Layout
 * Features:
 * 1. Hero Section with Government Theme & Search Bar (with instant suggestions & voice)
 * 2. National Categories Grid
 * 3. Embedded AI Assistant (ChatGPT-style context memory)
 */
export default function HomePage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#047857] text-white py-16 sm:py-24 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Emblem & Portal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-blue-100 mb-6">
            <span>🇮🇳</span>
            <span>National Citizen Welfare Portal</span>
          </div>

          {/* Main Title & Subtitle */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            AI Government Scheme Assistant
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Discover central and state government schemes, check personalized eligibility, and get instant answers from our AI Assistant.
          </p>

          {/* Large Search Bar with Dropdown Suggestions & Voice Input */}
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search schemes by name, ministry, eligibility, or benefits..." />
          </div>

          {/* Quick Stats Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-bold text-blue-200/90">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>87+ Verified Schemes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Instant AI Guidance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Speech-to-Text Enabled</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. National Welfare Categories Grid Section ── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryCards />
      </section>

      {/* ── 3. Embedded AI Assistant Component Section ── */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Instant AI Scheme Assistant
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Ask questions about any scheme in natural language. Maintains conversation history for follow-ups.
            </p>
          </div>
          
          <AIAssistant />
        </div>
      </section>
    </div>
  );
}
