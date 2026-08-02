import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  const externalLinks = [
    { label: 'myScheme.gov.in', href: 'https://www.myscheme.gov.in' },
    { label: 'india.gov.in', href: 'https://www.india.gov.in' },
    { label: 'Digital India', href: 'https://www.digitalindia.gov.in' },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      {/* Flag accent stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
          
          {/* Brand */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#1e3a8a] text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                🏛️
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  AI Government Scheme Assistant
                </div>
                <div className="text-xs font-bold text-emerald-700">National Welfare & Information Directory</div>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Empowering citizens across India to search, verify eligibility, and apply for government welfare schemes using modern AI & voice search.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Navigation</p>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link to="/" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">Home Directory</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">About Portal</Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">Contact Helpdesk</Link>
              </li>
            </ul>
          </div>

          {/* External Government Portals */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Official Portals</p>
            <ul className="space-y-2 text-sm font-semibold">
              {externalLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-[#1e3a8a] transition-colors flex items-center gap-1"
                  >
                    <span>{l.label}</span>
                    <span className="text-xs">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            <strong>⚠️ Official Guidance Disclaimer:</strong> This platform provides AI-assisted search and eligibility guidance for citizen empowerment. Always verify final application guidelines on official central and state government portals before submitting documents.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-500 pt-6 border-t border-slate-100">
          <p>© {year} AI Government Scheme Assistant. Production-Ready Deployment.</p>
          <div className="flex items-center gap-1.5">
            <span>🇮🇳</span>
            <span>A Digital India Inspired AI Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
