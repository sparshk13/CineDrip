const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const { GENRE_MAP } = require('../services/recommender');

const router = express.Router();

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0' },
});

const attachKey = (params = {}) => ({ api_key: TMDB_API_KEY, ...params });

const cleanMovie = (m) => ({
  tmdbId: m.id,
  title: m.title,
  overview: m.overview,
  posterPath: m.poster_path,
  backdropPath: m.backdrop_path,
  releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
  genreIds: m.genre_ids || (m.genres ? m.genres.map((g) => g.id) : []),
  language: m.original_language,
  avgRating: m.vote_average || 0,
  popularity: m.popularity || 0,
  genres: (m.genre_ids || (m.genres ? m.genres.map((g) => g.id) : []))
    .map((id) => GENRE_MAP[id])
    .filter(Boolean),
});

// GET /api/movies/trending
router.get('/trending', auth, async (req, res) => {
  try {
    const { data } = await tmdbClient.get('/trending/movie/week', { params: attachKey() });
    res.status(200).json((data.results || []).map(cleanMovie));
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch trending movies' });
  }
});

// GET /api/movies/search?query=
router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.query || '';
    const { data } = await tmdbClient.get('/search/movie', {
      params: attachKey({ query }),
    });
    res.status(200).json((data.results || []).map(cleanMovie));
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch search results' });
  }
});

// GET /api/movies/genres/list  (MUST be before /:id)
router.get('/genres/list', auth, async (req, res) => {
  try {
    const { data } = await tmdbClient.get('/genre/movie/list', { params: attachKey() });
    res.status(200).json(data.genres || []);
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch genres' });
  }
});

// Map common filter labels (incl. our recommender vocabulary) to TMDB genre
// names, since TMDB uses "Science Fiction", not "sci-fi", etc.
const GENRE_SYNONYMS = {
  'sci-fi': 'science fiction',
  scifi: 'science fiction',
  'sci fi': 'science fiction',
  animated: 'animation',
  doc: 'documentary',
  romcom: 'romance',
};

// GET /api/movies/discover?genre=<name>&sort=popularity|rating&page=
// Filter by genre (not keyword) using TMDB's discover endpoint.
router.get('/discover', auth, async (req, res) => {
  try {
    let genreName = (req.query.genre || '').toLowerCase();
    if (GENRE_SYNONYMS[genreName]) genreName = GENRE_SYNONYMS[genreName];
    const sort = req.query.sort === 'rating' ? 'vote_average.desc' : 'popularity.desc';
    const page = Math.max(1, parseInt(req.query.page) || 1);

    // Resolve genre name -> TMDB genre id.
    const { data: genreData } = await tmdbClient.get('/genre/movie/list', {
      params: attachKey(),
    });
    const match = (genreData.genres || []).find(
      (g) => g.name.toLowerCase() === genreName
    );
    if (!match) {
      return res.status(200).json([]);
    }

    const { data } = await tmdbClient.get('/discover/movie', {
      params: attachKey({
        with_genres: match.id,
        sort_by: sort,
        page,
        'vote_count.gte': 50,
      }),
    });
    res.status(200).json((data.results || []).map(cleanMovie));
  } catch (error) {
    res.status(502).json({ message: 'Failed to discover movies' });
  }
});

// GET /api/movies/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const [movieRes, videosRes] = await Promise.all([
      tmdbClient.get(`/movie/${id}`, { params: attachKey() }),
      tmdbClient.get(`/movie/${id}/videos`, { params: attachKey() }),
    ]);

    const movie = movieRes.data;
    const videos = videosRes.data.results || [];
    const trailer = videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') || videos[0];

    res.status(200).json({
      ...cleanMovie(movie),
      genres: (movie.genres || []).map((g) => g.name),
      runtime: movie.runtime,
      trailerKey: trailer ? trailer.key : null,
    });
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch movie details' });
  }
});

module.exports = router;
module.exports.cleanMovie = cleanMovie;
