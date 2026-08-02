import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSchemeSuggestions } from '../api';

/**
 * Advanced SearchBar Component:
 * - Fixed position typing (NO auto-scrolling or page jumping on input)
 * - Real-time autocomplete suggestions dropdown
 * - Direct navigation to /search?q=... on submit or /scheme/:id on suggestion click
 * - Browser Speech-to-Text Integration
 */
export default function SearchBar({
  placeholder = 'Search schemes by name, ministry, eligibility, or benefits...',
  accentColor = '#1e3a8a'
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechFeedback, setSpeechFeedback] = useState('');
  
  const recognitionRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search suggestions fetch (NO page movement)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await fetchSchemeSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.warn('Suggestions fetch error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechFeedback('Listening… Speak your query clearly');
      };

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQuery(transcript);
        setSpeechFeedback(`Recognized: "${transcript}"`);

        if (event.results[0].isFinal) {
          rec.stop();
          setIsListening(false);
          if (transcript.trim()) {
            navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
          }
        }
      };

      rec.onerror = (event) => {
        setIsListening(false);
        setSpeechFeedback('Voice recognition error. Please try again.');
        setTimeout(() => setSpeechFeedback(''), 3000);
      };

      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    } else {
      setSpeechSupported(false);
    }
  }, [navigate]);

  const toggleVoiceSearch = () => {
    if (!speechSupported) {
      alert('Voice search is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        setSpeechFeedback('Starting microphone…');
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (id) => {
    setShowSuggestions(false);
    setQuery('');
    navigate(`/scheme/${id}`);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSpeechFeedback('');
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center w-full bg-white rounded-2xl border-2 border-slate-200 shadow-lg transition-all duration-200 focus-within:border-[#1e3a8a] focus-within:ring-4 focus-within:ring-[#1e3a8a]/10">
        
        {/* Search Icon */}
        <button type="submit" className="pl-4 pr-2 text-slate-400 text-lg flex items-center justify-center shrink-0 hover:text-[#1e3a8a] transition-colors" title="Execute Search">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Text Input */}
        <input
          type="text"
          className="w-full py-3.5 px-2 bg-transparent text-slate-800 text-sm sm:text-base outline-none font-medium placeholder:text-slate-400"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
        />

        {/* Action Controls: Clear & Voice */}
        <div className="flex items-center gap-1.5 pr-2 shrink-0">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            className={`relative p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md'
                : 'text-slate-500 hover:text-[#1e3a8a] hover:bg-slate-100'
            }`}
            title={isListening ? 'Stop Listening' : 'Search by Voice'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          {/* Search Submit Button */}
          <button
            type="submit"
            className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-150 hover:brightness-95 shadow-sm"
            style={{ background: accentColor }}
          >
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-100">
          <div className="px-4 py-2 bg-slate-50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Matching Schemes ({suggestions.length})</span>
            <span>Click to view details</span>
          </div>

          {suggestions.map((s) => (
            <div
              key={s.id}
              onClick={() => handleSuggestionClick(s.id)}
              className="px-4 py-3 hover:bg-blue-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#1e3a8a] truncate">
                  {s.scheme_name}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {s.ministry}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-[#1e3a8a] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  {s.category}
                </span>
                <span className="text-slate-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voice Status / Feedback Indicator */}
      {(isListening || speechFeedback) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900/80 text-white backdrop-blur-sm inline-flex">
          {isListening && <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />}
          <span>{speechFeedback}</span>
        </div>
      )}
    </div>
  );
}
