import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="logo" onClick={() => setActiveTab('home')}>
          <span>🏛️ SchemeAI</span>
          <span className="logo-badge">Gov Assistant</span>
        </div>
        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            🏠 Home & Schemes
          </button>
          <button 
            className={`nav-item ${activeTab === 'eligibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('eligibility')}
          >
            📋 Eligibility Check
          </button>
          <button 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 AI Assistant
          </button>
        </nav>
      </div>
    </header>
  );
}
