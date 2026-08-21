import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { devoteeRegisterSchema, DevoteeRegisterInput } from '@temple/shared';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { VedicAutocomplete } from '../components/VedicAutocomplete.js';
import { useVedicMasters } from '../hooks/useVedicMasters.js';
import { UserCheck, Sparkles, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { MandalaPattern } from '../components/home/SpiritualDecorations.js';

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
    <div className="min-h-screen bg-[#FAF6EE] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#C99A3D] selection:text-white">
      {/* Background Mandala Motifs */}
      <div className="absolute -top-32 -left-32 pointer-events-none">
        <MandalaPattern size={500} opacity={0.035} />
      </div>
      <div className="absolute -bottom-32 -right-32 pointer-events-none">
        <MandalaPattern size={500} opacity={0.035} />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C2F22] hover:text-[#6E2217] transition-colors px-2 py-1 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Temple Home</span>
        </Link>

        {/* Card */}
        <div className="w-full bg-white border border-[#C99A3D]/40 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF6EE] border border-turmeric/30 flex items-center justify-center text-2xl mb-3 shadow-xs">
              🕉️
            </div>
            <h2 className="font-display text-[#6B1616] text-2xl font-bold">
              Devotee Registration
            </h2>
            <p className="text-xs text-[#5C4D44] mt-1">
              Create your family Devotee account to view Seva history &amp; receipts
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
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
                  className="w-full bg-[#FAF6EE]/50 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                />
                {errors.username && <p className="text-[10px] text-red-600 mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B32] mb-1">Password *</label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#FAF6EE]/50 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
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
                className="w-full bg-[#FAF6EE]/50 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
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
                  className="w-full bg-[#FAF6EE]/50 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                />
                {errors.phone && <p className="text-[10px] text-red-600 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B32] mb-1">City / Town</label>
                <input
                  {...register('city')}
                  type="text"
                  placeholder="e.g. Bengaluru"
                  className="w-full bg-[#FAF6EE]/50 border border-turmeric/30 rounded-xl px-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#8C2F22] focus:ring-2 focus:ring-[#8C2F22]/20"
                />
              </div>
            </div>

            {/* Vedic Details */}
            <div className="pt-2 border-t border-turmeric/20">
              <span className="text-[11px] font-bold text-[#A67C29] uppercase tracking-wider block mb-3 font-mono">
                Vedic &amp; Sankalpa Information (Optional)
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
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-xs text-white bg-[#8C2F22] hover:bg-[#6E2217] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

          <div className="text-center text-xs text-[#5C4D44] border-t border-turmeric/20 pt-4 flex justify-between">
            <Link to="/" className="text-[#8C2F22] hover:underline">
              ← Back to Home
            </Link>
            <Link to="/login" className="text-[#8C2F22] hover:underline font-bold">
              Already registered? Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
