'use client';

import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  showToast: (message: string, type?: ToastType) => void;
}

const noop = () => {};
const ToastContext = createContext<ToastContextType>({ toast: noop, showToast: noop });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons: Record<ToastType, string> = {
    success: 'M4.5 12.75l6 6 9-13.5',
    error: 'M6 18L18 6M6 6l12 12',
    info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  };

  const colors: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    info: 'border-brass-400/30 bg-brass-400/10 text-brass-300',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, showToast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg animate-slide-up ${colors[t.type]}`}
            style={{ minWidth: '280px' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[t.type]} />
            </svg>
            <span className="text-sm flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-white/40 hover:text-white/80 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
