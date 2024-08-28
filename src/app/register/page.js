'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerWithEmailAndPassword, signInWithGoogle } from '../firebase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await registerWithEmailAndPassword(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      // Tampilkan error ke pengguna jika diperlukan
    }
  };

  const handleGoogleSignUp = async () => {
    try {
        const user = await signInWithGoogle();
        console.log('User after Google sign-up:', user);
        router.push('/dashboard');
    } catch (error) {
        console.error('Google sign-up error:', error.message);
        alert(`Google sign-up failed: ${error.message}`);
    }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
          </div>
        </form>
        <div className="mt-6">
          <button
            onClick={handleGoogleSignUp}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline"
          >
            Sign up with Google
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-600">Already have an account?</p>
          <button
            onClick={() => router.push('/login')}
            className="text-blue-500 hover:text-blue-700 font-bold"
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}
