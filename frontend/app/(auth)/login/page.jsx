// app/(auth)/login/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Sparkles,Loader2 } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Invalid email or password. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0EFFF] via-white to-[#EEF2FF] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#9C8FFF] flex items-center justify-center shadow-lg shadow-purple-200">
            <Sparkles size={22} className="text-white" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/60 border border-gray-100/80 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#2D2A5A] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#7A799D] mt-1">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-[#6B6A8F] uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'email' ? 'text-[#6C63FF]' : 'text-[#7A799D]'}`}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 bg-[#F7F8FA] border border-transparent text-[#2D2A5A] placeholder:text-[#7A799D] focus:bg-white focus:border-[#6C63FF] focus:shadow-[0_0_0_4px_rgba(108,99,255,0.12)] hover:border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-[#6B6A8F] uppercase tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-[#6C63FF] hover:text-[#5550E8] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'password' ? 'text-[#6C63FF]' : 'text-[#7A799D]'}`}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all duration-200 bg-[#F7F8FA] border border-transparent text-[#2D2A5A] placeholder:text-[#7A799D] focus:bg-white focus:border-[#6C63FF] focus:shadow-[0_0_0_4px_rgba(108,99,255,0.12)] hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A799D] hover:text-[#6C63FF] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-3.5 py-3">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] hover:from-[#5550E8] hover:to-[#8A7FEE] shadow-md shadow-purple-200 hover:shadow-lg transition-all duration-200 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#7A799D] mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-[#6C63FF] hover:text-[#5550E8] transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}