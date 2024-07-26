'use client'
import { useState } from 'react';
import Login from './(auth)/login/page';
import Register from './(auth)/register/page';

export default function Home() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleView = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLoginView(!isLoginView);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Login</h1>
        
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {isLoginView ? <Login /> : <Register />}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={toggleView}
            className="text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-300"
          >
            {isLoginView ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </main>
  );
}