import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import CategoryEligibilityPage from './pages/CategoryEligibilityPage';
import SearchResultsPage from './pages/SearchResultsPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import EligibilityPage from './pages/EligibilityPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/scheme/:id" element={<SchemeDetailPage />} />
            <Route path="/eligibility" element={<EligibilityPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/category/:slug/eligibility" element={<CategoryEligibilityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
