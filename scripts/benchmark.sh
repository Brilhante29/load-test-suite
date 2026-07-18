#!/usr/bin/env sh
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
image_tag=${IMAGE_TAG:-load-test-suite:local}
result_name=${RESULT_NAME:-p95-curve-local.json}
result_dir="$root/benchmarks/results"
mkdir -p "$result_dir"

if [ "${BUILD_IMAGE:-0}" = "1" ]; then
  docker build -t "$image_tag" "$root"
fi

image_id=$(docker image inspect --format '{{.Id}}' "$image_tag")
commit=$(git -C "$root" rev-parse --short HEAD 2>/dev/null || printf '%s' working-tree)
command="docker run --rm -v <repo>/benchmarks/results:/results -e RESULT_FILE_NAME=$result_name $image_tag benchmark"

docker run --rm \
  -v "$result_dir:/results" \
  -e "RESULT_FILE_NAME=$result_name" \
  -e "BENCHMARK_IMAGE=$image_tag" \
  -e "BENCHMARK_IMAGE_ID=$image_id" \
  -e "BENCHMARK_COMMIT=$commit" \
  -e "BENCHMARK_COMMAND=$command" \
  "$image_tag" benchmark

printf 'benchmark result: %s\n' "$result_dir/$result_name"
