# Spec: load-test-suite

## Number

#29

## Claim

A Dockerized suite measures a reproducible p95 curve of a local HTTP target
under 1, 5, 10, and 20 VUs.

## Stack

Go 1.26.6 standard library, k6 2.1.0, JavaScript, Docker, and GitHub Actions.

## User-visible output

- `docker build -t load-test-suite:local .`
- `docker run --rm -v ...:/results load-test-suite:local benchmark`
- `benchmarks/results/29-p95-curve-v1.json`
- `benchmarks/publication/29-p95-curve-v2.json`
- README with one row per VU level.

## Scope

In:

- A minimal, stable local HTTP target.
- A reusable k6 scenario with levels configured in the profile.
- A JSON report with p95, requests, errors, image, and environment.
- Docker, CI, tests, and strict validation.

Out:

- Cloud, database, broker, or paid-secret integration.
- A persistent dashboard, statistical comparison across machines, or distributed load execution.

## Architecture

`Docker entrypoint -> target module + k6 scenario -> report module -> JSON`

The modular monolith separates modules by responsibility without introducing
additional deployments or external processes.

## Benchmark

- name: `p95_ms_at_max_vus`
- unit: `ms`
- levels: 1, 5, 10, 20 VUs
- fixture: `GET /work`, four slots and 2 ms of service time
- warmup: 1s
- sample window: 3s per level
- repetitions: 3
- result: `benchmarks/results/29-p95-curve-v1.json`
- publication: `benchmarks/publication/29-p95-curve-v2.json`

## Definition of done

- [x] Docker build and Docker run work from the checkout.
- [x] README opens with a descriptive title, the claim, and the versioned result.
- [x] Benchmark writes JSON compatible with the contract.
- [x] Tests cover the main HTTP contract.
- [x] REFERENCES.md explains the reuse.
- [x] No secret or paid credential is required.
- [x] V2 binds the result, commit, image, fixture, configuration, and lock.
- [x] CI smoke uses an artifact separate from the published result.
