import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

/**
 * Government-Style Header & Navigation Component
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/eligibility', label: 'Eligibility' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top National Flag Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 bg-[#1e3a8a] text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:bg-[#1e40af] transition-colors">
              🏛️
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                AI Government Scheme Assistant
              </div>
              <div className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">
                National Welfare & Eligibility Portal
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#1e3a8a] border border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Contact / Help CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <span>Portal Helpdesk</span>
              <span className="text-xs">↗</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-bold ${
                  isActive ? 'bg-blue-50 text-[#1e3a8a]' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="block text-center py-2.5 rounded-xl bg-[#047857] text-white font-bold text-sm"
          >
            Portal Helpdesk
          </Link>
        </div>
      )}
    </header>
  );
}
