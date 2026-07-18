param(
  [switch]$SkipDocker,
  [switch]$Strict
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$failures = [System.Collections.Generic.List[string]]::new()

function Fail([string]$message) {
  $script:failures.Add($message)
}

function Run-Checked([string]$label, [scriptblock]$command) {
  & $command
  if ($LASTEXITCODE -ne 0) {
    Fail "$label failed with exit code $LASTEXITCODE"
  }
  $global:LASTEXITCODE = 0
}

function Require-File([string]$relativePath) {
  if (-not (Test-Path -LiteralPath (Join-Path $root $relativePath) -PathType Leaf)) {
    Fail "Missing file: $relativePath"
  }
}

$requiredFiles = @(
  "README.md",
  "project.yaml",
  "REFERENCES.md",
  "AGENTS.md",
  "Dockerfile",
  "go.mod",
  "cmd/load-target/main.go",
  "internal/target/handler.go",
  "internal/target/handler_test.go",
  "k6/p95-curve.js",
  "k6/scenarios/p95-curve.js",
  "k6/report/result.js",
  "scripts/entrypoint.sh",
  "scripts/benchmark.ps1",
  "scripts/benchmark.sh",
  ".github/workflows/validate.yml",
  "sdd/spec.md",
  "sdd/benchmark-plan.md",
  "sdd/architecture-decision.md",
  "sdd/technical-decision.md",
  "sdd/agent-handoff.md",
  "sdd/reuse-improvement-review.md",
  "openspec/config.yaml",
  "openspec/changes/implement-load-test-suite/intent.md",
  "openspec/changes/implement-load-test-suite/verification.md"
)
foreach ($file in $requiredFiles) { Require-File $file }

$readmePath = Join-Path $root "README.md"
if (Test-Path -LiteralPath $readmePath) {
  $readme = Get-Content -Raw -LiteralPath $readmePath
  if ($readme -notmatch "(?m)^# #29 load-test-suite") { Fail "README must start with project #29" }
  if ($readme -match "pending") { Fail "README still contains pending benchmark values" }
}

$manifestPath = Join-Path $root "project.yaml"
if (Test-Path -LiteralPath $manifestPath) {
  $manifest = Get-Content -Raw -LiteralPath $manifestPath
  foreach ($pattern in @(
    "(?m)^status: benchmarked$",
    "(?m)^  id: delivery-observability-infra$",
    "(?m)^  primary: go-backend$",
    "(?m)^  primary_metric: p95_curve$",
    "(?m)^  result_path: benchmarks/results/p95-curve-baseline.json$"
  )) {
    if ($manifest -notmatch $pattern) { Fail "project.yaml missing expected contract: $pattern" }
  }
  if ($manifest -match "<[^>]+>") { Fail "project.yaml still contains template placeholders" }
}

$reviewPath = Join-Path $root "sdd/reuse-improvement-review.md"
if (Test-Path -LiteralPath $reviewPath) {
  $review = Get-Content -Raw -LiteralPath $reviewPath
  if ($review -match "<id>|<project-name>|\|  \| `patch_now\|backlog\|reject` \|") {
    Fail "reuse improvement review still contains template placeholders"
  }
  foreach ($pattern in @(
    "(?m)^- \[x\] Reusable improvements were patched or recorded\.$",
    "(?m)^- \[x\] Project-specific implementation was not moved into the kit\.$",
    "(?m)^- \[x\] Validation reflects .+\.$"
  )) {
    if ($review -notmatch $pattern) { Fail "reuse review final gate incomplete: $pattern" }
  }
}

$resultDir = Join-Path $root "benchmarks/results"
$resultFiles = if (Test-Path -LiteralPath $resultDir -PathType Container) {
  @(Get-ChildItem -LiteralPath $resultDir -Filter *.json -File)
} else { @() }
if ($resultFiles.Count -eq 0) {
  Fail "Missing benchmark JSON under benchmarks/results"
}
if (-not (Test-Path -LiteralPath (Join-Path $resultDir "p95-curve-baseline.json") -PathType Leaf)) {
  Fail "Missing versioned baseline p95-curve-baseline.json"
}

foreach ($file in $resultFiles) {
  try {
    $result = Get-Content -Raw -LiteralPath $file.FullName | ConvertFrom-Json
    foreach ($property in @("project", "metric", "value", "unit", "timestamp", "command", "environment", "curve")) {
      if ($null -eq $result.PSObject.Properties[$property]) { Fail "$($file.Name) missing JSON property: $property" }
    }
    if ($result.project -ne "load-test-suite") { Fail "$($file.Name) has wrong project" }
    if ($result.metric -ne "p95_curve") { Fail "$($file.Name) has wrong metric" }
    if ($result.curve.Count -ne 4) { Fail "$($file.Name) must contain four VU levels" }
    if ([string]::IsNullOrWhiteSpace([string]$result.environment.image_tag)) { Fail "$($file.Name) missing image metadata" }
    if ([string]::IsNullOrWhiteSpace([string]$result.environment.runtime)) { Fail "$($file.Name) missing runtime metadata" }
  } catch {
    Fail "Invalid benchmark JSON: $($file.Name): $($_.Exception.Message)"
  }
}

Push-Location -LiteralPath $root
try {
  if (Get-Command go -ErrorAction SilentlyContinue) {
    Run-Checked "go test" { go test ./... }
    Run-Checked "go vet" { go vet ./... }
  } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    $volume = "${root}:/src"
    Run-Checked "container go test" { docker run --rm -v $volume -w /src golang:1.25-alpine go test ./... }
  } else {
    Fail "Neither Go nor Docker is available for Go validation"
  }

  if (Get-Command node -ErrorAction SilentlyContinue) {
    foreach ($script in @("k6/p95-curve.js", "k6/scenarios/p95-curve.js", "k6/report/result.js")) {
      Run-Checked "node syntax $script" { node --check $script }
    }
  } else {
    Fail "Node.js is required for strict k6 syntax validation"
  }
} finally {
  Pop-Location
}

if (-not $SkipDocker) {
  if (Get-Command docker -ErrorAction SilentlyContinue) {
    Run-Checked "docker build" { docker build -t load-test-suite:validation $root }
  } else {
    Fail "Docker is required unless -SkipDocker is used"
  }
}

if ($failures.Count -gt 0) {
  $failures | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host "strict portfolio validation passed"
