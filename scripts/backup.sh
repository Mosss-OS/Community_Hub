#!/usr/bin/env bash
set -euo pipefail

# Database backup script
# Usage:
#   DATABASE_URL=postgres://... scripts/backup.sh
# Optional env:
#   BACKUP_DIR=./backups
#   BACKUP_RETENTION_DAYS=30
#   S3_BACKUP_BUCKET=my-backups-bucket
#   S3_BACKUP_PREFIX=community-hub
#   BACKUP_ALERT_WEBHOOK=https://hooks.example.com/...

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DB_URL="${DATABASE_URL:-}"
FILENAME="community_hub_backup_${TIMESTAMP}.sql"
TARGET_FILE="${BACKUP_DIR}/${FILENAME}"
COMPRESSED_FILE="${TARGET_FILE}.gz"
LATEST_MARKER="${BACKUP_DIR}/latest-success.txt"

if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL is required."
  exit 1
fi

notify_failure() {
  local message="$1"
  if [ -n "${BACKUP_ALERT_WEBHOOK:-}" ]; then
    curl -sS -X POST "$BACKUP_ALERT_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"${message}\"}" >/dev/null || true
  fi
}

trap 'notify_failure "Database backup failed on $(hostname) at ${TIMESTAMP}"' ERR

mkdir -p "$BACKUP_DIR"

echo "Creating backup: ${TARGET_FILE}"
pg_dump "$DB_URL" > "$TARGET_FILE"

echo "Compressing backup..."
gzip -f "$TARGET_FILE"

echo "Pruning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "community_hub_backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

if [ -n "${S3_BACKUP_BUCKET:-}" ]; then
  S3_KEY="${S3_BACKUP_PREFIX:-community-hub}/$(basename "$COMPRESSED_FILE")"
  echo "Uploading backup to s3://${S3_BACKUP_BUCKET}/${S3_KEY}"
  aws s3 cp "$COMPRESSED_FILE" "s3://${S3_BACKUP_BUCKET}/${S3_KEY}" --only-show-errors
fi

echo "$(date -Iseconds) ${COMPRESSED_FILE}" > "$LATEST_MARKER"
echo "Backup completed successfully: ${COMPRESSED_FILE}"
