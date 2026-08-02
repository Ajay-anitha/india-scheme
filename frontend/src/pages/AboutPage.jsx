import React from 'react';

export default function AboutPage() {
  const features = [
    { icon: '🔍', title: 'Smart Scheme Search', desc: 'AI-powered search helps you find relevant government schemes by keyword, category, state, or eligibility criteria.' },
    { icon: '🎯', title: 'Personalised Eligibility Match', desc: 'Enter your profile once and receive a curated list of schemes you are qualified to apply for.' },
    { icon: '🤖', title: '24/7 AI Assistant', desc: 'Ask questions in plain language — our AI is trained on official government scheme data.' },
    { icon: '🗣️', title: 'Voice-Enabled Input', desc: 'Use Web Speech API to speak your queries. Ideal for users who prefer voice over typing.' },
    { icon: '🌐', title: 'All States Covered', desc: 'Schemes from all major Indian states and Union Territories are included and updated regularly.' },
    { icon: '📱', title: 'Mobile Friendly', desc: 'Fully responsive across desktop, tablet, and mobile with accessible, government-standard design.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-[#eff6ff] text-[#1e3a8a] text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-[#bfdbfe]">
          🇮🇳 Official AI Scheme Assistance Portal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          About SchemeAI Portal
        </h1>
        <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">
          SchemeAI is an AI-powered government welfare portal designed to help Indian citizens discover, understand, and apply for central and state government schemes — quickly and without confusion.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-slate-800 text-base mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Important Disclaimer</h3>
        <p className="text-amber-700 text-sm leading-relaxed">
          This portal is an independent AI-assisted tool for informational and guidance purposes only. Scheme eligibility, benefits, and application processes may change. Citizens are advised to verify all information on the official ministry or government portal before applying.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: 'myScheme.gov.in', href: 'https://www.myscheme.gov.in' },
            { label: 'india.gov.in', href: 'https://www.india.gov.in' },
            { label: 'Digital India', href: 'https://www.digitalindia.gov.in' },
          ].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-[#1e3a8a] bg-white border border-[#bfdbfe] px-3 py-1.5 rounded-full hover:bg-[#eff6ff] transition-colors">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
