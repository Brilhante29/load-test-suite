# Intent

## Measurable Claim

A Dockerized suite measures a reproducible p95 curve of a local HTTP target
under 1, 5, 10, and 20 VUs.

## Problem

The portfolio needs a load profile that runs without a local language setup,
produces p95 per level, and records the environment next to the evidence.

## In Scope

- A minimal HTTP target in Go.
- A k6 profile with warmup, four levels, and thresholds.
- JSON report, Docker, scripts, CI, and strict validation.

## Out of Scope

- Cloud, broker, database, dashboard, or distributed load.

## Default Demo Path

- Runs with Docker: yes.
- Requires no paid secret: yes.
- Uses local-first substitutes when cloud behavior is needed: not applicable; the target is local.

## Public Proof

- Benchmark: `p95_ms_at_max_vus` in ms, with the complete curve per VU level.
- README number: p95 table for 1, 5, 10, and 20 VUs.
