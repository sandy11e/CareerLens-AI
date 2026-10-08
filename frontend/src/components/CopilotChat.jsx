import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Loader2, Copy, Check, Mic, MicOff, Volume2, VolumeX, 
  Bot, Trash2, Plus, MessageSquare, PanelLeftClose, PanelLeft,
  Sparkles, ArrowUp, MoreHorizontal, ThumbsUp, ThumbsDown, User
} from 'lucide-react';
import api from '../api';

const QUICK_PROMPTS = [
  { icon: '📊', text: 'How can I improve my ATS score?' },
  { icon: '💻', text: 'What projects should I build to verify my skills?' },
  { icon: '🎯', text: 'Give me 3 tough interview questions for my target role.' },
  { icon: '📝', text: 'How should I describe my projects to impress recruiters?' },
];

export default function CopilotChat({ evaluationId, initialContext }) {
  const [conversations, setConversations] = useState([
    { id: 'current', title: 'New Conversation', messages: [], createdAt: new Date() }
  ]);
  const [activeConvoId, setActiveConvoId] = useState('current');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingIdx, setIsSpeakingIdx] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 768 : true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }

    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Load chat history from MongoDB
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getChatHistory(evaluationId || 'latest');
        if (res?.history && res.history.length > 0) {
          const loaded = res.history.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          }));
          setMessages(loaded);
          setConversations(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(c => c.id === 'current');
            if (idx >= 0) {
              updated[idx].messages = loaded;
              updated[idx].title = loaded.find(m => m.role === 'user')?.content?.slice(0, 40) || 'Conversation';
            }
            return updated;
          });
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
      }
    }
    loadHistory();
  }, [evaluationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isSending]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleNewChat = async () => {
    try {
      await api.clearChatHistory(evaluationId || 'latest');
    } catch (err) {
      console.warn('Could not clear chat on server:', err);
    }
    const newId = 'chat-' + Date.now();
    // Save current messages to its conversation
    setConversations(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(c => c.id === activeConvoId);
      if (idx >= 0) updated[idx].messages = messages;
      return [...updated, { id: newId, title: 'New Conversation', messages: [], createdAt: new Date() }];
    });
    setActiveConvoId(newId);
    setMessages([]);
  };

  const switchConversation = (convoId) => {
    // Save current
    setConversations(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(c => c.id === activeConvoId);
      if (idx >= 0) updated[idx].messages = messages;
      return updated;
    });
    const convo = conversations.find(c => c.id === convoId);
    setMessages(convo?.messages || []);
    setActiveConvoId(convoId);
  };

  const deleteConversation = (e, convoId) => {
    e.stopPropagation();
    if (conversations.length <= 1) return;
    setConversations(prev => prev.filter(c => c.id !== convoId));
    if (activeConvoId === convoId) {
      const remaining = conversations.filter(c => c.id !== convoId);
      setActiveConvoId(remaining[0]?.id || 'current');
      setMessages(remaining[0]?.messages || []);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try { recognitionRef.current.start(); } catch (e) { /* already started */ }
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
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ''));
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeakingIdx(null);
    utterance.onerror = () => setIsSpeakingIdx(null);
    setIsSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isSending) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    // Update conversation title from first user message
    if (!messages.find(m => m.role === 'user')) {
      setConversations(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => c.id === activeConvoId);
        if (idx >= 0) updated[idx].title = query.slice(0, 50) + (query.length > 50 ? '...' : '');
        return updated;
      });
    }

    try {
      const historyPayload = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await api.askCopilot(query, evaluationId || 'latest', historyPayload);
      const botMessage = {
        role: 'assistant',
        content: res.reply || "I analyzed your query based on your profile context.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.response?.data?.detail || err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const candidateName = initialContext?.candidate_info?.name || 'your profile';
  const isEmptyChat = messages.length === 0;

  return (
    <div className="chat-layout" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      {/* ========== SIDEBAR ========== */}
      <div className={`chat-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        {/* Sidebar Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={handleNewChat}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '8px 14px', fontSize: '0.82rem', gap: 6 }}
          >
            <Plus size={15} />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-ghost"
            style={{ padding: 6, marginLeft: 6, flexShrink: 0 }}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 10px 4px', marginBottom: 4 }}>
            Conversations
          </div>
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`chat-history-item ${activeConvoId === convo.id ? 'active' : ''}`}
              onClick={() => switchConversation(convo.id)}
            >
              <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {convo.title}
              </span>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => deleteConversation(e, convo.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                    opacity: 0.5,
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <div className="glow-dot" style={{ background: 'var(--emerald)', width: 6, height: 6 }} />
          <span>Career scope only</span>
        </div>
      </div>

      {/* Mobile backdrop for chat sidebar */}
      {sidebarOpen && (
        <div
          className="mobile-nav-backdrop show-on-mobile"
          style={{ zIndex: 35 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== MAIN CHAT AREA ========== */}
      <div className="chat-main">
        {/* Chat Header Bar */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-ghost"
              style={{ padding: 6, minHeight: 36, minWidth: 36, alignItems: 'center', justifyContent: 'center' }}
              title={sidebarOpen ? "Hide conversations" : "Show conversations"}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--gradient-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Sparkles size={15} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Career Advisor
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                Context-aware AI • Profile & career scope
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isListening && (
              <span className="badge badge-rose" style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}>
                🎙️ Listening...
              </span>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages-area">
          {/* Empty State – Welcome Screen */}
          {isEmptyChat && !isSending && (
            <div className="animate-fade-in-up" style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 'clamp(20px, 5vw, 40px) 16px',
              gap: 20,
            }}>
              <div style={{
                width: 58, height: 58, borderRadius: 16,
                background: 'var(--gradient-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 32px var(--primary-glow)',
                animation: 'float 4s ease-in-out infinite'
              }}>
                <Sparkles size={28} />
              </div>

              <div>
                <h2 className="font-display" style={{
                  fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginBottom: 8
                }}>
                  How can I help with {candidateName}?
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.55 }}>
                  I have your complete 360° profile loaded — resume audit, GitHub repositories, LeetCode stats, and job matches. Ask me anything about your career.
                </p>
              </div>

              {/* Quick Prompt Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 10,
                maxWidth: 560,
                width: '100%',
              }}>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="animate-fade-in-up"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      animationDelay: `${0.1 + i * 0.08}s`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', marginRight: 6 }}>{prompt.icon}</span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Messages */}
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant';
            return (
              <div key={idx} className="chat-message-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: isBot ? 'var(--gradient-accent)' : 'var(--bg-subtle)',
                  border: isBot ? 'none' : '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isBot ? 'white' : 'var(--text-muted)',
                  marginTop: 2
                }}>
                  {isBot ? <Sparkles size={15} /> : <User size={15} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--text-dim)',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}>
                    {isBot ? 'Career Advisor' : 'You'}
                  </div>

                  <div style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>

                  {/* Message Actions */}
                  {isBot && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 10,
                    }}>
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="btn-ghost"
                        style={{ padding: '3px 7px', fontSize: '0.72rem', gap: 4 }}
                        title="Copy response"
                      >
                        {copiedIdx === idx ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                        <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => toggleSpeak(msg.content, idx)}
                        className="btn-ghost"
                        style={{ padding: '3px 7px', fontSize: '0.72rem', gap: 4, color: isSpeakingIdx === idx ? 'var(--rose)' : undefined }}
                        title={isSpeakingIdx === idx ? 'Stop' : 'Listen'}
                      >
                        {isSpeakingIdx === idx ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isSending && (
            <div className="chat-message-row animate-fade-in" style={{ animationDelay: '0s' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--gradient-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white'
              }}>
                <Sparkles size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Career Advisor
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--primary)',
                        opacity: 0.4,
                        animation: `bounce-subtle 1.2s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========== INPUT AREA ========== */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input-box"
              placeholder={isListening ? '🎙️ Listening to speech...' : 'Ask about your career, resume, interviews...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={1}
              style={{ paddingRight: voiceSupported ? 96 : 52 }}
            />

            {/* Input action buttons */}
            <div style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: 'none',
                    background: isListening ? 'var(--rose-subtle)' : 'transparent',
                    color: isListening ? 'var(--rose)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title={isListening ? 'Stop' : 'Voice input'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isSending}
                className="chat-send-btn"
                style={{
                  background: input.trim() ? 'var(--text-main)' : 'var(--border-medium)',
                }}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
            CareerLens Advisor is scoped to your profile data. Career & technical questions only.
          </div>
        </div>
      </div>
    </div>
  );
}
