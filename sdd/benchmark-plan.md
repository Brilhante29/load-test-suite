# Benchmark Plan: load-test-suite

## Hypothesis

A pinned image with a local Go target and a sequential k6 profile produces a p95
curve comparable across 1, 5, 10, and 20 VUs without depending on external services.

## Command

```powershell
pwsh -NoProfile -File scripts/publish-benchmark.ps1 -Build
```

## Environment

- OS: Windows 11 host with Docker Desktop, recorded in the JSON.
- CPU/RAM: recorded as machine metadata when available; the container records the image and parameters.
- Docker image: `grafana/k6:2.1.0` plus a static Go 1.26.6 binary.
- Date: UTC timestamp in the result.

## Inputs

- Fixture: `GET /work`, with four slots and 2 ms of controlled service time.
- Levels: `[1, 5, 10, 20]` constant VUs.
- Warmup: 1 second.
- Sample window: 3 seconds per level.
- Repetitions: three complete curves in the same process, without overlap.

## Metrics

| Metric | Unit | Source | Why it matters |
|---|---:|---|---|
| p95_ms_at_max_vus | ms | median of the 20-VU p95 across three repetitions | gives one publishable number without losing the curve |
| error_rate | ratio | custom Rate per level | prevents calling a failed curve a baseline |
| requests | count | custom Counter per level | proves that each window had samples |

## Result schema

V1 contains `project`, `metric`, `value`, `samples`, `summary`,
`environment`, `curve`, and `runs`. `value` is the median of the 20-VU p95,
`samples` keeps one measurement per repetition, and `runs` preserves the 12 points.
V2 binds that artifact to the clean commit, the image, and the fixture and config digests.

## Post angle

#29 load-test-suite: a small, Dockerized, reusable load suite that turns p95
into comparable evidence.
