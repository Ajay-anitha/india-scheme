import React, { useState } from 'react';
import { checkEligibility } from '../api';

const STATES = [
  "All India", "Maharashtra", "Uttar Pradesh", "Bihar", "Delhi", 
  "Karnataka", "Tamil Nadu", "West Bengal", "Gujarat", "Rajasthan", "Madhya Pradesh"
];

const OCCUPATIONS = [
  "All", "Farmer", "Student", "Entrepreneur", "Vendor", "Unemployed", "Worker"
];

const CATEGORIES = [
  "All", "General", "OBC", "SC", "ST", "EWS"
];

export default function EligibilityPage({ onResultsReceived }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'All',
    state: 'All India',
    occupation: 'All',
    annual_income: '',
    category: 'All'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    setError(null);

    // Form input formatting
    const payload = {
      age: formData.age !== '' ? parseInt(formData.age, 10) : null,
      gender: formData.gender,
      state: formData.state,
      occupation: formData.occupation,
      annual_income: formData.annual_income !== '' ? parseInt(formData.annual_income, 10) : null,
      category: formData.category
    };

    setLoading(true);
    try {
      const response = await checkEligibility(payload);
      if (onResultsReceived) {
        onResultsReceived(response.schemes || [], formData);
      }
    } catch (err) {
      setError("Failed to check eligibility. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="form-container">
        <h2 className="form-title">Check Scheme Eligibility</h2>
        <p className="form-subtitle">
          Fill in your details below to instantly discover government schemes you qualify for.
        </p>

        {error && <div className="alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            {/* Age */}
            <div className="form-group">
              <label className="form-label">Age (Years)</label>
              <input
                type="number"
                name="age"
                className="form-input"
                placeholder="e.g. 28"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                <option value="All">All / Male & Female</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label">State</label>
              <select name="state" className="form-select" value={formData.state} onChange={handleChange}>
                {STATES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Occupation */}
            <div className="form-group">
              <label className="form-label">Occupation</label>
              <select name="occupation" className="form-select" value={formData.occupation} onChange={handleChange}>
                {OCCUPATIONS.map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            {/* Annual Income */}
            <div className="form-group">
              <label className="form-label">Annual Income (₹)</label>
              <input
                type="number"
                name="annual_income"
                className="form-input"
                placeholder="e.g. 150000"
                min="0"
                value={formData.annual_income}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="form-group full-width" style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Checking Eligibility...' : 'Find Eligible Schemes 🔍'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
