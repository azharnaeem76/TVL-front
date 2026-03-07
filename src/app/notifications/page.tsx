'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn, getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!mounted || !isLoggedIn()) return;
    setLoading(true);
    getNotifications({ limit: 50 })
      .then(data => setNotifications(data.notifications || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  if (!mounted) return null;

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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="px-4 sm:px-6 pt-24 pb-16 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-sm text-brass-400 hover:text-brass-300">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="court-panel p-12 text-center">
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`court-panel p-4 cursor-pointer hover:border-brass-400/20 transition-colors ${
                  !n.is_read ? 'border-brass-400/10 bg-brass-400/[0.03]' : ''
                }`}
                onClick={() => {
                  if (!n.is_read) handleMarkRead(n.id);
                  if (n.link) router.push(n.link);
                }}
              >
                <div className="flex items-start gap-3">
                  {!n.is_read && <span className="w-2 h-2 mt-2 rounded-full bg-brass-400 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-medium ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>{n.title}</h3>
                      <span className="text-[10px] text-gray-600 whitespace-nowrap">{n.created_at ? timeAgo(n.created_at) : ''}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{n.message}</p>
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
