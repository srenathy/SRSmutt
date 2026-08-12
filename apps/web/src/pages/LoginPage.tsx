import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@temple/shared';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // First time login password change state
  const [firstTimeModalOpen, setFirstTimeModalOpen] = useState(false);
  const [firstTimeUsername, setFirstTimeUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setErrorMessage(null);
      const authRes: any = await login(data);
      if (authRes?.isFirstTimeLogin || authRes?.user?.isFirstTimeLogin) {
        setFirstTimeUsername(data.username);
        setFirstTimeModalOpen(true);
      } else {
        if (authRes?.user?.role === 'DEVOTEE') {
          navigate('/devotee/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to authenticate. Please verify your credentials.';
      setErrorMessage(msg);
    }
  };

  const handleSaveFirstTimePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await apiClient.post('/auth/first-time-password', { newPassword });
      setFirstTimeModalOpen(false);
      navigate('/devotee/dashboard');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-light flex items-center justify-center p-6 selection:bg-turmeric selection:text-ink">
      <div className="w-full max-w-md bg-ivory-light rounded-3xl shadow-2xl overflow-hidden border border-turmeric/40">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-kumkum-dark via-kumkum to-kumkum-light p-8 text-center text-ivory">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-turmeric/20 border border-turmeric/40 flex items-center justify-center font-display text-3xl mb-3 shadow-inner">
            🛕
          </div>
          <h2 className="font-display text-2xl font-bold tracking-wide">Portal Login</h2>
          <p className="text-xs text-ivory/80 mt-1">Temple Seva Billing & Devotee System (SRSmutt)</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-textInk/80 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-kumkum" />
              Username / Phone Number
            </label>
            <input
              type="text"
              {...register('username')}
              placeholder="Username or 10-digit Mobile Number"
              className="w-full px-4 py-3 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/60 text-textInk"
            />
            {errors.username && (
              <p className="text-xs text-red-600 font-medium">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-textInk/80 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-kumkum" />
              Password (Mobile Number for 1st time)
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/60 text-textInk"
            />
            {errors.password && (
              <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-kumkum hover:bg-kumkum-light text-ivory font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-6"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
            ) : (
              <>
                Sign In to System
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* First Time Devotee Password Setup Modal */}
      {firstTimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-turmeric/40 max-w-md w-full p-8 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-amber-300">
                🔒
              </div>
              <h3 className="font-display text-2xl font-bold text-kumkum">
                First-Time Account Setup
              </h3>
              <p className="text-xs text-textInk/70 leading-relaxed">
                Welcome to Mulabagala Sri Sripadaraja Matha! For your account security, please create a new personal password to authorize your devotee account.
              </p>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFirstTimePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Devotee Username / Phone</label>
                <input
                  type="text"
                  value={firstTimeUsername}
                  disabled
                  className="w-full px-4 py-2.5 bg-ivory border border-turmeric/30 rounded-xl text-sm text-textInk/60 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">New Personal Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 bg-white border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 text-textInk font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 bg-white border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 text-textInk font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3.5 bg-kumkum hover:bg-kumkum-light text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {changingPassword ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Authorize Account & Save Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
