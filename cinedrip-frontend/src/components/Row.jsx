import { useRef } from 'react';
import MovieCard from './MovieCard';

export default function Row({ title, movies, onWatchlist, watchlist }) {
  const scroller = useRef(null);

  const scroll = (dir) => {
    if (!scroller.current) return;
    const amount = scroller.current.clientWidth * 0.8;
    scroller.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="mt-6">
      {title && (
        <div className="mb-2 flex items-center justify-between px-4">
          <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>
          <div className="flex gap-1">
            <button
              onClick={() => scroll(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/15"
            >
              ‹
            </button>
            <button
              onClick={() => scroll(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/15"
            >
              ›
            </button>
          </div>
        </div>
      )}
      <div
        ref={scroller}
        className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2"
      >
        {movies.map((m) => (
          <MovieCard
            key={m.tmdbId}
            movie={m}
            onWatchlist={onWatchlist}
            watchlisted={watchlist?.includes(m.tmdbId)}
          />
        ))}
      </div>
    </section>
  );
}
