// components/Header.js
'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Brain, Trophy, LayoutDashboard, LogOut, User, Shield, Sparkles } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        const userData = await response.json();
        console.log('Header user data:', userData); // Debug log
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#E6E4FF] sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] bg-clip-text text-transparent">
              Qnect
            </Link>
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className={`text-sm transition-colors ${pathname === '/' ? 'text-[#6C63FF]' : 'text-[#7A799D] hover:text-[#6C63FF]'}`}>
                    Home
                  </Link>
                </li>
                {user && (
                  <>
                    <li>
                      <Link href="/dashboard" className={`text-sm transition-colors ${pathname === '/dashboard' ? 'text-[#6C63FF]' : 'text-[#7A799D] hover:text-[#6C63FF]'}`}>
                        <LayoutDashboard size={14} className="inline mr-1" />
                        Dashboard
                      </Link>
                    </li>
                    {user.role === 'admin' && (
                      <li>
                        <Link href="/admin" className={`text-sm transition-colors ${pathname === '/admin' ? 'text-[#6C63FF]' : 'text-[#7A799D] hover:text-[#6C63FF]'}`}>
                          <Shield size={14} className="inline mr-1" />
                          Admin
                        </Link>
                      </li>
                    )}
                  </>
                )}
                <li>
                  <a href="#features" className="text-[#7A799D] hover:text-[#6C63FF] transition-colors text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-[#7A799D] hover:text-[#6C63FF] transition-colors text-sm">
                    Testimonials
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F4FF] rounded-lg">
                  <Trophy size={14} className="text-[#6C63FF]" />
                  <span className="text-sm font-medium text-[#2D2A5A]">{user.points || 0} pts</span>
                </div>
                {/* Role badge */}
                <div className={`hidden md:block px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'creator' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role === 'admin' && <Shield size={10} className="inline mr-1" />}
                  {user.role === 'creator' && <Sparkles size={10} className="inline mr-1" />}
                  {user.role}
                </div>
                <span className="text-sm text-[#6B6A8F] hidden md:inline">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#7A799D] hover:text-[#6C63FF] transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-[#6B6A8F] hover:text-[#6C63FF] font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] text-white rounded-lg hover:from-[#5550E8] hover:to-[#8A7FEE] transition-colors text-sm font-medium"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}