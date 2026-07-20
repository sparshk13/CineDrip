# ---- Backend (cinedrip-backend) ----
# Debian-based (not Alpine): mongodb-memory-server needs glibc + a detectable
# /etc/os-release to download its mongod binary during `npm test`.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
# Hermetic gate: lint + pure unit tests (no MongoDB download needed in-image).
# Full integration suite (mongodb-memory-server) runs in CI with a Mongo service.
RUN npm run lint && npm run test:unit

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# Copy only app source (NOT the build stage's node_modules with dev deps).
COPY --from=build /app/config ./config
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/models ./models
COPY --from=build /app/routes ./routes
COPY --from=build /app/services ./services
COPY --from=build /app/server.js ./server.js
EXPOSE 3000
CMD ["node", "server.js"]
