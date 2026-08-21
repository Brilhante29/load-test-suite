param(
  [string]$ImageTag = "load-test-suite:local",
  [string]$ResultName = "p95-curve-local.json",
  [switch]$Build
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$resultDir = Join-Path $root "benchmarks\results"
New-Item -ItemType Directory -Force -Path $resultDir | Out-Null

if ($Build) {
  & docker build -t $ImageTag $root
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$imageId = (& docker image inspect --format "{{.Id}}" $ImageTag 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($imageId)) {
  throw "Docker image '$ImageTag' was not found. Use -Build or build it first."
}

$commit = (& git -C $root rev-parse HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commit)) { $commit = "working-tree" }
$command = "docker run --rm -v <repo>/benchmarks/results:/results -e RESULT_FILE_NAME=$ResultName $ImageTag benchmark"

$arguments = @(
  "run", "--rm",
  "-v", "${resultDir}:/results",
  "-e", "RESULT_FILE_NAME=$ResultName",
  "-e", "BENCHMARK_IMAGE=$ImageTag",
  "-e", "BENCHMARK_IMAGE_ID=$imageId",
  "-e", "BENCHMARK_COMMIT=$commit",
  "-e", "BENCHMARK_COMMAND=$command",
  $ImageTag, "benchmark"
)
& docker @arguments
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "benchmark result: $(Join-Path $resultDir $ResultName)"
