import React from 'react';
import SchemeCard from '../components/SchemeCard';

export default function ResultsPage({ schemes, filterCriteria, onBackToForm }) {
  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a' }}>
            Eligible Government Schemes ({schemes.length})
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Based on your eligibility criteria ({filterCriteria.occupation !== 'All' ? filterCriteria.occupation : 'General'}, Age: {filterCriteria.age || 'Any'}, Income: ₹{filterCriteria.annual_income || 'Any'}).
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onBackToForm}>
          ✏️ Modify Criteria
        </button>
      </div>

      {schemes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>No matching schemes found for these specific criteria.</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Try adjusting your age or annual income filters to see more schemes.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={onBackToForm}>
            Back to Eligibility Form
          </button>
        </div>
      ) : (
        <div className="schemes-grid">
          {schemes.map(scheme => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
}
