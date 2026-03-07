'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount, isLoggedIn } from '@/lib/api';
import { useSocket } from '@/lib/socket';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { on, connected } = useSocket();

  useEffect(() => { setMounted(true); }, []);

  // Fetch initial count + fallback polling (longer interval when socket is connected)
  useEffect(() => {
    if (!mounted || !isLoggedIn()) return;

    const fetchCount = async () => {
      try {
        const data = await getUnreadNotificationCount();
        setUnreadCount(data.unread_count);
      } catch {
        // ignore
      }
    };

    fetchCount();
    // Poll less frequently when socket is connected (120s vs 30s)
    const interval = setInterval(fetchCount, connected ? 120000 : 30000);
    return () => clearInterval(interval);
  }, [mounted, connected]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (!mounted || !isLoggedIn()) return;

    const unsub1 = on('new_notification', (notif: any) => {
      setUnreadCount(prev => prev + 1);
      // If dropdown is open, prepend the new notification
      setNotifications(prev => prev.length > 0 ? [notif, ...prev] : prev);
    });

    const unsub2 = on('unread_count', (data: { unread_count: number }) => {
      setUnreadCount(data.unread_count);
    });

    return () => { unsub1(); unsub2(); };
  }, [mounted, on]);

  useEffect(() => {
    if (!open || !isLoggedIn()) return;
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications({ limit: 10 });
        setNotifications(data.items || data.notifications || data);
      } catch {
        // ignore
      }
    };
    fetchNotifications();
  }, [open]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!mounted || !isLoggedIn()) return null;

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto court-panel shadow-2xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-[10px] text-brass-400 hover:text-brass-300">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
          ) : (
            <div>
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-brass-400/5' : ''
                  }`}
                  onClick={() => { if (!n.is_read) handleMarkRead(n.id); }}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="w-2 h-2 mt-1.5 rounded-full bg-brass-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{n.title}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{n.created_at ? timeAgo(n.created_at) : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/notifications"
            className="block p-3 text-center text-xs text-brass-400 hover:text-brass-300 border-t border-white/10"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
