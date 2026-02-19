#!/bin/bash
# Run Supabase migrations locally
# Prerequisites: supabase CLI installed, supabase login, supabase link
# Usage: ./scripts/migrate.sh [up|reset]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

CMD="${1:-up}"

case "$CMD" in
  up)
    echo "Running migrations..."
    supabase db push
    ;;
  reset)
    echo "Resetting database (destructive)..."
    supabase db reset
    ;;
  *)
    echo "Usage: $0 [up|reset]"
    echo "  up   - Apply migrations (supabase db push)"
    echo "  reset - Reset DB and re-run all migrations"
    exit 1
    ;;
esac

echo "Done."
