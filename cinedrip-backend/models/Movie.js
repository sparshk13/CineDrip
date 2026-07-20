const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    overview: { type: String },
    posterPath: { type: String },
    backdropPath: { type: String },
    releaseYear: { type: Number },
    genres: { type: [String], default: [] },
    vibes: { type: [String], default: [] },
    origins: { type: [String], default: [] },
    language: { type: String },
    avgRating: { type: Number },
    popularity: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
