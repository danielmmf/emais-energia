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

DEPLOY_URL="${DEPLOY_ENDPOINT_URL:-https://emais-energia.devinhas.com.br/deploy/pull.php}"
DEPLOY_TOKEN="${DEPLOY_ENDPOINT_TOKEN:-baconpedacudo}"
PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-https://emais-energia.devinhas.com.br}"
export PLAYWRIGHT_BASE_URL

PHASE_INFO=$(bash scripts/ops/phase_issue_gate.sh)

DEPLOY_START_MESSAGE=$(printf '🚀 Inicio deploy Viabilidade Verde\n%s\nBranch: %s' "$PHASE_INFO" "$(git branch --show-current)")
bash scripts/ops/telegram_notify.sh "$DEPLOY_START_MESSAGE"

git push origin "$(git branch --show-current)"

DEPLOY_OUTPUT=$(curl -fsS -X POST "$DEPLOY_URL" -d "token=${DEPLOY_TOKEN}")
echo "$DEPLOY_OUTPUT" | jq -e '.ok == true' >/dev/null

npx playwright test tests/playwright/production.smoke.spec.js tests/playwright/production.mobile.spec.js --reporter=line

DEPLOY_DONE_MESSAGE=$(printf '✅ Deploy e teste Playwright OK\nURL: %s' "${PLAYWRIGHT_BASE_URL}")
bash scripts/ops/telegram_notify.sh "$DEPLOY_DONE_MESSAGE"

echo "publish_and_test_ok"
