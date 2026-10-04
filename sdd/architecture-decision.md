# Architecture Decision

## Status

Accepted

## Context

Project: `load-test-suite #29`

Claim: p95 curve of an HTTP target under VU levels.

Benchmark: `p95_ms_at_max_vus` in milliseconds, keeping the curve per level.

Problem forces:

- Domain complexity: low.
- Integration pressure: medium: Docker, k6, and the filesystem must connect.
- UI state complexity: none.
- Data/ML reproducibility: high: the run needs a recorded fixture and environment.
- Auditability/event history: low.
- Throughput/async pressure: medium: the target must accept concurrency but needs no broker.
- Independent deployability: low.

## Decision

Chosen architecture: `modular-monolith`, with a simple hexagonal seam between
the target, the scenario, and the report.

Reason:

The problem has a single Docker deployment and three stable responsibilities.
Separating `internal/target`, `k6/scenarios`, and `k6/report` makes it possible
to replace the target or reuse the scenario without coupling the benchmark to
the handler. A microservice or a full hexagonal architecture would add ceremony
without a real integration that justifies extra ports.

Dependency rule:

The handler uses only `net/http` and `io`. The scenario depends on the HTTP
contract but not on the Go code. The report depends on the k6 summary format,
and the Docker script is the only adapter that starts both sides.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Full hexagonal | There is no database, broker, or external provider to swap; the module boundaries cover the real risk. |
| Microservices | A second service would increase benchmark variance and the cost of local operation. |
| Layered API | It would have persistence and service layers with no corresponding domain. |

## Folder Layout

```txt
cmd/load-target/        # HTTP process and signals
internal/target/        # testable contract and handler
k6/scenarios/           # VU levels and custom metrics
k6/report/              # curve and result JSON
scripts/                # Docker adapters for PowerShell and POSIX
benchmarks/results/     # raw V1 result
benchmarks/publication/ # V2 evidence with provenance
```

## Testing Strategy

- Unit tests: the Go handler with `httptest`, without Docker or k6.
- Integration test: the k6 benchmark runs against the target started by the entrypoint.
- Benchmark: three curves of four sequential scenarios, with error and p95 thresholds.

## Consequences

Positive:

- The target is minimal and cheap enough for a local curve focused on load.
- The scenario is reusable for any HTTP 2xx endpoint.
- The evidence records image and environment, which makes runs comparable.

Tradeoffs:

- The local result measures a single-process image, not a distributed topology.
- The k6 summary depends on the version pinned in the image.

Migration path:

If the problem grows into comparing adapters, the target module can gain a
service port and additional implementations without moving the scenario or the
result contract.
