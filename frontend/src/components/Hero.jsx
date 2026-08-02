import React, { useState, useEffect, useRef } from 'react';

/**
 * Dynamic hero banner that crossfades between category images.
 * Props: category (config object), onSearch (fn), searchQuery, setSearchQuery
 */
export default function HeroBanner({ category, onSearch, searchQuery, setSearchQuery }) {
  const [currentImg, setCurrentImg] = useState(category.image);
  const [prevImg, setPrevImg] = useState(null);
  const [fading, setFading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef(null);

  // Crossfade when category changes
  useEffect(() => {
    if (category.image === currentImg) return;
    clearTimeout(timerRef.current);
    setPrevImg(currentImg);
    setFading(true);
    setCurrentImg(category.image);
    setImgError(false);
    timerRef.current = setTimeout(() => {
      setPrevImg(null);
      setFading(false);
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [category]);

  const handleKey = (e) => {
    if (e.key === 'Enter') onSearch(searchQuery);
  };

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 420 }}>
      {/* Background: fallback gradient */}
      <div
        className="absolute inset-0"
        style={{ background: category.gradient, zIndex: 0 }}
      />

      {/* Background: previous image (fading out) */}
      {prevImg && (
        <img
          src={prevImg}
          alt=""
          aria-hidden
          className="hero-img"
          style={{ opacity: fading ? 0 : 1, zIndex: 1 }}
        />
      )}

      {/* Background: current image */}
      {currentImg && !imgError && (
        <img
          src={currentImg}
          alt={category.name}
          className="hero-img"
          style={{ opacity: 1, zIndex: 2 }}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.08) 100%)',
          zIndex: 3,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-xl">
          {/* Category chip */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4 text-white"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)' }}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </span>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            {category.name}
          </h1>

          {/* Description */}
          <p className="text-slate-200 text-base leading-relaxed mb-8 max-w-lg">
            {category.description}
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-lg">
            <input
              type="text"
              className="flex-1 px-4 py-3.5 rounded-xl border-0 text-slate-800 text-sm outline-none shadow-md"
              placeholder="Search schemes by name, eligibility, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              onClick={() => onSearch(searchQuery)}
              className="px-6 py-3.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all duration-150 hover:brightness-90 whitespace-nowrap"
              style={{ background: category.accent }}
            >
              Search
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: 'Schemes Available', value: '500+' },
              { label: 'States Covered', value: 'All India' },
              { label: 'AI-Powered', value: 'Instant Match' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-white font-bold text-lg">{stat.value}</div>
                <div className="text-slate-300 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
