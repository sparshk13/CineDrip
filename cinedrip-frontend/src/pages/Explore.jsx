import { useEffect, useState, useRef } from 'react';
import Row from '../components/Row';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import Loader from '../components/Loader';
import { moviesAPI, watchlistAPI } from '../api/client';

// Curated genre filters. "trending" is the default blended feed.
const GENRE_FILTERS = [
  'trending',
  'action',
  'comedy',
  'drama',
  'horror',
  'sci-fi',
  'romance',
  'thriller',
  'animation',
  'documentary',
  'fantasy',
  'mystery',
  'crime',
];

export default function Explore() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('trending');
  const [watchlist, setWatchlist] = useState([]);
  const debounce = useRef(null);

  const loadByFilter = async (filter) => {
    setLoading(true);
    try {
      const { data } =
        filter === 'trending'
          ? await moviesAPI.trending()
          : await moviesAPI.discover(filter);
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (q) => {
    setLoading(true);
    try {
      const { data } = await moviesAPI.search(q);
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) searchMovies(query);
    else loadByFilter(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (query.trim()) searchMovies(query);
      else loadByFilter(activeFilter);
    }, 400);
    return () => clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleWatchlist = async (movie) => {
    try {
      await watchlistAPI.add({
        tmdbId: movie.tmdbId,
        movieTitle: movie.title,
        posterPath: movie.posterPath,
      });
      setWatchlist((prev) => [...prev, movie.tmdbId]);
    } catch {}
  };

  if (loading) return <Loader />;

  const title = query
    ? `results for "${query}"`
    : activeFilter === 'trending'
    ? 'trending now'
    : `top ${activeFilter} picks`;

  return (
    <div className="ml-[78px] min-h-screen bg-base pb-12">
      <div className="px-4 pt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search movies..."
          className="w-full rounded-full border border-white/15 bg-surface px-4 py-3 text-white outline-none focus:border-purple-500"
        />
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {GENRE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setQuery('');
                setActiveFilter(f);
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-sm capitalize transition ${
                activeFilter === f && !query.trim()
                  ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white'
                  : 'border border-white/15 text-gray-300 hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Row title={title} movies={movies} onWatchlist={handleWatchlist} watchlist={watchlist} />

      <Sidebar />
      <NavBar />
    </div>
  );
}
