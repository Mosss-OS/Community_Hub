#!/usr/bin/env bash
set -euo pipefail

# Installs or updates the cron job defined in scripts/backup.cron.
# Usage: scripts/install-backup-cron.sh

CRON_FILE="$(cd "$(dirname "$0")" && pwd)/backup.cron"

if [ ! -f "$CRON_FILE" ]; then
  echo "ERROR: backup.cron not found."
  exit 1
fi

# Remove old entry if present, then append current one.
(crontab -l 2>/dev/null | rg -v "community_hub_backup\\.log|scripts/backup\\.sh" || true; cat "$CRON_FILE") | crontab -
echo "Backup cron installed/updated from ${CRON_FILE}"
