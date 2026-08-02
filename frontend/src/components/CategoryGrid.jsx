import React from 'react';
import { CATEGORY_CONFIG, CATEGORY_LIST } from '../data/categoryData';

/**
 * Category card grid. Selecting a card triggers onSelect(categoryKey).
 */
export default function CategoryGrid({ selectedCategory, onSelect }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h2 className="section-title">Browse by Category</h2>
        <p className="section-subtitle">Select a category to see relevant government schemes and update the hero banner.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {CATEGORY_LIST.map((key) => {
          const cat = CATEGORY_CONFIG[key];
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`category-card ${isActive ? 'active' : ''}`}
              style={{
                '--accent': cat.accent,
                '--accent-bg': cat.accentBg,
                borderColor: isActive ? cat.accent : undefined,
                background: isActive ? cat.accentBg : undefined,
              }}
              title={cat.description}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
                style={{ background: isActive ? cat.accent : cat.accentBg }}
              >
                {cat.icon}
              </div>

              {/* Name */}
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: isActive ? cat.accent : '#1e293b' }}
              >
                {cat.name}
              </p>

              {/* Active indicator */}
              {isActive && (
                <div
                  className="mt-2 h-1 w-8 rounded-full"
                  style={{ background: cat.accent }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
