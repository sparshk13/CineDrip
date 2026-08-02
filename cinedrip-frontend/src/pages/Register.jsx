import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      toast.success('Welcome to CineDrip!');
      navigate(data.user.isOnboarded ? '/home' : '/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-3 text-white outline-none focus:border-purple-500"
          />
          <input
            name="email"
            type="email"
            placeholder="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-3 text-white outline-none focus:border-purple-500"
          />
          <input
            name="password"
            type="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-4 py-3 text-white outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? '...' : 'register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          already have an account?{' '}
          <a href="/login" className="text-purple-400">
            login
          </a>
        </p>
      </div>
    </div>
  );
}
