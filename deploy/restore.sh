#!/usr/bin/env sh
# Restores a database dump created by backup.sh into the running "db" service.
# DANGER: replaces the current database content. Usage: deploy/restore.sh /var/backups/athana/db-<stamp>.dump
set -eu
[ -f "${1:-}" ] || { echo "usage: $0 <db-dump-file>"; exit 1; }
printf 'This will REPLACE the database with %s. Type "restore" to continue: ' "$1"
read -r answer
[ "$answer" = "restore" ] || { echo "aborted"; exit 1; }
docker compose stop app
docker compose exec -T db pg_restore -U athana -d athana --clean --if-exists --no-owner < "$1"
docker compose start app
echo "restore complete"
