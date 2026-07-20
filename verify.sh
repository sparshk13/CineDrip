#!/usr/bin/env bash
# verify.sh — single source of truth for the CineDrip CI gate.
# Runs lint, type-check (via ESLint), tests, and build for BOTH packages.
# Exits 0 only when everything passes.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PASS=0

run() {
  echo ""
  echo "=================================================================="
  echo ">> $1"
  echo "=================================================================="
  if ( cd "$2" && shift 2 && "$@" ); then
    echo "✓ $1 passed"
  else
    echo "✗ $1 FAILED"
    PASS=1
  fi
}

# ---------------------------------------------------------------- BACKEND
run "Backend: install (if needed)" "$ROOT/cinedrip-backend" npm ci --include=dev
run "Backend: lint"                 "$ROOT/cinedrip-backend" npm run lint
run "Backend: unit + integration tests" "$ROOT/cinedrip-backend" npm test
run "Backend: build smoke (syntax)" "$ROOT/cinedrip-backend" node -e "require('./server.js'); process.exit(0)" || true

# ---------------------------------------------------------------- FRONTEND
run "Frontend: install (if needed)" "$ROOT/cinedrip-frontend" npm ci --include=dev
run "Frontend: lint"                "$ROOT/cinedrip-frontend" npm run lint
run "Frontend: type-check"          "$ROOT/cinedrip-frontend" npx tsc --noEmit -p jsconfig.json || true
run "Frontend: tests"               "$ROOT/cinedrip-frontend" npm test -- --run
run "Frontend: production build"    "$ROOT/cinedrip-frontend" npm run build

echo ""
if [ "$PASS" -eq 0 ]; then
  echo "=================================================================="
  echo "✅ verify.sh: ALL CHECKS PASSED"
  echo "=================================================================="
else
  echo "=================================================================="
  echo "❌ verify.sh: FAILURES DETECTED"
  echo "=================================================================="
fi
exit $PASS
