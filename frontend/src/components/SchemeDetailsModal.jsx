import React, { useEffect } from 'react';

/**
 * Full-details modal for a government scheme.
 * Props: scheme, accentColor, accentBg, onClose
 */
export default function SchemeDetailsModal({ scheme, accentColor, accentBg, onClose }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sections = [
    { label: '💡 Benefits', value: scheme.benefits },
    { label: '📋 Eligibility Criteria', value: scheme.eligibility },
    { label: '📄 Required Documents', value: scheme.required_documents },
  ];

  const meta = [
    { label: 'State / Region', value: scheme.state || 'All India' },
    { label: 'Target Occupation', value: scheme.occupation || 'All' },
    { label: 'Age Range', value: scheme.min_age || scheme.max_age ? `${scheme.min_age ?? 0} – ${scheme.max_age ?? '∞'} years` : 'Any' },
    { label: 'Category', value: scheme.category || 'All' },
    { label: 'Income Limit', value: scheme.max_income ? `₹${Number(scheme.max_income).toLocaleString('en-IN')}` : 'No limit' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100" style={{ borderTopColor: accentColor }}>
          <div className="h-1 w-full rounded-t-2xl -mx-6 -mt-6 mb-5" style={{ background: accentColor }} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-800 text-xl leading-snug mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {scheme.scheme_name}
              </h2>
              <p className="text-sm text-slate-400">{scheme.ministry}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-lg transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-6 py-4 border-b border-slate-100" style={{ background: accentBg }}>
          {meta.map((m) => (
            <div key={m.label}>
              <p className="text-xs text-slate-400 font-medium mb-0.5">{m.label}</p>
              <p className="text-sm font-semibold text-slate-700">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Detail sections */}
        <div className="px-6 py-5 space-y-5">
          {sections.map((sec) => (
            <div key={sec.label}>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">{sec.label}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{sec.value || '—'}</p>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 pb-6">
          {scheme.apply_link && (
            <a
              href={scheme.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-3 rounded-xl text-white font-semibold text-sm transition-all hover:brightness-90"
              style={{ background: accentColor }}
            >
              Apply Online 🔗
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 text-slate-500 border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
