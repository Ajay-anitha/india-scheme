import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_MAP } from '../data/categoryData';
import SchemeCard from '../components/SchemeCard';
import { checkEligibility } from '../api';
import { INDIAN_STATES, OCCUPATIONS, INCOME_RANGES, CATEGORIES } from '../utils/formatters';

export default function CategoryEligibilityPage() {
  const { slug } = useParams();
  const category = CATEGORY_MAP[slug] || CATEGORY_MAP.agriculture;

  const [formData, setFormData] = useState({
    ageRange: 'All',
    customAge: '',
    gender: 'All',
    state: 'All India',
    occupation: 'All',
    annual_income: '',
    category: 'All',
    disability: 'All',
  });

  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValidationError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgeRangeSelect = (val) => {
    setValidationError('');
    setFormData((prev) => ({
      ...prev,
      ageRange: val,
      customAge: val === 'custom' ? prev.customAge : val === 'All' ? '' : val
    }));
  };

  const handleCustomAgeChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 120)) {
      setValidationError('');
      setFormData((prev) => ({ ...prev, customAge: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    let resolvedAge = null;
    if (formData.ageRange === 'custom') {
      if (!formData.customAge) {
        setValidationError('Please enter a valid age in years (0 - 120).');
        return;
      }
      resolvedAge = parseInt(formData.customAge, 10);
    } else if (formData.ageRange !== 'All') {
      resolvedAge = parseInt(formData.ageRange, 10);
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const payload = {
        age: resolvedAge,
        gender: formData.gender,
        state: formData.state,
        occupation: formData.occupation,
        annual_income: formData.annual_income ? parseInt(formData.annual_income, 10) : null,
        category: formData.category,
      };

      const result = await checkEligibility(payload);
      const allMatched = result.schemes || [];

      const categoryKeyword = (category.searchQuery || '').toLowerCase();
      const catSlug = (category.slug || '').toLowerCase();

      let filteredCategorySchemes = allMatched.filter((s) => {
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

      if (formData.disability === 'Yes') {
        filteredCategorySchemes = filteredCategorySchemes.filter(s => {
          const text = `${s.scheme_name} ${s.eligibility} ${s.benefits}`.toLowerCase();
          return text.includes('disab') || text.includes('handicap') || text.includes('rvy') || text.includes('pwd');
        });
      }

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
            Category Eligibility Tool
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#ff9933] via-[#1e3a8a] to-[#138808] absolute top-0 left-0 right-0" />
          <div className="flex items-center gap-3 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl border border-emerald-200 shrink-0">
              {category.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {category.name} Eligibility Checker
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Select your profile criteria to verify matching <strong>{category.name}</strong> schemes.
              </p>
            </div>
          </div>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Eligibility Selection Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Age Selection Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  👤 Age Group
                </label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => handleAgeRangeSelect(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white cursor-pointer font-medium text-slate-800"
                >
                  <option value="All">All Ages (0 – 100 Years)</option>
                  <option value="8">Child (Under 15 Years)</option>
                  <option value="20">Youth / Student (15 – 24 Years)</option>
                  <option value="35">Adult (25 – 45 Years)</option>
                  <option value="50">Senior Adult (46 – 59 Years)</option>
                  <option value="65">Senior Citizen (60+ Years)</option>
                  <option value="custom">Enter Specific Age...</option>
                </select>

                {formData.ageRange === 'custom' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.customAge}
                      onChange={handleCustomAgeChange}
                      placeholder="Enter age in years (0 - 120)"
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] bg-slate-50 font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Gender Selection Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  ⚧ Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white cursor-pointer font-medium text-slate-800"
                >
                  <option value="All">All Genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Transgender</option>
                </select>
              </div>

              {/* State Selection Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  📍 State / Region
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white cursor-pointer font-medium text-slate-800"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Occupation Selection Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  💼 Target Occupation
                </label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white cursor-pointer font-medium text-slate-800"
                >
                  {OCCUPATIONS.map((occ) => (
                    <option key={occ.value} value={occ.value}>{occ.label}</option>
                  ))}
                </select>
              </div>

              {/* Annual Income Selection Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  💰 Annual Family Income Limit
                </label>
                <select
                  name="annual_income"
                  value={formData.annual_income}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white cursor-pointer font-medium text-slate-800"
                >
                  {INCOME_RANGES.map((inc) => (
                    <option key={inc.value} value={inc.value}>{inc.label}</option>
                  ))}
                </select>
              </div>

              {/* Caste / Category Selection Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  🏷️ Caste / Social Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white cursor-pointer font-medium text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Disability Status Selection Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  ♿ Disability Status (PwD)
                </label>
                <select
                  name="disability"
                  value={formData.disability}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white cursor-pointer font-medium text-slate-800"
                >
                  <option value="All">All Statuses (General & PwD)</option>
                  <option value="Yes">Person with Disability (PwD)</option>
                  <option value="No">Non-Disabled</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Checking {category.name} Eligibility…</span>
                ) : (
                  <>
                    <span>Verify {category.name} Schemes</span>
                    <span>🎯</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
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
                <h3 className="text-base font-bold text-slate-800">No Category Matches Found</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                  Try broadening your profile criteria for {category.name}.
                </p>
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
