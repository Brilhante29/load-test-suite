param(
  [string]$ImageTag = "load-test-suite:local",
  [switch]$Build
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Push-Location -LiteralPath $root
try {
  if ($Build) {
    & docker build -t $ImageTag .
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  }

  $producer = @(
    "tools/generate-publication-benchmark.py",
    "--repo", ".",
    "--project", "load-test-suite",
    "--benchmark-id", "p95-curve",
    "--image", $ImageTag,
    "--v1-result", "benchmarks/results/29-p95-curve-v1.json",
    "--fixture", "internal/target",
    "--config", "k6",
    "--lock", "Dockerfile",
    "--output", "benchmarks/publication/29-p95-curve-v2.json",
    "--direction", "lower_is_better",
    "--workload-version", "2.0.0",
    "--warmup-iterations", "1",
    "--measured-iterations", "4",
    "--concurrency", "20",
    "--runtime", "go-1.26.6+k6-2.1.0",
    "--comparability-key", "p95-curve:2.0.0:vus-1-5-10-20:repeats-3:window-3s:workers-4:service-2ms:k6-2.1.0",
    "--timeout-seconds", "120",
    "--",
    "pwsh", "-NoProfile", "-File", "scripts/benchmark.ps1",
    "-ImageTag", $ImageTag,
    "-ResultName", "29-p95-curve-v1.json"
  )
  & python @producer
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  & python tools/validate-publication.py --require-git
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}
