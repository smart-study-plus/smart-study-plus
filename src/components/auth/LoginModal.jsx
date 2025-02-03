import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.access_token);
      onClose();
      navigate('/dashboard'); // Or wherever you want to redirect after login
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Login</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#F4976C] focus:outline-none focus:ring-[#F4976C]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#F4976C] focus:outline-none focus:ring-[#F4976C]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#F4976C] text-white py-2 px-4 rounded-md hover:bg-[#f3855c] transition-colors font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 