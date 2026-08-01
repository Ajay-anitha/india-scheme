import React from 'react';

export default function Hero({ onCheckEligibility, onAskAI }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">AI Government Scheme Assistant</h1>
        <p className="hero-subtitle">
          Find government schemes, check your eligibility instantly, and get answers from our AI assistant.
        </p>
        <div className="hero-actions">
          <button className="btn btn-accent" onClick={onCheckEligibility}>
            📋 Check Your Eligibility
          </button>
          <button className="btn btn-outline" onClick={onAskAI}>
            💬 Ask AI Assistant
          </button>
        </div>
      </div>
    </section>
  );
}
