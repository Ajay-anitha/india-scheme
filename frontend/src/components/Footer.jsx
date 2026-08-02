import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'myScheme.gov.in', href: 'https://www.myscheme.gov.in', external: true },
    { label: 'india.gov.in', href: 'https://www.india.gov.in', external: true },
    { label: 'Digital India', href: 'https://www.digitalindia.gov.in', external: true },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8">
          {/* Brand */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[#1e3a8a] rounded-lg flex items-center justify-center text-white text-lg">🏛️</div>
              <div>
                <div className="font-bold text-slate-800 text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  SchemeAI Portal
                </div>
                <div className="text-xs text-slate-400">AI Government Welfare Assistant</div>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Helping citizens discover, understand, and apply for government welfare schemes through AI-powered guidance.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Links</p>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.external ? '_blank' : undefined}
                    rel={l.external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-slate-500 hover:text-[#1e3a8a] transition-colors"
                  >
                    {l.label} {l.external && '↗'}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact</p>
            <ul className="space-y-2">
              <li className="text-sm text-slate-500">📧 help@schemeai.gov.in</li>
              <li className="text-sm text-slate-500">📞 1800-XXX-XXXX (Toll Free)</li>
              <li className="text-sm text-slate-500">🕐 Mon – Sat: 9 AM – 6 PM</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>⚠️ Disclaimer:</strong> This portal is an AI-assisted guidance tool for informational purposes only.
            Scheme details may vary. Citizens must verify final eligibility and documentation requirements on the respective
            official government ministry portals before applying.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pt-6 border-t border-slate-100">
          <p>© {year} SchemeAI Portal. Powered by AI & FastAPI Backend.</p>
          <div className="flex items-center gap-1">
            <span>🇮🇳</span>
            <span>A Digital India Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
