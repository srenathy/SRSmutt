import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { devoteeRegisterSchema, DevoteeRegisterInput } from '@temple/shared';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

export const DevoteeRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DevoteeRegisterInput>({
    resolver: zodResolver(devoteeRegisterSchema)
  });

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 mb-3">
            🕉️
          </div>
          <h2 className="font-serif text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            Devotee Registration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create your family Devotee account to view Seva history & receipts
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
              <input
                {...register('username')}
                type="text"
                placeholder="e.g. srinivas_rao"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              {errors.username && <p className="text-[10px] text-red-400 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Devotee Name *</label>
            <input
              {...register('fullName')}
              type="text"
              placeholder="e.g. Srinivas Rao"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            {errors.fullName && <p className="text-[10px] text-red-400 mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="10-digit mobile number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City / Town</label>
              <input
                {...register('city')}
                type="text"
                placeholder="e.g. Bengaluru"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Vedic Details */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-3">
              Vedic & Sankalpa Information (Optional)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gotra</label>
                <input
                  {...register('gotra')}
                  type="text"
                  placeholder="Kashyapa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nakshatra</label>
                <input
                  {...register('nakshatra')}
                  type="text"
                  placeholder="Uttara"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Rashi</label>
                <input
                  {...register('rashi')}
                  type="text"
                  placeholder="Meena"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:shadow-lg hover:shadow-amber-500/25 transition disabled:opacity-50"
          >
            {submitting ? 'Creating Devotee Profile...' : 'Complete Devotee Registration'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 flex justify-between">
          <Link to="/" className="text-amber-400 hover:underline">
            ← Back to Home
          </Link>
          <Link to="/login" className="text-amber-400 hover:underline font-semibold">
            Already registered? Login →
          </Link>
        </div>
      </div>
    </div>
  );
};
