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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden px-6">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-40"></div>
      </div>

      {/* Floating decorative dots */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
      <div className="absolute top-10 right-40 w-20 h-20 bg-blue-500 rounded-full blur-3xl opacity-15 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-surface p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🎬</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Register
            </h1>
          </div>
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
    </div>
  );
}
