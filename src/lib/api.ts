const API_BASE = '/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tvl_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('tvl_token', data.access_token);
  localStorage.setItem('tvl_user', JSON.stringify(data.user));
  return data;
}

export async function register(userData: {
  email: string;
  full_name: string;
  password: string;
  role: string;
  phone?: string;
  city?: string;
  preferred_language?: string;
}) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  localStorage.setItem('tvl_token', data.access_token);
  localStorage.setItem('tvl_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('tvl_token');
  localStorage.removeItem('tvl_user');
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('tvl_user');
  return user ? JSON.parse(user) : null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// Scenario Search
export async function scenarioSearch(query: string, options?: {
  category?: string;
  court?: string;
  year_from?: number;
  year_to?: number;
  max_results?: number;
}) {
  const isGuest = !isLoggedIn();
  const endpoint = isGuest ? '/search/scenario/guest' : '/search/scenario';
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify({ query, ...options }),
  });
}

export async function detectLanguage(text: string) {
  return request(`/search/detect-language?text=${encodeURIComponent(text)}`);
}

export async function getCategories() {
  return request('/search/categories');
}

export async function getCourts() {
  return request('/search/courts');
}

// Chat
export async function sendChatMessage(message: string, sessionId?: number) {
  return request('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

export async function getChatSessions() {
  return request('/chat/sessions');
}

export async function getSessionMessages(sessionId: number) {
  return request(`/chat/sessions/${sessionId}/messages`);
}

// Legal Database
export async function getCaseLaws(params?: {
  category?: string;
  court?: string;
  year?: number;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) query.set(k, String(v));
    });
  }
  return request(`/legal/case-laws?${query}`);
}

export async function getCaseLaw(id: number) {
  return request(`/legal/case-laws/${id}`);
}

export async function getStatutes(params?: { category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) query.set(k, String(v));
    });
  }
  return request(`/legal/statutes?${query}`);
}

export async function getStatuteSections(statuteId: number) {
  return request(`/legal/statutes/${statuteId}/sections`);
}

// ─── Admin APIs ─────────────────────────────────────────────────────────────

export async function adminGetStats() {
  return request('/admin/stats');
}

// Case Laws
export async function adminGetCaseLaws(params?: {
  category?: string; court?: string; year?: number; search?: string; skip?: number; limit?: number;
}) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/admin/case-laws?${query}`);
}

export async function adminCreateCaseLaw(data: Record<string, any>) {
  return request('/admin/case-laws', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateCaseLaw(id: number, data: Record<string, any>) {
  return request(`/admin/case-laws/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteCaseLaw(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/case-laws/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

// Statutes
export async function adminGetStatutes(params?: {
  category?: string; search?: string; skip?: number; limit?: number;
}) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/admin/statutes?${query}`);
}

export async function adminCreateStatute(data: Record<string, any>) {
  return request('/admin/statutes', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateStatute(id: number, data: Record<string, any>) {
  return request(`/admin/statutes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteStatute(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/statutes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

// Sections
export async function adminCreateSection(data: Record<string, any>) {
  return request('/admin/sections', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateSection(id: number, data: Record<string, any>) {
  return request(`/admin/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteSection(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/sections/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

// Users
export async function adminGetUsers(params?: {
  role?: string; is_active?: boolean; search?: string; skip?: number; limit?: number;
}) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/admin/users?${query}`);
}

export async function adminUpdateUser(id: number, data: Record<string, any>) {
  return request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteUser(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

// Bulk Operations
export async function adminBulkImportCaseLaws(caseLaws: Record<string, any>[]) {
  return request('/admin/case-laws/bulk', { method: 'POST', body: JSON.stringify({ case_laws: caseLaws }) });
}

export async function adminBulkDeleteCaseLaws(ids: number[]) {
  return request('/admin/case-laws/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) });
}

// ─── Google Auth ────────────────────────────────────────────────────────────

export async function googleLogin(token: string, role: string = 'client') {
  const data = await request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token, role }),
  });
  localStorage.setItem('tvl_token', data.access_token);
  localStorage.setItem('tvl_user', JSON.stringify(data.user));
  return data;
}

// ─── Feature Flags ──────────────────────────────────────────────────────────

export async function getFeatureFlags() {
  return request('/features/');
}

export async function getEnabledFeatures(): Promise<{ enabled: string[] }> {
  return request('/features/enabled');
}

export async function updateFeatureFlag(key: string, data: { enabled?: boolean; config?: Record<string, any> }) {
  return request(`/features/${key}`, { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Notifications ──────────────────────────────────────────────────────────

export async function getNotifications(params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/notifications/?${query}`);
}

export async function markNotificationRead(id: number) {
  return request(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return request('/notifications/read-all', { method: 'PUT' });
}

export async function getUnreadNotificationCount(): Promise<{ unread_count: number }> {
  return request('/notifications/unread-count');
}

// ─── Case Tracker ───────────────────────────────────────────────────────────

export async function getTrackedCases(params?: { status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/case-tracker/?${query}`);
}

export async function createTrackedCase(data: Record<string, any>) {
  return request('/case-tracker/', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTrackedCase(id: number, data: Record<string, any>) {
  return request(`/case-tracker/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteTrackedCase(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/case-tracker/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

// ─── Client CRM ─────────────────────────────────────────────────────────────

export async function getClients(params?: { search?: string }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/clients/?${query}`);
}

export async function createClient(data: Record<string, any>) {
  return request('/clients/', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateClient(id: number, data: Record<string, any>) {
  return request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteClient(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

// ─── Lawyer Directory ───────────────────────────────────────────────────────

export async function getLawyerDirectory(params?: { search?: string; city?: string; specialization?: string }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/directory/?${query}`);
}
