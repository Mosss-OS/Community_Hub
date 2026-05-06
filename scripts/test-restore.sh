#!/usr/bin/env bash
set -euo pipefail

# Basic restore verification: validates SQL stream can be read and begins with expected markers.
# Usage:
#   scripts/test-restore.sh ./backups/community_hub_backup_x.sql.gz

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file.sql.gz|backup-file.sql>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [[ "$BACKUP_FILE" == *.gz ]]; then
  SQL_HEAD="$(gunzip -c "$BACKUP_FILE" | sed -n '1,25p')"
else
  SQL_HEAD="$(sed -n '1,25p' "$BACKUP_FILE")"
fi

echo "$SQL_HEAD" | rg -q "PostgreSQL database dump|Dumped from database version|Dumped by pg_dump"
echo "Backup integrity check passed for: $BACKUP_FILE"
