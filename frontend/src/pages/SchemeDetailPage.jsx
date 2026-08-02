import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchSchemeById } from '../api';
import SchemeCard from '../components/SchemeCard';

/**
 * Full Dedicated Scheme Detail Page (/scheme/:id)
 * Displays complete official scheme metadata, eligibility, benefits, required documents, FAQs, and related schemes.
 */
export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);
  const [relatedSchemes, setRelatedSchemes] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSchemeById(id);
        setScheme(data.scheme || null);
        setRelatedSchemes(data.related_schemes || []);
        setFaqs(data.faqs || []);
      } catch (err) {
        console.error('Scheme detail error:', err);
        setError('Scheme details not found or database unavailable.');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
          <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-sm">
          <div className="text-5xl mb-3">⚠️</div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Scheme Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'The requested scheme could not be located.'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] text-white font-bold text-xs"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs sm:text-sm font-bold text-[#1e3a8a] hover:underline flex items-center gap-1"
          >
            <span>← Back</span>
          </button>
          <span className="text-xs font-bold text-slate-400">
            Official Scheme Profile
          </span>
        </div>

        {/* Scheme Header Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="h-2 w-full bg-[#1e3a8a] absolute top-0 left-0 right-0" />
          
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pt-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-xs font-extrabold mb-3 border border-blue-200 uppercase tracking-wider">
                🏛️ {scheme.category || 'General'} Portal
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {scheme.scheme_name}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                {scheme.ministry}
              </p>
            </div>

            {/* Direct Apply Action Button */}
            {scheme.apply_link && (
              <a
                href={scheme.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2 text-center"
              >
                <span>Apply on Official Portal</span>
                <span className="text-xs">↗</span>
              </a>
            )}
          </div>

          {/* Quick Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 mt-6">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">State Coverage</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">📍 {scheme.state || 'All India'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Target Occupation</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">💼 {scheme.occupation || 'All'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Age Limits</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                👤 {scheme.min_age || scheme.max_age ? `${scheme.min_age ?? 0} - ${scheme.max_age ?? '∞'} yrs` : 'Any Age'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Income Limit</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                💰 {scheme.max_income && scheme.max_income < 10000000 ? `₹${Number(scheme.max_income).toLocaleString('en-IN')}` : 'No Limit'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="space-y-6 mb-10">
          
          {/* Key Benefits */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-lg mb-3">
              <span>💡</span>
              <h2>Key Benefits & Financial Cover</h2>
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {scheme.benefits}
            </p>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-[#1e3a8a] font-extrabold text-lg mb-3">
              <span>📋</span>
              <h2>Eligibility Criteria</h2>
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {scheme.eligibility}
            </p>
          </div>

          {/* Required Documents Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-lg mb-3">
              <span>📄</span>
              <h2>Required Documents Checklist</h2>
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {scheme.required_documents}
            </p>
          </div>

          {/* Step-by-Step Application Guide */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700 font-extrabold text-lg mb-4">
              <span>🔗</span>
              <h2>Application Process & Steps</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-900">Gather Required Documents</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ensure you have valid copies of: {scheme.required_documents}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-900">Access Official Portal</p>
                  <p className="text-xs text-slate-500 mt-0.5">Visit the official application portal: {scheme.apply_link}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-900">Submit Application Form</p>
                  <p className="text-xs text-slate-500 mt-0.5">Fill out your profile details according to eligibility criteria and submit online or at your nearest District Secretariat / CSC Center.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          {faqs.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="font-extrabold text-slate-900 text-lg mb-4">Frequently Asked Questions (FAQs)</h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full p-4 bg-slate-50 hover:bg-slate-100 font-bold text-slate-900 text-xs sm:text-sm text-left flex justify-between items-center transition-colors"
                    >
                      <span>{faq.question}</span>
                      <span className="text-slate-400 ml-2">{activeFaq === idx ? '−' : '+'}</span>
                    </button>
                    {activeFaq === idx && (
                      <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 border-t border-slate-200 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Schemes Grid */}
        {relatedSchemes.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Related Schemes in {scheme.category || 'this Sector'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedSchemes.map((rel) => (
                <SchemeCard key={rel.id} scheme={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
