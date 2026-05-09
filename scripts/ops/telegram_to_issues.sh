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
REPO="${GITHUB_REPOSITORY:-danielmmf/emais-energia}"
STATE_FILE=".planning/reports/telegram_offset.txt"

if [ -z "$BOT_TOKEN" ]; then
  echo "telegram_to_issues_skip: TELEGRAM_BOT_TOKEN missing"
  exit 0
fi

offset=0
if [ -f "$STATE_FILE" ]; then
  offset=$(cat "$STATE_FILE")
fi

RESP=$(curl -fsS "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=1")
echo "$RESP" | jq -e '.ok == true' >/dev/null

max_update_id=$offset
created=0

while IFS= read -r row; do
  update_id=$(echo "$row" | jq -r '.update_id')
  text=$(echo "$row" | jq -r '.message.text // empty')
  chat=$(echo "$row" | jq -r '.message.chat.id // empty')
  user=$(echo "$row" | jq -r '.message.from.username // .message.from.first_name // "anon"')

  if [ "$update_id" -ge "$max_update_id" ]; then
    max_update_id=$((update_id + 1))
  fi

  if [ -n "$CHAT_ID" ] && [ "$chat" != "$CHAT_ID" ]; then
    continue
  fi
  [ -n "$text" ] || continue

  lower=$(echo "$text" | tr '[:upper:]' '[:lower:]')

  if [[ "$lower" == /issue* || "$lower" == issue:* ]]; then
    title=$(echo "$text" | sed -E 's#^/issue[[:space:]]*##I; s#^issue:[[:space:]]*##I' | cut -c1-120)
    if [ -z "$title" ]; then
      title="Issue criada via Telegram"
    fi

    body=$(cat <<BODY
Origem: Telegram
Usuario: @${user}
Mensagem completa:
${text}
BODY
)

    gh issue create --repo "$REPO" --title "$title" --body "$body" --label "triage" >/dev/null
    created=$((created + 1))
  fi
done < <(echo "$RESP" | jq -c '.result[]')

echo "$max_update_id" > "$STATE_FILE"
echo "telegram_to_issues_ok: created=${created}"
