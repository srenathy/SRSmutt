import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@temple/shared';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Lock, User, AlertCircle, ArrowRight, Sparkles, ChevronLeft, CheckCircle2, Clock, FileText } from 'lucide-react';
import { MandalaPattern, DiyaIcon } from '../components/home/SpiritualDecorations';

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
    <div className="min-h-screen bg-[#FAF6EE] relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-10 selection:bg-[#C99A3D] selection:text-white">
      {/* Background Spiritual Mandala Motifs */}
      <div className="absolute -top-36 -left-36 pointer-events-none">
        <MandalaPattern size={550} opacity={0.04} />
      </div>
      <div className="absolute -bottom-36 -right-36 pointer-events-none">
        <MandalaPattern size={550} opacity={0.04} />
      </div>

      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between relative z-10 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8C2F22] hover:text-[#6E2217] transition-all px-3 py-1.5 rounded-xl bg-white/70 border border-turmeric/20 shadow-2xs hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Sannidhana Website</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#63534B]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Devotee Portal Online</span>
        </div>
      </div>

      {/* Main 2-Column Portal Card */}
      <div className="max-w-5xl w-full mx-auto my-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-3xl shadow-xl border border-[#C99A3D]/40 overflow-hidden">
        {/* Left Column: Sacred Sannidhana Visual & Benefits (Hero Panel) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#6E2217] via-[#8C2F22] to-[#A63C2E] p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative inner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C99A3D]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Header Emblem */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#C99A3D]/50 flex items-center justify-center font-display text-2xl font-bold shadow-md shrink-0">
                🕉️
              </div>
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-white leading-tight">
                  Mulabagala Sri Sripadaraja Matha
                </h1>
                <p className="text-xs text-[#EFE3CE] font-medium">
                  Sri Raghavendra Swamy Brindavana Sannidhana — Rajajinagar
                </p>
              </div>
            </div>

            {/* Sacred Shloka Card */}
            <div className="bg-black/25 rounded-2xl p-4 border border-[#C99A3D]/30 space-y-1">
              <p className="font-display text-xs sm:text-sm text-[#FCD34D] font-bold tracking-wide">
                ॥ ಪೂಜ್ಯಾಯ ರಾಘವೇಂದ್ರಾಯ ಸತ್ಯಧರ್ಮ ರತಾಯ ಚ । ಭಜತಾಂ ಕಲ್ಪವೃಕ್ಷಾಯ ನಮತಾಂ ಕಾಮಧೇನವೇ ॥
              </p>
              <p className="text-[10px] text-[#EFE3CE]/80 font-serif">
                Daily Archana, Abhisheka, Hastodaka &amp; Phala Mantrakshate
              </p>
            </div>

            {/* Devotee Portal Benefits List */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#FCD34D] font-sans">
                Devotee Portal Features:
              </h2>
              <ul className="space-y-2.5 text-xs text-[#EFE3CE]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
                  <span><strong>Instant E-Receipts:</strong> View &amp; download PDF receipts for all seva bookings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
                  <span><strong>Sankalpa Records:</strong> Registered Gotra, Nakshatra &amp; Rashi for seva archana.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
                  <span><strong>Festival &amp; Aradhana Updates:</strong> Direct notices for annual Utsavas.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
                  <span><strong>Pooja &amp; Darshan Schedules:</strong> Real-time darshan, aarthi &amp; seva timings.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Timings Ribbon */}
          <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-[#EFE3CE]/90 relative z-10">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FCD34D]" />
              <span>Darshan: 7:00 AM – 12:30 PM &amp; 5:30 PM – 8:30 PM</span>
            </span>
          </div>
        </div>

        {/* Right Column: Portal Login Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C2F22] bg-[#8C2F22]/10 px-2.5 py-1 rounded-md font-mono">
                SECURE AUTHENTICATION
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C221E] mt-2">
                Sign In to Portal
              </h2>
              <p className="text-xs text-[#5C4D44] mt-1">
                Enter your registered mobile number or username to access your devotee account or administrative dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A3B32] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8C2F22]" />
                  Username or Mobile Number
                </label>
                <input
                  type="text"
                  {...register('username')}
                  placeholder="e.g. 9876543210 or admin"
                  className="w-full px-4 py-3 bg-[#FAF6EE]/60 border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C2F22]/20 text-[#2C221E]"
                />
                {errors.username && (
                  <p className="text-xs text-red-600 font-medium">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A3B32] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8C2F22]" />
                  Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#FAF6EE]/60 border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C2F22]/20 text-[#2C221E]"
                />
                {errors.password && (
                  <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
                )}
                <p className="text-[11px] text-[#7A6B63] italic">
                  Note: For first-time login, your password is your registered 10-digit mobile number.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#8C2F22] hover:bg-[#6E2217] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Sign In to System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Devotee Registration Link Box */}
          <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-turmeric/30 text-center text-xs text-[#5C4D44] space-y-1">
            <p className="font-semibold text-[#2C221E]">New Devotee to the Sannidhana?</p>
            <p>
              Register your family profile with Gotra &amp; Nakshatra to view receipts online.{' '}
              <Link to="/devotee-register" className="font-bold text-[#8C2F22] hover:underline block sm:inline mt-1 sm:mt-0">
                Register as Devotee →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="max-w-6xl w-full mx-auto text-center text-[11px] text-[#7A6B63] pt-4 relative z-10">
        © {new Date().getFullYear()} Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch, Bengaluru. All rights reserved.
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
