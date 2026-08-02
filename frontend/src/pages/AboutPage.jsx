import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const highlights = [
    { icon: '🔍', title: 'Smart Voice & Text Search', desc: 'Search central and state government schemes effortlessly via text or browser Web Speech API voice input.' },
    { icon: '🎯', title: 'Category-Specific Eligibility', desc: 'Verify qualified schemes tailored to your age, income, state, occupation, and social category.' },
    { icon: '🤖', title: '24/7 AI Scheme Assistant', desc: 'Interact with an intelligent assistant powered by direct FastAPI endpoints for scheme details, documents, and recommendations.' },
    { icon: '🏛️', title: 'Verified Portal Links', desc: 'Direct access to official state and central portal application links without third-party redirection.' },
    { icon: '🌐', title: 'All States & Sectors', desc: 'Comprehensive coverage across Agriculture, Health, Education, Housing, Women, Employment, Student, and Senior Citizen welfare.' },
    { icon: '📱', title: 'Accessible & Responsive', desc: 'Designed according to official government portal standards with high contrast, responsive layouts, and clean typography.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1e3a8a] text-xs font-extrabold px-4 py-1.5 rounded-full mb-4 border border-blue-200 uppercase tracking-wider">
            🇮🇳 Official AI Welfare Assistance Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            About AI Government Scheme Assistant
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Bridging the gap between Indian citizens and government welfare. Empowering every individual with instant, transparent information on central and state schemes.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {highlights.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center text-2xl mb-4 border border-blue-100">
                {item.icon}
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2">{item.title}</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Mission Statement Banner */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#047857] text-white rounded-3xl p-8 sm:p-10 shadow-lg text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Transforming Welfare Delivery Across India
          </h2>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
            Our platform utilizes modern AI, web speech recognition, and structured database queries to ensure every citizen finds the benefits they are entitled to.
          </p>
          <Link
            to="/"
            className="px-8 py-3.5 rounded-xl bg-white text-[#1e3a8a] font-bold text-sm hover:bg-slate-100 transition-colors inline-block shadow-md"
          >
            Explore Schemes Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
