import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@temple/shared';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Lock, User, AlertCircle, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';
import { MandalaPattern, LotusIcon } from '../components/home/SpiritualDecorations';

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
    <div className="min-h-screen bg-[#FAF6EE] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 selection:bg-[#C99A3D] selection:text-white">
      {/* Background Spiritual Mandala Motifs */}
      <div className="absolute -top-32 -left-32 pointer-events-none">
        <MandalaPattern size={500} opacity={0.035} />
      </div>
      <div className="absolute -bottom-32 -right-32 pointer-events-none">
        <MandalaPattern size={500} opacity={0.035} />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Back to Public Home Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C2F22] hover:text-[#6E2217] transition-colors px-2 py-1 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Temple Home</span>
        </Link>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#C99A3D]/40">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#6E2217] via-[#8C2F22] to-[#A63C2E] p-8 text-center text-white relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 border border-[#C99A3D]/50 flex items-center justify-center font-display text-3xl mb-3 shadow-md">
              🕉️
            </div>
            <h2 className="font-display text-2xl font-bold tracking-wide">Portal Login</h2>
            <p className="text-xs text-[#EFE3CE] mt-1 font-medium">
              Mulabagala Sri Sripadaraja Matha — Rajajinagar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A3B32] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8C2F22]" />
                Username / Phone Number
              </label>
              <input
                type="text"
                {...register('username')}
                placeholder="Username or 10-digit Mobile Number"
                className="w-full px-4 py-3 bg-[#FAF6EE]/50 border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C2F22]/20 text-[#2C221E]"
              />
              {errors.username && (
                <p className="text-xs text-red-600 font-medium">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A3B32] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8C2F22]" />
                Password (Mobile Number for 1st time)
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#FAF6EE]/50 border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C2F22]/20 text-[#2C221E]"
              />
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#8C2F22] hover:bg-[#6E2217] text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Devotee Registration Link */}
          <div className="p-4 bg-[#FAF6EE] border-t border-turmeric/20 text-center text-xs text-[#5C4D44]">
            <span>Don&apos;t have an account? </span>
            <Link to="/devotee-register" className="font-bold text-[#8C2F22] hover:underline">
              Register as Devotee →
            </Link>
          </div>
        </div>
      </div>

      {/* First Time Devotee Password Setup Modal */}
      {firstTimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-turmeric/40 max-w-md w-full p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-amber-300">
                🔒
              </div>
              <h3 className="font-display text-2xl font-bold text-[#8C2F22]">
                First-Time Account Setup
              </h3>
              <p className="text-xs text-[#5C4D44] leading-relaxed">
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
                <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Devotee Username / Phone</label>
                <input
                  type="text"
                  value={firstTimeUsername}
                  disabled
                  className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-turmeric/30 rounded-xl text-sm text-[#7A6B63] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B32] mb-1">New Personal Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 bg-white border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C2F22]/20 text-[#2C221E] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 bg-white border border-turmeric/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C2F22]/20 text-[#2C221E] font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3.5 bg-[#8C2F22] hover:bg-[#6E2217] text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
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
