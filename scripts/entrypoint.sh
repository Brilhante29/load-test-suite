#!/bin/sh
set -eu

mode="${1:-benchmark}"
if [ "$mode" = "target" ]; then
  exec /usr/local/bin/load-target
fi

if [ "$mode" != "benchmark" ]; then
  exec "$@"
fi

/usr/local/bin/load-target &
target_pid=$!

cleanup() {
  kill "$target_pid" 2>/dev/null || true
  wait "$target_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 0.2
set +e
k6 run /work/k6/p95-curve.js
status=$?
set -e
exit "$status"
