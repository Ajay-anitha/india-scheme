import React from 'react';

const CATEGORIES = [
  { name: "All", icon: "🌐" },
  { name: "Agriculture", icon: "🌾" },
  { name: "Health", icon: "🏥" },
  { name: "Finance", icon: "💰" },
  { name: "Women & Child", icon: "👩" },
  { name: "Housing", icon: "🏠" },
  { name: "Vendors", icon: "🛒" },
  { name: "Senior Citizens", icon: "👴" }
];

export default function SearchBar({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-section">
      <div className="search-box">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search schemes by keyword (e.g., PM Kisan, Ayushman Bharat, Mudra Loan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button className="btn btn-primary" onClick={onSearch}>
          Search Schemes
        </button>
      </div>

      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            className={`chip ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(cat.name);
              if (cat.name === "All") {
                setSearchQuery("");
              } else {
                setSearchQuery(cat.name);
              }
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
