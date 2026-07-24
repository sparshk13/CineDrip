import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && user) {
      window.location.href = '/home';
    }
  }, [hydrated, user]);

  if (!hydrated) return null;

  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-base px-6 text-center">
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-purple-600 opacity-10 blur-3xl" />
      <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-pink-600 opacity-10 blur-3xl" />

      <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-6xl font-extrabold text-transparent">
        CineDrip
      </h1>
      <p className="mt-3 text-gray-400">your vibe, your movies.</p>

      <div className="mt-10 flex gap-4">
        <a
          href="/register"
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white"
        >
          register
        </a>
        <a
          href="/login"
          className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white"
        >
          login
        </a>
      </div>
    </div>
  );
}
