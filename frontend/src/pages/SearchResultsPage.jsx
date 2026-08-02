import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SchemeCard from '../components/SchemeCard';
import { fetchSchemes } from '../api';

/**
 * Dedicated Search Results Page (/search?q=...)
 * Renders matching schemes grid cleanly isolated from home page layout.
 */
export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSector, setActiveSector] = useState('All');

  const loadSearchResults = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchemes(q);
      setSchemes(data.schemes || []);
    } catch (err) {
      console.error('Search results error:', err);
      setError('Unable to fetch search results. Please verify the backend API server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearchResults(query);
  }, [query, loadSearchResults]);

  // Sector filter helper
  const filteredSchemes = schemes.filter((s) => {
    if (activeSector === 'All') return true;
    const cat = (s.category || '').toLowerCase();
    const name = (s.scheme_name || '').toLowerCase();
    const sec = activeSector.toLowerCase();
    return cat.includes(sec) || name.includes(sec);
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-xs sm:text-sm font-bold text-[#1e3a8a] hover:underline flex items-center gap-1"
          >
            <span>← Back to National Directory</span>
          </Link>
          <span className="text-xs font-bold text-slate-400">
            Dedicated Search Results Portal
          </span>
        </div>

        {/* Top Search Header Container */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="max-w-3xl mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {query ? `Search Results for "${query}"` : 'Government Scheme Directory'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              {loading
                ? 'Searching central and state scheme databases…'
                : `Found ${filteredSchemes.length} matching government schemes`}
            </p>
          </div>

          {/* Search Bar Container */}
          <div className="max-w-2xl">
            <SearchBar placeholder="Refine your search query or ask a specific question..." />
          </div>
        </div>

        {/* Sector Quick Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {[
            { label: 'All Results', sector: 'All' },
            { label: '🌾 Agriculture', sector: 'Agriculture' },
            { label: '💰 Loans', sector: 'Loan' },
            { label: '🎓 Education', sector: 'Education' },
            { label: '🏥 Health', sector: 'Health' },
            { label: '🏠 Housing', sector: 'Housing' },
            { label: '👩 Women', sector: 'Women' },
            { label: '💼 Employment', sector: 'Employment' },
            { label: '👴 Senior Citizens', sector: 'Senior' },
          ].map((tab) => {
            const isActive = activeSector === tab.sector;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveSector(tab.sector)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-8 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Results Grid / Loading State / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 max-w-md mx-auto">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Matching Schemes Found</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              We couldn't find schemes matching "{query}". Try checking your spelling or search using another keyword.
            </p>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold text-xs sm:text-sm inline-block shadow-sm"
            >
              Explore National Sectors
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
