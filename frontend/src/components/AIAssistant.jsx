import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, fetchSchemes } from '../api';

/**
 * Conversational AI Assistant Component:
 * - Session Context Retention: Remembers the active scheme or category across follow-up queries.
 * - Intent Detection: Translates follow-ups ("Benefits?", "Eligibility?", "Documents?", "How to apply?") into contextual questions.
 * - Category Scheme Listing: Lists available schemes when a category is selected before taking scheme follow-ups.
 * - Scoped Auto-Scroll: Auto-scrolls ONLY inside the chat bubble window, maintaining page scroll position.
 */
export default function AIAssistant({ categoryName }) {
  const [activeScheme, setActiveScheme] = useState(null);
  const [activeCategory, setActiveCategory] = useState(categoryName || null);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: categoryName
        ? `Namaste! 🙏 I am your AI Scheme Assistant for **${categoryName}**.\n\nYou can ask me any question about ${categoryName} schemes, or select a scheme to check benefits, eligibility criteria, required documents, or application steps!`
        : 'Namaste! 🙏 I am your AI Government Scheme Assistant.\n\nAsk me about any central or state government scheme, or select a category to view available schemes and ask follow-up questions!',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync category prop if updated
  useEffect(() => {
    if (categoryName && categoryName !== activeCategory) {
      setActiveCategory(categoryName);
    }
  }, [categoryName, activeCategory]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (e) => {
        const transcript = Array.from(e.results).map((r) => r[0].transcript).join('');
        setInput(transcript);
        if (e.results[0].isFinal) {
          rec.stop();
          setIsRecording(false);
        }
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // Scoped Auto-Scroll inside chat window only (No window page scrolling)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Helper to check if text is a follow-up query
  const isFollowUpQuery = (text) => {
    const lower = text.toLowerCase().trim();
    const followUpKeywords = [
      'benefit', 'benefits', 'eligible', 'eligibility', 'document', 'documents',
      'apply', 'how to apply', 'application', 'process', 'steps', 'details',
      'tell me more', 'criteria', 'link', 'what do i need'
    ];
    return followUpKeywords.some((kw) => lower.includes(kw));
  };

  const handleSend = async (textOverride) => {
    const query = (textOverride ?? input).trim();
    if (!query || loading) return;

    // Append User Message to Chat History
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setInput('');
    setLoading(true);

    try {
      let payloadPrompt = query;

      // 1. Check if user is asking about a category listing
      const categoryMatchKeywords = ['agriculture', 'education', 'health', 'housing', 'women', 'employment', 'student', 'senior'];
      const matchedCat = categoryMatchKeywords.find((cat) => query.toLowerCase().includes(cat));

      if (matchedCat && (query.toLowerCase().includes('scheme') || query.toLowerCase().includes('list') || query.toLowerCase().includes('what'))) {
        try {
          const categorySchemesRes = await fetchSchemes(matchedCat);
          const catSchemes = categorySchemesRes.schemes || [];
          if (catSchemes.length > 0) {
            const listText = `Here are the official schemes available under **${catSchemes[0].category || matchedCat}**:\n\n` +
              catSchemes.map((s, idx) => `**${idx + 1}. ${s.scheme_name}** — ${s.benefits}`).join('\n\n') +
              `\n\n💡 You can ask me follow-up questions like *"What are the benefits of ${catSchemes[0].scheme_name}?"* or *"Eligibility?"*`;

            setActiveCategory(catSchemes[0].category || matchedCat);
            setActiveScheme(catSchemes[0]); // Default focus to top scheme in category

            setMessages((prev) => [
              ...prev,
              {
                sender: 'assistant',
                text: listText,
                schemesMentioned: catSchemes.slice(0, 3)
              }
            ]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Category quick fetch error:', err);
        }
      }

      // 2. Conversational Memory: If it's a follow-up query and activeScheme exists
      if (isFollowUpQuery(query) && activeScheme) {
        payloadPrompt = `[Context Scheme: ${activeScheme.scheme_name}] ${query}`;
      } else if (activeCategory && !activeScheme) {
        payloadPrompt = `[Context Category: ${activeCategory}] ${query}`;
      }

      // 3. API Call to /chat
      const data = await sendChatMessage(payloadPrompt);
      const replyText = data.reply || 'Here is the relevant scheme information.';

      // Extract schemes mentioned from API response
      const schemesMentioned = data.schemes_mentioned || [];
      if (schemesMentioned.length > 0) {
        // Automatically retain the first scheme as active conversational context
        setActiveScheme(schemesMentioned[0]);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: replyText,
          schemesMentioned
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the AI Assistant service. Please ensure the backend server is running.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!speechSupported) {
      alert('Voice search is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const clearMemory = () => {
    setActiveScheme(null);
    setActiveCategory(categoryName || null);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden flex flex-col min-h-[520px] max-h-[680px]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#1e3a8a] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center text-xl backdrop-blur-sm">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {categoryName ? `${categoryName} AI Advisor` : 'AI Government Scheme Assistant'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              
              {/* Active Context Banner */}
              {activeScheme ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 mt-0.5 font-medium">
                  <span>Focused Scheme:</span>
                  <span className="font-bold underline">{activeScheme.scheme_name}</span>
                  <button
                    type="button"
                    onClick={clearMemory}
                    className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-1.5 py-0.2 rounded ml-1"
                    title="Clear Scheme Context"
                  >
                    ✕ Clear
                  </button>
                </div>
              ) : activeCategory ? (
                <p className="text-blue-200 text-xs mt-0.5">Focused Category: {activeCategory}</p>
              ) : (
                <p className="text-blue-200 text-xs mt-0.5">Conversational Context Enabled · Direct API Query</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              clearMemory();
              setMessages([messages[0]]);
            }}
            className="text-xs text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors font-semibold"
          >
            Reset Chat
          </button>
        </div>

        {/* Quick Follow-up Action Chips (Appears when activeScheme is focused) */}
        {activeScheme ? (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-emerald-800 shrink-0">Ask about {activeScheme.scheme_name}:</span>
            <button
              type="button"
              onClick={() => handleSend(`What are the key benefits of ${activeScheme.scheme_name}?`)}
              className="shrink-0 text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              💡 Benefits
            </button>
            <button
              type="button"
              onClick={() => handleSend(`What is the eligibility criteria for ${activeScheme.scheme_name}?`)}
              className="shrink-0 text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              📋 Eligibility
            </button>
            <button
              type="button"
              onClick={() => handleSend(`What documents are required to apply for ${activeScheme.scheme_name}?`)}
              className="shrink-0 text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              📄 Documents
            </button>
            <button
              type="button"
              onClick={() => handleSend(`How do I apply online for ${activeScheme.scheme_name}?`)}
              className="shrink-0 text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              🔗 How to Apply
            </button>
          </div>
        ) : (
          /* General Category Prompt Chips */
          <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex gap-2 overflow-x-auto scrollbar-thin">
            {[
              '🌾 Agriculture Schemes',
              '🏥 Ayushman Bharat',
              '💰 Mudra Loan',
              '👩 Women Welfare',
              '🎓 Scholarships',
              '👴 Senior Pensions'
            ].map((chipText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(`Show schemes under ${chipText}`)}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-[#1e3a8a] hover:text-[#1e3a8a] hover:bg-blue-50 transition-all shadow-sm"
              >
                {chipText}
              </button>
            ))}
          </div>
        )}

        {/* Chat History Messages Stream */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex gap-2.5 max-w-[90%] sm:max-w-[82%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm ${
                    msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-[#1e3a8a] text-white'
                  }`}
                >
                  {msg.sender === 'user' ? '👤' : '🤖'}
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#1e3a8a] text-white rounded-tr-none shadow-sm font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}

                  {/* Context Scheme Cards */}
                  {msg.schemesMentioned && msg.schemesMentioned.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Focus Scheme Context:</p>
                      {msg.schemesMentioned.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => setActiveScheme(s)}
                          className="bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-xl p-2.5 border border-blue-200 text-xs transition-colors flex items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-bold text-[#1e3a8a]">{s.scheme_name}</p>
                            <p className="text-slate-600 text-[11px] line-clamp-1">{s.benefits}</p>
                          </div>
                          <span className="text-[10px] font-bold text-[#1e3a8a] bg-white px-2 py-1 rounded-md shrink-0 border border-blue-200">
                            Focus Scheme
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Animation */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Processing conversational query</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#1e3a8a] rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[#1e3a8a] rounded-full animate-bounce delay-150" />
                  <span className="w-2 h-2 bg-[#1e3a8a] rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs font-bold text-red-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span>Listening… Speak your question into your microphone.</span>
            </div>
            <button
              type="button"
              onClick={toggleMic}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg"
            >
              Stop
            </button>
          </div>
        )}

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeScheme
                ? `Ask follow-up about ${activeScheme.scheme_name} (e.g. Benefits, Eligibility, Documents)...`
                : 'Ask any scheme question or type follow-ups...'
            }
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-sm text-slate-800 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
          />

          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
              isRecording
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]'
            }`}
            title="Voice Input"
          >
            🎙️
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="py-3 px-6 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
