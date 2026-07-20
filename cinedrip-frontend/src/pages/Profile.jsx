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
    <div className="ml-[78px] min-h-screen bg-base pb-12 pt-6">
      <div className="px-4">
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-3xl font-bold text-white">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <h1 className="mt-3 text-xl font-bold text-white">{user?.username}</h1>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#16161f] p-4 text-center">
            <p className="text-2xl font-bold text-white">{tasteArr('genres').length}</p>
            <p className="text-xs text-gray-400">genres</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#16161f] p-4 text-center">
            <p className="text-2xl font-bold text-white">{tasteArr('vibes').length}</p>
            <p className="text-xs text-gray-400">vibes</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#16161f] p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-300">your taste</h2>
          {['genres', 'vibes', 'eras', 'origins'].map((key) => (
            <div key={key} className="mb-3">
              <p className="mb-1 text-xs capitalize text-gray-500">{key}</p>
              <div className="flex flex-wrap gap-1">
                {tasteArr(key).map((v, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-gray-300"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="mt-4 w-full rounded-full border border-white/15 py-3 font-semibold text-white"
        >
          update taste
        </button>
        <button
          onClick={handleLogout}
          className="mt-3 w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white"
        >
          logout
        </button>
      </div>

      <Sidebar />
      <NavBar />
    </div>
  );
}
