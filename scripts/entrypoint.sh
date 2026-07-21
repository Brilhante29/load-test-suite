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

ready=0
attempt=0
while [ "$attempt" -lt 30 ]; do
  if k6 run --quiet -e "TARGET_URL=$TARGET_URL" /work/k6/readiness.js >/dev/null 2>&1; then
    ready=1
    break
  fi
  attempt=$((attempt + 1))
  sleep 0.1
done
if [ "$ready" -ne 1 ]; then
  echo "load target did not become ready" >&2
  exit 1
fi

set +e
k6 run /work/k6/p95-curve.js
status=$?
set -e
exit "$status"