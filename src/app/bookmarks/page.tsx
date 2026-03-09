'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { GavelSVG } from '@/components/CourtElements';
import { isLoggedIn } from '@/lib/api';
import { useBookmarks, BookmarkButton } from '@/components/Bookmarks';

export default function BookmarksPage() {
  const router = useRouter();
  const { bookmarks, removeBookmark, isBookmarked, updateNote } = useBookmarks();
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  useEffect(() => {
    if (!isLoggedIn()) router.replace('/login');
  }, [router]);

  const filtered = bookmarks
    .filter(b =>
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.citation.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return b.bookmarkedAt - a.bookmarkedAt;
      return a.title.localeCompare(b.title);
    });

  const startEditNote = (id: number, currentNote: string) => {
    setEditingNote(id);
    setNoteText(currentNote || '');
  };

  const saveNote = (id: number) => {
    updateNote(id, noteText);
    setEditingNote(null);
    setNoteText('');
  };

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-brass-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
              Bookmarks
            </h1>
            <p className="text-gray-400 text-sm mt-1">{bookmarks.length} saved case{bookmarks.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input
              className="input-field w-full pl-10"
              placeholder="Search bookmarks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field w-full sm:w-40" value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'title')}>
            <option value="date">Newest First</option>
            <option value="title">By Title</option>
          </select>
        </div>

        {/* Bookmarks List */}
        {filtered.length === 0 ? (
          <div className="court-panel p-12 text-center">
            <GavelSVG size={50} className="mx-auto mb-4 opacity-15" />
            <p className="text-gray-500 mb-2">
              {search ? 'No bookmarks match your search.' : 'No bookmarks yet.'}
            </p>
            <p className="text-gray-600 text-sm">
              Bookmark case laws from search results or the case laws page to save them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.id} className="court-panel p-5 hover:border-brass-400/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-brass-400 font-mono">{b.citation}</span>
                      <span className="text-xs text-gray-600">|</span>
                      <span className="text-xs text-gray-500">{b.court?.replace(/_/g, ' ')}</span>
                      {b.year && <span className="text-xs text-gray-600">({b.year})</span>}
                    </div>
                    <h3
                      className="text-white font-medium cursor-pointer hover:text-brass-300 transition-colors line-clamp-2"
                      onClick={() => router.push(`/case-laws/${b.id}`)}
                    >
                      {b.title}
                    </h3>

                    {/* Note */}
                    {editingNote === b.id ? (
                      <div className="mt-3 flex gap-2">
                        <input
                          className="input-field flex-1 text-sm"
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Add a note..."
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && saveNote(b.id)}
                        />
                        <button onClick={() => saveNote(b.id)} className="px-3 py-1 text-xs text-emerald-400 border border-emerald-400/20 rounded-lg hover:bg-emerald-400/10">Save</button>
                        <button onClick={() => setEditingNote(null)} className="px-3 py-1 text-xs text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2">
                        {b.note ? (
                          <p className="text-xs text-gray-400 italic cursor-pointer hover:text-gray-300" onClick={() => startEditNote(b.id, b.note || '')}>
                            &ldquo;{b.note}&rdquo;
                          </p>
                        ) : (
                          <button onClick={() => startEditNote(b.id, '')} className="text-xs text-gray-600 hover:text-brass-400 transition-colors">
                            + Add note
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-600 mt-2">
                      Saved {new Date(b.bookmarkedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/case-laws/${b.id}`)}
                      className="px-3 py-1.5 text-xs text-brass-400 border border-brass-400/20 rounded-lg hover:bg-brass-400/10 transition-colors"
                    >
                      View
                    </button>
                    <BookmarkButton
                      caseData={b}
                      isBookmarked={isBookmarked(b.id)}
                      onToggle={() => removeBookmark(b.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
