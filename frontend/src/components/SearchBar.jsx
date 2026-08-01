import React from 'react';

const CATEGORIES = [
  "All",
  "Agriculture",
  "Health",
  "Finance",
  "Women & Child",
  "Housing",
  "Vendors",
  "Senior Citizens"
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
        <input
          type="text"
          className="search-input"
          placeholder="Search schemes by name or keyword (e.g. Kisan, Health, Loan, House)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={onSearch}>
          🔍 Search
        </button>
      </div>

      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(cat);
              if (cat === "All") {
                setSearchQuery("");
              } else {
                setSearchQuery(cat);
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
