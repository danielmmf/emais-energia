#!/usr/bin/env bash
set -euo pipefail

PID_FILE=".planning/reports/telegram_worker.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "worker_not_running"
  exit 0
fi

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "worker_stopped pid=$PID"
else
  echo "worker_not_running"
fi

rm -f "$PID_FILE"
