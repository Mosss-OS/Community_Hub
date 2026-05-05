#!/bin/bash
# Database backup script
# Run this daily via cron: 0 2 * * * /path/to/backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
FILENAME="community_hub_backup_$TIMESTAMP.sql"

# Create backup dir if not exists
mkdir -p "$BACKUP_DIR"

# Run pg_dump
pg_dump "postgres://chubuser:chubpass123@localhost:5432/community_hub" > "$BACKUP_DIR/$FILENAME"

# Compress
gzip "$BACKUP_DIR/$FILENAME"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "community_hub_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/${FILENAME}.gz"
