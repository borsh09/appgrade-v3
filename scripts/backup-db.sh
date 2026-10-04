#!/bin/sh
# Run from the project root on the Docker server: sh scripts/backup-db.sh
set -eu
umask 077
backup_dir=${BACKUP_DIR:-./var/backups}
mkdir -p "$backup_dir"
backup_file="$backup_dir/appgrade-$(date -u +%Y%m%dT%H%M%SZ)-$$.dump"
partial_file="$backup_file.partial"
if docker compose exec -T db pg_dump -U appgrade -d appgrade --format=custom > "$partial_file"; then
  if [ ! -s "$partial_file" ]; then
    printf '%s\n' "Backup is empty: $partial_file" >&2
    exit 1
  fi
  mv "$partial_file" "$backup_file"
  printf '%s\n' "Backup saved: $backup_file"
else
  printf '%s\n' "Backup failed; incomplete file retained: $partial_file" >&2
  exit 1
fi
