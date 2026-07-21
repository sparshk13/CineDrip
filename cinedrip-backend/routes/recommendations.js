const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { cleanMovie } = require('./movies');
const { recommend } = require('../services/recommender');

const router = express.Router();

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0' },
});

const attachKey = (params = {}) => ({ api_key: TMDB_API_KEY, ...params });

const fetchList = async (endpoint, params = {}) => {
  try {
    const { data } = await tmdbClient.get(endpoint, { params: attachKey(params) });
    return data.results || [];
  } catch (error) {
    return [];
  }
};

// Fetch several pages of a TMDB list to widen the candidate pool for diversity.
const fetchPages = async (endpoint, pages = 1, extra = {}) => {
  const out = [];
  for (let page = 1; page <= pages; page++) {
    const results = await fetchList(endpoint, { ...extra, page });
    out.push(...results);
  }
  return out;
};

// Origin-specific TMDB language queries
const ORIGIN_LANG_QUERIES = {
  bollywood: { langs: ['hi'], pages: 2 },
  korean: { langs: ['ko'], pages: 2 },
  european: { langs: ['fr', 'de', 'it', 'es'], pages: 1 },
  anime: { langs: ['ja'], pages: 2 },
  latin: { langs: ['es', 'pt'], pages: 1 },
};

// Always fetch these for discovery even if user didn't select them
const DISCOVERY_ORIGINS = ['bollywood', 'korean', 'anime'];

// Fetch origin-specific movies from TMDB discover endpoint
async function fetchOriginPool(origins = []) {
  const toFetch = new Set([...origins, ...DISCOVERY_ORIGINS]);
  const results = [];
  for (const origin of toFetch) {
    const cfg = ORIGIN_LANG_QUERIES[origin];
    if (!cfg) continue;
    for (const lang of cfg.langs) {
      for (let p = 1; p <= cfg.pages; p++) {
        const movies = await fetchList('/discover/movie', {
          with_original_language: lang,
          sort_by: 'popularity.desc',
          'vote_count.gte': 25,
          page: p,
        });
        results.push(...movies);
      }
    }
  }
  return results;
}

// Build themed sections from scored movies
function buildSections(movies, taste) {
  const seen = new Set();
  const take = (predicate, n) => {
    const out = [];
    for (const m of movies) {
      if (out.length >= n) break;
      if (seen.has(m.tmdbId)) continue;
      if (predicate(m)) {
        seen.add(m.tmdbId);
        out.push(m);
      }
    }
    return out;
  };

  const sections = [];

  // Section 1: Top matches (always present)
  const top = take(() => true, 14);
  if (top.length >= 6) {
    sections.push({ title: 'tailored for you', movies: top });
  }

  // Section 2: Fresh drops (2023+)
  const fresh = take((m) => m.releaseYear >= 2023, 12);
  if (fresh.length >= 6) {
    sections.push({ title: 'fresh off the screen', movies: fresh });
  }

  // Section 3: Critically loved (rating >= 7.5)
  const acclaimed = take((m) => m.avgRating >= 7.5, 12);
  if (acclaimed.length >= 6) {
    sections.push({ title: 'critically loved', movies: acclaimed });
  }

  // Section 4: World cinema (non-English)
  const world = take((m) => !m.origins.includes('hollywood'), 12);
  if (world.length >= 6) {
    sections.push({ title: 'world cinema picks', movies: world });
  }

  // Section 5: Era-specific based on taste
  if (taste.eras?.includes('classics')) {
    const classics = take((m) => m.era === 'classics', 12);
    if (classics.length >= 6) {
      sections.push({ title: 'timeless classics', movies: classics });
    }
  } else {
    const recent = take((m) => m.releaseYear >= 2020 && m.releaseYear < 2023, 12);
    if (recent.length >= 6) {
      sections.push({ title: 'recent gems', movies: recent });
    }
  }

  // Section 6: Vibe-based (dynamic from user taste)
  if (taste.vibes?.length > 0) {
    const vibeLabel = taste.vibes[0];
    const vibeMovies = take((m) => m.vibes?.includes(vibeLabel), 12);
    if (vibeMovies.length >= 6) {
      sections.push({ title: vibeLabel, movies: vibeMovies });
    }
  }

  // Fill to minimum 5 sections if any section is short
  const remaining = movies.filter((m) => !seen.has(m.tmdbId));
  if (sections.length < 5 && remaining.length >= 6) {
    sections.push({ title: 'more you might like', movies: remaining.slice(0, 12) });
  }

  return { sections, totalMovies: seen.size };
}

// GET /api/recommendations
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.isOnboarded) {
      return res.status(403).json({ message: 'Complete onboarding first' });
    }

    // Sequential fetches to avoid ECONNRESET (critical rule #2).
    // Pull multiple pages from each source to maximize variety in the pool.
    const trending = await fetchPages('/trending/movie/week', 2);
    const topRated = await fetchPages('/movie/top_rated', 2);
    const popular = await fetchPages('/movie/popular', 2);

    // NEW: Origin-specific pool for Bollywood, Korean, anime, etc.
    const originPool = await fetchOriginPool(user.taste.origins);

    // Deduplicate by movie id, then normalize fields (posterPath, tmdbId, genres)
    const seen = new Set();
    const merged = [];
    for (const m of [...trending, ...topRated, ...popular, ...originPool]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(cleanMovie(m));
      }
    }

    const recommendations = recommend(merged, user.taste, { count: 80 });
    const response = buildSections(recommendations, user.taste);
    res.status(200).json(response);
  } catch (error) {
    res.status(200).json({ sections: [], totalMovies: 0 });
  }
});

module.exports = router;
