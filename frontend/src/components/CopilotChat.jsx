import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader2, Copy, Check, Mic, MicOff, Volume2, VolumeX, MessageSquare, Bot } from 'lucide-react';
import api from '../api';

const QUICK_PROMPTS = [
  "How can I quickly improve my ATS score?",
  "What projects should I build to verify my unverified skills?",
  "Give me 3 tough interview questions for my target role.",
  "How should I describe my projects to impress recruiters?"
];

export default function CopilotChat({ evaluationId, initialContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am CareerLens Copilot, your specialized technical career advisor & ATS mentor. I have your complete profile loaded — your resume audit, verified GitHub repositories, LeetCode performance, and job matches.\n\n📌 Domain Scope: I am exclusively programmed to assist with CareerLens AI evaluations (resume optimization, code verification, technical interview prep, and engineering roadmaps). I do not answer unrelated questions outside your career and profile.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingIdx, setIsSpeakingIdx] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  const toggleSpeak = (text, idx) => {
    if (!window.speechSynthesis) return;

    if (isSpeakingIdx === idx) {
      window.speechSynthesis.cancel();
      setIsSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeakingIdx(null);
    utterance.onerror = () => setIsSpeakingIdx(null);

    setIsSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isSending) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.askCopilot(query, evaluationId || 'latest', historyPayload);

      const botMessage = {
        role: 'assistant',
        content: res.reply || "I analyzed your query based on your profile context.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        role: 'assistant',
        content: `Error communicating with advisor: ${err.response?.data?.detail || err.message}\n\nPlease check your \`GROQ_API_KEY\` in \`backend/.env\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="card-solid" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 175px)',
      minHeight: 460,
      maxHeight: 880,
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        background: 'var(--bg-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              Career Advisor
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Context-Aware & Voice-Enabled • Strictly Profile & Career Scope
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isListening && (
            <span className="badge badge-rose">
              Listening...
            </span>
          )}
          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
            Career Focused
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: 'var(--bg-page)'
      }}>
        {messages.map((msg, idx) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 10,
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '92%'
              }}
            >
              <div style={{
                background: isBot ? '#ffffff' : 'var(--text-main)',
                border: isBot ? '1px solid var(--border-subtle)' : 'none',
                color: isBot ? 'var(--text-main)' : '#ffffff',
                padding: '12px 16px',
                borderRadius: 12,
                boxShadow: 'var(--shadow-xs)',
                fontSize: '0.86rem',
                lineHeight: 1.55,
                wordBreak: 'break-word',
                whiteSpace: 'pre-line'
              }}>
                <div>{msg.content}</div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: `1px solid ${isBot ? 'var(--border-subtle)' : 'rgba(255,255,255,0.1)'}`,
                  fontSize: '0.68rem',
                  color: isBot ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)'
                }}>
                  <span>{msg.timestamp}</span>

                  {isBot && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => toggleSpeak(msg.content, idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isSpeakingIdx === idx ? 'var(--rose)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={isSpeakingIdx === idx ? 'Stop Speaking' : 'Listen via Audio'}
                      >
                        {isSpeakingIdx === idx ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedIdx === idx ? 'var(--emerald)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Copy Response"
                      >
                        {copiedIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start', maxWidth: '80%' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              padding: '10px 14px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
              color: 'var(--text-muted)'
            }}>
              <Loader2 size={14} className="spin-animation" color="var(--primary)" />
              <span>Analyzing query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div style={{
        padding: '8px 16px',
        background: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {QUICK_PROMPTS.map((prompt, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(prompt)}
            disabled={isSending}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: 14,
              fontSize: '0.74rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop Listening' : 'Speak Message (Voice-to-Text)'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${isListening ? 'var(--rose-border)' : 'var(--border-subtle)'}`,
              background: isListening ? 'var(--rose-subtle)' : 'var(--bg-subtle)',
              color: isListening ? 'var(--rose)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            {isListening ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>
            ) : (
              <Mic size={17} />
            )}
          </button>
        )}

        <input
          type="text"
          placeholder={isListening ? 'Listening to speech...' : 'Type a question or ask for resume advice...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isSending}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: '0.88rem'
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isSending}
          className="btn-primary"
          style={{ padding: '8px 14px' }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
