import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_MAP } from '../data/categoryData';
import SchemeCard from '../components/SchemeCard';
import { checkEligibility } from '../api';

const STATES = [
  'All India', 'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 
  'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export default function CategoryEligibilityPage() {
  const { slug } = useParams();
  const category = CATEGORY_MAP[slug] || CATEGORY_MAP.agriculture;

  const [formData, setFormData] = useState({
    age: '',
    gender: 'All',
    state: 'All India',
    occupation: 'All',
    annual_income: '',
    category: 'All',
  });

  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const payload = {
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        state: formData.state,
        occupation: formData.occupation,
        annual_income: formData.annual_income ? parseInt(formData.annual_income, 10) : null,
        category: formData.category,
      };

      const result = await checkEligibility(payload);
      const allMatched = result.schemes || [];

      // Filter results to ONLY include schemes matching this category's sector keywords
      const categoryKeyword = (category.searchQuery || '').toLowerCase();
      const catSlug = (category.slug || '').toLowerCase();

      const filteredCategorySchemes = allMatched.filter((s) => {
        const text = `${s.category || ''} ${s.scheme_name || ''} ${s.benefits || ''} ${s.eligibility || ''} ${s.occupation || ''}`.toLowerCase();
        if (text.includes(categoryKeyword) || text.includes(catSlug)) return true;

        if (catSlug.includes('senior')) return text.includes('pension') || text.includes('elderly') || text.includes('old age') || text.includes('senior');
        if (catSlug.includes('agri')) return text.includes('kisan') || text.includes('farmer') || text.includes('farm') || text.includes('agri');
        if (catSlug.includes('employ')) return text.includes('job') || text.includes('skill') || text.includes('rozgar') || text.includes('kaushal');
        if (catSlug.includes('health')) return text.includes('medical') || text.includes('hospital') || text.includes('ayushman') || text.includes('insurance');
        if (catSlug.includes('hous')) return text.includes('awas') || text.includes('home') || text.includes('shelter');
        if (catSlug.includes('women')) return text.includes('mahila') || text.includes('girl') || text.includes('female') || text.includes('lady');
        if (catSlug.includes('stud') || catSlug.includes('edu')) return text.includes('scholarship') || text.includes('stipend') || text.includes('school') || text.includes('college');

        return false;
      });

      setMatchedSchemes(filteredCategorySchemes);
    } catch {
      setError('Eligibility check failed. Ensure the FastAPI backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to={`/category/${category.slug}`}
            className="text-xs sm:text-sm font-bold text-[#1e3a8a] hover:underline flex items-center gap-1"
          >
            <span>← Back to {category.name} Portal</span>
          </Link>
          <span className="text-xs font-bold text-slate-400">
            Category-Specific Eligibility Tool
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl border border-emerald-200">
              {category.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {category.name} Eligibility Checker
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                Enter your profile details below to verify matching <strong>{category.name}</strong> schemes.
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Age (Years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 28"
                  min="0"
                  max="120"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  State / Region
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white"
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Farmer, Student, Worker"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                />
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Annual Income (₹)
                </label>
                <input
                  type="number"
                  name="annual_income"
                  value={formData.annual_income}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  min="0"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Caste / Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white"
                >
                  <option value="All">All Categories</option>
                  <option value="General">General / Unreserved</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Checking Database…</span>
                ) : (
                  <>
                    <span>Check {category.name} Eligibility</span>
                    <span>🎯</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Display Section */}
        {hasSearched && (
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">
                Matching {category.name} Schemes ({matchedSchemes.length})
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold">
                {error}
              </div>
            )}

            {matchedSchemes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-base font-bold text-slate-800">No Direct Matches Found in {category.name}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                  Try broadening your criteria (e.g. state as 'All India' or income limit) or explore all category schemes.
                </p>
                <Link
                  to={`/category/${category.slug}`}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold inline-block"
                >
                  View All {category.name} Schemes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedSchemes.map((scheme) => (
                  <SchemeCard key={scheme.id} scheme={scheme} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
