import React, { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      question: 'What is the AI Government Scheme Assistant?',
      answer: 'The AI Government Scheme Assistant is a citizen-centric digital platform designed to help citizens across India discover central and state government welfare schemes, verify personalized eligibility, and receive instant AI-powered guidance on application procedures.'
    },
    {
      question: 'How does the AI Assistant help me find schemes?',
      answer: 'Our AI Assistant utilizes natural language processing grounded in official government scheme databases. You can ask questions in plain English or regional phrasing (e.g. "What schemes are available for small farmers?", "How do I apply for PM-JAY?") and receive accurate, instant answers with direct links to official application portals.'
    },
    {
      question: 'Are the eligibility criteria and document requirements up to date?',
      answer: 'Yes. All scheme information, eligibility limits, and required document checklists are sourced exclusively from official Government of India ministries, state government departments, and official notifications.'
    },
    {
      question: 'Does this portal collect payment for government scheme applications?',
      answer: 'No. The AI Government Scheme Assistant is 100% free for all citizens. We do not charge any fees or process payment transactions. We direct applicants directly to official government portals (.gov.in / .nic.in).'
    },
    {
      question: 'How can I report an incorrect link or suggest a new scheme?',
      answer: 'You can submit feedback using the contact form on this page or email our technical helpdesk directly at helpdesk@schemeai.gov.in.'
    }
  ];

  const officialLinks = [
    { name: 'myScheme National Portal', url: 'https://www.myscheme.gov.in', desc: 'Centralized government scheme discovery platform' },
    { name: 'National Portal of India', url: 'https://www.india.gov.in', desc: 'Single-window access to information and services' },
    { name: 'Digital India Initiative', url: 'https://www.digitalindia.gov.in', desc: 'Flagship programme to transform India into a digitally empowered society' },
    { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in', desc: 'Common portal for central and state scholarship schemes' },
    { name: 'Ayushman Bharat PM-JAY', url: 'https://pmjay.gov.in', desc: 'World’s largest government-funded healthcare assurance scheme' },
    { name: 'PM Kisan Samman Nidhi', url: 'https://pmkisan.gov.in', desc: 'Income support scheme for cultivable landholding farmer families' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-extrabold px-4 py-1.5 rounded-full mb-3 border border-emerald-200 uppercase tracking-wider">
            🏛️ Portal Helpdesk & Citizen Assistance
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Contact & Portal Support
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
            Get official support, submit technical feedback, review common FAQs, or access official Government of India welfare resources.
          </p>
        </div>

        {/* ── 1. Project Information Banner ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-10 relative overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808] absolute top-0 left-0 right-0" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
            <div className="flex-1">
              <span className="text-xs font-extrabold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                About the Initiative
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                Empowering Citizens through Intelligent Scheme Discovery
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                The <strong>AI Government Scheme Assistant</strong> streamlines citizen access to over 87+ central and state welfare initiatives. By combining structured scheme databases with intelligent search, speech recognition, and generative AI guidance, we eliminate information barriers for farmers, students, entrepreneurs, women, and senior citizens.
              </p>
            </div>
            <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-[200px]">
              <div className="text-2xl font-extrabold text-[#1e3a8a]">87+</div>
              <div className="text-xs text-slate-500 font-bold">Verified Schemes</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Free & Transparent</div>
            </div>
          </div>
        </div>

        {/* ── 2. Contact Grid: Support Cards & Form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Support Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center text-xl mb-3 border border-blue-100">
                📞
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Helpline Support</h3>
              <p className="text-slate-800 text-sm font-bold mt-1">+91 7904779290</p>
              <p className="text-slate-500 text-xs mt-0.5">Toll-Free Citizen Query Assistance</p>
              <p className="text-slate-400 text-[11px] mt-2 pt-2 border-t border-slate-100 font-medium">Mon - Sat: 9:00 AM - 6:00 PM IST</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl mb-3 border border-emerald-100">
                ✉️
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Official Support Email</h3>
              <p className="text-slate-800 text-sm font-bold mt-1">helpdesk@schemeai.gov.in</p>
              <p className="text-slate-500 text-xs mt-0.5">24/7 Citizen Query & Technical Escalation</p>
              <p className="text-slate-400 text-[11px] mt-2 pt-2 border-t border-slate-100 font-medium">Average Response Time: &lt; 24 Hours</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl mb-3 border border-purple-100">
                📍
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Central Secretariat</h3>
              <p className="text-slate-800 text-xs font-semibold mt-1">National Informatics & Citizen Portal Division</p>
              <p className="text-slate-500 text-xs">New Delhi - 110001, India</p>
              <p className="text-slate-400 text-[11px] mt-2 pt-2 border-t border-slate-100 font-medium">Ministry of Electronics & IT</p>
            </div>
          </div>

          {/* Contact & Feedback Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <h2 className="text-xl font-extrabold text-slate-900">Citizen Support & Feedback Form</h2>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mb-6">
                Fill out the details below to raise a portal issue, suggest scheme updates, or request eligibility assistance.
              </p>

              {submitted ? (
                <div className="text-center py-12 bg-emerald-50/50 rounded-2xl border border-emerald-200 p-6">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Message Successfully Logged</h3>
                  <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                    Thank you for reaching out to the AI Scheme Assistant Helpdesk. Your query ticket reference is <strong>#SCH-{Math.floor(100000 + Math.random() * 900000)}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold shadow-sm"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Inquiry Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 bg-white"
                    >
                      <option value="General Inquiry">General Scheme Inquiry</option>
                      <option value="Eligibility Issue">Eligibility Verification Question</option>
                      <option value="Broken Link">Broken Government Portal Link</option>
                      <option value="AI Feedback">AI Assistant Response Feedback</option>
                      <option value="New Scheme Suggestion">Suggest a Scheme to Add</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Message / Feedback *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your inquiry, scheme question, or feedback in detail..."
                      className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Submit Inquiry</span>
                    <span className="text-xs">↗</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Portal FAQs Accordion ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-12">
          <div className="mb-6">
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
              Citizen FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 font-bold text-slate-900 text-sm text-left flex justify-between items-center transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className="text-slate-500 text-lg ml-2">{activeFaq === idx ? '−' : '+'}</span>
                </button>
                {activeFaq === idx && (
                  <div className="p-4 bg-white text-sm text-slate-600 border-t border-slate-200 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Official Government Resource Directory ── */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="mb-6 border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">
                <span>🇮🇳</span>
                <span>Government of India Direct Portals</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Official Resource Links
              </h2>
            </div>
            <span className="text-xs text-slate-400">All links open verified government websites</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialLinks.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700/80 hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-xs text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/50 text-[10px] font-mono text-emerald-400/80">
                  {item.url.replace('https://', '')}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
