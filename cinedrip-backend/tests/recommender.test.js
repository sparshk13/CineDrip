const {
  GENRE_MAP,
  deriveVibes,
  deriveEra,
  deriveOrigin,
  normalizeMovie,
  scoreMovie,
  recommend,
} = require('../services/recommender');

describe('recommender service (pure functions)', () => {
  test('GENRE_MAP maps known TMDB ids', () => {
    expect(GENRE_MAP[28]).toBe('action');
    expect(GENRE_MAP[878]).toBe('sci-fi');
    expect(GENRE_MAP[27]).toBe('horror');
  });

  test('deriveVibes derives edge-of-your-seat for horror', () => {
    const vibes = deriveVibes(['horror'], 6);
    expect(vibes).toContain('edge of your seat');
  });

  test('deriveVibes derives mind-bending only for high-rated sci-fi', () => {
    expect(deriveVibes(['sci-fi'], 8)).toContain('mind-bending');
    expect(deriveVibes(['sci-fi'], 7)).not.toContain('mind-bending');
  });

  test('deriveEra buckets years correctly', () => {
    expect(deriveEra(1980)).toBe('classics');
    expect(deriveEra(2000)).toBe('90s-2000s');
    expect(deriveEra(2015)).toBe('2010s');
    expect(deriveEra(2022)).toBe('recent');
    expect(deriveEra(null)).toBeNull();
  });

  test('deriveOrigin maps language codes', () => {
    expect(deriveOrigin('en')).toBe('hollywood');
    expect(deriveOrigin('ko')).toBe('korean');
    expect(deriveOrigin('ja')).toBe('anime');
    expect(deriveOrigin('hi')).toBe('bollywood');
  });

  test('normalizeMovie produces genres/vibes/era/origins', () => {
    const m = normalizeMovie({
      releaseYear: 2021,
      genre_ids: [28, 12],
      avgRating: 7.8,
      popularity: 100,
      language: 'en',
    });
    expect(m.genres).toContain('action');
    expect(m.era).toBe('recent');
    expect(m.origins).toContain('hollywood');
  });

  test('scoreMovie gives higher score for more matches', () => {
    const taste = { genres: ['action'], vibes: [], eras: ['recent'], origins: ['hollywood'] };
    const movie = normalizeMovie({
      releaseYear: 2021,
      genre_ids: [28],
      avgRating: 8,
      popularity: 100,
      language: 'en',
    });
    expect(scoreMovie(movie, taste)).toBeGreaterThan(0);
    expect(scoreMovie(movie, { genres: [] })).toBe(0);
  });

  test('recommend returns top 20 sorted desc with matchPercent', () => {
    const taste = { genres: ['action'], vibes: [], eras: ['recent'], origins: ['hollywood'] };
    const movies = Array.from({ length: 25 }, (_, i) => ({
      releaseYear: 2021,
      genre_ids: [28],
      avgRating: 8,
      popularity: 100,
      language: 'en',
      id: i,
    }));
    const recs = recommend(movies, taste);
    expect(recs.length).toBeLessThanOrEqual(20);
    expect(recs[0].matchPercent).toBeGreaterThanOrEqual(recs[recs.length - 1].matchPercent);
    expect(recs[0]).toHaveProperty('matchPercent');
  });
});
