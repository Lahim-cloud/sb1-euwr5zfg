import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefae0] via-[#fefae0]/80 to-[#fefae0] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-[#fefae0] p-8 rounded-xl shadow-lg text-center">
        <div>
          <LogIn className="mx-auto h-12 w-12 text-[#a47148]" />
          <h2 className="mt-6 text-3xl font-extrabold text-stone-900">Sign Up Disabled</h2>
          <p className="mt-2 text-sm text-stone-600">
            This is a private application. New sign-ups are not allowed.
          </p>
        </div>
        <div>
          <Link
            to="/signin"
            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-[#fefae0] bg-gradient-to-r from-[#a47148] to-black rounded-lg hover:from-[#a47148]/90 hover:to-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a47148]"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
