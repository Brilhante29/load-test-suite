# Verification

## Commands Run

| Command | Result |
|---|---|
| `docker run --rm -v ... golang:1.25-alpine go test ./...` | passed: handler tests green |
| `docker run --rm -v ... golang:1.25-alpine go vet ./...` | passed |
| `node --check k6/p95-curve.js` and module files | passed |
| `docker build -t load-test-suite:local .` | passed |
| `docker run ... load-test-suite:local benchmark` | passed: 0% errors, four VU levels |
| `powershell -NoProfile -File scripts/benchmark.ps1 -ResultName p95-curve-script.json` | passed |
| `powershell -NoProfile -File tools/validate-project.ps1 -Strict` | passed |

## Evidence

- Docker: multi-stage image compiled Go and ran k6 0.49.0.
- Tests: httptest covers health, payload and method rejection.
- Benchmark: `p95-curve-baseline.json` has p95 `[0.9934, 1.5960, 2.0660, 5.3777] ms` and 0 error rate.
- README result: table linked to the baseline JSON.
- References: local kit and k6 attribution documented.
- Reuse review: patch-now/backlog/reject decisions recorded.
- Validation: strict script passed file, JSON, Go, JS, Docker and placeholder checks.

## Publication Decision

- Ready: local implementation is complete and committed; no push was performed.
- Remaining risk: host-level Docker variance and no cloud topology claim.

## Reuse Follow-up

The only kit-level candidate is a future generic tagged-scenario p95 helper;
this project keeps its scenario-specific code local.
