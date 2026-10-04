# Benchmark Proof

## Primary Metric

- Metric: `p95_ms_at_max_vus`.
- Unit: `ms`.
- Direction: lower is better.
- Target: a non-empty curve, 0% errors, and a recorded p95 at every level.

## Reproducible Command

```powershell
pwsh -NoProfile -File scripts/publish-benchmark.ps1 -Build
```

## Fixture

The Go target serves `GET /work` through a controlled pool of four slots. The
profile runs three repetitions, each with a 1s warmup and 3s of load at every
level `[1, 5, 10, 20]`.

## Result Path

`benchmarks/results/29-p95-curve-v1.json` and
`benchmarks/publication/29-p95-curve-v2.json`.

## README Number

The root table shows p95, requests, and error rate per level. The JSON also
keeps the image tag, image id, commit, and parameters.
