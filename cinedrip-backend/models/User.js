const mongoose = require('mongoose');

const tasteSchema = new mongoose.Schema(
  {
    genres: { type: [String], default: [] },
    vibes: { type: [String], default: [] },
    eras: { type: [String], default: [] },
    origins: { type: [String], default: [] },
    watchVibe: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    taste: { type: tasteSchema, default: () => ({}) },
    isOnboarded: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
