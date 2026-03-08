'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn, getCurrentUser, adminGetStudyContent, adminCreateStudyContent, adminUpdateStudyContent, adminDeleteStudyContent } from '@/lib/api';

const CONTENT_TYPES = [
  { key: 'quiz_question', label: 'Quiz Question' },
  { key: 'study_note', label: 'Study Note' },
  { key: 'past_paper', label: 'Past Paper' },
];

const CATEGORIES = [
  'Constitutional', 'Criminal', 'Civil', 'Family', 'Property',
  'Contract', 'Evidence', 'Labour', 'Cyber', 'Islamic',
  'International', 'Administrative', 'Jurisprudence', 'General',
];

const EXAM_TYPES = [
  { key: '', label: 'All Exams' },
  { key: 'llb', label: 'LLB' },
  { key: 'bar', label: 'Bar Council' },
  { key: 'lat', label: 'LAT' },
  { key: 'gat_general', label: 'GAT General' },
  { key: 'gat_law', label: 'GAT Law' },
  { key: 'css_law', label: 'CSS Law' },
  { key: 'pms_law', label: 'PMS Law' },
  { key: 'judiciary', label: 'Judiciary' },
  { key: 'nts_law', label: 'NTS Lecturer' },
  { key: 'llm', label: 'LLM Entrance' },
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm flex items-center gap-3 ${
      type === 'success' ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-200' : 'bg-red-900/90 border-red-500/40 text-red-200'
    }`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/50 hover:text-white">&times;</button>
    </div>
  );
}

export default function StudyContentPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formType, setFormType] = useState('quiz_question');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Constitutional');
  const [formExamType, setFormExamType] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('medium');
  const [formContent, setFormContent] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') { router.replace('/dashboard'); return; }
    setAuthorized(true);
  }, [router]);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetStudyContent({
        content_type: filterType || undefined,
        category: filterCategory || undefined,
        limit: 50,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load', type: 'error' });
    }
    setLoading(false);
  }, [filterType, filterCategory]);

  useEffect(() => { if (authorized) loadContent(); }, [authorized, loadContent]);

  const resetForm = () => {
    setEditingId(null);
    setFormType('quiz_question');
    setFormTitle('');
    setFormCategory('Constitutional');
    setFormExamType('');
    setFormDifficulty('medium');
    setFormContent('');
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setFormExplanation('');
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return setToast({ message: 'Title is required', type: 'error' });

    const payload: any = {
      content_type: formType,
      title: formTitle,
      category: formCategory,
      exam_type: formExamType || null,
      difficulty: formDifficulty || null,
    };

    if (formType === 'quiz_question') {
      if (!formQuestion.trim()) return setToast({ message: 'Question text is required', type: 'error' });
      if (formOptions.some(o => !o.trim())) return setToast({ message: 'All options are required', type: 'error' });
      payload.question_data = {
        question: formQuestion,
        options: formOptions,
        correct: formCorrect,
        explanation: formExplanation,
      };
    } else {
      if (!formContent.trim()) return setToast({ message: 'Content is required', type: 'error' });
      payload.content = formContent;
    }

    try {
      if (editingId) {
        await adminUpdateStudyContent(editingId, payload);
        setToast({ message: 'Content updated', type: 'success' });
      } else {
        await adminCreateStudyContent(payload);
        setToast({ message: 'Content created', type: 'success' });
      }
      resetForm();
      setShowForm(false);
      loadContent();
    } catch (err: any) {
      setToast({ message: err.message || 'Save failed', type: 'error' });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormType(item.content_type);
    setFormTitle(item.title);
    setFormCategory(item.category || 'General');
    setFormExamType(item.exam_type || '');
    setFormDifficulty(item.difficulty || 'medium');
    setFormContent(item.content || '');
    if (item.question_data) {
      setFormQuestion(item.question_data.question || '');
      setFormOptions(item.question_data.options || ['', '', '', '']);
      setFormCorrect(item.question_data.correct || 0);
      setFormExplanation(item.question_data.explanation || '');
    }
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this content?')) return;
    try {
      await adminDeleteStudyContent(id);
      setToast({ message: 'Deleted', type: 'success' });
      loadContent();
    } catch (err: any) {
      setToast({ message: err.message || 'Delete failed', type: 'error' });
    }
  };

  const handleTogglePublish = async (item: any) => {
    try {
      await adminUpdateStudyContent(item.id, { is_published: !item.is_published });
      loadContent();
    } catch (err: any) {
      setToast({ message: err.message || 'Update failed', type: 'error' });
    }
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-brass-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              Study Content
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage quiz questions, study notes, and past papers</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{total} items</span>
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm font-medium">
              + Add Content
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="court-panel p-3 mb-6 flex flex-wrap gap-2">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
            <option value="">All Types</option>
            {CONTENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="court-panel p-12 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="court-panel p-12 text-center text-gray-500">
            <p>No content yet. Click &quot;Add Content&quot; to create quiz questions, notes, or past papers.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className={`court-panel p-4 flex items-center gap-4 ${!item.is_published ? 'opacity-60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.content_type === 'quiz_question' ? 'bg-purple-400/10 text-purple-400' :
                      item.content_type === 'study_note' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-orange-400/10 text-orange-400'
                    }`}>
                      {CONTENT_TYPES.find(t => t.key === item.content_type)?.label || item.content_type}
                    </span>
                    <span className="text-[10px] text-gray-500">{item.category}</span>
                    {item.exam_type && <span className="text-[10px] text-brass-400">{item.exam_type}</span>}
                    {item.difficulty && <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      item.difficulty === 'easy' ? 'bg-emerald-400/10 text-emerald-400' :
                      item.difficulty === 'medium' ? 'bg-amber-400/10 text-amber-400' :
                      'bg-red-400/10 text-red-400'
                    }`}>{item.difficulty}</span>}
                    {!item.is_published && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-500">Draft</span>}
                  </div>
                  <p className="text-sm text-white truncate">{item.title}</p>
                  {item.question_data?.question && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.question_data.question}</p>
                  )}
                  {item.content && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.content}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleTogglePublish(item)}
                    className={`text-[10px] px-2 py-1 rounded ${item.is_published ? 'text-gray-400 hover:text-amber-400' : 'text-emerald-400 hover:text-emerald-300'}`}>
                    {item.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleEdit(item)} className="text-[10px] px-2 py-1 rounded text-brass-400 hover:text-brass-300">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-[10px] px-2 py-1 rounded text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
            <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Content' : 'Add Content'}</h2>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-white text-xl">&times;</button>
              </div>

              <div className="space-y-4">
                {/* Content Type */}
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Content Type</label>
                  <div className="flex gap-2">
                    {CONTENT_TYPES.map(t => (
                      <button key={t.key} onClick={() => setFormType(t.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${formType === t.key ? 'bg-brass-400/20 text-brass-300 border border-brass-400/30' : 'bg-white/[0.03] text-gray-400 border border-transparent'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Title</label>
                  <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    placeholder={formType === 'quiz_question' ? 'E.g., Bail Provisions MCQ' : 'E.g., Constitutional Law Notes'}
                    className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2 text-gray-200 text-sm focus:outline-none focus:border-brass-400/30" />
                </div>

                {/* Category + Exam Type + Difficulty */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Category</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Exam Type</label>
                    <select value={formExamType} onChange={e => setFormExamType(e.target.value)}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
                      {EXAM_TYPES.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Difficulty</label>
                    <select value={formDifficulty} onChange={e => setFormDifficulty(e.target.value)}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none">
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Quiz Question Fields */}
                {formType === 'quiz_question' && (
                  <>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Question</label>
                      <textarea value={formQuestion} onChange={e => setFormQuestion(e.target.value)} rows={2}
                        placeholder="Enter the question text..."
                        className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2 text-gray-200 text-sm focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Options (select correct answer)</label>
                      <div className="space-y-2">
                        {formOptions.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <button onClick={() => setFormCorrect(i)}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                formCorrect === i ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-gray-600 text-gray-500'
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </button>
                            <input value={opt} onChange={e => { const n = [...formOptions]; n[i] = e.target.value; setFormOptions(n); }}
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                              className="flex-1 bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-1.5 text-gray-200 text-sm focus:outline-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Explanation</label>
                      <textarea value={formExplanation} onChange={e => setFormExplanation(e.target.value)} rows={2}
                        placeholder="Explain why the correct answer is right..."
                        className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2 text-gray-200 text-sm focus:outline-none resize-none" />
                    </div>
                  </>
                )}

                {/* Note / Past Paper Content */}
                {formType !== 'quiz_question' && (
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Content</label>
                    <textarea value={formContent} onChange={e => setFormContent(e.target.value)} rows={10}
                      placeholder={formType === 'study_note' ? 'Write study notes here...' : 'Paste past paper questions and answers here...'}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2 text-gray-200 text-sm focus:outline-none resize-none font-mono" />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave}
                    className="flex-1 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm font-medium">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button onClick={() => { setShowForm(false); resetForm(); }}
                    className="px-6 py-2.5 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
