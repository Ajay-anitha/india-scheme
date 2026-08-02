import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SchemeDetailsModal from './SchemeDetailsModal';
import { CATEGORY_MAP } from '../data/categoryData';

/**
 * SchemeCard Component:
 * - Scheme Image (Category artwork)
 * - Scheme Name & Ministry (Clickable to /scheme/:id)
 * - Benefits preview
 * - View Details button (Navigates to dedicated /scheme/:id page)
 * - Apply Now button (Direct official portal link)
 */
export default function SchemeCard({ scheme }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Match category slug for image selection
  const catKey = (scheme.category || '').toLowerCase();
  let imageSrc = '/images/hero-bg.png';
  if (catKey.includes('agri')) imageSrc = CATEGORY_MAP.agriculture.image;
  else if (catKey.includes('edu') || catKey.includes('scholar')) imageSrc = CATEGORY_MAP.education.image;
  else if (catKey.includes('health') || catKey.includes('med')) imageSrc = CATEGORY_MAP.health.image;
  else if (catKey.includes('hous')) imageSrc = CATEGORY_MAP.housing.image;
  else if (catKey.includes('women') || catKey.includes('child')) imageSrc = CATEGORY_MAP.women.image;
  else if (catKey.includes('employ') || catKey.includes('skill')) imageSrc = CATEGORY_MAP.employment.image;
  else if (catKey.includes('stud')) imageSrc = CATEGORY_MAP.student.image;
  else if (catKey.includes('seni') || catKey.includes('pension')) imageSrc = CATEGORY_MAP['senior-citizen'].image;

  const truncate = (text, maxLen = 100) => {
    if (!text) return '—';
    return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
  };

  return (
    <>
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
        {/* Scheme Image Thumbnail Header */}
        <Link to={`/scheme/${scheme.id}`} className="relative h-40 w-full overflow-hidden bg-slate-900 block">
          <img
            src={imageSrc}
            alt={scheme.scheme_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-white/95 text-[#1e3a8a] border border-white/40 shadow-sm uppercase tracking-wider">
              🏛️ {scheme.category || 'General'}
            </span>
            <span className="text-[11px] font-bold text-white bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              📍 {scheme.state || 'All India'}
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Scheme Title */}
          <h3
            onClick={() => navigate(`/scheme/${scheme.id}`)}
            className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug mb-1 group-hover:text-[#1e3a8a] transition-colors line-clamp-2 cursor-pointer"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {scheme.scheme_name}
          </h3>

          {/* Ministry Sub-heading */}
          <p className="text-xs font-semibold text-slate-400 mb-4 line-clamp-1">
            {scheme.ministry}
          </p>

          {/* Key Benefits Preview */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5 flex-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="text-emerald-600">💡</span> Key Benefits
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              {truncate(scheme.benefits)}
            </p>
          </div>

          {/* Action Buttons: View Details & Apply Now */}
          <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-slate-100">
            <Link
              to={`/scheme/${scheme.id}`}
              className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-[#1e3a8a] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1 text-center"
            >
              <span>View Details</span>
            </Link>

            {scheme.apply_link ? (
              <a
                href={scheme.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#047857] hover:bg-[#065f46] shadow-sm transition-colors flex items-center justify-center gap-1 text-center"
              >
                <span>Apply Now</span>
                <span className="text-xs">↗</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1e3a8a] hover:bg-[#1e40af] transition-colors"
              >
                <span>Apply Info</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Scheme Details Modal */}
      {showModal && (
        <SchemeDetailsModal
          scheme={scheme}
          accentColor="#1e3a8a"
          accentBg="#eff6ff"
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
