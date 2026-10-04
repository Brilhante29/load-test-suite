# Load Test Suite: Reusable k6 Latency Curves with Fail-Closed Gates

[![validate](https://github.com/Brilhante29/load-test-suite/actions/workflows/validate.yml/badge.svg)](https://github.com/Brilhante29/load-test-suite/actions/workflows/validate.yml)

**15.1410 ms median p95 at 20 VUs**, across three complete curves, with
**41,234 requests** and **0% errors**. Exact values:
`p95_ms_at_max_vus=15.14099235`, `total_requests=41234`.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![k6](https://img.shields.io/badge/k6-7D64FF?logo=k6&logoColor=white) ![Go](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white)

## Why this exists

A single load test number ("1,400 req/s!") hides the shape that matters: where latency starts to climb, and whether throughput stops growing while queues fill up. Load tests are also often run once, on a noisy laptop, with no failure criteria, so a regression passes silently. This suite turns load testing into a repeatable, gated measurement:

- k6 runs sequential windows at 1, 5, 10, and 20 virtual users against a controlled Go target;
- every level must have zero HTTP errors and p95 under 100 ms, or the run fails;
- three complete curves are recorded, and the published value is the median of the three 20-VU p95 samples;
- everything runs in Docker, so no local k6 or Go installation is needed.

## Results

| VUs | Median p95 | Requests/s | Requests | Error rate |
|---:|---:|---:|---:|---:|
| 1 | 3.3461 ms | 293.33 | 2,640 | 0% |
| 5 | 5.0537 ms | 1,384.00 | 12,456 | 0% |
| 10 | 8.9508 ms | 1,452.67 | 13,074 | 0% |
| 20 | **15.1410 ms** | 1,451.56 | 13,064 | 0% |

The three 20-VU p95 samples were `14.9140293`, `15.14099235`, and
`15.2416762 ms`. Throughput plateaus near 1,453 req/s while tail latency
keeps rising, exposing the four-slot target's queueing behavior.

- Raw V1: [`benchmarks/results/29-p95-curve-v1.json`](benchmarks/results/29-p95-curve-v1.json)
- Publication V2: [`benchmarks/publication/29-p95-curve-v2.json`](benchmarks/publication/29-p95-curve-v2.json)
- Source commit: `3146602070006665950e42aeddc5aca19a8670db`
- Image: `sha256:64f9c11c4de6a65cde252ccbb959091dd9b55e089e8c2499c070e14912af34f6`

## Quickstart

Requirements: Docker. Python 3.12 with `requirements-validation.txt` is needed
only to generate publication evidence.

```bash
docker build -t load-test-suite:local .
docker run --rm \
  -v "$PWD/benchmarks/results:/results" \
  -e RESULT_FILE_NAME=p95-curve-local.json \
  load-test-suite:local benchmark
```

PowerShell produces the same result without installing k6 or Go:

```powershell
pwsh -NoProfile -File scripts/benchmark.ps1 -ImageTag load-test-suite:local
```

Generate canonical V1 and V2 evidence from a clean commit:

```powershell
python -m pip install -r requirements-validation.txt
pwsh -NoProfile -File scripts/publish-benchmark.ps1 -Build
```

## Workload

Each repetition runs one warm-up window and four sequential three-second
measurement windows. The target exposes four worker slots with 2 ms of service
time per request, so concurrency above four creates observable queueing rather
than synthetic random delay.

| Level | VUs | Window | Failure gate |
|---:|---:|---:|---:|
| 1 | 1 | 3 s | error rate = 0, p95 < 100 ms |
| 2 | 5 | 3 s | error rate = 0, p95 < 100 ms |
| 3 | 10 | 3 s | error rate = 0, p95 < 100 ms |
| 4 | 20 | 3 s | error rate = 0, p95 < 100 ms |

The headline sample for each repetition is p95 at 20 VUs. The published value
is the median of those three samples; the JSON preserves all 12 curve points
and request rates. Compare runs only when their V2 `comparability_key`
matches; host CPU scheduling still affects local Docker latency.

## Architecture

```mermaid
flowchart LR
  A["Docker entrypoint"] --> B["Go controlled target"]
  A --> C["k6 sequential scenarios"]
  C -->|"HTTP /work"| B
  C --> D["V1 raw evidence"]
  D --> E["V2 provenance envelope"]
```

The repository is a small modular monolith. `internal/target` owns the HTTP
fixture, `k6/scenarios` owns load generation, and `k6/report` owns evidence
aggregation. The modules depend on HTTP and the k6 summary contract, not on
each other's implementation.

## Validate

```powershell
pwsh -NoProfile -File tools/validate-project.ps1 -Strict
```

CI runs Go tests and vet, formatting and JavaScript checks, V2 provenance
validation, a Docker build, and an isolated smoke benchmark. The smoke result
is written outside the checkout and never overwrites committed evidence.

## Limitations

- The target is a deliberate four-slot fixture, so the curve characterizes the harness and queueing, not a real service.
- Local Docker latency depends on host CPU scheduling; compare only runs with matching `comparability_key`.
- Closed-model VUs only; open-model arrival rates and soak tests are out of scope.

## How this repository is built

The project follows the spec-driven workflow of [portfolio-reuse-kit](https://github.com/Brilhante29/portfolio-reuse-kit). Decisions live in [`sdd/`](sdd/spec.md) and [`openspec/changes/implement-load-test-suite/`](openspec/changes/implement-load-test-suite/), and [`project.yaml`](project.yaml) records the architecture, stack, and rejected alternatives. Development is AI-assisted and human-governed: [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md) hold the coding-agent instructions, while tests, validators, and CI decide what gets published.

## Related work

- [go-rate-limiter](https://github.com/Brilhante29/go-rate-limiter) and [api-gateway-lite](https://github.com/Brilhante29/api-gateway-lite): services measured with k6 under contention.
- [ci-cd-templates](https://github.com/Brilhante29/ci-cd-templates): reusable, security-gated CI workflows.

See [`REFERENCES.md`](REFERENCES.md) for reuse attribution.

## Author

**Guilherme Brilhante**, software engineer working on scalable backends and production AI.
[LinkedIn](https://www.linkedin.com/in/guilhermefreirebrilhanteseveriano/) · [GitHub](https://github.com/Brilhante29) · [Publications](https://dblp.org/pid/353/6812.html)

## License

[MIT](LICENSE).
