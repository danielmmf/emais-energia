#!/usr/bin/env bash
set -euo pipefail

PID_FILE=".planning/reports/telegram_worker.pid"
STATE_FILE=".planning/reports/telegram_worker_state.json"

find_worker_pid() {
  pgrep -af "node scripts/bot/telegram_groq_worker.js" | awk 'NR==1 {print $1}'
}

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "worker_running pid=$PID"
  else
    REAL_PID=$(find_worker_pid || true)
    if [ -n "${REAL_PID:-}" ]; then
      echo "$REAL_PID" > "$PID_FILE"
      echo "worker_running pid=$REAL_PID (recovered)"
    else
      echo "worker_stale_pid pid=$PID"
    fi
  fi
else
  REAL_PID=$(find_worker_pid || true)
  if [ -n "${REAL_PID:-}" ]; then
    echo "$REAL_PID" > "$PID_FILE"
    echo "worker_running pid=$REAL_PID (recovered)"
  else
    echo "worker_stopped"
  fi
fi

if [ -f "$STATE_FILE" ]; then
  echo "-- state --"
  cat "$STATE_FILE"
fi
