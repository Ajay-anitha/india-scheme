import React, { useState, useEffect, useCallback } from 'react';
import HeroBanner from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import SchemeCard from '../components/SchemeCard';
import { fetchSchemes } from '../api';
import { CATEGORY_CONFIG } from '../data/categoryData';

export default function HomePage({ onCheckEligibility, onAskAI }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultQuery, setResultQuery] = useState('');

  const categoryConfig = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG['All'];

  const load = useCallback(async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchemes(query);
      setSchemes(data.schemes || []);
    } catch {
      setError('Unable to connect to the backend server. Please start the FastAPI backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { load(); }, [load]);

  const handleSearch = (q) => {
    setResultQuery(q);
    load(q || categoryConfig.searchQuery);
  };

  const handleCategorySelect = (key) => {
    setSelectedCategory(key);
    const cfg = CATEGORY_CONFIG[key];
    const q = cfg.searchQuery;
    setSearchQuery(q);
    setResultQuery(q);
    load(q);
  };

  return (
    <div>
      {/* ── Dynamic hero banner ── */}
      <HeroBanner
        category={categoryConfig}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* ── Category grid ── */}
      <CategoryGrid
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
      />

      {/* ── Scheme results ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Section heading */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="section-title" style={{ color: categoryConfig.accent }}>
              {resultQuery
                ? `Results for "${resultQuery}"`
                : categoryConfig.name}
            </h2>
            <p className="section-subtitle mb-0">
              {loading ? 'Loading schemes…' : `${schemes.length} scheme${schemes.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {(resultQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setResultQuery('');
                setSelectedCategory('All');
                load('');
              }}
              className="text-sm text-slate-500 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            <span className="text-base mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">Backend Offline</p>
              <p className="text-red-600">{error}</p>
              <p className="text-red-500 text-xs mt-1">Run: <code className="bg-red-100 px-1.5 py-0.5 rounded">uvicorn main:app --reload</code></p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-1 w-full bg-slate-200 rounded mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                <div className="h-3 bg-slate-100 rounded mb-1.5" />
                <div className="h-3 bg-slate-100 rounded mb-1.5 w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="flex gap-2 mt-5">
                  <div className="h-10 flex-1 bg-slate-200 rounded-lg" />
                  <div className="h-10 flex-1 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : schemes.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No schemes found</h3>
            <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto">
              Try a different keyword or select another category to explore available schemes.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setResultQuery(''); setSelectedCategory('All'); load(''); }}
              className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
              style={{ background: categoryConfig.accent }}
            >
              View All Schemes
            </button>
          </div>
        ) : (
          /* Scheme grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {schemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                accentColor={categoryConfig.accent}
                accentBg={categoryConfig.accentBg}
              />
            ))}
          </div>
        )}

        {/* Quick AI CTA */}
        {!loading && schemes.length > 0 && (
          <div
            className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: categoryConfig.accentBg, border: `1px solid ${categoryConfig.accent}30` }}
          >
            <div>
              <p className="font-bold text-slate-800">Not sure which scheme to apply for?</p>
              <p className="text-slate-500 text-sm mt-1">Our AI Assistant can answer your specific eligibility questions instantly.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={onCheckEligibility}
                className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
                style={{ background: categoryConfig.accent }}
              >
                Check My Eligibility
              </button>
              <button
                onClick={onAskAI}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border-2 bg-white"
                style={{ color: categoryConfig.accent, borderColor: categoryConfig.accent }}
              >
                Ask AI
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
