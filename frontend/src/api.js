// Hỗ trợ lấy API_BASE từ biến môi trường trên Vercel/Netlify
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Chat
  async sendMessage(message, sessionId = null, lang = 'vi') {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId, lang }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Lỗi kết nối');
    return res.json();
  },

  async getSessions() {
    const res = await fetch(`${API_BASE}/sessions`);
    if (!res.ok) throw new Error('Không tải được danh sách phiên');
    return res.json();
  },

  async createSession(userName = 'Khách') {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: userName }),
    });
    if (!res.ok) throw new Error('Không tạo được phiên');
    return res.json();
  },

  async getMessages(sessionId) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
    if (!res.ok) throw new Error('Không tải được tin nhắn');
    return res.json();
  },

  async deleteSession(sessionId) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Không xóa được phiên');
    return res.json();
  },

  // Admin
  async adminLogin(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Đăng nhập thất bại');
    return res.json();
  },

  async getDocuments() {
    const res = await fetch(`${API_BASE}/admin/documents`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không tải được tài liệu');
    return res.json();
  },

  async uploadDocument(file, category) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Upload thất bại');
    return res.json();
  },

  async deleteDocument(docId) {
    const res = await fetch(`${API_BASE}/admin/documents/${docId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không xóa được tài liệu');
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không tải được thống kê');
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Admission Predictor
  async predictAdmission(score, method, major) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, method, major }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Lỗi dự đoán');
    return res.json();
  },

  // Career Orientation
  async careerOrientation(interests, personality, budget, strengths) {
    const res = await fetch(`${API_BASE}/orient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests, personality, budget, strengths }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Lỗi định hướng');
    return res.json();
  },
};
