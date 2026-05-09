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

  local from_updates=""
  from_updates=$(
    curl -fsS "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?timeout=1" \
      | jq -r '[.result[]?.message?.chat?.id, .result[]?.channel_post?.chat?.id, .result[]?.edited_message?.chat?.id] | map(select(. != null)) | unique | .[]'
  )

  mkdir -p .planning/reports
  touch "$CACHE_FILE"

  if [ -n "$from_updates" ]; then
    printf "%s\n" "$from_updates" >> "$CACHE_FILE"
  fi

  sort -u "$CACHE_FILE"
}

CHAT_IDS="$(resolve_chat_ids)"
if [ -z "$CHAT_IDS" ]; then
  echo "telegram_skip: no active chat found in bot updates"
  exit 0
fi

while IFS= read -r cid; do
  [ -n "$cid" ] || continue
  curl -fsS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${cid}" \
    --data-urlencode "text=${MESSAGE}" \
    -d "parse_mode=Markdown" >/dev/null
done <<< "$CHAT_IDS"

echo "telegram_ok"
