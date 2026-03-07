'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';
import { forgotPassword, resetPassword } from '@/lib/api';
import FloatingSymbols from '@/components/FloatingSymbols';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await forgotPassword(email);
      setMessage(data.message || 'If the email exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await resetPassword(token!, newPassword);
      setMessage(data.message || 'Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 noise flex flex-col relative overflow-hidden">
      <Navbar />
      <FloatingSymbols count={6} />

      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="court-panel p-5 sm:p-8">
            <div className="text-center mb-8">
              <Logo size={48} className="mx-auto mb-3" />
              <h1 className="text-2xl font-display font-bold text-white">
                {token ? 'Set New Password' : 'Reset Password'}
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

            {message && (
              <div className="glass p-3 mb-4 !border-emerald-500/30 !bg-emerald-500/10">
                <p className="text-emerald-300 text-sm">{message}</p>
              </div>
            )}

            {token ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">New Password</label>
                  <input type="password" className="input-field !border-brass-400/10 focus:!border-brass-400/30"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <input type="password" className="input-field !border-brass-400/10 focus:!border-brass-400/30"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className="btn-gavel w-full !py-3.5" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-brass-400/50 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input type="email" className="input-field !border-brass-400/10 focus:!border-brass-400/30"
                    value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
                </div>
                <button type="submit" className="btn-gavel w-full !py-3.5" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="my-4" />
            <p className="text-center text-sm text-gray-500">
              Remember your password?{' '}
              <button onClick={() => router.push('/login')} className="text-brass-400 font-medium hover:text-brass-300 transition-colors">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
