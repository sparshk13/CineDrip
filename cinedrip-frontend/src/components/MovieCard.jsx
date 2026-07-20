import { useNavigate } from 'react-router-dom';
import ScoreRing from './ScoreRing';

export default function MovieCard({ movie, onWatchlist, watchlisted }) {
  const navigate = useNavigate();

  const poster = movie.posterPath
    ? `https://image.tmdb.org/t/p/w342${movie.posterPath}`
    : null;

  const handleClick = () => navigate(`/movie/${movie.tmdbId}`);

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (onWatchlist && !watchlisted) onWatchlist(movie);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative w-[130px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-surface border border-white/10 transition hover:scale-[1.03] sm:w-[150px]"
    >
      <div className="relative aspect-[2/3] w-full bg-surface">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🎬</div>
        )}
        {typeof movie.matchPercent === 'number' && <ScoreRing score={movie.matchPercent} />}
        {onWatchlist && (
          <button
            onClick={handleBookmark}
            className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
          >
            {watchlisted ? '✓ Saved' : '+ Save'}
          </button>
        )}
      </div>
      <div className="p-2">
        <h3 className="truncate text-xs font-semibold text-white">{movie.title}</h3>
        <p className="text-[10px] text-gray-400">
          {movie.releaseYear || ''} {movie.language ? `· ${movie.language.toUpperCase()}` : ''}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {(movie.genres || []).slice(0, 2).map((g, i) => (
            <span
              key={i}
              className="rounded-full bg-white/8 px-1.5 py-0.5 text-[9px] text-gray-300"
            >
              {typeof g === 'string' ? g : g.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
