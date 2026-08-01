import React, { useState } from 'react';

export default function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="scheme-card">
      <div>
        <div className="scheme-header">
          <div className="scheme-ministry">{scheme.ministry}</div>
          <h3 className="scheme-title">{scheme.scheme_name}</h3>
          <span className="scheme-badge">📍 {scheme.state || 'All India'}</span>
        </div>

        <div className="scheme-body">
          <div className="scheme-section">
            <div className="scheme-section-title">💡 Benefits:</div>
            <p>{scheme.benefits}</p>
          </div>

          <div className="scheme-section">
            <div className="scheme-section-title">📋 Eligibility:</div>
            <p>{scheme.eligibility}</p>
          </div>

          {expanded && (
            <div className="scheme-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
              <div className="scheme-section-title">📄 Required Documents:</div>
              <p>{scheme.required_documents}</p>
            </div>
          )}
        </div>
      </div>

      <div className="scheme-footer">
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'View Full Details'}
        </button>

        {scheme.apply_link && (
          <a 
            href={scheme.apply_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
          >
            Apply Online 🔗
          </a>
        )}
      </div>
    </div>
  );
}
