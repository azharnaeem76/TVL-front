'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import {
  getCurrentUser, isLoggedIn,
  getForumPosts, createForumPost, deleteForumPost,
  getForumReplies, createForumReply, deleteForumReply,
  toggleForumPostLike, toggleForumReplyLike,
} from '@/lib/api';

const CATEGORIES = [
  { value: 'general', label: 'General Discussion' },
  { value: 'case_discussion', label: 'Case Discussion' },
  { value: 'legal_help', label: 'Legal Help' },
  { value: 'career', label: 'Career & Jobs' },
  { value: 'news', label: 'Legal News' },
];

const ROLE_LABELS: Record<string, string> = {
  lawyer: 'Advocate', judge: 'Judge', paralegal: 'Paralegal',
  law_student: 'Student', client: 'Member', admin: 'Admin', support: 'Staff',
};

export default function ForumPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  // New post
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [posting, setPosting] = useState(false);

  // Active post / replies
  const [activePost, setActivePost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    setUser(getCurrentUser());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (user) loadPosts(); }, [user, activeCategory]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 30 };
      if (activeCategory) params.category = activeCategory;
      if (search.trim()) params.search = search.trim();
      const data = await getForumPosts(params);
      setPosts(data.items || []);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setPosting(true);
    try {
      const post = await createForumPost({ title: newTitle.trim(), content: newContent.trim(), category: newCategory });
      setPosts(prev => [post, ...prev]);
      setShowNewPost(false);
      setNewTitle(''); setNewContent(''); setNewCategory('general');
      showToast('Post created!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to post', 'error');
    }
    setPosting(false);
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Delete this post?')) return;
    try {
      await deleteForumPost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (activePost?.id === postId) setActivePost(null);
      showToast('Post deleted', 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const res = await toggleForumPostLike(postId);
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p, user_liked: res.liked, like_count: res.liked ? p.like_count + 1 : p.like_count - 1
      } : p));
      if (activePost?.id === postId) {
        setActivePost((prev: any) => prev ? {
          ...prev, user_liked: res.liked, like_count: res.liked ? prev.like_count + 1 : prev.like_count - 1
        } : prev);
      }
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const openPost = async (post: any) => {
    setActivePost(post);
    try {
      const data = await getForumReplies(post.id);
      setReplies(Array.isArray(data) ? data : []);
    } catch { setReplies([]); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activePost) return;
    setReplying(true);
    try {
      const reply = await createForumReply(activePost.id, replyText.trim());
      setReplies(prev => [...prev, reply]);
      setReplyText('');
      setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, reply_count: p.reply_count + 1 } : p));
    } catch (err: any) {
      showToast(err.message || 'Failed to reply', 'error');
    }
    setReplying(false);
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      await deleteForumReply(replyId);
      setReplies(prev => prev.filter(r => r.id !== replyId));
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const handleLikeReply = async (replyId: number) => {
    try {
      const res = await toggleForumReplyLike(replyId);
      setReplies(prev => prev.map(r => r.id === replyId ? {
        ...r, user_liked: res.liked, like_count: res.liked ? r.like_count + 1 : r.like_count - 1
      } : r));
    } catch (err: any) { showToast(err.message, 'error'); }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Community Forum</h1>
            <p className="text-gray-400 text-sm mt-1">Discuss legal topics with the community</p>
          </div>
          <button onClick={() => setShowNewPost(true)} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm flex-shrink-0">
            New Post
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          <button onClick={() => setActiveCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${!activeCategory ? 'bg-brass-400/20 text-brass-300' : 'bg-white/[0.04] text-gray-400 hover:text-brass-300'}`}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setActiveCategory(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${activeCategory === c.value ? 'bg-brass-400/20 text-brass-300' : 'bg-white/[0.04] text-gray-400 hover:text-brass-300'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadPosts()}
            placeholder="Search posts..."
            className="w-full bg-white/[0.03] border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brass-400/30 text-sm"
          />
        </div>

        <div className="flex gap-6">
          {/* Posts list */}
          <div className={`${activePost ? 'hidden lg:block lg:w-2/5' : 'w-full'} space-y-3`}>
            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="court-panel p-12 text-center">
                <p className="text-gray-500">No posts yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              posts.map(p => (
                <div key={p.id} onClick={() => openPost(p)}
                  className={`court-panel p-4 cursor-pointer hover:border-brass-400/20 transition-colors ${activePost?.id === p.id ? 'border-brass-400/20' : ''}`}>
                  {p.is_pinned && <span className="text-[10px] text-brass-400 uppercase tracking-wider font-semibold">Pinned</span>}
                  <h3 className="text-sm font-medium text-white mt-1">{p.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center text-[8px] font-bold text-white">
                        {p.author?.name?.charAt(0) || '?'}
                      </span>
                      {p.author?.name}
                      <span className="text-brass-400/50 capitalize">{ROLE_LABELS[p.author?.role] || ''}</span>
                    </span>
                    <span>{timeAgo(p.created_at)}</span>
                    <span className="flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {p.reply_count}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <svg className={`w-3 h-3 ${p.user_liked ? 'text-red-400 fill-red-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      {p.like_count}
                    </span>
                    <span className="bg-white/[0.06] px-1.5 py-0.5 rounded text-[9px] capitalize">{p.category?.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Post detail + replies */}
          {activePost && (
            <div className="flex-1 lg:w-3/5">
              <button onClick={() => setActivePost(null)} className="lg:hidden text-brass-400 text-sm mb-3 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>

              <div className="court-panel p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-gray-400 capitalize">{activePost.category?.replace('_', ' ')}</span>
                    <h2 className="text-lg font-medium text-white mt-2">{activePost.title}</h2>
                  </div>
                  {(activePost.author?.id === user.id || user.role === 'admin') && (
                    <button onClick={() => handleDeletePost(activePost.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete post">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center text-[10px] font-bold text-white">
                    {activePost.author?.name?.charAt(0) || '?'}
                  </span>
                  <span className="text-gray-300">{activePost.author?.name}</span>
                  <span className="text-brass-400/50 capitalize">{ROLE_LABELS[activePost.author?.role] || ''}</span>
                  <span>{timeAgo(activePost.created_at)}</span>
                </div>

                <div className="mt-4 text-sm text-gray-300 whitespace-pre-wrap">{activePost.content}</div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.06]">
                  <button onClick={() => handleLikePost(activePost.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${activePost.user_liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
                    <svg className={`w-4 h-4 ${activePost.user_liked ? 'fill-red-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {activePost.like_count} {activePost.like_count === 1 ? 'Like' : 'Likes'}
                  </button>
                  <span className="text-xs text-gray-500">{activePost.reply_count} {activePost.reply_count === 1 ? 'Reply' : 'Replies'}</span>
                </div>
              </div>

              {/* Replies */}
              <div className="mt-4 space-y-3">
                {replies.map(r => (
                  <div key={r.id} className="court-panel p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center text-[8px] font-bold text-white">
                          {r.author?.name?.charAt(0) || '?'}
                        </span>
                        <span className="text-gray-300">{r.author?.name}</span>
                        <span className="text-brass-400/50 capitalize">{ROLE_LABELS[r.author?.role] || ''}</span>
                        <span>{timeAgo(r.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleLikeReply(r.id)}
                          className={`flex items-center gap-0.5 text-[10px] ${r.user_liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
                          <svg className={`w-3 h-3 ${r.user_liked ? 'fill-red-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {r.like_count}
                        </button>
                        {(r.author?.id === user.id || user.role === 'admin') && (
                          <button onClick={() => handleDeleteReply(r.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">{r.content}</p>
                  </div>
                ))}

                {/* Reply input */}
                <div className="court-panel p-4">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    className="w-full bg-navy-950/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brass-400/30 text-sm resize-none"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  />
                  <div className="flex justify-end mt-2">
                    <button onClick={handleReply} disabled={replying || !replyText.trim()}
                      className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 text-sm">
                      {replying ? 'Posting...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Create Post</h2>
                <button onClick={() => setShowNewPost(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
              </div>

              <div className="space-y-3">
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:outline-none">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Post title..."
                  className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm"
                />
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="What would you like to discuss?"
                  rows={5}
                  className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm resize-none"
                />
                <button
                  onClick={handleCreatePost}
                  disabled={posting || !newTitle.trim() || !newContent.trim()}
                  className="w-full py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {posting ? 'Posting...' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
