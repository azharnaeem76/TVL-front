'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import { login, register, googleLogin } from '@/lib/api';
import { ScalesOfJustice } from '@/components/CourtElements';
import FloatingSymbols from '@/components/FloatingSymbols';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'client',
    phone: '',
    city: '',
    preferred_language: 'en',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      // Use Google Identity Services popup
      const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scope: 'email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            try {
              await googleLogin(response.access_token, form.role);
              router.push('/dashboard');
              router.refresh();
            } catch (err: any) {
              setError(err.message || 'Google login failed');
            }
          }
          setGoogleLoading(false);
        },
      });
      if (client) {
        client.requestAccessToken();
      } else {
        setError('Google Sign-In is not configured');
        setGoogleLoading(false);
      }
    } catch {
      setError('Google Sign-In is not available');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 noise flex flex-col relative overflow-hidden">
      <Navbar />
      <FloatingSymbols count={8} />

      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="court-panel p-5 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Logo size={48} className="mx-auto mb-3" />
              <h1 className="text-2xl font-display font-bold text-white">
                {isRegister ? 'Create Account' : 'Sign In'}
              </h1>
              <p className="text-brass-400/50 text-xs italic font-serif mt-1">
                &ldquo;According to Spirit Of Law&rdquo;
              </p>
            </div>

            {error && (
              <div className="glass p-3 mb-4 !border-red-500/30 !bg-red-500/10">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {!isRegister && (
              <div className="glass p-3 mb-4 !border-brass-400/20 !bg-brass-400/5">
                <p className="text-brass-300 text-sm">
                  Demo: <strong>lawyer@tvl.pk</strong> / <strong>demo123</strong>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input type="text" className="input-field !border-brass-400/10 focus:!border-brass-400/30"
                      value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">Role</label>
                    <select className="input-field !border-brass-400/10" value={form.role} onChange={(e) => update('role', e.target.value)}>
                      <option value="client">Litigant / Client</option>
                      <option value="lawyer">Advocate</option>
                      <option value="law_student">Law Student</option>
                      <option value="paralegal">Legal Professional</option>
                      <option value="judge">Judge</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">City</label>
                      <input type="text" className="input-field !border-brass-400/10"
                        value={form.city} onChange={(e) => update('city', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">Language</label>
                      <select className="input-field !border-brass-400/10" value={form.preferred_language} onChange={(e) => update('preferred_language', e.target.value)}>
                        <option value="en">English</option>
                        <option value="ur">Urdu</option>
                        <option value="roman_ur">Roman Urdu</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" className="input-field !border-brass-400/10 focus:!border-brass-400/30"
                  value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">Password</label>
                <input type="password" className="input-field !border-brass-400/10 focus:!border-brass-400/30"
                  value={form.password} onChange={(e) => update('password', e.target.value)} required />
              </div>

              <button type="submit" className="btn-gavel w-full !py-3.5" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Please wait...
                  </span>
                ) : isRegister ? 'Register' : 'Sign In'}
              </button>
            </form>

            <div className="divider-ornate my-6" />

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-brass-400/20 bg-white/5 hover:bg-white/10 transition-colors text-white font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Connecting...' : `Continue with Google`}
            </button>

            <div className="my-4" />

            <p className="text-center text-sm text-gray-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-brass-400 font-medium hover:text-brass-300 transition-colors"
              >
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
