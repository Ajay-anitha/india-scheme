import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_MAP } from '../data/categoryData';
import SchemeCard from '../components/SchemeCard';
import AIAssistant from '../components/AIAssistant';
import { fetchSchemes } from '../api';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = CATEGORY_MAP[slug] || CATEGORY_MAP.agriculture;

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const schemesRef = useRef(null);

  useEffect(() => {
    async function loadCategorySchemes() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSchemes(category.searchQuery);
        setSchemes(data.schemes || []);
      } catch {
        setError('Unable to fetch category schemes. Ensure the backend FastAPI server is running.');
      } finally {
        setLoading(false);
      }
    }
    loadCategorySchemes();
  }, [category]);

  const scrollToSchemes = () => {
    schemesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── 1. Large Category Hero Banner ── */}
      <section className="relative bg-slate-900 min-h-[380px] sm:min-h-[440px] flex items-center overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.85) 60%, ${category.accent}90 100%)`
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="max-w-2xl">
            {/* Category Breadcrumb Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-4 shadow-sm">
              <span className="text-base">{category.icon}</span>
              <span className="tracking-wide uppercase font-bold text-[11px] text-emerald-300">Category Portal</span>
              <span className="text-white/40">•</span>
              <span>{category.name}</span>
            </div>

            {/* Category Title */}
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-3 tracking-tight"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {category.title}
            </h1>

            {/* Category Short Description */}
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              {category.description}
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToSchemes}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:brightness-95 flex items-center gap-1.5"
                style={{ background: category.accent }}
              >
                <span>View Schemes</span>
                <span className="text-xs">↓</span>
              </button>

              <Link
                to={`/category/${category.slug}/eligibility`}
                className="px-6 py-3 rounded-xl bg-white text-[#1e3a8a] font-bold text-sm shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <span>Check Eligibility</span>
                <span className="text-xs">🎯</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Embedded AI Assistant (Category Contextualized) ── */}
      <div className="border-b border-slate-200 bg-white">
        <AIAssistant categoryName={category.name} />
      </div>

      {/* ── 3. Category Schemes Grid ── */}
      <section ref={schemesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {category.name} Schemes
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading category database…' : `Showing ${schemes.length} schemes under ${category.name}`}
            </p>
          </div>

          <Link
            to={`/category/${category.slug}/eligibility`}
            className="text-xs sm:text-sm font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
          >
            🎯 Filter My {category.name} Eligibility
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse" />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 max-w-md mx-auto">
            <div className="text-5xl mb-3">{category.icon}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Schemes Found for {category.name}</h3>
            <p className="text-slate-500 text-sm mb-4">You can explore all central and state schemes on our home directory.</p>
            <Link to="/" className="px-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm inline-block">
              View All Schemes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
