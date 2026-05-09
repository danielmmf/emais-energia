#!/usr/bin/env bash
set -euo pipefail

mkdir -p .planning/reports

PID_FILE=".planning/reports/telegram_worker.pid"
LOG_FILE=".planning/reports/telegram_worker.log"

find_worker_pid() {
  pgrep -af "node scripts/bot/telegram_groq_worker.js" | awk 'NR==1 {print $1}'
}

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "worker_already_running pid=$PID"
    exit 0
  fi
fi

nohup setsid node scripts/bot/telegram_groq_worker.js >> "$LOG_FILE" 2>&1 < /dev/null &
PID=$!
sleep 1
if ! kill -0 "$PID" 2>/dev/null; then
  REAL_PID=$(find_worker_pid || true)
  if [ -n "${REAL_PID:-}" ]; then
    PID="$REAL_PID"
  fi
fi
echo "$PID" > "$PID_FILE"
echo "worker_started pid=$PID log=$LOG_FILE"
