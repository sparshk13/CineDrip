import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import { useAuth } from '../hooks/useAuth';
import { tasteAPI } from '../api/client';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [taste, setTaste] = useState(null);

  useEffect(() => {
    const loadTaste = async () => {
      try {
        const { data } = await tasteAPI.get();
        setTaste(data.taste);
      } catch {}
    };
    loadTaste();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tasteArr = (key) => (taste && Array.isArray(taste[key]) ? taste[key] : []);

  return (
    <div className="ml-[78px] min-h-screen bg-base pb-24">
      {/* Hero Banner */}
      <div className="relative h-48 bg-gradient-to-br from-purple-600/40 via-pink-600/30 to-base">
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/60 to-transparent" />
      </div>

      {/* Profile Info - overlaps banner */}
      <div className="relative -mt-16 px-6">
        <div className="flex items-end gap-5">
          <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-2xl border-4 border-base bg-gradient-to-br from-purple-500 to-pink-500 text-4xl font-bold text-white shadow-xl">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 pb-1">
            <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-8 grid grid-cols-4 gap-4 px-6">
        {[
          { label: 'genres', value: tasteArr('genres').length, color: 'text-purple-400' },
          { label: 'vibes', value: tasteArr('vibes').length, color: 'text-pink-400' },
          { label: 'eras', value: tasteArr('eras').length, color: 'text-blue-400' },
          { label: 'origins', value: tasteArr('origins').length, color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-6 mt-8 border-t border-white/5" />

      {/* Taste Sections */}
      <div className="px-6 pt-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Your Taste
        </h2>

        <div className="space-y-6">
          {['genres', 'vibes', 'eras', 'origins'].map((key) => {
            const items = tasteArr(key);
            if (items.length === 0) return null;
            return (
              <div key={key}>
                <p className="mb-3 text-xs font-medium text-gray-500">{key}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((v, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-gray-300 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-12 flex gap-4 px-6">
        <button
          onClick={() => navigate('/onboarding')}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
        >
          Update Taste
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/15"
        >
          Logout
        </button>
      </div>

      <Sidebar />
      <NavBar />
    </div>
  );
}
