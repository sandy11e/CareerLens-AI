import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, Loader2, Copy, Check, Mic, MicOff, Volume2, VolumeX, 
  Bot, Trash2, Plus, MessageSquare, PanelLeftClose, PanelLeft,
  Sparkles, ArrowUp, RefreshCw, ThumbsUp, ThumbsDown, User,
  FileText, Code, Award, Target, Download, Search,
  HelpCircle, ChevronRight, CornerDownLeft, Info, X, Zap, Terminal,
  GitBranch, Maximize2, Minimize2
} from 'lucide-react';
import { GithubIcon, LeetCodeIcon } from './Icons';
import api from '../api';

// Categorized Starter Prompts
const PROMPT_CATEGORIES = [
  {
    id: 'quick',
    label: '⚡ Quick Wins',
    prompts: [
      { title: 'Instant ATS Boost', text: 'Analyze my resume and give me the top 3 high-impact changes to increase my ATS score immediately.' },
      { title: 'Top Skill Gaps', text: 'Based on my target role and verified GitHub repos, what are my critical skill gaps and how do I bridge them?' },
      { title: '30-Day Action Plan', text: 'Create an aggressive 30-day technical career roadmap with weekly milestones for my profile.' },
    ]
  },
  {
    id: 'resume',
    label: '📄 Resume & ATS',
    prompts: [
      { title: 'Google XYZ Bullet Formula', text: 'Rewrite my main project bullet points using the Google XYZ formula: Accomplished [X], measured by [Y], by doing [Z].' },
      { title: 'Quantify My Impact', text: 'How can I add measurable business metrics (latency %, user scale, throughput) to my experience section?' },
      { title: 'Keyword Optimization', text: 'What high-value keywords and industry-standard technologies are missing from my resume skills list?' },
    ]
  },
  {
    id: 'github',
    label: '💻 GitHub & Code',
    prompts: [
      { title: 'Featured Repo Selection', text: 'Which of my public GitHub repositories should I pin as my flagship project, and what needs improvement in its README?' },
      { title: 'Production Architecture', text: 'How can I refactor my existing repositories to demonstrate production-grade architecture (CI/CD, Docker, tests)?' },
      { title: 'Code Quality Review', text: 'What architectural patterns or automated testing strategies should I showcase to impress senior engineering leads?' },
    ]
  },
  {
    id: 'interview',
    label: '🎯 Interview Prep',
    prompts: [
      { title: 'Mock Technical Behavioral', text: 'Ask me 3 tough behavioral questions tailored to my background, then critique my responses.' },
      { title: 'System Design Question', text: 'Give me a system design problem suited for my target role and guide me through the architecture trade-offs.' },
      { title: 'LeetCode Pattern Strategy', text: 'Based on my LeetCode profile, what specific algorithmic patterns (DP, Graphs, Sliding Window) should I prioritize?' },
    ]
  },
  {
    id: 'career',
    label: '📈 Salary & Strategy',
    prompts: [
      { title: 'Target Salary Benchmark', text: 'Based on my tech stack and engineering readiness score, what salary band and tier of companies should I target?' },
      { title: 'LinkedIn Headline Hook', text: 'Write 3 compelling LinkedIn headlines and a punchy About summary based on my verified technical proof-of-work.' },
      { title: 'Seniority Level Assessment', text: 'Am I currently positioned as Junior, Mid-level, or Senior based on my 360° signals? What is needed to reach the next tier?' },
    ]
  }
];

// Smart follow-up suggestions dynamically shown below assistant replies
const DEFAULT_FOLLOWUPS = [
  'Show me a concrete code example',
  'Rewrite this for my resume',
  'What are common interview pitfalls for this?',
  'How do I test this in production?'
];

// Helper: Custom Markdown & Code Formatter
function MarkdownRenderer({ content }) {
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const handleCopyCode = (codeText, id) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Render inline formatting (bold, italic, inline code)
  const renderInline = (text) => {
    if (!text) return null;

    // Split by inline code `code`
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={pIdx} className="chat-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Format bold **text** and italic *text*
      const boldParts = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
          return <strong key={bIdx} style={{ color: 'var(--text-main)', fontWeight: 700 }}>{bPart.slice(2, -2)}</strong>;
        }
        if (bPart.startsWith('*') && bPart.endsWith('*') && bPart.length > 2) {
          return <em key={bIdx} style={{ color: 'var(--text-secondary)' }}>{bPart.slice(1, -1)}</em>;
        }
        return bPart;
      });
    });
  };

  // Process multi-line markdown blocks
  const blocks = useMemo(() => {
    const rawLines = content.split('\n');
    const parsed = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines = [];
    let inTable = false;
    let tableRows = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim() || 'code';
          codeLines = [];
        } else {
          inCodeBlock = false;
          parsed.push({
            type: 'code',
            language: codeLanguage,
            code: codeLines.join('\n')
          });
          codeLanguage = '';
          codeLines = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Markdown Table detection
      if (line.includes('|') && (line.trim().startsWith('|') || line.trim().endsWith('|'))) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        // ignore markdown separator rows like |---|---|
        if (!line.replace(/[\s|:-]/g, '').length) {
          continue;
        }
        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1 || (arr.length === 2 && idx === 0));
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        inTable = false;
        parsed.push({ type: 'table', rows: tableRows });
        tableRows = [];
      }

      // Headers
      if (line.startsWith('### ')) {
        parsed.push({ type: 'h3', text: line.slice(4) });
      } else if (line.startsWith('## ')) {
        parsed.push({ type: 'h2', text: line.slice(3) });
      } else if (line.startsWith('# ')) {
        parsed.push({ type: 'h1', text: line.slice(2) });
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        parsed.push({ type: 'blockquote', text: line.slice(2) });
      }
      // Unordered Lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        parsed.push({ type: 'bullet', text: line.trim().slice(2) });
      }
      // Numbered Lists
      else if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s(.*)$/);
        parsed.push({ type: 'number', num: match[1], text: match[2] });
      }
      // Regular Paragraphs
      else if (line.trim().length > 0) {
        parsed.push({ type: 'paragraph', text: line });
      } else {
        parsed.push({ type: 'spacer' });
      }
    }

    if (inCodeBlock && codeLines.length > 0) {
      parsed.push({ type: 'code', language: codeLanguage, code: codeLines.join('\n') });
    }
    if (inTable && tableRows.length > 0) {
      parsed.push({ type: 'table', rows: tableRows });
    }

    return parsed;
  }, [content]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {blocks.map((b, idx) => {
        if (b.type === 'h1') {
          return (
            <h1 key={idx} style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '12px 0 6px' }}>
              {renderInline(b.text)}
            </h1>
          );
        }
        if (b.type === 'h2') {
          return (
            <h2 key={idx} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '10px 0 4px' }}>
              {renderInline(b.text)}
            </h2>
          );
        }
        if (b.type === 'h3') {
          return (
            <h3 key={idx} style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)', margin: '8px 0 2px' }}>
              {renderInline(b.text)}
            </h3>
          );
        }
        if (b.type === 'code') {
          const codeId = `code-${idx}`;
          return (
            <div key={idx} className="chat-code-block">
              <div className="chat-code-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Terminal size={12} color="var(--primary)" />
                  {b.language || 'CODE'}
                </span>
                <button
                  onClick={() => handleCopyCode(b.code, codeId)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: copiedCodeId === codeId ? 'var(--emerald)' : '#a8987e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    transition: 'all 0.15s ease'
                  }}
                  title="Copy code"
                >
                  {copiedCodeId === codeId ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCodeId === codeId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="chat-code-content">
                <code>{b.code}</code>
              </pre>
            </div>
          );
        }
        if (b.type === 'table') {
          return (
            <div key={idx} style={{ overflowX: 'auto', margin: '8px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    {b.rows[0]?.map((col, cIdx) => (
                      <th key={cIdx} style={{
                        background: 'var(--bg-muted)',
                        padding: '8px 12px',
                        fontWeight: 700,
                        textAlign: 'left',
                        borderBottom: '2px solid var(--border-medium)',
                        color: 'var(--text-main)'
                      }}>
                        {renderInline(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.type === 'blockquote') {
          return (
            <div key={idx} className="chat-blockquote">
              {renderInline(b.text)}
            </div>
          );
        }
        if (b.type === 'bullet') {
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '4px 0' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem', lineHeight: '1.6' }}>•</span>
              <div style={{ flex: 1, color: 'var(--text-main)', lineHeight: 1.7 }}>
                {renderInline(b.text)}
              </div>
            </div>
          );
        }
        if (b.type === 'number') {
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '5px 0' }}>
              <span style={{
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.74rem',
                minWidth: 22,
                height: 22,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
                border: '1px solid rgba(249,115,22,0.2)'
              }}>
                {b.num}
              </span>
              <div style={{ flex: 1, color: 'var(--text-main)', lineHeight: 1.7 }}>
                {renderInline(b.text)}
              </div>
            </div>
          );
        }
        if (b.type === 'paragraph') {
          return (
            <p key={idx} style={{ margin: '6px 0', color: 'var(--text-main)', lineHeight: 1.7 }}>
              {renderInline(b.text)}
            </p>
          );
        }
        return <div key={idx} style={{ height: 6 }} />;
      })}
    </div>
  );
}

export default function CopilotChat({ evaluationId, initialContext }) {
  const [conversations, setConversations] = useState([
    { id: 'convo-default', title: 'Career Strategy Session', messages: [], createdAt: new Date() }
  ]);
  const [activeConvoId, setActiveConvoId] = useState('convo-default');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingIdx, setIsSpeakingIdx] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 900 : true);
  const [activeCategory, setActiveCategory] = useState('quick');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContextModal, setShowContextModal] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [focusScope, setFocusScope] = useState('360'); // '360' | 'resume' | 'github' | 'interview'
  const [isFullScreen, setIsFullScreen] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  // Extract Profile Context Summary
  const candidateName = initialContext?.candidate_info?.name || 'Developer';
  const targetRole = initialContext?.target_role || initialContext?.job_matches?.[0]?.title || 'Software Engineer';
  const atsScore = initialContext?.scores?.ats_compatibility || 85;
  const engineeringScore = initialContext?.github_signals?.engineering_score || 'A';
  const publicRepos = initialContext?.github_signals?.public_repos || 0;
  const leetcodeSolved = initialContext?.leetcode_signals?.total_solved || 0;

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

  // Load chat history from backend MongoDB
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
            const idx = updated.findIndex(c => c.id === 'convo-default');
            if (idx >= 0) {
              updated[idx].messages = loaded;
              const firstUser = loaded.find(m => m.role === 'user');
              if (firstUser) updated[idx].title = firstUser.content.slice(0, 35) + '...';
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // Create New Chat
  const handleNewChat = async () => {
    try {
      await api.clearChatHistory(evaluationId || 'latest');
    } catch (err) {
      console.warn('Could not clear chat on server:', err);
    }
    const newId = 'chat-' + Date.now();
    setConversations(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(c => c.id === activeConvoId);
      if (idx >= 0) updated[idx].messages = messages;
      return [{ id: newId, title: 'New Conversation', messages: [], createdAt: new Date() }, ...updated];
    });
    setActiveConvoId(newId);
    setMessages([]);
  };

  const switchConversation = (convoId) => {
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
    if (conversations.length <= 1) {
      setMessages([]);
      return;
    }
    const filtered = conversations.filter(c => c.id !== convoId);
    setConversations(filtered);
    if (activeConvoId === convoId) {
      setActiveConvoId(filtered[0].id);
      setMessages(filtered[0].messages || []);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try { recognitionRef.current.start(); } catch (e) { /* already active */ }
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
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`|]/g, ''));
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeakingIdx(null);
    utterance.onerror = () => setIsSpeakingIdx(null);
    setIsSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend) => {
    const rawQuery = (textToSend || input).trim();
    if (!rawQuery || isSending) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Attach scope hint if not 360 default
    let scopePrefix = '';
    if (focusScope === 'resume') scopePrefix = '[Focus strictly on Resume & ATS metrics]: ';
    else if (focusScope === 'github') scopePrefix = '[Focus strictly on GitHub repos and code architecture]: ';
    else if (focusScope === 'interview') scopePrefix = '[Focus strictly on Technical Interview Simulation]: ';

    const query = scopePrefix + rawQuery;

    const userMessage = {
      role: 'user',
      content: rawQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    // Update conversation title if first user message
    if (!messages.find(m => m.role === 'user')) {
      setConversations(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => c.id === activeConvoId);
        if (idx >= 0) updated[idx].title = rawQuery.slice(0, 36) + (rawQuery.length > 36 ? '...' : '');
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

  const handleRegenerate = async () => {
    if (messages.length === 0 || isSending) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleFeedback = (idx, type) => {
    setLikedMap(prev => ({
      ...prev,
      [idx]: prev[idx] === type ? null : type
    }));
  };

  const handleExportChat = (format = 'markdown') => {
    let output = `# Devlyzer AI Copilot — Chat Transcript\n`;
    output += `Date: ${new Date().toLocaleString()}\n`;
    output += `Target Role: ${targetRole} | ATS Score: ${atsScore}/100\n\n---\n\n`;

    messages.forEach(m => {
      const sender = m.role === 'assistant' ? 'Devlyzer AI Copilot' : 'Candidate';
      output += `### ${sender} (${m.timestamp || ''})\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `devlyzer-chat-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmptyChat = messages.length === 0;

  return (
    <div className={`chat-layout ${isFullScreen ? 'fullscreen-overlay' : ''}`}>
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className={`chat-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        {/* Header / New Chat */}
        <div className="chat-sidebar-header">
          <button
            onClick={handleNewChat}
            className="btn-primary"
            style={{ flex: 1, padding: '9px 14px', fontSize: '0.84rem', justifyContent: 'center', gap: 6 }}
          >
            <Plus size={15} />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-ghost"
            style={{ padding: 7, flexShrink: 0 }}
            title="Collapse sidebar"
          >
            <PanelLeftClose size={17} />
          </button>
        </div>

        {/* Search Bar in Sidebar */}
        <div style={{ padding: '8px 12px 4px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 10px',
          }}>
            <Search size={13} color="var(--text-dim)" style={{ marginRight: 6 }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.78rem',
                color: 'var(--text-main)',
                width: '100%',
                padding: '2px 0'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="chat-history-list">
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '6px 10px 2px'
          }}>
            History ({filteredConversations.length})
          </div>

          {filteredConversations.map((convo) => (
            <div
              key={convo.id}
              className={`chat-history-item ${activeConvoId === convo.id ? 'active' : ''}`}
              onClick={() => switchConversation(convo.id)}
            >
              <MessageSquare size={14} style={{ flexShrink: 0, opacity: activeConvoId === convo.id ? 1 : 0.6 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {convo.title}
              </span>
              <button
                onClick={(e) => deleteConversation(e, convo.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  opacity: 0.4,
                  transition: 'opacity 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
                title="Delete chat"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Context Pill */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <button
            onClick={() => setShowContextModal(true)}
            className="btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '6px 10px',
              fontSize: '0.74rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              border: '1px solid rgba(249,115,22,0.2)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <Sparkles size={13} />
              <span>360° Context Loaded</span>
            </span>
            <ChevronRight size={13} />
          </button>
          
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="glow-dot" style={{ width: 5, height: 5, background: 'var(--emerald)' }} />
              MongoDB Synced
            </span>
            <button
              onClick={() => handleExportChat('markdown')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.68rem',
                display: 'flex',
                alignItems: 'center',
                gap: 3
              }}
              title="Export conversation"
            >
              <Download size={11} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop for Sidebar */}
      {sidebarOpen && (
        <div
          className="mobile-nav-backdrop show-on-mobile"
          style={{ zIndex: 15 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== MAIN CHAT ARENA ==================== */}
      <main className="chat-main">
        {/* Top Header Bar */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn-ghost"
                style={{ padding: 7, flexShrink: 0 }}
                title="Open conversations"
              >
                <PanelLeft size={18} />
              </button>
            )}

            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px var(--primary-glow)',
              flexShrink: 0
            }}>
              <Sparkles size={18} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  Devlyzer AI Copilot
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.66rem', padding: '2px 7px' }}>
                  v2.0 Active
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Evaluating: <strong style={{ color: 'var(--text-main)' }}>{candidateName}</strong></span>
                <span>•</span>
                <span>Target: <strong style={{ color: 'var(--primary)' }}>{targetRole}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Context Metric Badges in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div
              onClick={() => setShowContextModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Click to view full context snapshot"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                <FileText size={12} color="var(--primary)" />
                <span>{atsScore}% ATS</span>
              </div>
              <span style={{ opacity: 0.3 }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                <GithubIcon size={12} color="var(--emerald)" />
                <span>{publicRepos} repos</span>
              </div>
              <span style={{ opacity: 0.3 }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                <LeetCodeIcon size={12} color="var(--amber)" />
                <span>{leetcodeSolved} DSA</span>
              </div>
            </div>

            <button
              onClick={() => handleExportChat('markdown')}
              className="btn-ghost"
              style={{ padding: 7 }}
              title="Export transcript"
            >
              <Download size={16} />
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="btn-ghost"
              style={{ padding: 7, color: isFullScreen ? 'var(--primary)' : undefined }}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* ==================== MESSAGES LIST ==================== */}
        <div className="chat-messages-area">
          {/* Empty State Welcome Hub */}
          {isEmptyChat && !isSending && (
            <div className="animate-fade-in-up" style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 'clamp(20px, 4vw, 40px) 16px',
              gap: 24,
              maxWidth: 820,
              margin: '0 auto',
              width: '100%'
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 12px 36px var(--primary-glow)',
                animation: 'float 4s ease-in-out infinite'
              }}>
                <Sparkles size={32} />
              </div>

              <div>
                <h2 className="font-display" style={{
                  fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginBottom: 8,
                  letterSpacing: '-0.02em'
                }}>
                  What career milestone are we conquering, {candidateName.split(' ')[0]}?
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 580, lineHeight: 1.6, margin: '0 auto' }}>
                  I have synchronized your full 360° technical evaluation — resume ATS metrics, verified GitHub code signals, and LeetCode benchmarks. Select a category below or ask anything.
                </p>
              </div>

              {/* Profile Snapshot Bar */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                  <Award size={15} color="var(--primary)" />
                  <span style={{ color: 'var(--text-dim)' }}>ATS Score:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{atsScore}/100</strong>
                </div>
                <span style={{ opacity: 0.2 }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                  <GithubIcon size={15} color="var(--emerald)" />
                  <span style={{ color: 'var(--text-dim)' }}>GitHub Grade:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{engineeringScore} ({publicRepos} repos)</strong>
                </div>
                <span style={{ opacity: 0.2 }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                  <Target size={15} color="var(--rose)" />
                  <span style={{ color: 'var(--text-dim)' }}>Target:</span>
                  <strong style={{ color: 'var(--primary)' }}>{targetRole}</strong>
                </div>
              </div>

              {/* Prompt Category Tabs */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}>
                  {PROMPT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: activeCategory === cat.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: activeCategory === cat.id ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                        color: activeCategory === cat.id ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Prompt Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 12,
                  textAlign: 'left'
                }}>
                  {PROMPT_CATEGORIES.find(c => c.id === activeCategory)?.prompts.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSend(p.text)}
                      className="animate-fade-in-up"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 18px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 8,
                        boxShadow: 'var(--shadow-xs)',
                        animationDelay: `${idx * 0.06}s`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px var(--primary-glow)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{p.title}</span>
                        <Zap size={13} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {p.text}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <span>Ask this</span>
                        <ArrowUp size={11} style={{ transform: 'rotate(45deg)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rendered Message Stream */}
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant';
            const isLastBot = isBot && idx === messages.length - 1;

            return (
              <div
                key={idx}
                className={`chat-message-row ${isBot ? 'bot-row' : 'user-row'}`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Avatar */}
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: isBot ? 'var(--gradient-accent)' : 'var(--bg-muted)',
                  border: isBot ? 'none' : '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isBot ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isBot ? '0 4px 12px var(--primary-glow)' : 'none',
                  marginTop: 2
                }}>
                  {isBot ? <Sparkles size={16} /> : <User size={16} />}
                </div>

                {/* Content Bubble Container */}
                {isBot ? (
                  <div className="chat-bot-container">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 5,
                      paddingLeft: 4
                    }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Devlyzer AI Advisor
                      </span>
                      {msg.timestamp && (
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                          • {msg.timestamp}
                        </span>
                      )}
                    </div>

                    {/* Bot Bubble */}
                    <div className="chat-bubble-bot">
                      <MarkdownRenderer content={msg.content} />
                    </div>

                    {/* Actions Toolbar for Bot Responses */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 6,
                      padding: '0 4px',
                      width: '100%'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => handleCopyMessage(msg.content, idx)}
                          className="btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', gap: 4 }}
                          title="Copy response"
                        >
                          {copiedMsgIdx === idx ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                          <span>{copiedMsgIdx === idx ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() => toggleSpeak(msg.content, idx)}
                          className="btn-ghost"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            gap: 4,
                            color: isSpeakingIdx === idx ? 'var(--rose)' : undefined
                          }}
                          title={isSpeakingIdx === idx ? 'Stop Voice' : 'Read Aloud'}
                        >
                          {isSpeakingIdx === idx ? (
                            <>
                              <VolumeX size={13} />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {isLastBot && (
                          <button
                            onClick={handleRegenerate}
                            className="btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', gap: 4 }}
                            title="Regenerate answer"
                          >
                            <RefreshCw size={13} />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>

                      {/* Feedback rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <button
                          onClick={() => handleFeedback(idx, 'up')}
                          className="btn-ghost"
                          style={{
                            padding: 4,
                            color: likedMap[idx] === 'up' ? 'var(--emerald)' : 'var(--text-dim)'
                          }}
                          title="Helpful"
                        >
                          <ThumbsUp size={13} />
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, 'down')}
                          className="btn-ghost"
                          style={{
                            padding: 4,
                            color: likedMap[idx] === 'down' ? 'var(--rose)' : 'var(--text-dim)'
                          }}
                          title="Not helpful"
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Contextual Smart Follow-up Suggestions on Latest Message */}
                    {isLastBot && !isSending && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginTop: 14,
                        padding: '0 4px',
                        width: '100%'
                      }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Sparkles size={11} color="var(--primary)" />
                          Suggestions:
                        </span>
                        {DEFAULT_FOLLOWUPS.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSend(chip)}
                            className="chat-suggestion-chip"
                          >
                            <span>{chip}</span>
                            <ArrowUp size={10} style={{ transform: 'rotate(45deg)', opacity: 0.6 }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="chat-user-container">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 5,
                      paddingRight: 4
                    }}>
                      {msg.timestamp && (
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                          {msg.timestamp} •
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-dim)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        You
                      </span>
                    </div>

                    {/* User Bubble */}
                    <div className="chat-bubble-user">
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Multi-step Animated Thinking Indicator */}
          {isSending && (
            <div className="chat-message-row bot-row animate-fade-in" style={{ animationDelay: '0s' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px var(--primary-glow)',
                flexShrink: 0
              }}>
                <Sparkles size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Devlyzer AI Advisor
                </div>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px 18px 18px 18px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        opacity: 0.5,
                        animation: `bounce-subtle 1.2s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Synthesizing 360° metrics & engineering intelligence...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ==================== COMPOSER INPUT DOCK ==================== */}
        <div className="chat-input-area">
          {/* Scope Focus Selector Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            padding: '0 4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                Scope:
              </span>
              {[
                { id: '360', label: '🌐 360° Profile' },
                { id: 'resume', label: '📄 Resume Only' },
                { id: 'github', label: '💻 GitHub & Code' },
                { id: 'interview', label: '🎯 Interview Mode' },
              ].map(scope => (
                <button
                  key={scope.id}
                  onClick={() => setFocusScope(scope.id)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 12,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: focusScope === scope.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: focusScope === scope.id ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                    color: focusScope === scope.id ? 'var(--primary)' : 'var(--text-secondary)'
                  }}
                >
                  {scope.label}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }} className="hide-on-mobile">
              Press <kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--bg-muted)', fontSize: '0.68rem', border: '1px solid var(--border-medium)' }}>Enter ↵</kbd> to send
            </span>
          </div>

          {/* Composer Input Box */}
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input-box"
              placeholder={isListening ? '🎙️ Listening to your voice query...' : `Ask anything about your resume, GitHub projects, or ${targetRole} prep...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={1}
              style={{ paddingRight: voiceSupported ? 100 : 54 }}
            />

            {/* Dock Actions: Clear, Mic, Send */}
            <div style={{
              position: 'absolute',
              right: 10,
              bottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              {/* Voice recognition active sound wave */}
              {isListening && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingRight: 4 }}>
                  <div className="soundwave-bar" style={{ animationDelay: '0s' }} />
                  <div className="soundwave-bar" style={{ animationDelay: '0.2s' }} />
                  <div className="soundwave-bar" style={{ animationDelay: '0.4s' }} />
                </div>
              )}

              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Clear input"
                >
                  <X size={15} />
                </button>
              )}

              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: 'none',
                    background: isListening ? 'var(--rose-subtle)' : 'var(--bg-subtle)',
                    color: isListening ? 'var(--rose)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isListening ? '0 0 12px var(--rose)' : 'none'
                  }}
                  title={isListening ? 'Stop recording' : 'Voice input'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isSending}
                className="chat-send-btn"
                style={{
                  background: input.trim() ? 'var(--gradient-accent)' : 'var(--border-medium)',
                }}
                title="Send query"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={17} />}
              </button>
            </div>
          </div>

          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-dim)',
            marginTop: 8,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            <Sparkles size={11} color="var(--primary)" />
            <span>Context-aware AI strictly scoped to your verified technical portfolio & career trajectory.</span>
          </div>
        </div>
      </main>

      {/* ==================== CONTEXT SNAPSHOT MODAL ==================== */}
      {showContextModal && (
        <div className="modal-backdrop" onClick={() => setShowContextModal(false)}>
          <div
            className="modal-box animate-scale-in"
            style={{ maxWidth: 600, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--gradient-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Active 360° Knowledge Context
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                    The grounded data feeding the AI Copilot reasoning engine
                  </p>
                </div>
              </div>
              <button onClick={() => setShowContextModal(false)} className="btn-ghost" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Candidate
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                  {candidateName}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {initialContext?.headline || 'Software Engineer'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Target Role
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                  {targetRole}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  ATS Match: {atsScore}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  GitHub Signals
                </div>
                <div style={{ fontWeight: 800, color: 'var(--emerald)', marginTop: 4 }}>
                  Grade {engineeringScore}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {publicRepos} public repositories verified
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  LeetCode Benchmarks
                </div>
                <div style={{ fontWeight: 800, color: 'var(--amber)', marginTop: 4 }}>
                  {leetcodeSolved} Problems Solved
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Easy: {initialContext?.leetcode_signals?.easy || 0} | Med: {initialContext?.leetcode_signals?.medium || 0} | Hard: {initialContext?.leetcode_signals?.hard || 0}
                </div>
              </div>
            </div>

            {/* Extracted Skills List */}
            {initialContext?.all_skills && initialContext.all_skills.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Extracted Tech Stack ({initialContext.all_skills.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 100, overflowY: 'auto' }}>
                  {initialContext.all_skills.map((skill, sIdx) => (
                    <span key={sIdx} className="badge badge-subtle" style={{ fontSize: '0.72rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowContextModal(false)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Close Context Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
