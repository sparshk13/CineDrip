# CineDrip

A production-grade, full-stack **movie recommendation platform**. Users onboard with
their taste (genres, vibes, eras, origins), get personalized picks scored by a
transparent recommender, explore/search TMDB, and build a watchlist. An **admin
console** provides analytics and a filterable, paginated user data-table with
role management.

> Stack: **Node.js + Express + MongoDB (Mongoose)** backend · **React + Vite +
> Tailwind** frontend · JWT auth · RBAC · helmet/rate-limit/CORS security.

---

## Features

- **Authentication** — register/login with bcrypt-hashed passwords and 7-day JWTs.
- **Onboarding** — 3-step taste capture; drives personalized scoring.
- **Recommendations** — pure, testable scoring service over TMDB trending/top-rated/popular.
- **Explore & Search** — TMDB proxy with trailer lookup.
- **Watchlist** — per-user saved movies (no cross-user leakage).
- **RBAC + Admin console** — `user`/`admin` roles; admin-only analytics dashboard and
  user data-table with search, role filter, pagination, and promote/demote.
- **Enterprise security** — `helmet` headers, global rate limiting, strict CORS,
  JSON body limits, per-user query scoping.
- **Design system** — dark OKLCH-based palette, accessible components (see `docs/DESIGN.md`).
- **CI gate** — `./verify.sh` lints, type-checks, tests, and builds both packages.

---

## Repository layout

```
CineDrip/
├── cinedrip-backend/      Express API (auth, taste, movies, recommendations, watchlist, admin)
│   ├── models/  routes/  services/  middleware/  config/
│   └── tests/             Jest + Supertest (mongodb-memory-server)
├── cinedrip-frontend/     React SPA (pages, components, context, api)
│   └── src/test/          Vitest + RTL
├── docs/                  DESIGN.md, ARCHITECTURE.md
├── .commandcode/skills/   stack.md, conventions.md (project context)
├── verify.sh              single source of truth CI gate
├── docker-compose.yml     mongo + backend + frontend
└── README.md
```

---

## Prerequisites

- Node.js ≥ 18 (built on v24)
- MongoDB (local `mongod`, Atlas URI, or Docker)
- A free [TMDB API key](https://www.themoviedb.org/settings/api)
- Docker (optional, for containerized run)

---

## Local development

### 1. Backend
```bash
cd cinedrip-backend
cp ../.env.example .env        # then set MONGO_URI, JWT_SECRET, TMDB_API_KEY
npm install --include=dev
npm run dev                    # http://localhost:3000
```

### 2. Frontend (separate terminal)
```bash
cd cinedrip-frontend
npm install --include=dev
npm run dev                    # http://localhost:5173 (proxies /api → :3000)
```

Open http://localhost:5173, register, complete onboarding, and explore.

### Seeding an admin
In the Mongo shell or a script:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```
Then visit `/admin` after login.

---

## Testing & quality gate

Run everything (lint ▸ type-check ▸ tests ▸ build) from the repo root:
```bash
./verify.sh
```
Per-package:
```bash
# Backend
cd cinedrip-backend && npm run lint && npm test

# Frontend
cd cinedrip-frontend && npm run lint && npm run build && npm test -- --run
```
- Backend tests use an **in-memory MongoDB** — no external database required.
- 20 backend tests (recommender unit + auth/RBAC/admin/watchlist integration).
- Frontend component tests via Vitest + Testing Library.

---

## Docker

```bash
# from repo root
export JWT_SECRET="$(openssl rand -hex 32)"
export TMDB_API_KEY="your_key"
docker compose up --build
```
- Frontend: http://localhost:8080 (Nginx serves the SPA, proxies `/api` → backend)
- Backend: http://localhost:3000
- Mongo: mongodb://mongo:27017/cinedrip

---

## Environment variables

| Var | Where | Purpose |
|-----|-------|---------|
| `PORT` | backend | API port (default 3000) |
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | JWT signing secret (keep secret) |
| `TMDB_API_KEY` | backend | TMDB API key |
| `TMDB_BASE_URL` | backend | TMDB base URL |
| `CORS_ORIGIN` | backend | Comma-separated allowed origins |

---

## API summary

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST/GET | `/api/taste/save`, `/api/taste` | user |
| GET | `/api/movies/trending`, `/search`, `/genres/list`, `/:id` | user |
| GET | `/api/recommendations` | user + onboarded |
| POST/GET/DELETE | `/api/watchlist[/:tmdbId]` | user (scoped) |
| GET | `/api/admin/analytics`, `/api/admin/users` | admin |
| PATCH | `/api/admin/users/:id/role` | admin |

Full schema, auth flow, and security notes: **`docs/ARCHITECTURE.md`**.

---

## Design system

Dark, accessible UI with an OKLCH brand ramp. See **`docs/DESIGN.md`** for tokens,
components, and accessibility decisions.

---

## License

MIT — internal/educational use.
