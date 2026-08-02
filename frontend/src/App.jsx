import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EligibilityPage from './pages/EligibilityPage';
import ResultsPage from './pages/ResultsPage';
import ChatPage from './pages/ChatPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [eligibilityResults, setEligibilityResults] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});

  const handleEligibilityResults = (results, criteria) => {
    setEligibilityResults(results);
    setFilterCriteria(criteria);
    setActiveTab('results');
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'home' && (
        <HomePage 
          onCheckEligibility={() => setActiveTab('eligibility')}
          onAskAI={() => setActiveTab('chat')}
        />
      )}

      {activeTab === 'eligibility' && (
        <EligibilityPage 
          onResultsReceived={handleEligibilityResults}
        />
      )}

      {activeTab === 'results' && (
        <ResultsPage 
          schemes={eligibilityResults}
          filterCriteria={filterCriteria}
          onBackToForm={() => setActiveTab('eligibility')}
        />
      )}

      {activeTab === 'chat' && (
        <ChatPage />
      )}

      {activeTab === 'about' && (
        <AboutPage />
      )}

      <Footer />
    </div>
  );
}
