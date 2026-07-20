import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import { watchlistAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Watchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await watchlistAPI.list();
      setItems(data.items);
      setCount(data.count);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (tmdbId) => {
    try {
      await watchlistAPI.remove(tmdbId);
      setItems((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
      setCount((prev) => prev - 1);
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="ml-[78px] min-h-screen bg-base pb-12 pt-6">
      <div className="px-4">
        <h1 className="text-2xl font-bold text-white">watchlist</h1>
        <p className="text-sm text-gray-400">{count} saved</p>
      </div>

      <div className="mt-6 space-y-3 px-4">
        {items.map((item) => (
          <div
            key={item.tmdbId}
            onClick={() => navigate(`/movie/${item.tmdbId}`)}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-[#16161f] p-3"
          >
            {item.posterPath ? (
              <img
                src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                alt={item.movieTitle}
                className="h-16 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-white/5 text-xl">
                🎬
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{item.movieTitle}</h3>
              <p className="text-xs text-gray-400">
                {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(item.tmdbId);
              }}
              className="rounded-xl bg-white/5 px-3 py-1 text-xs text-gray-300"
            >
              remove
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="px-4 text-center text-gray-400">your watchlist is empty</p>
      )}

      <Sidebar />
      <NavBar />
    </div>
  );
}
