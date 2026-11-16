#!/usr/bin/env sh
# Daily backup: PostgreSQL dump + uploaded files. Run from cron on the host, e.g.
#   15 2 * * * /opt/athana/deploy/backup.sh >> /var/log/athana-backup.log 2>&1
# Copy the resulting archives off-site (object storage in another region) and test restores regularly.
set -eu
cd "$(dirname "$0")/.."
BACKUP_DIR="${BACKUP_DIR:-/var/backups/athana}"
KEEP_DAYS="${KEEP_DAYS:-30}"
ENV_FILE="${ENV_FILE:-.env.production}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"
docker compose --env-file "$ENV_FILE" exec -T db pg_dump -U athana -d athana --format=custom > "$BACKUP_DIR/db-$STAMP.dump"
docker compose --env-file "$ENV_FILE" exec -T app tar czf - -C /data/storage . > "$BACKUP_DIR/uploads-$STAMP.tar.gz"
find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete
echo "$STAMP backup complete"
