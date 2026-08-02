import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../api';

const ACCENT = '#1e3a8a';

const SUGGESTED = [
  '🌾 What schemes are available for farmers?',
  '🏥 Am I eligible for Ayushman Bharat?',
  '💰 How to apply for PM Mudra Loan?',
  '👩 What are welfare schemes for women?',
  '🎓 Scholarships for higher education?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! 🙏 I am your AI Government Scheme Assistant. Ask me anything about central or state government schemes — eligibility, benefits, documents, or how to apply.',
    },
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [isRecording, setIsRec]   = useState(false);
  const endRef                    = useRef(null);
  const recognitionRef            = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-IN';
      rec.onresult = (e) => {
        const t = Array.from(e.results).map((r) => r[0].transcript).join('');
        setInput(t);
      };
      rec.onend = () => setIsRec(false);
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessage(text);
      setMessages((m) => [...m, { sender: 'assistant', text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { sender: 'assistant', text: 'Sorry, I could not reach the AI service. Please ensure the backend server is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRec(false);
    } else {
      try { recognitionRef.current.start(); setIsRec(true); } catch {}
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          🤖 AI Scheme Assistant
        </h1>
        <p className="text-slate-500 text-sm">Ask any question about government schemes in plain language.</p>
      </div>

      {/* Chat container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden" style={{ height: 580 }}>
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: ACCENT }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
            <div>
              <p className="text-white font-semibold text-sm">AI Scheme Assistant</p>
              <p className="text-blue-200 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
                Active · Powered by Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Suggested prompts */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto scrollbar-thin">
          {SUGGESTED.map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🤖</div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#1e3a8a] text-white rounded-br-sm'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                }`}
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center text-sm mr-2 shrink-0">🤖</div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Voice recording indicator */}
        {isRecording && (
          <div className="px-5 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2 text-red-600 text-xs font-semibold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening… Speak now and tap Stop when done.
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="px-4 py-3 border-t border-slate-100 bg-white flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak your question about government schemes…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all"
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              isRecording
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
            title="Voice Input"
          >
            {isRecording ? '🛑' : '🎙️'}
          </button>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: ACCENT }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
