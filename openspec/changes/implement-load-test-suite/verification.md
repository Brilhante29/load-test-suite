# Verification

## Commands Run

| Command | Result |
|---|---|
| `docker run ... golang:1.26.6-alpine gofmt/go test/go vet` | passed: 4 handler tests |
| `node --check k6/*.js` | passed |
| `docker build -t load-test-suite:local .` | passed |
| `pwsh -File scripts/publish-benchmark.ps1 -Build` | passed: 3 curves, 12 measured windows |
| `python tools/validate-publication.py --require-git` | passed |
| `pwsh -File tools/validate-project.ps1 -SkipDocker -Strict` | passed |

## Evidence

- Source commit: `3146602070006665950e42aeddc5aca19a8670db`.
- Image: `sha256:64f9c11c4de6a65cde252ccbb959091dd9b55e089e8c2499c070e14912af34f6`.
- Runtime: Go 1.26.6 and k6 2.1.0.
- Benchmark: median p95 `15.14099235 ms` at 20 VUs.
- Samples: `[14.9140293, 15.14099235, 15.2416762]` ms.
- Workload: 3 repetitions, 4 levels, 3 seconds per level.
- Volume: 41,234 requests with 0 failures.
- Evidence: V1 raw result plus benchmark-result-v2 provenance.

## Publication Decision

- Ready: implementation, benchmark and local publication gates passed.
- Remote gate: the exact final GitHub head must pass `.github/workflows/validate.yml`.
- Remaining risk: host-level Docker variance; no distributed-load or cloud claim.

## Reuse Follow-up

Promote only the generic multi-run k6 evidence rules to `portfolio-reuse-kit`.
The controlled Go target and this scenario topology remain project-specific.
