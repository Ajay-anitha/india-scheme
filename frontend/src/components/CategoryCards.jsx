import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_MAP, CATEGORY_LIST } from '../data/categoryData';

/**
 * CategoryCards Component:
 * Renders interactive category cards for Home Page.
 * Each card navigates to `/category/:slug` route.
 */
export default function CategoryCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Explore Scheme Sectors
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Select a dedicated category to view specialized schemes, category eligibility, and AI assistance.
          </p>
        </div>
        <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full self-start sm:self-center">
          {CATEGORY_LIST.length} National Welfare Sectors
        </span>
      </div>

      {/* Grid of 8 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CATEGORY_LIST.map((key) => {
          const cat = CATEGORY_MAP[key];
          return (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#1e3a8a] transition-all duration-200 flex flex-col"
            >
              {/* Category Image Thumbnail */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

                {/* Category Icon Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/40 shadow-sm">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-extrabold text-slate-900">{cat.name}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
                  {cat.description}
                </p>

                {/* Card Action Link Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-[#1e3a8a] group-hover:text-[#1e40af]">
                  <span>Explore Schemes</span>
                  <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
