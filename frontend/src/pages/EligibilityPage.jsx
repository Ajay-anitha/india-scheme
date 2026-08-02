import React, { useState } from 'react';
import { checkEligibility } from '../api';

const STATES = [
  'All India', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Delhi',
  'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan',
  'Madhya Pradesh', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab',
];
const OCCUPATIONS = ['All', 'Farmer', 'Student', 'Entrepreneur', 'Vendor', 'Unemployed', 'Worker', 'Salaried'];
const CATEGORIES  = ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'];

const ACCENT = '#1e3a8a';

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

export default function EligibilityPage({ onResultsReceived }) {
  const [form, setForm] = useState({
    age: '', gender: 'All', state: 'All India',
    occupation: 'All', annual_income: '', category: 'All',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender,
        state: form.state,
        occupation: form.occupation,
        annual_income: form.annual_income ? parseInt(form.annual_income, 10) : null,
        category: form.category,
      };
      const data = await checkEligibility(payload);
      onResultsReceived(data.schemes || [], form);
    } catch {
      setError('Failed to check eligibility. Please ensure the FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white outline-none transition-all focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page heading */}
      <div className="max-w-xl mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          🎯 Check Your Eligibility
        </h1>
        <p className="text-slate-500 text-base">
          Fill in your personal details below and our AI will instantly match you with government schemes you qualify for.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100" style={{ background: '#eff6ff' }}>
              <h2 className="font-bold text-[#1e3a8a] text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Personal Details
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Your information is used only to match eligible schemes.</p>
            </div>

            <form onSubmit={submit} className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <FormField label="🎂 Age (Years)">
                  <input name="age" type="number" min="0" max="120" placeholder="e.g., 28" className={inputCls} value={form.age} onChange={handle} />
                </FormField>

                <FormField label="👤 Gender">
                  <select name="gender" className={inputCls} value={form.gender} onChange={handle}>
                    <option value="All">Any Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>

                <FormField label="📍 Resident State">
                  <select name="state" className={inputCls} value={form.state} onChange={handle}>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>

                <FormField label="💼 Occupation">
                  <select name="occupation" className={inputCls} value={form.occupation} onChange={handle}>
                    {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FormField>

                <FormField label="💵 Annual Family Income (₹)">
                  <input name="annual_income" type="number" min="0" placeholder="e.g., 150000" className={inputCls} value={form.annual_income} onChange={handle} />
                </FormField>

                <FormField label="📜 Social Category">
                  <select name="category" className={inputCls} value={form.category} onChange={handle}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-all hover:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: ACCENT }}
              >
                {loading ? '🔍 Analyzing schemes…' : '✨ Find My Eligible Schemes'}
              </button>
            </form>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-3 text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>How It Works</h3>
            {[
              { step: '1', text: 'Enter your personal details in the form.' },
              { step: '2', text: 'Our AI cross-checks your profile against 500+ government schemes.' },
              { step: '3', text: 'Receive a personalised list of schemes you are eligible for.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-3 mb-3 last:mb-0">
                <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: ACCENT }}>
                  {s.step}
                </div>
                <p className="text-sm text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h4 className="font-semibold text-[#1e3a8a] text-sm mb-2">🔒 Privacy Notice</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your information is processed locally and not stored on any external server. It is used only to match government scheme eligibility criteria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
