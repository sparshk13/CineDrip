# CineDrip — Run Guide

Full-stack movie recommender (Node/Express/Mongo backend + React/Vite/Tailwind frontend).

## Prerequisites
- Node.js v18+ (this project was built on v24) — **only needed for the local dev path**
- MongoDB running locally (Community Server or `mongod`) — **only needed for the local dev path**
- Docker + Docker Compose — **only needed for the Docker path (Section 2b)**
- A TMDB API key — get one free at https://www.themoviedb.org/settings/api

## 1. Backend (`cinedrip-backend/`)

### a. Configure environment
Create `cinedrip-backend/.env` (a template already exists). Replace the placeholders:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/cinedrip
JWT_SECRET=replace_with_a_long_random_secret
TMDB_API_KEY=replace_with_your_tmdb_key
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### b. Start MongoDB
```bash
mongod
```
(Keep this running in its own terminal. Use a separate data path if needed, e.g. `mongod --dbpath ./data`.)

### c. Install & run
```bash
cd cinedrip-backend
npm install --include=dev
npm run dev        # nodemon, auto-restarts on change
# or: npm start    # plain node
```
Backend listens on http://localhost:3000

> NOTE: If `npm install` only installs a few packages, your npm is set to omit dev
> deps. Force them with `--include=dev` as shown above.

## 2. Frontend (`cinedrip-frontend/`)

```bash
cd cinedrip-frontend
npm install --include=dev
npm run dev
```
Vite dev server starts on http://localhost:5173 and proxies `/api` → http://localhost:3000.

Open http://localhost:5173 in your browser.

## 2b. Docker (recommended, one command)

Runs the whole stack — Mongo, backend, and frontend — as containers. No local
Mongo or two terminals required.

```bash
# From the project root
cd /Users/sparsh/Downloads/CineDrip

# Free the ports Docker needs (3000 = backend, 27017 = mongo, 8080 = frontend)
# if anything local is already using them:
#   pkill -f nodemon; pkill -f vite; brew services stop mongodb-community 2>/dev/null; pkill mongod

# Export the required env vars (TMDB_API_KEY is read from your existing .env)
export TMDB_API_KEY=$(grep '^TMDB_API_KEY=' cinedrip-backend/.env | cut -d= -f2)
export JWT_SECRET=$(openssl rand -hex 32)

# Build and start everything (mongo + backend + frontend)
docker-compose up --build
```

Then open the app at **http://localhost:8080** (Nginx serves the SPA and proxies
`/api` → backend on `:3000`). The backend API is also directly reachable at
http://localhost:3000.

Run in the background instead of a blocking terminal:

```bash
docker-compose up -d --build
docker-compose logs -f        # follow all container logs
```

Manage the stack:

```bash
docker-compose ps                 # container status
docker-compose logs -f backend    # follow backend logs
docker-compose down               # stop (keeps Mongo data volume)
docker-compose down -v            # stop + delete Mongo data volume
```

Notes:
- `TMDB_API_KEY` is required — without it the app has no movie data. It's pulled
  from `cinedrip-backend/.env`, so your key stays local (not committed).
- `JWT_SECRET` is generated fresh each run; sessions expire on container restart.
  For a stable secret, set it to a fixed value instead of `openssl rand -hex 32`.
- `CORS_ORIGIN` defaults to `http://localhost:8080,http://localhost:5173,http://localhost`,
  so it works in both Docker and local dev. Override it for real deployments.

## 3. Using the app
1. Register a new account (or log in).
2. Complete the 3-step onboarding (genres, vibes/eras/origins, rate sample movies).
3. You land on Home with personalized recommendations.
4. Explore/search, open a movie for its trailer, and add items to your watchlist.

## 4. Production build (optional)
```bash
cd cinedrip-frontend
npm run build      # outputs to dist/
npm run preview    # serves the built app
```
For a real deployment, point the frontend at the backend URL (set the axios `baseURL` or configure your own proxy) and serve the backend behind your host of choice.

## Troubleshooting
- **Recommendations empty / 403:** Make sure you finished onboarding (sets `isOnboarded`).
- **TMDB calls fail:** Check `TMDB_API_KEY` in `.env` and that your key is active.
- **Mongo connection refused:** Ensure `mongod` is running and `MONGO_URI` matches.
- **Vite not found after install:** Re-run `npm install --include=dev`.
