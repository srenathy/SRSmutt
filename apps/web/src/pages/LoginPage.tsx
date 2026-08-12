import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@temple/shared';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to authenticate. Please verify your credentials.';
      setErrorMessage(msg);
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
          <h2 className="font-display text-2xl font-bold tracking-wide">Counter Login</h2>
          <p className="text-xs text-ivory/80 mt-1">Temple Seva Billing System (SRSmutt)</p>
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
              Username
            </label>
            <input
              type="text"
              {...register('username')}
              placeholder="e.g. admin"
              className="w-full px-4 py-3 bg-white border border-turmeric/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/60 text-textInk"
            />
            {errors.username && (
              <p className="text-xs text-red-600 font-medium">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-textInk/80 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-kumkum" />
              Password
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
                Sign In to Billing Counter
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
