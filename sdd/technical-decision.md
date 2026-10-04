# Technical Decision

## Status

Accepted

## Decision Type

`runtime + stack + benchmark`

## Context

Project: `load-test-suite #29`

Problem: measure local HTTP load with a simple runtime and versioned evidence.

Portfolio program: `delivery-observability-infra`.

Public signal: low-overhead Go, k6, Docker, CI, and a reproducible benchmark.

Benchmark: `p95_ms_at_max_vus`, preserving the complete curve.

## Selected Option

Selected: the Go standard library as the controlled target and a k6 2.2.0
security rebuild as the executor.

Security refresh and historical benchmark scope: [2026-09-14 decision](security-refresh-2026-09-14.md).

Reason:

Go offers a small binary with no runtime dependencies, fast startup, and
predictable behavior under concurrency. k6 is the right tool for VUs and
percentiles; its pinned image makes execution independent of Node, Python, or
local packages.

## Decision Brain Fields

- Stack profile: `go-backend`.
- API style: `rest-http`.
- Messaging: `none`.
- Cloud mode: `none`.
- Database/runtime: no database; one container with the Go binary and k6.
- Library policy: the Go standard library and native k6 APIs; no application dependency.

## Engineering Principles

Coupling boundary:

The Go target imports neither k6, Docker, nor the report. The report receives
only the k6 summary object and produces the JSON contract.

SOLID application:

- SRP: handler, scenario, report, and scripts each have one responsibility.
- OCP: `TARGET_URL` swaps the target without changing the measurement logic.
- LSP: any HTTP endpoint that honors the 2xx contract can replace the local target.
- ISP: the target exposes only the HTTP endpoints it needs; there is no artificial interface.
- DIP: the Go process receives a concrete `http.Handler` built at the boundary, and k6 depends on the HTTP contract, not on the implementation.

Simplicity:

- KISS: one entrypoint starts the target and k6, with no Compose or broker.
- YAGNI: no database, observability stack, or dashboard was added because none of them proves the p95 curve.
- DRY: levels and metrics are described once in the scenario and formatted once in the report.

Testability evidence:

- `internal/target/handler_test.go` runs without infrastructure.
- `go vet`, `node --check`, the Docker build, and the benchmark form the integrated contract test.

## Rejected Options

| Option | Why rejected |
|---|---|
| Python stdlib server | A larger runtime and less signal for the low-overhead profile. |
| Node.js server | It would duplicate the JavaScript runtime; the JavaScript that is needed already runs inside k6. |
| k6 installed on the host | It would break version reproducibility and add a local prerequisite. |
| Docker Compose | The case has a single executable container and does not need to orchestrate services. |

## API Contract

Contract artifact: the minimal HTTP contract in `internal/target/handler.go`, described in `sdd/spec.md`.

- `GET /work` waits for one of four worker slots, spends 2 ms of service time, and returns `200 application/json`; it is the benchmark target.
- `GET /health` returns `200 application/json` with a stable body.
- `GET /payload` returns a stable fixture with seed 42.
- Other methods return `405` with `Allow: GET`.

## Cloud Local-First

Local provider: `none`.

Real provider target: `none`.

Config switch:

```txt
TARGET_URL=http://127.0.0.1:8080/work
```

Unsupported local behaviors: none; the benchmark makes no cloud-parity claim.

## Benchmark Impact

Expected impact:

- The Go target reduces runtime noise and makes the HTTP p95 curve visible.
- The JSON records image tag, image id, commit, levels, and durations.

Validation command:

```powershell
pwsh -NoProfile -File tools/validate-project.ps1 -Strict
```

## Operational Cost

- Docker services added: no external service.
- Local demo complexity: low.
- Failure case required: yes; thresholds fail the run unless every level has a zero error rate and p95 below 100 ms.

## Follow-up

- Revisit the architecture if the project starts comparing multiple providers or topologies.
