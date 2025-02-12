import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefae0] via-[#fefae0]/80 to-[#fefae0] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-[#fefae0] p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-[#a47148]" />
          <h2 className="mt-6 text-3xl font-extrabold text-stone-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-stone-600">
            Enter your credentials to access the application
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-stone-300 placeholder-stone-500 text-stone-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a47148] focus:border-[#a47148] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-stone-300 placeholder-stone-500 text-stone-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a47148] focus:border-[#a47148] focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#a47148] focus:ring-[#a47148] border-stone-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-stone-900">
                Remember me
              </label>
            </div>

            <Link to="/forgot-password" className="text-sm font-medium text-[#a47148] hover:text-[#a47148]/80">
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-[#fefae0] bg-gradient-to-r from-[#a47148] to-black hover:from-[#a47148]/90 hover:to-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a47148] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-stone-600">Don't have an account?</span>{' '}
            <Link to="/signup" className="font-medium text-[#a47148] hover:text-[#a47148]/80">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}