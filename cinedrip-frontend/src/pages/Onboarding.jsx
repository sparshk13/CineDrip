import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { tasteAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const GENRES = [
  'action', 'sci-fi', 'horror', 'thriller', 'comedy', 'crime',
  'drama', 'animation', 'romance', 'mystery', 'documentary', 'fantasy',
  'history', 'adventure', 'family', 'music', 'war', 'western',
];
const VIBES = [
  'edge of your seat', 'mind-bending', 'laugh-out-loud',
  'emotional rollercoaster', 'dark and gritty', 'feel-good', 'slow burn',
];
const ERAS = ['classics', '90s-2000s', '2010s', 'recent'];
const ORIGINS = ['hollywood', 'bollywood', 'korean', 'european', 'anime', 'indie'];
const WATCH_VIBES = ['chill night', 'hyped up', 'cozy', 'dark & intense'];

const SAMPLE_MOVIES = [
  { id: 155, title: 'The Dark Knight' },
  { id: 27205, title: 'Inception' },
  { id: 603, title: 'The Matrix' },
  { id: 19404, title: 'Dilwale Dulhania Le Jayenge' },
  { id: 129, title: 'Spirited Away' },
];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [genres, setGenres] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [eras, setEras] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [watchVibe, setWatchVibe] = useState('');
  const [ratings, setRatings] = useState({});

  const toggleItem = (setter, list, value) => {
    if (list.includes(value)) setter(list.filter((v) => v !== value));
    else setter([...list, value]);
  };

  const handleSubmit = async () => {
    try {
      const { data } = await tasteAPI.save({
        genres,
        vibes,
        eras,
        origins,
        watchVibe,
        ratings,
      });
      // Critical rule #4: call updateUser BEFORE navigating
      updateUser({ isOnboarded: true, taste: data.taste });
      toast.success('Taste saved!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save taste');
    }
  };

  const progress = `step ${step} / 3`;

  return (
    <div className="min-h-screen bg-base px-6 py-10">
      <p className="text-center text-sm text-gray-400">{progress}</p>

      {step === 1 && (
        <div className="mx-auto mt-6 max-w-md">
          <h2 className="mb-4 text-xl font-bold text-white">what genres do you love?</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => toggleItem(setGenres, genres, g)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  genres.includes(g)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'border border-white/15 text-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <h2 className="mb-4 mt-8 text-xl font-bold text-white">your watch vibe?</h2>
          <div className="flex flex-wrap gap-2">
            {WATCH_VIBES.map((v) => (
              <button
                key={v}
                onClick={() => setWatchVibe(v)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  watchVibe === v
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'border border-white/15 text-gray-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={genres.length === 0 || !watchVibe}
            className="mt-8 w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mx-auto mt-6 max-w-md">
          <h2 className="mb-4 text-xl font-bold text-white">pick your vibes</h2>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <button
                key={v}
                onClick={() => toggleItem(setVibes, vibes, v)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  vibes.includes(v)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'border border-white/15 text-gray-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <h2 className="mb-4 mt-8 text-xl font-bold text-white">eras</h2>
          <div className="flex flex-wrap gap-2">
            {ERAS.map((e) => (
              <button
                key={e}
                onClick={() => toggleItem(setEras, eras, e)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  eras.includes(e)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'border border-white/15 text-gray-300'
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <h2 className="mb-4 mt-8 text-xl font-bold text-white">origins</h2>
          <div className="flex flex-wrap gap-2">
            {ORIGINS.map((o) => (
              <button
                key={o}
                onClick={() => toggleItem(setOrigins, origins, o)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  origins.includes(o)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'border border-white/15 text-gray-300'
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 rounded-full border border-white/15 py-3 font-semibold text-white"
            >
              back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={vibes.length === 0}
              className="w-2/3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white disabled:opacity-50"
            >
              next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mx-auto mt-6 max-w-md">
          <h2 className="mb-4 text-xl font-bold text-white">rate these movies</h2>
          <div className="space-y-3">
            {SAMPLE_MOVIES.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface px-4 py-3"
              >
                <span className="text-sm text-white">{m.title}</span>
                <div className="flex gap-2">
                  {['😴', '😐', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setRatings({ ...ratings, [m.id]: emoji })}
                      className={`rounded-full px-2 py-1 text-lg ${
                        ratings[m.id] === emoji ? 'bg-purple-600' : 'bg-white/5'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 rounded-full border border-white/15 py-3 font-semibold text-white"
            >
              back
            </button>
            <button
              onClick={handleSubmit}
              className="w-2/3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white"
            >
              finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
