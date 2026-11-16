#!/usr/bin/env sh
# Restores a database dump (and optionally the uploads archive) created by backup.sh.
# DANGER: replaces the current database content.
# Usage: deploy/restore.sh <db-dump-file> [uploads-archive.tar.gz]
set -eu
cd "$(dirname "$0")/.."
ENV_FILE="${ENV_FILE:-.env.production}"
[ -f "${1:-}" ] || { echo "usage: $0 <db-dump-file> [uploads-archive.tar.gz]"; exit 1; }
printf 'This will REPLACE the database with %s. Type "restore" to continue: ' "$1"
read -r answer
[ "$answer" = "restore" ] || { echo "aborted"; exit 1; }
docker compose --env-file "$ENV_FILE" stop app
docker compose --env-file "$ENV_FILE" exec -T db pg_restore -U athana -d athana --clean --if-exists --no-owner < "$1"
docker compose --env-file "$ENV_FILE" start app
if [ -f "${2:-}" ]; then
  docker compose --env-file "$ENV_FILE" exec -T app tar xzf - -C /data/storage < "$2"
  echo "uploads restored"
fi
echo "restore complete"
