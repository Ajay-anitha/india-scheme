import React, { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
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

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-extrabold px-4 py-1.5 rounded-full mb-3 border border-emerald-200 uppercase tracking-wider">
            🏛️ Portal Helpdesk & Citizen Assistance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Contact & Support
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Have questions about scheme eligibility, application links, or technical feedback? Reach out to our portal team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Support Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xl mb-2">📞</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Helpline Support</h3>
              <p className="text-slate-500 text-xs mt-1">+91 7904779290</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Mon - Sat: 9:00 AM - 6:00 PM</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xl mb-2">✉️</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Official Email</h3>
              <p className="text-slate-500 text-xs mt-1">helpdesk@schemeai.gov.in</p>
              <p className="text-slate-400 text-[11px] mt-0.5">24/7 Citizen Query Support</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="text-xl mb-2">📍</div>
              <h3 className="font-extrabold text-slate-900 text-sm">Central Secretariat</h3>
              <p className="text-slate-500 text-xs mt-1">New Delhi, India</p>
              <p className="text-slate-400 text-[11px] mt-0.5">National Informatics Center</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Message Received</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Thank you for contacting the AI Scheme Assistance Helpdesk. Your ticket has been logged.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Message / Feedback *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or feedback..."
                    className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold text-sm shadow-md transition-colors"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
