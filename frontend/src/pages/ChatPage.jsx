import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../api';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! 🙏 I am your AI Government Scheme Assistant. Ask me anything about Indian government schemes, eligibility criteria, benefits, or application procedures!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleVoiceRecording = () => {
    if (!voiceSupported) {
      alert("Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || loading) return;

    // Add user message to history
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend);
      const botMsg = { sender: 'assistant', text: response.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: 'Sorry, I encountered an error retrieving information. Please ensure the backend server is running and try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="chat-wrapper">
        <div className="chat-header">
          <div style={{ fontSize: '1.8rem' }}>🤖</div>
          <div className="chat-header-info">
            <h3>AI Scheme Assistant</h3>
            <p>Online • Powered by Government Knowledge Base</p>
          </div>
        </div>

        {isRecording && (
          <div className="voice-status">
            <span>🎙️ Listening to your voice... Speak now!</span>
          </div>
        )}

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-bubble ${msg.sender === 'user' ? 'message-user' : 'message-assistant'}`}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="message-bubble message-assistant">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Type your question about government schemes..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button
            type="button"
            className={`btn-mic ${isRecording ? 'recording' : ''}`}
            onClick={toggleVoiceRecording}
            title={isRecording ? "Stop Voice Input" : "Start Voice Input"}
          >
            {isRecording ? '🛑 Stop' : '🎙️ Mic'}
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading || !inputText.trim()}>
            Send 📤
          </button>
        </form>
      </div>
    </div>
  );
}
