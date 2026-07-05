import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../api';
import { getTranslations } from '../i18n';

function TypingIndicator() {
  return (
    <div className="msg-row msg-row--assistant" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="msg-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="msg-bubble msg-bubble--assistant">
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              animation: `typing 1.2s ${i * 0.2}s ease-in-out infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceChip({ source, t }) {
  return (
    <span className="source-chip">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" />
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
      </svg>
      {source.filename}{source.page > 0 ? ` ${t.page}${source.page}` : ''}
    </span>
  );
}

function AdmissionPredictCard({ data, t }) {
  const prob = data.probability || 0;
  const barColor = prob >= 70 ? '#22c55e' : prob >= 40 ? '#f59e0b' : '#ef4444';
  const barBg = prob >= 70 ? 'rgba(34,197,94,0.15)' : prob >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)';
  
  return (
    <div className="special-card predict-card">
      <div className="special-card__header">
        <span className="special-card__icon">🔮</span>
        <span className="special-card__title">{t.predictTitle}</span>
      </div>
      
      {data.found ? (
        <>
          <div className="predict-card__info">
            <div className="predict-card__row">
              <span className="predict-card__label">{t.predictMajor}</span>
              <span className="predict-card__value">{data.major_matched}</span>
            </div>
            <div className="predict-card__row">
              <span className="predict-card__label">{t.predictScore}</span>
              <span className="predict-card__value" style={{color: '#60a5fa', fontWeight: 700}}>{data.input?.score}</span>
            </div>
            <div className="predict-card__row">
              <span className="predict-card__label">{t.predictBenchmark}</span>
              <span className="predict-card__value" style={{fontWeight: 700}}>{data.benchmark_score}</span>
            </div>
            <div className="predict-card__row">
              <span className="predict-card__label">{t.predictDiff}</span>
              <span className="predict-card__value" style={{color: data.difference >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700}}>
                {data.difference >= 0 ? '+' : ''}{data.difference} {t.predictPoints}
              </span>
            </div>
          </div>
          
          <div className="predict-card__bar-section">
            <div className="predict-card__bar-header">
              <span>{t.predictProb}</span>
              <span style={{color: barColor, fontWeight: 700}}>{prob}% - {data.level}</span>
            </div>
            <div className="predict-card__bar-bg" style={{background: barBg}}>
              <div className="predict-card__bar-fill" style={{width: `${prob}%`, background: barColor}} />
            </div>
          </div>
          
          {data.alternatives && data.alternatives.length > 0 && (
            <div className="predict-card__alts">
              <div className="predict-card__alts-title">{t.predictAlts}</div>
              {data.alternatives.slice(0, 3).map((alt, i) => (
                <div key={i} className="predict-card__alt-item">
                  <span className="predict-card__alt-name">{alt.major}</span>
                  <span className="predict-card__alt-prob" style={{color: alt.probability >= 70 ? '#22c55e' : '#f59e0b'}}>
                    {alt.probability}% {t.predictPass}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{padding: '12px 0', color: 'var(--text-secondary)', fontSize: 13}}>
          {data.analysis || t.predictNoData}
        </div>
      )}
    </div>
  );
}

function CareerOrientCard({ data, t }) {
  const badgeColors = {
    '🥇 Rất phù hợp': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    '🥈 Phù hợp': { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
    '🥉 Có thể cân nhắc': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  };
  
  return (
    <div className="special-card orient-card">
      <div className="special-card__header">
        <span className="special-card__icon">🧭</span>
        <span className="special-card__title">{t.orientTitle}</span>
      </div>

      {data.recommendations && data.recommendations.length > 0 ? (
        <div className="orient-card__list">
          {data.recommendations.map((rec, i) => {
            const badgeStyle = badgeColors[rec.badge] || badgeColors['🥉 Có thể cân nhắc'];
            return (
              <div key={i} className="orient-card__item">
                <div className="orient-card__item-header">
                  <span className="orient-card__major">{rec.major}</span>
                  <span className="orient-card__badge" style={{background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`}}>
                    {rec.badge}
                  </span>
                </div>
                <div className="orient-card__desc">{rec.info?.mo_ta}</div>
                <div className="orient-card__meta">
                  <span>{t.orientTuition} {rec.info?.hoc_phi}</span>
                  <span>{t.orientDifficulty} {rec.info?.do_kho}</span>
                  <span>{t.orientJobs} {rec.info?.co_hoi_viec_lam}</span>
                </div>
                {rec.reasons && rec.reasons.length > 0 && (
                  <div className="orient-card__reasons">
                    {rec.reasons.map((r, j) => <span key={j} className="orient-card__reason">{r}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{padding: '12px 0', color: 'var(--text-secondary)', fontSize: 13}}>
          {t.orientNoMatch}
        </div>
      )}
    </div>
  );
}

function parseSpecialCards(content) {
  const predictMatch = content.match(/<!--PREDICT_RESULT:(.*?)-->/s);
  const orientMatch = content.match(/<!--ORIENT_RESULT:(.*?)-->/s);
  
  let predictData = null;
  let orientData = null;
  let textContent = content;
  
  if (predictMatch) {
    try { predictData = JSON.parse(predictMatch[1]); } catch {}
    textContent = textContent.replace(predictMatch[0], '').trim();
  }
  if (orientMatch) {
    try { orientData = JSON.parse(orientMatch[1]); } catch {}
    textContent = textContent.replace(orientMatch[0], '').trim();
  }
  
  return { predictData, orientData, textContent };
}

function Message({ msg, t }) {
  const isUser = msg.role === 'user';
  const { predictData, orientData, textContent } = isUser 
    ? { predictData: null, orientData: null, textContent: msg.content }
    : parseSpecialCards(msg.content);
  
  return (
    <div
      className={`msg-row ${isUser ? 'msg-row--user' : 'msg-row--assistant'}`}
      style={{ animation: isUser ? 'slideInRight 0.3s ease' : 'slideInLeft 0.3s ease' }}
    >
      {!isUser && (
        <div className="msg-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className={`msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--assistant'}`}>
        {predictData && <AdmissionPredictCard data={predictData} t={t} />}
        {orientData && <CareerOrientCard data={orientData} t={t} />}
        {textContent && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {textContent}
          </ReactMarkdown>
        )}
        {msg.sources && msg.sources.length > 0 && (
          <div className="msg-sources">
            <span className="msg-sources__label">{t.sourceLabel}</span>
            <div className="msg-sources__chips">
              {msg.sources.map((s, i) => <SourceChip key={i} source={s} t={t} />)}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="msg-avatar msg-avatar--user">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}

function SessionItem({ session, active, onSelect, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div
      className={`session-item ${active ? 'session-item--active' : ''}`}
      onClick={() => onSelect(session.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="session-item__title">{session.title}</span>
      {showDelete && (
        <button
          className="session-item__delete"
          onClick={e => { e.stopPropagation(); onDelete(session.id); }}
          title="Xóa phiên"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" />
            <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" />
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'vi');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const t = useMemo(() => getTranslations(lang), [lang]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = t.speechLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        setInput(transcript);
        if (event.results[0].isFinal) {
          setIsListening(false);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    loadSessions();
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(l => l === 'vi' ? 'en' : 'vi');

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch { /* silently ignore */ }
  };

  const loadMessages = async (sessionId) => {
    try {
      const data = await api.getMessages(sessionId);
      setMessages(data);
      setShowWelcome(data.length === 0);
    } catch { /* silently ignore */ }
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    await loadMessages(sessionId);
  };

  const handleNewChat = async () => {
    try {
      const session = await api.createSession();
      setCurrentSessionId(session.id);
      setMessages([]);
      setShowWelcome(true);
      setSessions(prev => [session, ...prev]);
    } catch {
      // If session creation fails, just reset state
      setCurrentSessionId(null);
      setMessages([]);
      setShowWelcome(true);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
        setShowWelcome(true);
      }
    } catch { /* silently ignore */ }
  };

  const handleSend = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setShowWelcome(false);

    const userMsg = { role: 'user', content: trimmed, sources: [], id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.sendMessage(trimmed, currentSessionId, lang);
      if (!currentSessionId && data.session_id) {
        setCurrentSessionId(data.session_id);
      }
      await loadSessions();
      const aiMsg = {
        role: 'assistant',
        content: data.message,
        sources: data.sources || [],
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${t.errorPrefix}${err.message}${t.errorSuffix}`,
        sources: [],
        id: Date.now() + 1,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon" style={{ background: 'transparent', border: 'none' }}>
              <img src="/logo-khtn.png" alt="HCMUS Logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
            </div>
            <div>
              <div className="sidebar__logo-title">{t.sidebarTitle}</div>
              <div className="sidebar__logo-subtitle">{t.sidebarSubtitle}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(false)} title={t.hideSidebar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M11 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M19 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <button
          className="btn btn-primary"
          style={{ margin: '12px 16px', width: 'calc(100% - 32px)' }}
          onClick={handleNewChat}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
            {t.newChat}
        </button>

        <div className="sidebar__section-label">{t.chatHistory}</div>
        <div className="sidebar__sessions">
          {sessions.length === 0 ? (
            <div className="sidebar__empty">{t.noSessions}</div>
          ) : (
            sessions.map(s => (
              <SessionItem
                key={s.id}
                session={s}
                active={s.id === currentSessionId}
                onSelect={handleSelectSession}
                onDelete={handleDeleteSession}
              />
            ))
          )}
        </div>

        <div className="sidebar__footer">
          <a href="/admin" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" />
            </svg>
            {t.adminPanel}
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          {!sidebarOpen && (
            <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(true)} title={t.openSidebar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <div className="chat-header__info">
            <div className="chat-header__status">
              <span className="status-dot"></span>
              <span>{t.aiStatus}</span>
            </div>
            <h1 className="chat-header__title">{t.headerTitle}</h1>
          </div>
          <button className="btn btn-ghost btn-icon lang-toggle" onClick={toggleLang} title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'} style={{fontWeight: 700, fontSize: 13, minWidth: 44}}>
            🌐 {t.langLabel}
          </button>
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title={theme === 'dark' ? t.toggleLight : t.toggleDark}>
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </header>

        {/* Messages */}
        <div className="chat-messages">
          {showWelcome && (
            <div className="welcome-screen">
              <div className="welcome-icon" style={{ background: 'transparent', border: 'none' }}>
                <img src="/logo-khtn.png" alt="HCMUS Logo" style={{width: '60px', height: '60px', objectFit: 'contain'}} />
              </div>
              <h2 className="welcome-title">{t.welcomeTitle}</h2>
              <p className="welcome-desc">{t.welcomeDesc}</p>
              <div className="suggestions-grid">
                {t.suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => handleSend(s.replace(/^[\p{Emoji}\s]+/u, '').trim())}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={msg.id || i} msg={msg} t={t} />
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder={t.inputPlaceholder}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className={`voice-btn ${isListening ? 'voice-btn--active' : ''}`}
              onClick={toggleVoice}
              title={isListening ? t.stopListening : t.startListening}
              disabled={loading || !recognitionRef.current}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              title={t.sendMessage}
            >
              {loading ? (
                <div className="spinner" style={{ width: 18, height: 18 }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
          <div className="chat-input-footer">
            {t.disclaimer}
          </div>
        </div>

        {/* Compact HCMUS Footer */}
        <footer className="hcmus-footer">
          <div className="hcmus-footer__socials">
            <a href="https://www.facebook.com/VNUHCM.US" target="_blank" rel="noreferrer" title="Facebook" className="social-icon social-fb">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>
            </a>
            <a href="https://www.youtube.com/channel/UCYtIjCGvl-VNizt_XWk9Uzg" target="_blank" rel="noreferrer" title="YouTube" className="social-icon social-yt">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4s-6.254,0-7.814,0.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/></svg>
            </a>
            <a href="https://www.linkedin.com/school/vnuhcm---university-of-science/" target="_blank" rel="noreferrer" title="LinkedIn" className="social-icon social-in">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-1.85 0-2.6 1-3.04 1.68V11h-2.9v7.5h2.9v-4.18c0-1.1.2-2.16 1.57-2.16 1.34 0 1.37 1.25 1.37 2.22v4.12h2.86M6.46 9.4A1.66 1.66 0 1 1 8.12 7.74 1.66 1.66 0 0 1 6.46 9.4m-1.46 9.1h2.9V11h-2.9v7.5z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@tvts.hcmus" target="_blank" rel="noreferrer" title="TikTok" className="social-icon social-tt">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.02c-.01 1.63-.55 3.23-1.53 4.54-1.07 1.4-2.61 2.37-4.32 2.74-1.74.37-3.6.22-5.23-.46-1.62-.68-2.97-1.92-3.79-3.42-1.01-1.84-1.21-4.08-.53-6.05.69-1.96 2.23-3.5 4.1-4.29 1.17-.5 2.47-.69 3.74-.53.18 1.43.14 2.87-.13 4.29-1.24-.26-2.55-.13-3.67.5-1.12.63-1.93 1.65-2.28 2.89-.36 1.27-.12 2.67.62 3.73.74 1.05 1.94 1.73 3.24 1.83 1.3.11 2.62-.23 3.65-.96 1.03-.73 1.72-1.85 1.93-3.13.22-1.34.19-2.71.18-4.06V.02z"/></svg>
            </a>
            <a href="https://zalo.me/1633096526969619154" target="_blank" rel="noreferrer" title="Zalo" className="social-icon social-zl">
              <span style={{fontWeight: 700}}>Zalo</span>
            </a>
          </div>
          <div className="hcmus-footer__info">
            <span>📞 1900999978</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>✉️ info@hcmus.edu.vn</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>📍 227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM</span>
          </div>
          <div className="hcmus-footer__copyright">
            © 2024 VNUHCM - US
          </div>
        </footer>
      </main>

      <style>{`
        /* ── Layout ── */
        .chat-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg-primary);
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          transition: var(--transition-slow);
          overflow: hidden;
        }
        .sidebar--closed { width: 0; border: none; }

        .sidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .sidebar__logo { display: flex; align-items: center; gap: 10px; }
        .sidebar__logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, rgba(37,99,235,0.3), rgba(245,158,11,0.2));
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(245,158,11,0.3);
          flex-shrink: 0;
        }
        .sidebar__logo-title { font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
        .sidebar__logo-subtitle { font-size: 11px; color: var(--text-muted); }

        .sidebar__section-label {
          padding: 12px 16px 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          flex-shrink: 0;
        }

        .sidebar__sessions {
          flex: 1;
          overflow-y: auto;
          padding: 4px 8px;
        }

        .sidebar__empty {
          padding: 24px 8px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .sidebar__footer {
          padding: 12px 8px;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        /* Session items */
        .session-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 10px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-secondary);
          font-size: 13px;
          position: relative;
        }
        .session-item:hover { background: var(--bg-card); color: var(--text-primary); }
        .session-item--active {
          background: rgba(37,99,235,0.12);
          color: var(--color-primary-light);
        }
        .session-item--active:hover { background: rgba(37,99,235,0.16); }

        .session-item__title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
        }

        .session-item__delete {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 3px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: var(--transition);
          flex-shrink: 0;
        }
        .session-item__delete:hover { color: var(--color-error); background: rgba(239,68,68,0.1); }

        /* ── Main area ── */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        /* Header */
        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(13, 21, 41, 0.8);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
        }

        .chat-header__info { flex: 1; min-width: 0; }
        .chat-header__title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-header__status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-success);
          margin-bottom: 2px;
        }

        .status-dot {
          width: 7px; height: 7px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }

        /* Messages */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Welcome screen */
        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px 20px 16px;
          animation: fadeIn 0.5s ease;
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
        }

        .welcome-icon {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, rgba(37,99,235,0.2), rgba(245,158,11,0.15));
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(245,158,11,0.2);
          animation: glow 3s ease-in-out infinite;
          flex-shrink: 0;
        }

        .welcome-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .welcome-desc {
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          width: 100%;
          max-width: 620px;
        }

        .suggestion-chip {
          padding: 10px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          font-family: var(--font-sans);
          line-height: 1.4;
        }
        .suggestion-chip:hover {
          background: var(--bg-card-hover);
          border-color: var(--color-primary);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        /* Message rows */
        .msg-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          max-width: 100%;
        }
        .msg-row--user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(37,99,235,0.3), rgba(37,99,235,0.1));
          border: 1px solid rgba(37,99,235,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .msg-avatar--user {
          background: linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1));
          border-color: rgba(245,158,11,0.3);
          color: var(--color-gold);
        }

        /* Message bubbles */
        .msg-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: var(--radius-lg);
          font-size: 14px;
          line-height: 1.65;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .msg-bubble--assistant {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-top-left-radius: 4px;
          color: var(--text-primary);
        }
        .msg-bubble--user {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
          border-top-right-radius: 4px;
        }

        /* Markdown inside bubbles */
        .msg-bubble p { margin: 0 0 8px; }
        .msg-bubble p:last-child { margin: 0; }
        .msg-bubble ul, .msg-bubble ol { padding-left: 20px; margin: 6px 0; }
        .msg-bubble li { margin: 4px 0; }
        .msg-bubble strong { font-weight: 600; }
        .msg-bubble em { font-style: italic; }
        .msg-bubble h1, .msg-bubble h2, .msg-bubble h3 {
          font-size: 15px;
          font-weight: 600;
          margin: 10px 0 6px;
          color: var(--text-primary);
        }
        .msg-bubble code {
          background: rgba(255,255,255,0.1);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 13px;
          font-family: var(--font-mono);
        }
        .msg-bubble pre {
          background: rgba(0,0,0,0.3);
          padding: 12px;
          border-radius: var(--radius-md);
          overflow-x: auto;
          margin: 8px 0;
        }
        .msg-bubble pre code { background: none; padding: 0; }
        .msg-bubble blockquote {
          border-left: 3px solid var(--color-primary);
          padding-left: 12px;
          margin: 8px 0;
          color: var(--text-secondary);
        }
        .msg-bubble table {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;
          font-size: 13px;
        }
        .msg-bubble th, .msg-bubble td {
          border: 1px solid var(--border-color);
          padding: 6px 10px;
          text-align: left;
        }
        .msg-bubble th { background: rgba(255,255,255,0.05); font-weight: 600; }
        .msg-bubble a { color: var(--text-accent); text-decoration: underline; }
        .msg-bubble hr { border: none; border-top: 1px solid var(--border-color); margin: 10px 0; }

        /* Sources */
        .msg-sources {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-color);
        }
        .msg-sources__label {
          font-size: 11px;
          color: var(--text-muted);
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .msg-sources__chips { display: flex; flex-wrap: wrap; gap: 5px; }

        .source-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: rgba(37,99,235,0.1);
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: var(--radius-full);
          font-size: 11px;
          color: var(--text-accent);
          white-space: nowrap;
        }

        /* ── Input area ── */
        .chat-input-area {
          padding: 16px 24px 20px;
          border-top: 1px solid var(--border-color);
          background: rgba(13, 21, 41, 0.6);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
        }

        .chat-input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 10px 10px 10px 18px;
          transition: var(--transition);
        }
        .chat-input-wrapper:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
          background: rgba(37,99,235,0.03);
        }

        .chat-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          max-height: 120px;
          overflow-y: auto;
          padding: 2px 0;
        }
        .chat-input::placeholder { color: var(--text-muted); }
        .chat-input:disabled { opacity: 0.6; cursor: not-allowed; }

        .chat-send-btn {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          border: none;
          border-radius: var(--radius-full);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: var(--transition);
        }
        .chat-send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(37,99,235,0.5);
        }
        .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* Voice button */
        .voice-btn {
          width: 40px; height: 40px;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: var(--transition);
        }
        .voice-btn:hover:not(:disabled) {
          color: var(--text-primary);
          border-color: var(--text-muted);
        }
        .voice-btn--active {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.5);
          color: #ef4444;
          animation: pulse 1.5s infinite;
        }
        .voice-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Light theme overrides for chat */
        [data-theme="light"] .chat-header {
          background: rgba(255,255,255,0.9);
        }
        [data-theme="light"] .chat-input-area {
          background: rgba(255,255,255,0.8);
        }
        [data-theme="light"] .msg-bubble--assistant {
          background: rgba(0,0,0,0.04);
          border-color: rgba(0,0,0,0.1);
        }
        [data-theme="light"] .msg-bubble--user {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }
        [data-theme="light"] .special-card {
          background: linear-gradient(135deg, rgba(37,99,235,0.06), rgba(245,158,11,0.04));
          border-color: rgba(37,99,235,0.15);
        }
        [data-theme="light"] .orient-card__item {
          background: rgba(0,0,0,0.02);
          border-color: rgba(0,0,0,0.08);
        }
        [data-theme="light"] .sidebar {
          background: #ffffff;
          border-color: rgba(0,0,0,0.1);
        }
        [data-theme="light"] .session-item--active {
          background: rgba(37,99,235,0.08);
        }

        .chat-input-footer {
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        /* ── Special Cards (Predict + Orient) ── */
        .special-card {
          background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(245,158,11,0.05));
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          animation: fadeIn 0.4s ease;
        }
        .special-card__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .special-card__icon { font-size: 20px; }
        .special-card__title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Predict Card */
        .predict-card__info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 14px;
        }
        .predict-card__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .predict-card__label { color: var(--text-secondary); }
        .predict-card__value { color: var(--text-primary); }

        .predict-card__bar-section { margin-bottom: 14px; }
        .predict-card__bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .predict-card__bar-bg {
          width: 100%;
          height: 10px;
          border-radius: 99px;
          overflow: hidden;
        }
        .predict-card__bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .predict-card__alts {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 12px;
        }
        .predict-card__alts-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .predict-card__alt-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 13px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .predict-card__alt-item:last-child { border-bottom: none; }
        .predict-card__alt-name { color: var(--text-primary); }
        .predict-card__alt-prob { font-weight: 600; font-size: 12px; }

        /* Orient Card */
        .orient-card__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .orient-card__item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px;
          transition: var(--transition);
        }
        .orient-card__item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(37,99,235,0.3);
        }
        .orient-card__item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }
        .orient-card__major {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          flex: 1;
        }
        .orient-card__badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 99px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .orient-card__desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .orient-card__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .orient-card__reasons {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .orient-card__reason {
          font-size: 11px;
          padding: 2px 8px;
          background: rgba(37,99,235,0.1);
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: 99px;
          color: var(--text-accent);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            top: 0; left: 0; bottom: 0;
            z-index: 100;
            box-shadow: var(--shadow-lg);
          }
          .chat-messages { padding: 16px; }
          .chat-input-area { padding: 12px 16px 16px; }
          .welcome-title { font-size: 18px; }
          .msg-bubble { max-width: 90%; }
          .orient-card__item-header { flex-direction: column; }
          .orient-card__meta { flex-direction: column; gap: 4px; }
        }
      `}</style>
    </div>
  );
}
