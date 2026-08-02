import React, { useState } from 'react';
import SchemeDetailsModal from './SchemeDetailsModal';

/**
 * Scheme card with Apply and Learn More actions.
 * Props: scheme, accentColor, accentBg
 */
export default function SchemeCard({ scheme, accentColor = '#1e3a8a', accentBg = '#eff6ff' }) {
  const [showModal, setShowModal] = useState(false);

  // Truncate long text
  const truncate = (text, len = 100) =>
    text && text.length > len ? text.slice(0, len).trimEnd() + '…' : text || '—';

  return (
    <>
      <article className="scheme-card">
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: accentColor }} />

        <div className="p-5 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-base leading-snug mb-1 line-clamp-2">
                {scheme.scheme_name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">{scheme.ministry}</p>
            </div>
            {/* State badge */}
            <span className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              📍 {scheme.state || 'All India'}
            </span>
          </div>

          {/* Category tag */}
          <span
            className="inline-block mb-3 text-xs font-bold px-2.5 py-0.5 rounded-full self-start"
            style={{ background: accentBg, color: accentColor }}
          >
            {scheme.occupation !== 'All' ? `👤 ${scheme.occupation}` : '🏛️ General'}
          </span>

          {/* Info rows */}
          <div className="space-y-2 flex-1">
            <div className="info-row">
              <span className="shrink-0 font-semibold text-slate-700 w-20">Benefits:</span>
              <span className="text-slate-500">{truncate(scheme.benefits)}</span>
            </div>
            <div className="info-row">
              <span className="shrink-0 font-semibold text-slate-700 w-20">Eligibility:</span>
              <span className="text-slate-500">{truncate(scheme.eligibility)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
            {scheme.apply_link && (
              <a
                href={scheme.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-150 hover:brightness-90"
                style={{ background: accentColor }}
              >
                Apply Online
              </a>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-150 hover:bg-slate-50"
              style={{ color: accentColor, borderColor: accentColor }}
            >
              Learn More
            </button>
          </div>
        </div>
      </article>

      {showModal && (
        <SchemeDetailsModal
          scheme={scheme}
          accentColor={accentColor}
          accentBg={accentBg}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
