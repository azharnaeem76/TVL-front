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
    if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
      throw new Error('Session expired');
    }
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

export async function adminCreateUser(data: Record<string, any>) {
  return request('/admin/users', { method: 'POST', body: JSON.stringify(data) });
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

// Profile
export async function updateProfile(data: Record<string, any>) {
  const result = await request('/auth/me', { method: 'PUT', body: JSON.stringify(data) });
  // Update cached user data
  localStorage.setItem('tvl_user', JSON.stringify(result));
  return result;
}

export async function uploadAvatar(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/auth/me/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  const result = await res.json();
  localStorage.setItem('tvl_user', JSON.stringify(result));
  return result;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return request('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

// Password Reset
export async function forgotPassword(email: string) {
  return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(token: string, newPassword: string) {
  return request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, new_password: newPassword }) });
}

// Documents
export async function uploadDocument(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail);
  }
  return res.json();
}

export async function getDocuments(params?: { status?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/documents/?${query}`);
}

export async function getDocument(id: number) {
  return request(`/documents/${id}`);
}

export async function analyzeDocument(id: number) {
  return request(`/documents/${id}/analyze`, { method: 'POST' });
}

export async function deleteDocument(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

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

// ─── AI Tools ────────────────────────────────────────────────────────────────

export async function aiSummarize(text: string, language?: string) {
  return request('/ai-tools/summarize', { method: 'POST', body: JSON.stringify({ text, language }) });
}

export async function aiOpinion(facts: string, area_of_law?: string, language?: string) {
  return request('/ai-tools/opinion', { method: 'POST', body: JSON.stringify({ facts, area_of_law, language }) });
}

export async function aiPredict(case_description: string, area_of_law?: string, language?: string) {
  return request('/ai-tools/predict', { method: 'POST', body: JSON.stringify({ case_description, area_of_law, language }) });
}

export async function aiAnalyzeContract(contract_text: string, language?: string) {
  return request('/ai-tools/analyze-contract', { method: 'POST', body: JSON.stringify({ contract_text, language }) });
}

export async function aiAnalyzeContractUpload(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/ai-tools/analyze-contract-upload`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(error.detail || 'Upload failed');
  }
  return res.json();
}

export async function aiFindCitations(legal_principle: string, area_of_law?: string, language?: string) {
  return request('/ai-tools/find-citations', { method: 'POST', body: JSON.stringify({ legal_principle, area_of_law, language }) });
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export async function getConversations() {
  return request('/messaging/conversations');
}

export async function getMessagingContacts(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/messaging/contacts${query}`);
}

export async function sendDirectMessage(recipient_id: number, content: string) {
  return request('/messaging/send', { method: 'POST', body: JSON.stringify({ recipient_id, content }) });
}

export async function getConversationMessages(conversationId: number) {
  return request(`/messaging/conversations/${conversationId}/messages`);
}

export async function sendFileMessage(recipientId: number, file: File, messageType: string, duration?: number) {
  const token = getToken();
  const formData = new FormData();
  formData.append('recipient_id', String(recipientId));
  formData.append('file', file);
  formData.append('message_type', messageType);
  if (duration !== undefined) formData.append('duration', String(duration));

  const res = await fetch(`${API_BASE}/messaging/send-file`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function getUnreadMessageCount(): Promise<{ unread_count: number }> {
  return request('/messaging/unread-count');
}

export async function deleteConversation(conversationId: number) {
  return request(`/messaging/conversations/${conversationId}`, { method: 'DELETE' });
}

export async function deleteMessage(messageId: number, forEveryone: boolean = false) {
  return request(`/messaging/messages/${messageId}?for_everyone=${forEveryone}`, { method: 'DELETE' });
}

// ─── Consultations ───────────────────────────────────────────────────────────

export async function getConsultations(status?: string) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  return request(`/consultations/?${query}`);
}

export async function createConsultation(data: Record<string, any>) {
  return request('/consultations/', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateConsultation(id: number, data: Record<string, any>) {
  return request(`/consultations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteConsultation(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/consultations/${id}`, {
    method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Delete failed' })); throw new Error(err.detail); }
}

export async function getAvailableLawyers(search?: string) {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  return request(`/consultations/lawyers?${query}`);
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export async function getAuditLogs(params?: { action?: string; resource_type?: string; user_id?: number; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/audit-logs/?${query}`);
}

export async function getAuditLogActions() {
  return request('/audit-logs/actions');
}

// ─── Student Tools (Moot Court & Exam Prep) ──────────────────────────────────

export async function generateMootScenario(topic: string, side?: string) {
  return request('/student-tools/moot-court/scenario', { method: 'POST', body: JSON.stringify({ topic, side }) });
}

export async function evaluateMootArgument(scenario: string, your_argument: string, side?: string) {
  return request('/student-tools/moot-court/evaluate', { method: 'POST', body: JSON.stringify({ scenario, your_argument, side }) });
}

export async function getExamTypes() {
  return request('/student-tools/exam-types');
}

export async function generateExamQuestions(subject: string, exam_type?: string, topic?: string, num_questions?: number) {
  return request('/student-tools/exam-prep/generate', { method: 'POST', body: JSON.stringify({ subject, exam_type: exam_type || 'llb', topic, num_questions }) });
}

export async function evaluateExamAnswer(question: string, student_answer: string, subject: string) {
  return request('/student-tools/exam-prep/evaluate', { method: 'POST', body: JSON.stringify({ question, student_answer, subject }) });
}

// ─── Study Content (Admin-managed) ──────────────────────────────────────────

export async function getStudyQuestions(params?: { category?: string; exam_type?: string; difficulty?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/study-content/questions?${query}`);
}

export async function getStudyNotes(params?: { category?: string; exam_type?: string; search?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/study-content/notes?${query}`);
}

export async function getStudyCategories() {
  return request('/study-content/categories');
}

export async function adminGetStudyContent(params?: { content_type?: string; category?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/study-content/admin/all?${query}`);
}

export async function adminCreateStudyContent(data: {
  content_type: string; title: string; category?: string; exam_type?: string;
  difficulty?: string; content?: string; question_data?: any;
}) {
  return request('/study-content/admin/create', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateStudyContent(id: number, data: any) {
  return request(`/study-content/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteStudyContent(id: number) {
  return request(`/study-content/admin/${id}`, { method: 'DELETE' });
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export async function getMyPlan() {
  return request('/subscriptions/my-plan');
}

export async function requestUpgrade(plan: string) {
  return request('/subscriptions/upgrade', { method: 'POST', body: JSON.stringify({ plan }) });
}

export async function adminSetPlan(userId: number, plan: string) {
  return request(`/subscriptions/set-plan/${userId}`, { method: 'PUT', body: JSON.stringify({ plan }) });
}

// ─── Support Tickets ────────────────────────────────────────────────────────

export async function createSupportTicket(data: { subject: string; description: string; category?: string; priority?: string }) {
  return request('/support/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export async function getSupportTickets(params?: { status_filter?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/support/tickets?${query}`);
}

export async function getSupportTicket(id: number) {
  return request(`/support/tickets/${id}`);
}

export async function replySupportTicket(id: number, message: string) {
  return request(`/support/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) });
}

export async function updateSupportTicket(id: number, data: { status?: string; priority?: string; assigned_to?: number; resolution_note?: string }) {
  return request(`/support/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function getSupportCategories() {
  return request('/support/categories');
}

export async function switchSupportRole(role: string) {
  return request(`/support/switch-role?role=${role}`, { method: 'POST' });
}

// ─── Community Forum ──────────────────────────────────────────────────────────

export async function getForumPosts(params?: { category?: string; search?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
  return request(`/forum/posts?${query}`);
}

export async function createForumPost(data: { title: string; content: string; category: string }) {
  return request('/forum/posts', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteForumPost(postId: number) {
  return request(`/forum/posts/${postId}`, { method: 'DELETE' });
}

export async function getForumReplies(postId: number) {
  return request(`/forum/posts/${postId}/replies`);
}

export async function createForumReply(postId: number, content: string) {
  return request(`/forum/posts/${postId}/replies`, { method: 'POST', body: JSON.stringify({ content }) });
}

export async function deleteForumReply(replyId: number) {
  return request(`/forum/replies/${replyId}`, { method: 'DELETE' });
}

export async function toggleForumPostLike(postId: number) {
  return request(`/forum/posts/${postId}/like`, { method: 'POST' });
}

export async function toggleForumReplyLike(replyId: number) {
  return request(`/forum/replies/${replyId}/like`, { method: 'POST' });
}

// ─── Workspaces ──────────────────────────────────────────────────────────────

export async function getWorkspaces() {
  return request('/workspaces/');
}

export async function createWorkspace(data: { name: string; description?: string }) {
  return request('/workspaces/', { method: 'POST', body: JSON.stringify(data) });
}

export async function getWorkspace(id: number) {
  return request(`/workspaces/${id}`);
}

export async function updateWorkspace(id: number, data: { name?: string; description?: string }) {
  return request(`/workspaces/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteWorkspace(id: number) {
  return request(`/workspaces/${id}`, { method: 'DELETE' });
}

export async function inviteToWorkspace(wsId: number, email: string, role: string = 'member') {
  return request(`/workspaces/${wsId}/invite`, { method: 'POST', body: JSON.stringify({ email, role }) });
}

export async function cancelWorkspaceInvite(wsId: number, inviteId: number) {
  return request(`/workspaces/${wsId}/invite/${inviteId}/cancel`, { method: 'POST' });
}

export async function getMyPendingInvites() {
  return request('/workspaces/invites/pending');
}

export async function acceptWorkspaceInvite(token: string) {
  return request(`/workspaces/invites/accept?token=${token}`, { method: 'POST' });
}

export async function declineWorkspaceInvite(token: string) {
  return request(`/workspaces/invites/decline?token=${token}`, { method: 'POST' });
}

export async function changeWorkspaceMemberRole(wsId: number, memberId: number, role: string) {
  return request(`/workspaces/${wsId}/members/${memberId}/role?role=${role}`, { method: 'PUT' });
}

export async function removeWorkspaceMember(wsId: number, memberId: number) {
  return request(`/workspaces/${wsId}/members/${memberId}`, { method: 'DELETE' });
}

export async function leaveWorkspace(wsId: number) {
  return request(`/workspaces/${wsId}/leave`, { method: 'POST' });
}

export async function getWorkspaceTasks(wsId: number, status?: string) {
  const query = status ? `?status=${status}` : '';
  return request(`/workspaces/${wsId}/tasks${query}`);
}

export async function createWorkspaceTask(wsId: number, data: { title: string; description?: string; priority?: string; assigned_to?: number; due_date?: string }) {
  return request(`/workspaces/${wsId}/tasks`, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateWorkspaceTask(wsId: number, taskId: number, data: any) {
  return request(`/workspaces/${wsId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteWorkspaceTask(wsId: number, taskId: number) {
  return request(`/workspaces/${wsId}/tasks/${taskId}`, { method: 'DELETE' });
}

export async function getWorkspaceNotes(wsId: number) {
  return request(`/workspaces/${wsId}/notes`);
}

export async function createWorkspaceNote(wsId: number, data: { title: string; content?: string }) {
  return request(`/workspaces/${wsId}/notes`, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateWorkspaceNote(wsId: number, noteId: number, data: { title?: string; content?: string }) {
  return request(`/workspaces/${wsId}/notes/${noteId}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteWorkspaceNote(wsId: number, noteId: number) {
  return request(`/workspaces/${wsId}/notes/${noteId}`, { method: 'DELETE' });
}
