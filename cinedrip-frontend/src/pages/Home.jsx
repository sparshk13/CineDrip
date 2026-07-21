import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Row from '../components/Row';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import { recommendationsAPI, watchlistAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState({});

  useEffect(() => {
    if (!user?.isOnboarded) {
      navigate('/onboarding');
      return;
    }
    fetchRecommendations();
    loadWatchlist();
  }, [user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await recommendationsAPI.get();
      // Handle both new structured format and legacy flat array
      if (Array.isArray(data)) {
        setSections([{ title: 'your picks today', movies: data }]);
      } else {
        setSections(data.sections || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlist = async () => {
    try {
      const { data } = await watchlistAPI.list();
      setWatchlist(data.items.map((i) => i.tmdbId));
    } catch {}
  };

  const handleWatchlist = async (movie) => {
    setAdding((prev) => ({ ...prev, [movie.tmdbId]: true }));
    try {
      await watchlistAPI.add({
        tmdbId: movie.tmdbId,
        movieTitle: movie.title,
        posterPath: movie.posterPath,
      });
      setWatchlist((prev) => [...prev, movie.tmdbId]);
      toast.success('Added to watchlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setAdding((prev) => ({ ...prev, [movie.tmdbId]: false }));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="ml-[78px] min-h-screen bg-base pb-12">
      <div className="px-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-bold text-white">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-l font-bold text-white">your picks today 🔥</h1>
            <p className="text-xs text-gray-400">curated from your taste</p>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <Row
          key={section.title}
          title={section.title}
          movies={section.movies}
          onWatchlist={handleWatchlist}
          watchlist={watchlist}
        />
      ))}

      {sections.length === 0 && (
        <p className="px-4 text-center text-gray-400">no picks yet — check back soon!</p>
      )}

      <Sidebar />
      <NavBar />
    </div>
  );
}
