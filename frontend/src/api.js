import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for deep AI extraction
});

// Attach auth token if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('careerlens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Authentication
  async register({ name, email, password }) {
    const res = await client.post('/api/auth/register', { name, email, password });
    if (res.data?.token) {
      localStorage.setItem('careerlens_token', res.data.token);
      localStorage.setItem('careerlens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login({ email, password }) {
    const res = await client.post('/api/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('careerlens_token', res.data.token);
      localStorage.setItem('careerlens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await client.get('/api/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('careerlens_token');
    localStorage.removeItem('careerlens_user');
  },

  getSavedUser() {
    try {
      const stored = localStorage.getItem('careerlens_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // System Health
  async checkHealth() {
    try {
      const res = await client.get('/api/health');
      return res.data;
    } catch (err) {
      console.warn('API Health check failed:', err.message);
      return { status: 'offline', groq_active: false };
    }
  },

  // Upload Resume PDF
  async uploadResume(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await client.post('/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  // Deep analyze uploaded resume
  async analyzeResume(sessionId) {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    const res = await client.post('/api/resume/analyze', formData);
    return res.data;
  },

  // Fetch Dev Signals
  async getGithubProfile(username) {
    const res = await client.get(`/api/dev/github/${encodeURIComponent(username)}`);
    return res.data;
  },

  async getLeetcodeProfile(username) {
    const res = await client.get(`/api/dev/leetcode/${encodeURIComponent(username)}`);
    return res.data;
  },

  // Unified 360 Evaluation
  async evaluateUnified({ sessionId, githubUsername, leetcodeUsername, targetRole, file, jdText, jdFile, onUploadProgress }) {
    const formData = new FormData();
    if (sessionId) formData.append('session_id', sessionId);
    if (githubUsername) formData.append('github_username', githubUsername);
    if (leetcodeUsername) formData.append('leetcode_username', leetcodeUsername);
    if (targetRole) formData.append('target_role', targetRole);
    if (file) formData.append('file', file);
    if (jdText) formData.append('jd_text', jdText);
    if (jdFile) formData.append('jd_file', jdFile);

    const res = await client.post('/api/evaluate/unified', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onUploadProgress && evt.total) {
          onUploadProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      }
    });
    return res.data;
  },

  // Match Profile Against Custom Job Description (Text or PDF)
  async matchCustomJD({ jdText, jdFile, evaluationId = 'latest' }) {
    const formData = new FormData();
    formData.append('evaluation_id', evaluationId);
    if (jdText) formData.append('jd_text', jdText);
    if (jdFile) formData.append('jd_file', jdFile);

    const res = await client.post('/api/jd/match', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Dynamic Custom Roadmap Generation for any Target Role
  async generateCustomRoadmap(targetRole, evaluationId = 'latest') {
    const res = await client.post('/api/roadmap/generate', {
      evaluation_id: evaluationId,
      target_role: targetRole,
    });
    return res.data;
  },

  // Roadmap
  async getRoadmap(evaluationId = 'latest') {
    const res = await client.get(`/api/roadmap/${evaluationId}`);
    return res.data;
  },

  // Copilot Chat & Persistent MongoDB History
  async askCopilot(message, evaluationId = 'latest', history = []) {
    const res = await client.post('/api/chat', {
      message,
      evaluation_id: evaluationId,
      history,
    });
    return res.data;
  },

  async getChatHistory(evaluationId = 'latest') {
    const res = await client.get(`/api/chat/history?evaluation_id=${encodeURIComponent(evaluationId)}`);
    return res.data;
  },

  async clearChatHistory(evaluationId = 'latest') {
    const res = await client.delete(`/api/chat/history?evaluation_id=${encodeURIComponent(evaluationId)}`);
    return res.data;
  },
};

export default api;
