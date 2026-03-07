'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tvl_annotations';

interface Annotation {
  id: string;
  caseId: number;
  text: string;
  note: string;
  color: string;
  createdAt: number;
}

const HIGHLIGHT_COLORS = [
  { value: 'bg-yellow-500/20 border-yellow-500/40', label: 'Yellow', dot: 'bg-yellow-400' },
  { value: 'bg-emerald-500/20 border-emerald-500/40', label: 'Green', dot: 'bg-emerald-400' },
  { value: 'bg-blue-500/20 border-blue-500/40', label: 'Blue', dot: 'bg-blue-400' },
  { value: 'bg-red-500/20 border-red-500/40', label: 'Red', dot: 'bg-red-400' },
  { value: 'bg-purple-500/20 border-purple-500/40', label: 'Purple', dot: 'bg-purple-400' },
];

export function useAnnotations(caseId: number) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all: Annotation[] = JSON.parse(stored);
        setAnnotations(all.filter(a => a.caseId === caseId));
      }
    } catch {}
  }, [caseId]);

  const saveAll = useCallback((updated: Annotation[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const all: Annotation[] = stored ? JSON.parse(stored) : [];
      const others = all.filter(a => a.caseId !== caseId);
      const next = [...others, ...updated];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setAnnotations(updated);
    } catch {}
  }, [caseId]);

  const addAnnotation = useCallback((text: string, note: string, color: string) => {
    const ann: Annotation = {
      id: `ann_${Date.now()}`,
      caseId,
      text,
      note,
      color,
      createdAt: Date.now(),
    };
    saveAll([...annotations, ann]);
  }, [annotations, caseId, saveAll]);

  const removeAnnotation = useCallback((id: string) => {
    saveAll(annotations.filter(a => a.id !== id));
  }, [annotations, saveAll]);

  const updateAnnotation = useCallback((id: string, note: string) => {
    saveAll(annotations.map(a => a.id === id ? { ...a, note } : a));
  }, [annotations, saveAll]);

  return { annotations, addAnnotation, removeAnnotation, updateAnnotation };
}

export function AnnotationPanel({
  caseId,
  annotations,
  onAdd,
  onRemove,
  onUpdate,
}: {
  caseId: number;
  annotations: Annotation[];
  onAdd: (text: string, note: string, color: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, note: string) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newColor, setNewColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd(newText, newNote, newColor);
    setNewText('');
    setNewNote('');
    setNewColor(HIGHLIGHT_COLORS[0].value);
    setShowAddForm(false);
  };

  return (
    <div className="court-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-brass-300 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Annotations
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs text-brass-400/60 hover:text-brass-300 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Note
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-white/[0.02] rounded-xl border border-brass-400/10 space-y-3">
          <div>
            <label className="block text-xs text-brass-400/50 mb-1">Highlighted Text / Reference</label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="input-field !py-2 !text-sm resize-none"
              rows={2}
              placeholder="Paste or type the text you want to annotate..."
            />
          </div>
          <div>
            <label className="block text-xs text-brass-400/50 mb-1">Your Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="input-field !py-2 !text-sm resize-none"
              rows={2}
              placeholder="Add your analysis or note..."
            />
          </div>
          <div>
            <label className="block text-xs text-brass-400/50 mb-1">Color</label>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setNewColor(c.value)}
                  className={`w-6 h-6 rounded-full ${c.dot} transition-all ${newColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-950 scale-110' : 'opacity-50 hover:opacity-80'}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddForm(false)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5">Cancel</button>
            <button onClick={handleAdd} className="btn-primary !py-1.5 !px-4 text-xs">Save Annotation</button>
          </div>
        </div>
      )}

      {annotations.length > 0 ? (
        <div className="space-y-3">
          {annotations.map(a => (
            <div key={a.id} className={`p-3 rounded-lg border ${a.color} group`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white/80 italic leading-relaxed">&ldquo;{a.text}&rdquo;</p>
                <button
                  onClick={() => onRemove(a.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {editingId === a.id ? (
                <textarea
                  defaultValue={a.note}
                  className="input-field !py-1.5 !text-xs mt-2 resize-none w-full"
                  rows={2}
                  autoFocus
                  onBlur={(e) => { onUpdate(a.id, e.target.value); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.target as HTMLTextAreaElement).blur(); } }}
                />
              ) : a.note ? (
                <p
                  className="text-xs text-gray-400 mt-2 cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => setEditingId(a.id)}
                >
                  {a.note}
                </p>
              ) : (
                <button
                  onClick={() => setEditingId(a.id)}
                  className="text-xs text-gray-600 hover:text-brass-300 mt-2 transition-colors"
                >
                  + Add note
                </button>
              )}
              <p className="text-[10px] text-gray-600 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : !showAddForm ? (
        <p className="text-sm text-gray-600 text-center py-4">No annotations yet. Click &ldquo;Add Note&rdquo; to start.</p>
      ) : null}
    </div>
  );
}
