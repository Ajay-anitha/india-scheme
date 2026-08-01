import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import SchemeCard from '../components/SchemeCard';
import { fetchSchemes } from '../api';

export default function HomePage({ onCheckEligibility, onAskAI }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadSchemes = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchemes(query);
      setSchemes(data.schemes || []);
    } catch (err) {
      setError("Unable to connect to the backend server. Please make sure FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const handleSearch = () => {
    loadSchemes(searchQuery);
  };

  return (
    <div>
      <Hero onCheckEligibility={onCheckEligibility} onAskAI={onAskAI} />

      <main className="main-content">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat === "All") loadSchemes("");
            else loadSchemes(cat);
          }}
          onSearch={handleSearch}
        />

        {error && (
          <div className="alert-error">
            ⚠️ {error}
          </div>
        )}

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>
          Government Schemes ({schemes.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div className="loading-dots" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            Loading schemes from database...
          </div>
        ) : schemes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>No schemes found matching your search.</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Try searching with different keywords like "Kisan", "Health", or "Loan".</p>
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                loadSchemes("");
              }}
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="schemes-grid">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
