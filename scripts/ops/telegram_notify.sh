#!/usr/bin/env bash
set -euo pipefail

load_env_file() {
  [ -f .env ] || return 0
  while IFS= read -r line; do
    line="${line%$'\r'}"
    [ -z "$line" ] && continue
    case "$line" in
      \#*) continue ;;
    esac
    case "$line" in
      *=*)
        key="${line%%=*}"
        value="${line#*=}"
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        export "$key=$value"
      ;;
    esac
  done < .env
}

load_env_file

BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"
MESSAGE="${1:-}"
CACHE_FILE=".planning/reports/telegram_chat_ids.txt"
STATE_FILE=".planning/reports/telegram_worker_state.json"

if [ -z "$BOT_TOKEN" ]; then
  echo "telegram_skip: TELEGRAM_BOT_TOKEN missing"
  exit 0
fi

if [ -z "$MESSAGE" ]; then
  echo "telegram_skip: empty message"
  exit 0
fi

resolve_chat_ids() {
  if [ -n "$CHAT_ID" ]; then
    echo "$CHAT_ID" | tr ',' '\n'
    return 0
  fi

  mkdir -p .planning/reports
  touch "$CACHE_FILE"

  if [ -f "$STATE_FILE" ]; then
    jq -r '.knownChats[]? // empty' "$STATE_FILE" >> "$CACHE_FILE" || true
  fi

  sort -u "$CACHE_FILE"
}

CHAT_IDS="$(resolve_chat_ids)"
if [ -z "$CHAT_IDS" ]; then
  echo "telegram_skip: no active chat found in bot updates"
  exit 0
fi

SENT_COUNT=0
while IFS= read -r cid; do
  [ -n "$cid" ] || continue
  if curl -fsS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${cid}" \
    --data-urlencode "text=${MESSAGE}" \
    -d "parse_mode=Markdown" >/dev/null; then
    SENT_COUNT=$((SENT_COUNT + 1))
  fi
done <<< "$CHAT_IDS"

if [ "${SENT_COUNT:-0}" -eq 0 ]; then
  echo "telegram_warn: none message sent"
  exit 0
fi

echo "telegram_ok sent=${SENT_COUNT}"
