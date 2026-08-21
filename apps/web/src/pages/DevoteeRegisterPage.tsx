import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { devoteeRegisterSchema, DevoteeRegisterInput } from '@temple/shared';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { VedicAutocomplete } from '../components/VedicAutocomplete.js';
import { useVedicMasters } from '../hooks/useVedicMasters.js';
import { UserCheck, Sparkles, ChevronLeft, ArrowRight, AlertCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { MandalaPattern, DiyaIcon } from '../components/home/SpiritualDecorations.js';

export const DevoteeRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { gotras, nakshatras, rashis } = useVedicMasters();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DevoteeRegisterInput>({
    resolver: zodResolver(devoteeRegisterSchema)
  });

  const gotraVal = watch('gotra') || '';
  const nakshatraVal = watch('nakshatra') || '';
  const rashiVal = watch('rashi') || '';

  const onSubmit = async (data: DevoteeRegisterInput) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await apiClient.post('/devotee-portal/register', data);
      await login({ username: data.username, password: data.password });
      navigate('/devotee/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to register devotee account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#C99A3D] selection:text-white">
      {/* Background Mandala Motifs */}
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
          <span>Free Devotee Registration</span>
        </div>
      </div>

      {/* Main 2-Column Registration Card */}
      <div className="max-w-5xl w-full mx-auto my-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-3xl shadow-xl border border-[#C99A3D]/40 overflow-hidden">
        {/* Left Column: Devotee Benefits & Sacred Lineage Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#6E2217] via-[#8C2F22] to-[#A63C2E] p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#C99A3D]/50 flex items-center justify-center font-display text-2xl font-bold shadow-md shrink-0">
                🕉️
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-white leading-tight">
                  Devotee Membership
                </h1>
                <p className="text-xs text-[#EFE3CE] font-medium">
                  Mulabagala Sri Sripadaraja Matha
                </p>
              </div>
            </div>

            {/* Sacred Shloka */}
            <div className="bg-black/25 rounded-2xl p-4 border border-[#C99A3D]/30 space-y-1">
              <p className="font-display text-xs text-[#FCD34D] font-bold tracking-wide">
                ॥ ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ ಹರಿಃ ಓಂ ॥
              </p>
              <p className="text-[10px] text-[#EFE3CE]/80">
                Join the sacred digital community of Rajajinagar Sannidhana.
              </p>
            </div>

            {/* Why Register? */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                Why Create a Devotee Account?
              </h2>
              <ul className="space-y-2.5 text-xs text-[#EFE3CE]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
                  <span><strong>Automatic Sankalpa:</strong> Pre-filled Gotra, Nakshatra &amp; Rashi for speedy seva bookings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
                  <span><strong>Seva History:</strong> View past receipts, donations &amp; Shashwata Seva records online.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
                  <span><strong>Direct WhatsApp / PDF:</strong> Download authentic digital thermal receipts.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/15 text-[11px] text-[#EFE3CE]/90 flex items-center gap-1.5 relative z-10">
            <ShieldCheck className="w-4 h-4 text-[#FCD34D]" />
            <span>Official Sri Raghavendra Swamy Brindavana Devotee Portal</span>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C2F22] bg-[#8C2F22]/10 px-2.5 py-1 rounded-md font-mono">
                DEVOTEE ENROLLMENT
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2C221E] mt-2">
                Create Devotee Profile
              </h2>
              <p className="text-xs text-[#5C4D44] mt-1">
                Enter your devotee credentials and optional Vedic details.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Username *</label>
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="e.g. srinivas_rao"
                    className="w-full bg-[#FAF6EE]/60 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                  />
                  {errors.username && <p className="text-[10px] text-red-600 mt-1">{errors.username.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Password *</label>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#FAF6EE]/60 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                  />
                  {errors.password && <p className="text-[10px] text-red-600 mt-1">{errors.password.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Full Devotee Name *</label>
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="e.g. Srinivas Rao"
                  className="w-full bg-[#FAF6EE]/60 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                />
                {errors.fullName && <p className="text-[10px] text-red-600 mt-1">{errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Phone Number *</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="10-digit mobile number"
                    className="w-full bg-[#FAF6EE]/60 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                  />
                  {errors.phone && <p className="text-[10px] text-red-600 mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">City / Town</label>
                  <input
                    {...register('city')}
                    type="text"
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-[#FAF6EE]/60 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                  />
                </div>
              </div>

              {/* Vedic Details */}
              <div className="pt-2 border-t border-turmeric/20">
                <span className="text-[11px] font-bold text-[#A67C29] uppercase tracking-wider block mb-2 font-mono">
                  Vedic &amp; Sankalpa Details (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <VedicAutocomplete
                      label="Gotra"
                      placeholder="Search Gotra..."
                      value={gotraVal}
                      onChange={(val) => setValue('gotra', val, { shouldValidate: true })}
                      options={gotras}
                      minChars={3}
                    />
                  </div>

                  <div>
                    <VedicAutocomplete
                      label="Nakshatra"
                      placeholder="Search Nakshatra..."
                      value={nakshatraVal}
                      onChange={(val) => setValue('nakshatra', val, { shouldValidate: true })}
                      options={nakshatras}
                      minChars={3}
                    />
                  </div>

                  <div>
                    <VedicAutocomplete
                      label="Rashi"
                      placeholder="Search Rashi..."
                      value={rashiVal}
                      onChange={(val) => setValue('rashi', val, { shouldValidate: true })}
                      options={rashis}
                      minChars={3}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#8C2F22] hover:bg-[#6E2217] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Complete Devotee Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-[#5C4D44] border-t border-turmeric/20 pt-4 flex items-center justify-between">
            <Link to="/" className="text-[#8C2F22] hover:underline">
              ← Back to Home
            </Link>
            <Link to="/login" className="text-[#8C2F22] hover:underline font-bold">
              Already registered? Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-[11px] text-[#7A6B63] pt-4 relative z-10">
        © {new Date().getFullYear()} Mulabagala Sri Sripadaraja Matha — Rajajinagar Branch, Bengaluru.
      </div>
    </div>
  );
};
