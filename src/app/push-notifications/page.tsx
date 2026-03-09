'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';

export default function PushNotificationsPage() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const { showToast } = useToast();

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Push notifications are not supported in this browser', 'error');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      setEnabled(true);
      showToast('Push notifications enabled', 'success');
    } else if (result === 'denied') {
      showToast('Push notifications blocked. Please enable in browser settings.', 'error');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Push Notifications</h1>
            <p className="text-gray-400 mt-1">Manage browser push notification preferences</p>
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-medium">Browser Notifications</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {permission === 'granted'
                    ? 'Notifications are enabled'
                    : permission === 'denied'
                    ? 'Notifications are blocked in browser settings'
                    : 'Allow notifications to get alerts for hearings, messages, and updates'}
                </p>
              </div>
              <button
                onClick={requestPermission}
                disabled={permission === 'granted'}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  permission === 'granted'
                    ? 'bg-green-500/10 text-green-400 cursor-default'
                    : 'bg-brass-400/20 text-brass-300 hover:bg-brass-400/30'
                }`}
              >
                {permission === 'granted' ? 'Enabled' : 'Enable'}
              </button>
            </div>

            <div className="space-y-4 border-t border-white/[0.06] pt-4">
              <h4 className="text-sm text-gray-400 font-medium">Notification Types</h4>
              {[
                { label: 'Hearing Reminders', desc: 'Get notified before upcoming court hearings', key: 'hearings' },
                { label: 'New Messages', desc: 'Alert when you receive a new message', key: 'messages' },
                { label: 'Case Updates', desc: 'Notify when case status changes', key: 'cases' },
                { label: 'New Judgments', desc: 'Alert when relevant judgments are added', key: 'judgments' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-gray-300 text-sm">{item.label}</p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      disabled={permission !== 'granted'}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brass-400/40 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-disabled:opacity-30"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-4 text-center">
            Push notifications require a modern browser with notification support.
          </p>
        </div>
      </div>
    </>
  );
}
