import React, { useState, useEffect } from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'home',        label: 'Home' },
    { id: 'eligibility', label: 'Check Eligibility' },
    { id: 'chat',        label: 'AI Assistant' },
    { id: 'about',       label: 'About' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-md border-b border-slate-100' : 'border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-9 h-9 bg-[#1e3a8a] rounded-lg flex items-center justify-center text-white text-lg shadow-sm">
              🏛️
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800 text-base leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                SchemeAI
              </div>
              <div className="text-xs text-slate-400 leading-none">Government Welfare Portal</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link ${activeTab === item.id ? 'active text-slate-900 bg-slate-100' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA + mobile menu */}
          <div className="flex items-center gap-3">
            <button
              className="hidden md:inline-flex btn-accent text-sm"
              style={{ '--accent': '#1e3a8a', '--accent-ring': 'rgba(30,58,138,0.15)' }}
              onClick={() => setActiveTab('eligibility')}
            >
              Check Eligibility
            </button>
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="block w-5 h-0.5 bg-current mb-1" />
              <span className="block w-5 h-0.5 bg-current mb-1" />
              <span className="block w-4 h-0.5 bg-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
              className={`nav-link text-left w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
          <button
            className="mt-2 btn-accent w-full justify-center"
            style={{ '--accent': '#1e3a8a' }}
            onClick={() => { setActiveTab('eligibility'); setMenuOpen(false); }}
          >
            Check Eligibility
          </button>
        </div>
      )}
    </header>
  );
}
