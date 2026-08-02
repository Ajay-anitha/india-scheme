import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchSchemeById } from '../api';
import SchemeCard from '../components/SchemeCard';
import { formatIncomeDisplay, formatAgeDisplay, formatDisabilityDisplay, formatMaritalDisplay } from '../utils/formatters';

/**
 * Helper to parse document list strings into structured objects with requirement badges,
 * official explanations, and application/verification stage indicators.
 */
function parseRequiredDocuments(docString) {
  if (!docString) return [];
  // Split on commas, semicolons, or newlines
  const rawList = docString.split(/[,;\n]+/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean);

  return rawList.map((docName) => {
    const lower = docName.toLowerCase();

    if (
      lower.includes('aadhaar') ||
      lower.includes('land') ||
      lower.includes('khasra') ||
      lower.includes('bank') ||
      lower.includes('mobile') ||
      lower.includes('identity') ||
      lower.includes('id proof')
    ) {
      return {
        name: docName,
        level: '🔴 Mandatory',
        levelType: 'mandatory',
        badgeBg: 'bg-red-50 border-red-200 text-red-700',
        explanation: 'This document is compulsory. The application cannot be submitted without it. Applicants should obtain it before applying.',
        stage: 'Application & Verification (Both)',
        isCompulsory: true
      };
    } else if (
      lower.includes('income') ||
      lower.includes('caste') ||
      lower.includes('disability') ||
      lower.includes('bpl') ||
      lower.includes('sc') ||
      lower.includes('st') ||
      lower.includes('obc') ||
      lower.includes('sowing')
    ) {
      return {
        name: docName,
        level: '🟡 Conditional',
        levelType: 'conditional',
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
        explanation: 'Required only for specific income groups, categories, states, or official eligibility conditions.',
        stage: 'Application Stage',
        isCompulsory: false
      };
    } else if (
      lower.includes('photo') ||
      lower.includes('residence') ||
      lower.includes('address') ||
      lower.includes('ration') ||
      lower.includes('birth') ||
      lower.includes('marksheet') ||
      lower.includes('certificate')
    ) {
      return {
        name: docName,
        level: '🟠 Usually Required',
        levelType: 'usually_required',
        badgeBg: 'bg-orange-50 border-orange-200 text-orange-800',
        explanation: 'Normally required for most applicants during verification. Keep ready to prevent portal delays.',
        stage: 'Verification Stage',
        isCompulsory: false
      };
    } else if (lower.includes('prescription') || lower.includes('optional') || lower.includes('affidavit')) {
      return {
        name: docName,
        level: '🟢 Optional',
        levelType: 'optional',
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        explanation: 'Helpful supporting document but not compulsory for application submission.',
        stage: 'Application Stage',
        isCompulsory: false
      };
    } else {
      return {
        name: docName,
        level: 'Unstated Level',
        levelType: 'unstated',
        badgeBg: 'bg-slate-100 border-slate-200 text-slate-700',
        explanation: 'Requirement level is not explicitly specified in the official government guidelines.',
        stage: 'Specified during verification',
        isCompulsory: false
      };
    }
  });
}

/**
 * Full Scheme Detail Page (/scheme/:id)
 * Features:
 * - Official Description, Benefits, Eligibility, Documents, Application Process, Official Portals & Notifications.
 * - Eligibility Grid Cards (Age, Gender, Income, Occupation, State, Community, Other Criteria).
 * - Required Documents Checklist with Badges (🔴 Mandatory, 🟠 Usually Required, 🟡 Conditional, 🟢 Optional).
 * - Highlighted Notice if all listed documents are mandatory.
 * - Verified Official Government (.gov.in / .nic.in / .org.in) links.
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
      <div className="bg-slate-50 min-h-screen py-12 max-w-5xl mx-auto px-4">
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
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Scheme Details Unavailable</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'The requested government scheme profile could not be loaded.'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] text-white font-bold text-xs"
          >
            ← Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const parsedDocs = parseRequiredDocuments(scheme.required_documents);
  const allDocsAreMandatory = parsedDocs.length > 0 && parsedDocs.every(d => d.isCompulsory);

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
            <span>← Back to Search Results</span>
          </button>
          <span className="text-xs font-bold text-slate-400">
            Verified Government Scheme Profile
          </span>
        </div>

        {/* Scheme Header Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#ff9933] via-[#1e3a8a] to-[#138808] absolute top-0 left-0 right-0" />
          
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pt-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-xs font-extrabold mb-3 border border-blue-200 uppercase tracking-wider">
                🏛️ {scheme.category || 'National'} Welfare Portal
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {scheme.scheme_name}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1">
                {scheme.ministry}
              </p>
            </div>

            {/* Direct Official Apply Link */}
            {scheme.apply_link && (
              <a
                href={scheme.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 text-center hover:scale-[1.02]"
              >
                <span>Official Application Portal</span>
                <span className="text-xs">↗</span>
              </a>
            )}
          </div>

          {/* Official Government Websites & Portals Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Official Links:</span>
            
            {scheme.apply_link && (
              <a
                href={scheme.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>🌐 Application Website</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}

            <a
              href="https://www.myscheme.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>🇮🇳 National Portal (myScheme.gov.in)</span>
              <span className="text-[10px]">↗</span>
            </a>

            <a
              href="https://www.india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>🏛️ India.gov.in Portal</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>

        {/* ── 1. Eligibility Criteria Displayed in Clean Information Cards ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-2 text-[#1e3a8a] font-extrabold text-xl mb-6">
            <span>📋</span>
            <h2>Eligibility Profile Requirements</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Age</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>👤</span> {formatAgeDisplay(scheme.min_age, scheme.max_age)}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gender</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>⚧</span> {scheme.gender || 'All Genders'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Annual Family Income</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800 flex items-center gap-1.5">
                <span>💰</span> {formatIncomeDisplay(scheme.max_income, scheme.eligibility)}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>🏷️</span> {scheme.category || 'All Categories'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Occupation</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>💼</span> {scheme.occupation || 'All Occupations'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">State</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>📍</span> {scheme.state || 'All States'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Disability</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>♿</span> {formatDisabilityDisplay(scheme.eligibility)}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Marital Status</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>💍</span> {formatMaritalDisplay(scheme.eligibility)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-2xl border border-blue-200 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <span className="font-extrabold text-[#1e3a8a] block mb-1">Official Guidelines Narrative:</span>
            {scheme.eligibility}
          </div>
        </div>

        {/* ── 2. Official Benefits Section ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xl mb-4">
            <span>💡</span>
            <h2>Official Scheme Benefits & Direct Assistance</h2>
          </div>
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-5 text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
            {scheme.benefits}
          </div>
        </div>

        {/* ── 3. Required Documents Checklist with Requirement Badges ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xl">
              <span>📄</span>
              <h2>Required Documents Checklist</h2>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {parsedDocs.length} Verified Document Requirements
            </span>
          </div>

          {/* Highlighted Notice if ALL documents are mandatory */}
          {allDocsAreMandatory && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="font-extrabold text-red-900 text-sm">
                  Important Notice
                </p>
                <p className="text-xs sm:text-sm text-red-800 mt-0.5 leading-relaxed font-semibold">
                  Every document listed below is mandatory for this scheme. Please obtain all required documents before beginning your application to avoid rejection or delays.
                </p>
              </div>
            </div>
          )}

          {/* Document Checklist Items */}
          <div className="space-y-3">
            {parsedDocs.map((doc, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-4 transition-all hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {doc.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs ${doc.badgeBg}`}>
                    {doc.level}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    {doc.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Step-by-Step Application Guide ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-2 text-blue-800 font-extrabold text-xl mb-6">
            <span>🔗</span>
            <h2>Application Process & Procedure</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-8 h-8 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-extrabold shrink-0">1</span>
              <div>
                <p className="font-extrabold text-slate-900 text-sm sm:text-base">Prepare Document Checklist</p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">Verify that you possess all mandatory and required documents listed above prior to starting the application.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-8 h-8 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-extrabold shrink-0">2</span>
              <div>
                <p className="font-extrabold text-slate-900 text-sm sm:text-base">Access Official Government Application Portal</p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Navigate to the official portal: {' '}
                  <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1e3a8a] underline">
                    {scheme.apply_link}
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-8 h-8 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-extrabold shrink-0">3</span>
              <div>
                <p className="font-extrabold text-slate-900 text-sm sm:text-base">Submit Citizen Registration or Visit CSC</p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">Complete your online registration or visit your nearest Common Service Centre (CSC) or Gram Panchayat Secretariat for assisted submission.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Scheme FAQs ── */}
        {faqs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
            <h2 className="font-extrabold text-slate-900 text-xl mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100 font-bold text-slate-900 text-xs sm:text-sm text-left flex justify-between items-center transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-500 font-extrabold text-base ml-2">{activeFaq === idx ? '−' : '+'}</span>
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

        {/* ── 6. Related Schemes Grid ── */}
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
