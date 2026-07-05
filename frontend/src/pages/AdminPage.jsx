import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';

const CATEGORY_LABELS = {
  general: 'Tổng quát',
  admission: 'Tuyển sinh',
  major: 'Ngành học',
  tuition: 'Học phí',
  dormitory: 'Ký túc xá',
  scholarship: 'Học bổng',
};

const CATEGORY_COLORS = {
  general: '#94a3b8',
  admission: '#60a5fa',
  major: '#a78bfa',
  tuition: '#34d399',
  dormitory: '#fb923c',
  scholarship: '#f59e0b',
};

function formatBytes(bytes) {
  if (!bytes) return '–';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '–';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/* ── Login Screen ── */
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.adminLogin(username.trim(), password);
      localStorage.setItem('adminToken', data.token);
      onLogin(data.username || username.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: 40,
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeIn 0.4s ease',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(245,158,11,0.2))',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid rgba(245,158,11,0.3)',
            animation: 'glow 3s ease-in-out infinite',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Đăng nhập Admin
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Quản trị hệ thống AI Tư Vấn HCMUS
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 13, color: 'var(--text-secondary)',
              marginBottom: 6, fontWeight: 500,
            }}>
              Tên đăng nhập
            </label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 13, color: 'var(--text-secondary)',
              marginBottom: 6, fontWeight: 500,
            }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4, display: 'flex',
                }}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            style={{ width: '100%' }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18 }} />Đang xử lý...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <polyline points="10 17 15 12 10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/" style={{
            color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Quay lại trang tư vấn
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <div className="glass" style={{
      padding: '20px 24px',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      animation: 'fadeIn 0.5s ease',
      transition: 'var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
    >
      <div style={{
        width: 52, height: 52,
        borderRadius: 14,
        background: `${color}18`,
        border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value ?? '–'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: color, marginTop: 3, fontWeight: 500 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

/* ── Upload Zone ── */
function UploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [category, setCategory] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus({ type: 'error', msg: 'Chỉ hỗ trợ file PDF. Vui lòng chọn file .pdf' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadStatus({ type: 'error', msg: 'File quá lớn. Kích thước tối đa là 50MB' });
      return;
    }
    setUploading(true);
    setUploadStatus(null);
    setProgress(0);

    // Fake progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 85));
    }, 400);

    try {
      const result = await api.uploadDocument(file, category);
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setUploadStatus({
          type: 'success',
          msg: `✅ Đã tải lên "${result.filename}" thành công – ${result.chunk_count ?? '?'} đoạn văn bản được lập chỉ mục`,
        });
        onUpload();
        // Reset file input
        if (fileRef.current) fileRef.current.value = '';
      }, 600);
    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setProgress(0);
      setUploadStatus({ type: 'error', msg: `❌ ${err.message}` });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      padding: 24,
      marginBottom: 24,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📤</span> Tải lên tài liệu PDF
      </h3>

      {/* Category selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Danh mục tài liệu
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setCategory(v)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${category === v ? CATEGORY_COLORS[v] : 'var(--border-color)'}`,
                background: category === v ? `${CATEGORY_COLORS[v]}18` : 'transparent',
                color: category === v ? CATEGORY_COLORS[v] : 'var(--text-secondary)',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: category === v ? 600 : 400,
                transition: 'var(--transition)',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: dragging ? 'rgba(37,99,235,0.06)' : 'transparent',
          transition: 'var(--transition)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onDragOver={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>
                Đang xử lý PDF và tạo vector embeddings...
              </div>
              {/* Progress bar */}
              <div style={{
                width: 240, height: 4, background: 'var(--border-color)',
                borderRadius: 'var(--radius-full)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              fontSize: 40, marginBottom: 14,
              filter: dragging ? 'none' : 'grayscale(0.3)',
              transition: 'var(--transition)',
            }}>📄</div>
            <div style={{ fontSize: 15, color: dragging ? 'var(--color-primary-light)' : 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
              {dragging ? 'Thả file vào đây!' : 'Kéo thả file PDF vào đây'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              hoặc{' '}
              <span style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>click để chọn file</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
              Hỗ trợ PDF • Tối đa 50MB
            </div>
          </>
        )}
      </div>

      {/* Status message */}
      {uploadStatus && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          lineHeight: 1.5,
          animation: 'fadeIn 0.3s ease',
          background: uploadStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${uploadStatus.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: uploadStatus.type === 'success' ? '#34d399' : '#f87171',
        }}>
          {uploadStatus.msg}
        </div>
      )}
    </div>
  );
}

/* ── Document Table Row ── */
function DocRow({ doc, onDelete, deleting }) {
  const color = CATEGORY_COLORS[doc.category] || '#94a3b8';
  const label = CATEGORY_LABELS[doc.category] || doc.category;

  const statusBadge = () => {
    switch (doc.status) {
      case 'ready': return <span className="badge badge-success">Sẵn sàng</span>;
      case 'processing': return <span className="badge badge-processing">Đang xử lý</span>;
      case 'error': return <span className="badge badge-error">Lỗi</span>;
      default: return <span className="badge badge-info">{doc.status || 'Không rõ'}</span>;
    }
  };

  return (
    <tr style={{ animation: 'fadeIn 0.3s ease' }}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>📄</div>
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 14, lineHeight: 1.3 }}>
              {doc.filename || doc.original_filename || 'Không tên'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              ID: {doc.id?.slice(0, 8) || '?'}...
            </div>
          </div>
        </div>
      </td>
      <td className="hide-mobile">
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 'var(--radius-full)',
          background: `${color}15`, border: `1px solid ${color}30`,
          color: color, fontSize: 12, fontWeight: 500,
        }}>
          {label}
        </span>
      </td>
      <td className="hide-mobile" style={{ fontSize: 13 }}>
        {doc.chunk_count != null ? (
          <span style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>
            {doc.chunk_count.toLocaleString()}
          </span>
        ) : '–'}
      </td>
      <td className="hide-mobile" style={{ fontSize: 13 }}>
        {formatBytes(doc.file_size)}
      </td>
      <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {formatDate(doc.created_at)}
      </td>
      <td>{statusBadge()}</td>
      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(doc.id)}
          disabled={deleting}
          title="Xóa tài liệu"
          style={{ padding: '6px 10px' }}
        >
          {deleting ? (
            <div className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" />
              <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" />
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>
      </td>
    </tr>
  );
}

/* ── Main Admin Dashboard ── */
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [adminName, setAdminName] = useState('Admin');
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ documents: 0, sessions: 0, messages: 0, total_chunks: 0 });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [docs, st] = await Promise.all([
        api.getDocuments(),
        api.getStats(),
      ]);
      setDocuments(Array.isArray(docs) ? docs : []);
      setStats(st || { documents: 0, sessions: 0, messages: 0, total_chunks: 0 });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) load();
  }, [isLoggedIn, load]);

  const handleDelete = async (docId) => {
    if (!window.confirm('Xóa tài liệu này? Tất cả dữ liệu vector sẽ bị xóa khỏi AI.')) return;
    setDeletingId(docId);
    try {
      await api.deleteDocument(docId);
      await load();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setDocuments([]);
    setStats({ documents: 0, sessions: 0, messages: 0, total_chunks: 0 });
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchQuery ||
      (doc.filename || doc.original_filename || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(name) => { setAdminName(name); setIsLoggedIn(true); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>

      {/* Top navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(13, 21, 41, 0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(245,158,11,0.2))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(245,158,11,0.3)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>HCMUS Admin</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hệ thống quản trị AI Tư Vấn</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastRefresh && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 21v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {lastRefresh.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={load}
            disabled={loading}
            title="Làm mới dữ liệu"
          >
            {loading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 21v-5h-5M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            Làm mới
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
            }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{adminName}</span>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Đăng xuất">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Đăng xuất
          </button>

          <a href="/" className="btn btn-ghost btn-sm" title="Trang tư vấn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" />
            </svg>
            Tư vấn
          </a>
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Dashboard quản trị
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Quản lý tài liệu và theo dõi hoạt động hệ thống AI Tư Vấn HCMUS
          </p>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <StatCard icon="📄" label="Tài liệu" value={stats.documents} color="#60a5fa" subtitle="đã tải lên" />
          <StatCard icon="🧩" label="Đoạn văn bản" value={stats.total_chunks?.toLocaleString()} color="#a78bfa" subtitle="vector embeddings" />
          <StatCard icon="💬" label="Phiên chat" value={stats.sessions} color="#34d399" subtitle="người dùng" />
          <StatCard icon="📨" label="Tin nhắn" value={stats.messages?.toLocaleString()} color="#f59e0b" subtitle="tổng cộng" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
          {[
            { id: 'documents', label: '📚 Tài liệu', count: documents.length },
            { id: 'upload', label: '📤 Tải lên', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--color-primary)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: -1,
              }}
            >
              {tab.label}
              {tab.count != null && (
                <span style={{
                  padding: '1px 7px', borderRadius: 'var(--radius-full)',
                  background: activeTab === tab.id ? 'rgba(37,99,235,0.2)' : 'var(--bg-card)',
                  color: activeTab === tab.id ? 'var(--color-primary-light)' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'upload' && (
          <UploadZone onUpload={() => { load(); setActiveTab('documents'); }} />
        )}

        {activeTab === 'documents' && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}>
            {/* Table toolbar */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginRight: 'auto' }}>
                Danh sách tài liệu
              </h3>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }}>
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  className="input"
                  type="text"
                  placeholder="Tìm tài liệu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 32, width: 200, fontSize: 13 }}
                />
              </div>

              {/* Category filter */}
              <select
                className="input"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{ width: 'auto', fontSize: 13, cursor: 'pointer' }}
              >
                <option value="all">Tất cả danh mục</option>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('upload')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Tải lên
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div style={{
                padding: '60px 20px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              }}>
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Đang tải dữ liệu...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div style={{
                padding: '60px 20px', textAlign: 'center',
                color: 'var(--text-muted)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {documents.length === 0 ? '📭' : '🔍'}
                </div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {documents.length === 0 ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu phù hợp'}
                </div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>
                  {documents.length === 0
                    ? 'Tải lên tài liệu PDF để AI có thể trả lời câu hỏi'
                    : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
                </div>
                {documents.length === 0 && (
                  <button className="btn btn-primary" onClick={() => setActiveTab('upload')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Tải lên tài liệu đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên tài liệu</th>
                      <th className="hide-mobile">Danh mục</th>
                      <th className="hide-mobile">Đoạn văn</th>
                      <th className="hide-mobile">Kích thước</th>
                      <th className="hide-mobile">Ngày tải lên</th>
                      <th>Trạng thái</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map(doc => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        onDelete={handleDelete}
                        deleting={deletingId === doc.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table footer */}
            {filteredDocs.length > 0 && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Hiển thị {filteredDocs.length} / {documents.length} tài liệu
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Tổng: {filteredDocs.reduce((a, d) => a + (d.chunk_count || 0), 0).toLocaleString()} đoạn văn bản
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        padding: '16px 28px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(13, 21, 41, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div className="admin-footer" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          &copy; 2024 Hệ thống Quản trị Tư vấn Tuyển sinh ĐH KHTN
        </div>
      </footer>

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.3); }
          50% { box-shadow: 0 0 25px rgba(37, 99, 235, 0.6); }
        }
        .status-dot {
          width: 7px; height: 7px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s infinite;
          display: inline-block;
        }
        @media (max-width: 768px) {
          nav { padding: 12px 16px; }
          nav > div:last-child > span { display: none; }
        }
      `}</style>
    </div>
  );
}
