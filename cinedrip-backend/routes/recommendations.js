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
    const trending = await fetchPages('/trending/movie/week', 3);
    const topRated = await fetchPages('/movie/top_rated', 3);
    const popular = await fetchPages('/movie/popular', 3);

    // Deduplicate by movie id, then normalize fields (posterPath, tmdbId, genres)
    const seen = new Set();
    const merged = [];
    for (const m of [...trending, ...topRated, ...popular]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(cleanMovie(m));
      }
    }

    const recommendations = recommend(merged, user.taste, { count: 36 });
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(200).json([]);
  }
});

module.exports = router;
