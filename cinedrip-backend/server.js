require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const tasteRoutes = require('./routes/taste');
const movieRoutes = require('./routes/movies');
const recommendationRoutes = require('./routes/recommendations');
const watchlistRoutes = require('./routes/watchlist');
const adminRoutes = require('./routes/admin');

const app = express();

// ---- Enterprise security ----
app.use(helmet());
// CORS works in every run mode:
//   - no CORS_ORIGIN set  -> reflect any origin (dev / docker convenience)
//   - CORS_ORIGIN set     -> allow-listed origins (comma-separated)
// Credentials stay enabled so the JWT cookie/header flow works cross-origin.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : null;

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Same-origin requests (origin undefined) and non-browser tools are allowed.
    if (!origin) return callback(null, true);
    if (!allowedOrigins) return callback(null, true); // dev: reflect all
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
};
app.use(cors(corsOptions));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

app.use(express.json({ limit: '10kb' }));

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/taste', tasteRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CineDrip API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`CineDrip backend listening on port ${PORT}`);
  });
};

// Only auto-start when run directly (not when imported by tests).
if (require.main === module) {
  start();
}

module.exports = app;
