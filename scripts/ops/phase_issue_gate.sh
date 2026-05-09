#!/usr/bin/env bash
set -euo pipefail

STRICT_MODE="${STRICT_MODE:-0}"
PHASE_INPUT="${1:-}"

phase_from_state() {
  if [ -f .planning/STATE.md ]; then
    local found
    found=$(rg -o "Phase: [0-9]+" .planning/STATE.md | head -n1 | rg -o "[0-9]+" || true)
    echo "$found"
    return
  fi
  echo ""
}

PHASE="${PHASE_INPUT:-$(phase_from_state)}"
if [ -z "$PHASE" ]; then
  echo "phase_issue_gate: phase not found"
  exit 1
fi

mkdir -p .planning/reports
REPORT_FILE=".planning/reports/phase-${PHASE}-issues.md"
TMP_JSON="$(mktemp)"

REPO="${GITHUB_REPOSITORY:-danielmmf/emais-energia}"

gh issue list --repo "$REPO" --state open --limit 200 --json number,title,body,labels,url > "$TMP_JSON"

FILTERED=$(jq --arg p "$PHASE" '
  map(
    . as $issue |
    {
      number: .number,
      title: .title,
      url: .url,
      labels: (.labels | map(.name)),
      body: (.body // "")
    }
  )
  | map(
      select(
        (
          (.labels | map(ascii_downcase) | join(" "))
          | test("phase[ -]?" + $p)
          or test("fase[ -]?" + $p)
        )
        or ((.title + " " + .body) | ascii_downcase | test("phase[ -]?" + $p))
        or ((.title + " " + .body) | ascii_downcase | test("fase[ -]?" + $p))
      )
    )
' "$TMP_JSON")

COUNT=$(echo "$FILTERED" | jq 'length')

{
  echo "# Phase ${PHASE} Issue Gate"
  echo
  echo "- Timestamp: $(date -Iseconds)"
  echo "- Open issues linked to phase: ${COUNT}"
  echo
  if [ "$COUNT" -eq 0 ]; then
    echo "No open issues mapped to this phase."
  else
    echo "## Matching issues"
    echo
    echo "$FILTERED" | jq -r '.[] | "- #\(.number) - \(.title) (\(.url))"'
  fi
} > "$REPORT_FILE"

rm -f "$TMP_JSON"

echo "phase=${PHASE} open_count=${COUNT} report=${REPORT_FILE}"

if [ "$STRICT_MODE" = "1" ] && [ "$COUNT" -gt 0 ]; then
  echo "phase_issue_gate: blocked by STRICT_MODE"
  exit 10
fi
