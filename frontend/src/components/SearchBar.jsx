import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSchemeSuggestions } from '../api';

/**
 * Google-Style SearchBar Component:
 * - Fixed position typing (NO auto-scrolling, page jumping, or automatic navigation while typing)
 * - Keeps cursor focused smoothly
 * - Real-time autocomplete suggestions dropdown with category & scheme matches
 * - Typo auto-correction badge ("Did you mean...?")
 * - Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 * - Direct navigation to dedicated /search?q=... on Enter or /scheme/:id / /category/:slug on selection
 * - Browser Speech-to-Text Integration
 */
export default function SearchBar({
  placeholder = 'Search schemes by name, ministry, eligibility, or benefits...',
  accentColor = '#1e3a8a'
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [correctedQuery, setCorrectedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechFeedback, setSpeechFeedback] = useState('');
  
  const recognitionRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search suggestions fetch (Zero scroll, zero refresh)
  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setCorrectedQuery('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetchSchemeSuggestions(query);
        const suggList = res.suggestions || [];
        setSuggestions(suggList);
        setCorrectedQuery(res.correctedQuery || '');
        setShowSuggestions(suggList.length > 0 || Boolean(res.correctedQuery));
        setSelectedIndex(-1);
      } catch (err) {
        console.warn('Suggestions fetch error:', err);
      }
    }, 180);

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

      rec.onerror = () => {
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
    if (e) e.preventDefault();
    setShowSuggestions(false);
    
    // If keyboard selection index is active
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleItemSelect(suggestions[selectedIndex]);
      return;
    }

    const finalQuery = query.trim();
    if (finalQuery) {
      navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleItemSelect = (item) => {
    setShowSuggestions(false);
    if (!item) return;
    
    if (item.type === 'category') {
      navigate(`/category/${item.slug}`);
    } else if (item.type === 'scheme') {
      navigate(`/scheme/${item.id}`);
    } else if (item.scheme_name) {
      navigate(`/scheme/${item.id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setCorrectedQuery('');
    setShowSuggestions(false);
    setSpeechFeedback('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      {/* Search Input Form */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full bg-white rounded-2xl border-2 border-slate-200 shadow-lg transition-all duration-200 focus-within:border-[#1e3a8a] focus-within:ring-4 focus-within:ring-[#1e3a8a]/10"
      >
        {/* Search Icon */}
        <button
          type="submit"
          className="pl-4 pr-2 text-slate-400 text-lg flex items-center justify-center shrink-0 hover:text-[#1e3a8a] transition-colors"
          title="Execute Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 0114 0z" />
          </svg>
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          className="w-full py-3.5 px-2 bg-transparent text-slate-800 text-sm sm:text-base outline-none font-medium placeholder:text-slate-400"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 || correctedQuery) setShowSuggestions(true);
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

      {/* Autocomplete & Typo Correction Live Dropdown */}
      {showSuggestions && (suggestions.length > 0 || correctedQuery) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 divide-y divide-slate-100">
          
          {/* Typo Correction Banner if query was auto-corrected */}
          {correctedQuery && (
            <div
              onClick={() => {
                setQuery(correctedQuery);
                navigate(`/search?q=${encodeURIComponent(correctedQuery)}`);
                setShowSuggestions(false);
              }}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100/80 cursor-pointer border-b border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>💡 Did you mean:</span>
                <span className="underline font-extrabold text-[#1e3a8a]">{correctedQuery}</span>
              </div>
              <span className="text-[10px] text-amber-700 uppercase tracking-wider">Auto-Correct Suggestion</span>
            </div>
          )}

          {/* Suggestions List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isCategory = item.type === 'category';

              return (
                <div
                  key={idx}
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/90 text-[#1e3a8a]' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base shrink-0">
                      {isCategory ? '🏷️' : '🏛️'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {isCategory ? item.label : item.scheme_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {isCategory ? 'Explore sector schemes & eligibility' : `${item.ministry} • ${item.state}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isCategory
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-[#1e3a8a] border-blue-200'
                    }`}>
                      {isCategory ? 'Category' : (item.category || 'Scheme')}
                    </span>
                    <span className="text-slate-400 text-xs">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voice Status / Feedback Indicator */}
      {(isListening || speechFeedback) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900/90 text-white backdrop-blur-sm inline-flex">
          {isListening && <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />}
          <span>{speechFeedback}</span>
        </div>
      )}
    </div>
  );
}
