# CineDrip — Architecture

A full-stack, production-grade movie recommendation platform. Two-package monorepo:
`cinedrip-backend` (Express + MongoDB) and `cinedrip-frontend` (React + Vite).

## High-level flow

```
Browser (React SPA)
   │  REST + Bearer JWT
   ▼
Express API (helmet, cors, rate-limit, express.json)
   ├─ /api/auth        register / login (bcrypt + JWT)
   ├─ /api/taste       onboarding taste save/get
   ├─ /api/movies      TMDB proxy (trending, search, detail, genres)
   ├─ /api/recommendations  scored personalized picks
   ├─ /api/watchlist   per-user saved list
   └─ /api/admin       RBAC-protected analytics + user table
   │  Mongoose ODM
   ▼
MongoDB (users, movies cache, watchlist)
   │  axios
   ▼
TMDB API (external movie data)
```

## Backend modules

| Path | Responsibility |
|------|----------------|
| `server.js` | App wiring, security middleware, error handler, conditional start |
| `config/db.js` | Mongoose connection |
| `middleware/auth.js` | JWT verify → `req.user = { id, username, role }` |
| `middleware/rbac.js` | `requireRole('admin')` guard |
| `models/User.js` | username, email, password(hash), taste, isOnboarded, role |
| `models/Movie.js` | Cached TMDB movie metadata |
| `models/Watchlist.js` | Per-user saved items (unique userId+tmdbId) |
| `routes/*` | Resource routers (auth, taste, movies, recommendations, watchlist, admin) |
| `services/recommender.js` | Pure scoring/derivation (unit-tested, no I/O) |

## Database schema (Mongoose)

**User**
- `username`: String unique, required, trimmed
- `email`: String unique, required, lowercased
- `password`: String (bcrypt hash, cost 10)
- `taste`: { genres[], vibes[], eras[], origins[], watchVibe }
- `isOnboarded`: Boolean default false
- `role`: Enum `user` | `admin` default `user`
- timestamps

**Movie**
- `tmdbId`: Number unique; `title`, `overview`, `posterPath`, `backdropPath`
- `releaseYear`, `genres[]`, `vibes[]`, `origins[]`, `language`, `avgRating`, `popularity`
- timestamps

**Watchlist**
- `userId`: ObjectId ref User (required)
- `tmdbId`: Number (required)
- `movieTitle`, `posterPath`
- unique compound index `{ userId, tmdbId }`; timestamps

## API endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | public | 201 + JWT; role defaults `user` |
| POST | `/api/auth/login` | public | 200 + JWT; vague errors |
| POST | `/api/taste/save` | user | sets taste + `isOnboarded=true` |
| GET | `/api/taste` | user | returns taste + onboarding flag |
| GET | `/api/movies/trending` | user | TMDB proxy |
| GET | `/api/movies/search?query=` | user | TMDB proxy |
| GET | `/api/movies/genres/list` | user | **before** `:id` route |
| GET | `/api/movies/:id` | user | detail + YouTube trailer |
| GET | `/api/recommendations` | user+onboarded | sequential TMDB fetches, scored |
| POST | `/api/watchlist` | user | dup-check scoped to user |
| GET | `/api/watchlist` | user | scoped to user |
| DELETE | `/api/watchlist/:tmdbId` | user | `parseInt` param, scoped |
| GET | `/api/admin/analytics` | admin | totals, rates, top watchlisted |
| GET | `/api/admin/users` | admin | search + filter + paginate |
| PATCH | `/api/admin/users/:id/role` | admin | promote/demote |

## Authentication flow

1. Client `POST /api/auth/login` → receives `{ token, user }`.
2. `AuthContext` stores token + user in localStorage; axios interceptor attaches
   `Authorization: Bearer <token>` to every request.
3. Backend `auth` middleware verifies the JWT with `JWT_SECRET`, attaches `req.user`.
4. `requireRole` enforces RBAC for `/api/admin/*`.
5. Token expires in 7 days; on 401 the client redirects to `/login`.

## Security posture

- **Hashing:** bcrypt (cost 10). **Tokens:** HS256 JWT, 7d.
- **Headers:** `helmet()` sets CSP, HSTS, X-Content-Type-Options, etc.
- **CORS:** configurable origin via `CORS_ORIGIN` (comma-separated) or reflect.
- **Rate limit:** global 300 req / 15 min with standard headers.
- **Input limits:** `express.json({ limit: '10kb' })`.
- **Scoping:** every protected query filters by `req.user.id` (no cross-user leaks).
- **Secrets:** `JWT_SECRET`, `TMDB_API_KEY` via `.env`; never logged.

## Frontend architecture

- `src/api/client.js` — axios instance + per-resource API objects (incl. `adminAPI`).
- `src/context/AuthContext.jsx` — session state, `isAdmin` derivation, `updateUser`.
- `src/components/*` — `Loader`, `MovieCard`, `ScoreRing`, `Row`, `NavBar`, `Sidebar`, `ProtectedRoute`.
- `src/pages/*` — `Landing`, `Login`, `Register`, `Onboarding`, `Home`, `Explore`,
  `Watchlist`, `Profile`, `MovieDetail`, `Admin`.
- `App.jsx` — `AuthProvider` + `BrowserRouter` + `Toaster`; public vs protected routes.

## Testing strategy (TDD)

- **Backend:** Jest + Supertest. `tests/setup.js` boots `mongodb-memory-server`
  (no external Mongo). Pure recommender logic unit-tested; auth/RBAC/admin/
  watchlist-scoping integration-tested. 20 tests.
- **Frontend:** Vitest + RTL + jsdom. Component tests under `src/test/*`.
- **Gate:** root `./verify.sh` runs lint + type-check + tests + build for both
  packages and exits 0 only when all pass.

## Deployment

- Containerized; verified end-to-end via `docker compose up` (backend + mongo + frontend
  all reach `running`, register returns 201, SPA serves 200 through the nginx proxy).
- **Backend image** (`cinedrip-backend/Dockerfile`): multi-stage, Debian `node:20-bookworm-slim`
  (not Alpine — `mongodb-memory-server` needs glibc + a detectable `/etc/os-release`).
  Build stage runs a hermetic gate: `npm run lint && npm run test:unit` (pure unit tests,
  no mongod download). Runtime stage installs production deps only and copies app source
  (not the build stage's `node_modules`) so the image ships jest/memory-server-free.
- **Frontend image** (`cinedrip-frontend/Dockerfile`): multi-stage; Vite build → Nginx.
  `nginx.conf` uses a variable + Docker embedded DNS resolver so the container still serves
  the SPA even if the `backend` upstream isn't resolvable at boot (no `[emerg] host not found`
  crash). `/api/` is proxied to `backend:3000`; all other routes fall back to `index.html`.
- Env required in prod: `MONGO_URI`, `JWT_SECRET`, `TMDB_API_KEY`, `CORS_ORIGIN`.
- MongoDB and backend orchestrated via `docker-compose.yml`; frontend image is standalone static.

## CI gate

`verify.sh` is the source of truth. Run locally or in CI:
```bash
./verify.sh   # lint ▸ type-check ▸ test ▸ build (both packages)
```
