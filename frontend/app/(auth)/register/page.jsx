// app/(auth)/register/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, Sparkles, CheckCircle,Loader2 } from 'lucide-react';

function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: 'Too short', color: 'bg-red-400' },
      { label: 'Weak', color: 'bg-red-400' },
      { label: 'Fair', color: 'bg-amber-400' },
      { label: 'Good', color: 'bg-emerald-400' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ];
    return { score, ...levels[score] };
  };

  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-gray-100'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 3 ? 'text-emerald-600' : score >= 2 ? 'text-amber-600' : 'text-red-500'}`}>
        {label}
      </p>
    </div>
  );
}

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isCreator: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,  
          email: formData.email,
          password: formData.password,
          isCreator:formData.isCreator,  
        }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0EFFF] via-white to-[#EEF2FF] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#9C8FFF] flex items-center justify-center shadow-lg shadow-purple-200">
            <Sparkles size={22} className="text-white" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/60 border border-gray-100/80 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#2D2A5A] tracking-tight">Create an account</h1>
            <p className="text-sm text-[#7A799D] mt-1">Start your expertise journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-semibold text-[#6B6A8F] uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'username' ? 'text-[#6C63FF]' : 'text-[#7A799D]'}`}
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="yourhandle"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused('')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 bg-[#F7F8FA] border border-transparent text-[#2D2A5A] placeholder:text-[#7A799D] focus:bg-white focus:border-[#6C63FF] focus:shadow-[0_0_0_4px_rgba(108,99,255,0.12)] hover:border-gray-300"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="block text-xs font-semibold text-[#6B6A8F] uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === 'password' ? 'text-[#6C63FF]' : 'text-[#7A799D]'}`}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
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
              <PasswordStrength password={formData.password} />
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#F5F4FF] rounded-xl border border-[#E6E4FF] cursor-pointer"
                 onClick={() => setFormData(prev => ({ ...prev, isCreator: !prev.isCreator }))}>
              <div className={`w-10 h-6 rounded-full flex items-center transition-all duration-200 ${formData.isCreator ? 'bg-[#6C63FF]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm mx-1 transition-transform duration-200 ${formData.isCreator ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#2D2A5A]">Register as a creator</p>
                <p className="text-xs text-[#7A799D] mt-0.5">Create organizations and manage learning content</p>
              </div>
              <input
                type="checkbox"
                name="isCreator"
                className="sr-only"
                checked={formData.isCreator}
                onChange={handleChange}
              />
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
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#7A799D] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#6C63FF] hover:text-[#5550E8] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}