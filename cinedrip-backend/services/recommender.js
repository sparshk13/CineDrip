// Genre map: TMDB genre IDs to strings
const GENRE_MAP = {
  28: 'action',
  878: 'sci-fi',
  27: 'horror',
  53: 'thriller',
  35: 'comedy',
  80: 'crime',
  18: 'drama',
  16: 'animation',
  10749: 'romance',
  9648: 'mystery',
  99: 'documentary',
  14: 'fantasy',
  36: 'history',
  12: 'adventure',
  10751: 'family',
  10402: 'music',
  10752: 'war',
  37: 'western',
};

// Origin map
const ORIGIN_MAP = {
  hollywood: ['en'],
  bollywood: ['hi'],
  korean: ['ko'],
  european: ['fr', 'de', 'it', 'es'],
  anime: ['ja'],
  indie: ['en'],
};

// Derive vibes from genres + rating
function deriveVibes(genres, rating) {
  const vibes = new Set();
  const has = (g) => genres.includes(g);

  if (has('horror') || has('thriller')) vibes.add('edge of your seat');
  if (has('sci-fi') && rating > 7.5) vibes.add('mind-bending');
  if (has('comedy')) vibes.add('laugh-out-loud');
  if (has('drama') && rating > 8) vibes.add('emotional rollercoaster');
  if (has('crime') || has('mystery')) vibes.add('dark and gritty');
  if (has('animation') || has('family')) vibes.add('feel-good');
  if (has('thriller')) vibes.add('slow burn');

  return Array.from(vibes);
}

// Derive era label from release year
function deriveEra(year) {
  if (!year) return null;
  if (year < 1990) return 'classics';
  if (year >= 1990 && year <= 2009) return '90s-2000s';
  if (year >= 2010 && year <= 2019) return '2010s';
  return 'recent';
}

// Derive origin label from language
function deriveOrigin(language) {
  if (!language) return null;
  for (const [label, langs] of Object.entries(ORIGIN_MAP)) {
    if (langs.includes(language)) {
      // indie + hollywood both map to 'en'; prefer hollywood for mainstream
      if (label === 'indie') continue;
      return label;
    }
  }
  return 'hollywood';
}

function normalizeMovie(m) {
  const year = m.releaseYear || (m.release_date ? parseInt(m.release_date.split('-')[0]) : null);
  // Accept either raw TMDB (genre_ids / genres:[{id}]) or the cleaned shape
  // produced by cleanMovie (genreIds:[number]).
  const genreIds =
    m.genre_ids ||
    m.genreIds ||
    (m.genres ? m.genres.map((g) => (typeof g === 'object' ? g.id : g)) : []);
  const genres = genreIds.map((id) => GENRE_MAP[id]).filter(Boolean);
  const rating = m.avgRating || m.vote_average || 0;
  const language = m.language || (m.original_language || 'en');

  return {
    ...m,
    releaseYear: year,
    genres,
    vibes: deriveVibes(genres, rating),
    era: deriveEra(year),
    origins: [deriveOrigin(language)].filter(Boolean),
    language,
    avgRating: rating,
    popularity: m.popularity || 0,
  };
}

function scoreMovie(movie, taste) {
  if (!taste || !taste.genres) return 0;

  let score = 0;

  // Genre match: 35 pts proportional
  const matchedGenres = movie.genres.filter((g) => taste.genres.includes(g));
  if (movie.genres.length > 0) {
    score += (matchedGenres.length / movie.genres.length) * 35;
  }

  // Vibe match: 25 pts proportional
  if (taste.vibes && taste.vibes.length > 0 && movie.vibes.length > 0) {
    const matchedVibes = movie.vibes.filter((v) => taste.vibes.includes(v));
    score += (matchedVibes.length / movie.vibes.length) * 25;
  }

  // Era match: 15 pts binary
  if (taste.eras && taste.eras.includes(movie.era)) {
    score += 15;
  }

  // Origin match: 15 pts binary
  if (
    taste.origins &&
    taste.origins.length > 0 &&
    movie.origins.length > 0 &&
    taste.origins.some((o) => movie.origins.includes(o))
  ) {
    score += 15;
  }

  // Rating boost from previously rated genres: 10 pts binary
  if (matchedGenres.length > 0 && movie.avgRating > 7.5) {
    score += 10;
  }

  return Math.min(score, 100);
}

function recommend(movies, taste, opts = {}) {
  const count = opts.count || 20;
  // 1. Score every candidate.
  const scored = movies
    .map((m) => {
      const norm = normalizeMovie(m);
      const score = scoreMovie(norm, taste);
      return { ...norm, score, matchPercent: Math.round(score) };
    })
    // Drop movies that carry no usable genre signal.
    .filter((m) => m.genres && m.genres.length > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];

  // 2. Genre-diversified selection (max-min style).
  // Pick the highest-scoring movie first, then greedily add the next best
  // candidate that introduces the least genre overlap with what we already
  // have. This prevents the list from collapsing into one repeated genre and
  // guarantees a varied, watchable mix.
  const selected = [scored[0]];
  const chosenGenres = new Set(scored[0].genres);

  const remaining = scored.slice(1);
  while (selected.length < count && remaining.length > 0) {
    let bestIdx = 0;
    let bestKey = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const m = remaining[i];
      const overlap = m.genres.filter((g) => chosenGenres.has(g)).length;
      // Reward score, penalize genre overlap. Score range ~0-100.
      const key = m.score - overlap * 18 - i * 0.01;
      if (key > bestKey) {
        bestKey = key;
        bestIdx = i;
      }
    }

    const pick = remaining.splice(bestIdx, 1)[0];
    selected.push(pick);
    pick.genres.forEach((g) => chosenGenres.add(g));
  }

  return selected;
}

module.exports = {
  GENRE_MAP,
  ORIGIN_MAP,
  deriveVibes,
  deriveEra,
  deriveOrigin,
  normalizeMovie,
  scoreMovie,
  recommend,
};
