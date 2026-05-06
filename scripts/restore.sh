#!/usr/bin/env bash
set -euo pipefail

# Restore a backup created by scripts/backup.sh
# Usage:
#   DATABASE_URL=postgres://... scripts/restore.sh ./backups/community_hub_backup_x.sql.gz

if [ $# -lt 1 ]; then
  echo "Usage: DATABASE_URL=postgres://... $0 <backup-file.sql.gz|backup-file.sql>"
  exit 1
fi

DB_URL="${DATABASE_URL:-}"
BACKUP_FILE="$1"

if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL is required."
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring backup from: $BACKUP_FILE"

if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | psql "$DB_URL"
else
  psql "$DB_URL" < "$BACKUP_FILE"
fi

echo "Restore completed successfully."
