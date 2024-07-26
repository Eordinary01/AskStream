// components/Header.js
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/org/" className="text-2xl font-bold">
              OrgQuest
            </Link>
            <nav className="ml-10">
              <ul className="flex space-x-4">
                <li>
                  <Link href="/dashboard" className="hover:text-blue-200 transition duration-300">
                    Dashboard
                  </Link>
                </li>
                {user && user.isCreator && (
                  <li>
                    <Link href="/create-org" className="hover:text-blue-200 transition duration-300">
                      Create Organization
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
          <div className="flex items-center">
            {user && (
              <span className="mr-4">Welcome, {user.username}!</span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}