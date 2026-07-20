import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/NavBar';
import { moviesAPI, watchlistAPI } from '../api/client';

export default function MovieDetail() {
  const { tmdbId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await moviesAPI.detail(tmdbId);
        setMovie(data);
      } catch {
        toast.error('Failed to load movie');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tmdbId]);

  const handleAdd = async () => {
    try {
      await watchlistAPI.add({
        tmdbId: movie.tmdbId,
        movieTitle: movie.title,
        posterPath: movie.posterPath,
      });
      toast.success('Added to watchlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  if (loading) return <Loader />;
  if (!movie) return null;

  const backdrop = movie.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : null;
  const poster = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  return (
    <div className="ml-[78px] min-h-screen bg-base pb-12">
      <div className="relative">
        {backdrop && (
          <div
            className="h-56 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm"
        >
          ← back
        </button>
      </div>

      <div className="px-6">
        <div className="-mt-20 flex gap-4">
          {poster ? (
            <img
              src={poster}
              alt={movie.title}
              className="h-44 w-28 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-44 w-28 items-center justify-center rounded-2xl bg-[#16161f] text-3xl">
              🎬
            </div>
          )}
          <div className="pt-20">
            <h1 className="text-xl font-bold text-white">{movie.title}</h1>
            <p className="text-sm text-gray-400">
              {movie.releaseYear} {movie.language ? `· ${movie.language.toUpperCase()}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(movie.genres || []).map((g, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-gray-300"
                >
                  {typeof g === 'string' ? g : g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {movie.overview && (
          <p className="mt-4 text-sm leading-relaxed text-gray-300">{movie.overview}</p>
        )}

        {movie.trailerKey && (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${movie.trailerKey}`}
              title="trailer"
              allowFullScreen
            />
          </div>
        )}

        <button
          onClick={handleAdd}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white"
        >
          + add to watchlist
        </button>
      </div>

      <Sidebar />
      <NavBar />
    </div>
  );
}
