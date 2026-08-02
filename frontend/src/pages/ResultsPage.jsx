import React from 'react';
import SchemeCard from '../components/SchemeCard';

export default function ResultsPage({ schemes, filterCriteria, onBackToForm }) {
  const accent    = '#1e3a8a';
  const accentBg  = '#eff6ff';

  const criteria = [
    filterCriteria.age        && `Age: ${filterCriteria.age}`,
    filterCriteria.gender !== 'All' && `Gender: ${filterCriteria.gender}`,
    filterCriteria.state      && `State: ${filterCriteria.state}`,
    filterCriteria.occupation !== 'All' && `Occupation: ${filterCriteria.occupation}`,
    filterCriteria.annual_income && `Income: ₹${Number(filterCriteria.annual_income).toLocaleString('en-IN')}`,
    filterCriteria.category !== 'All' && `Category: ${filterCriteria.category}`,
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb / back */}
      <button
        onClick={onBackToForm}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1e3a8a] mb-6 transition-colors"
      >
        ← Back to Eligibility Form
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            🎉 Your Eligible Schemes
          </h1>
          {criteria.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {criteria.map((c) => (
                <span key={c} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            <strong className="text-slate-800">{schemes.length}</strong> scheme{schemes.length !== 1 ? 's' : ''} matched
          </span>
          <button
            onClick={onBackToForm}
            className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            ✏️ Modify Criteria
          </button>
        </div>
      </div>

      {/* Results */}
      {schemes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-4">😔</div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No schemes matched your criteria</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Try broadening your income range, changing the state, or adjusting the occupation filter.
          </p>
          <button
            onClick={onBackToForm}
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ background: accent }}
          >
            Adjust Parameters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              accentColor={accent}
              accentBg={accentBg}
            />
          ))}
        </div>
      )}
    </div>
  );
}
