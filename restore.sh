#!/bin/bash

set -Eeuo pipefail

ENV_FILE=".env"

if [[ $# -ne 1 ]]; then
  echo "Usage: ./restore.sh <backup-file>"
  exit 1
fi

BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Load env
export $(grep -v '^#' "$ENV_FILE" | xargs)

REQUIRED_VARS=(DB_NAME DB_USER DB_PASSWORD DB_CONTAINER)
for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!VAR:-}" ]]; then
    echo "❌ Missing env variable: $VAR"
    exit 1
  fi
done

# Check container
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "❌ Docker container '$DB_CONTAINER' is not running"
  exit 1
fi

# ⚠️ CONFIRMATION (important safety)
echo "⚠️ This will DELETE and recreate database '$DB_NAME'"
read -p "Continue? (y/N): " confirm
[[ "$confirm" != "y" ]] && echo "Aborted" && exit 1

TMP_DIR=$(mktemp -d)

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "📦 Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$TMP_DIR"

# --- VALIDATE ---
if [[ ! -f "$TMP_DIR/db.sql" ]]; then
  echo "❌ db.sql not found in backup"
  exit 1
fi

# --- RESET DATABASE ---
echo "🧨 Dropping and recreating database..."

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d postgres <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

# --- RESTORE DB ---
echo "🗄️ Restoring database..."

cat "$TMP_DIR/db.sql" | docker exec -i "$DB_CONTAINER" \
  psql -U "$DB_USER" -d "$DB_NAME"

echo "✅ Database restored"

# --- RESTORE FILES ---
if [[ -d "$TMP_DIR/files" ]]; then
  echo "📁 Restoring files..."

  rm -rf ./files
  cp -r "$TMP_DIR/files" ./files

  echo "✅ Files restored"
else
  echo "⚠️ No files directory in backup"
fi

echo "🎉 Restore completed"
