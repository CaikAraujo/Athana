#!/usr/bin/env sh
# Daily backup: PostgreSQL dump + uploaded files. Run from cron on the host, e.g.
#   15 2 * * * /opt/athana/deploy/backup.sh >> /var/log/athana-backup.log 2>&1
# Copy the resulting archives off-site (object storage in another region) and test restores regularly.
set -eu
BACKUP_DIR="${BACKUP_DIR:-/var/backups/athana}"
KEEP_DAYS="${KEEP_DAYS:-30}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"
docker compose exec -T db pg_dump -U athana -d athana --format=custom > "$BACKUP_DIR/db-$STAMP.dump"
docker run --rm -v athana_uploads:/data:ro -v "$BACKUP_DIR":/backup alpine tar czf "/backup/uploads-$STAMP.tar.gz" -C /data .
find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete
echo "$STAMP backup complete"
