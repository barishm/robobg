#!/bin/bash

set -Eeuo pipefail

# --- CONFIG ---
ENV_FILE=".env"
BACKUP_DIR="./backups"
FILES_DIR="./files"
RETENTION=10

# --- LOAD ENV ---
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ .env file not found"
  exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

# Validate required vars
REQUIRED_VARS=(DB_NAME DB_USER DB_PASSWORD DB_CONTAINER)
for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!VAR:-}" ]]; then
    echo "❌ Missing env variable: $VAR"
    exit 1
  fi
done

# Check docker container
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "❌ Docker container '$DB_CONTAINER' is not running"
  exit 1
fi

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
TMP_DIR=$(mktemp -d)
ARCHIVE_NAME="backup_${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"

echo "📦 Starting backup at $TIMESTAMP"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$BACKUP_DIR"

# --- DB BACKUP ---
echo "🗄️ Dumping database..."

docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" \
  pg_dump -U "$DB_USER" "$DB_NAME" > "$TMP_DIR/db.sql"

# Validate dump
if [[ ! -s "$TMP_DIR/db.sql" ]]; then
  echo "❌ Database dump failed or empty"
  exit 1
fi

# --- FILES BACKUP ---
if [[ -d "$FILES_DIR" ]]; then
  echo "📁 Copying files..."
  cp -r "$FILES_DIR" "$TMP_DIR/"
else
  echo "⚠️ files directory not found, skipping"
fi

# --- CREATE ARCHIVE ---
echo "🗜️ Creating archive..."
tar -czf "$ARCHIVE_PATH" -C "$TMP_DIR" .

# Validate archive
if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "❌ Failed to create archive"
  exit 1
fi

echo "✅ Backup created: $ARCHIVE_PATH"

# --- RETENTION ---
echo "🧹 Cleaning old backups (keeping last $RETENTION)..."

cd "$BACKUP_DIR"
ls -1t backup_*.tar.gz | tail -n +$((RETENTION+1)) | xargs -r rm --
cd - >/dev/null

echo "✅ Done"
