# Agent Handoff

Project: `29 - load-test-suite`

## Principal Agent Summary

- Objective: measure a local p95 curve under four VU levels.
- Portfolio program: `delivery-observability-infra`.
- Public proof claim: a Dockerized benchmark with a versioned JSON result.
- Primary benchmark: `p95_ms_at_max_vus` in ms, with a curve per VU level.
- Default publication path: `scripts/publish-benchmark.ps1 -Build`.

## Subagent Decisions

| Role | Decision | Evidence Path | Status |
|---|---|---|---|
| `program-planner` | delivery-observability-infra | `project.yaml`, `openspec/changes/implement-load-test-suite/portfolio-impact.md` | accepted |
| `architecture-selector` | modular-monolith with simple hexagonal seams | `sdd/architecture-decision.md` | accepted |
| `engineering-principles-reviewer` | Go stdlib, inward dependencies | `sdd/technical-decision.md` | accepted |
| `stack-decision-agent` | Go + k6 + Docker | `project.yaml`, `sdd/technical-decision.md` | accepted |
| `api-style-agent` | minimal HTTP REST | `sdd/technical-decision.md` | accepted |
| `cloud-local-first-agent` | no cloud; configurable local target | `sdd/technical-decision.md` | accepted |
| `messaging-agent` | no broker | `sdd/technical-decision.md` | accepted |
| `language-profile-agent` | go-backend + JavaScript for k6 | `go.mod`, `k6/` | accepted |
| `benchmark-harness-agent` | custom p95 curve per VU level | `sdd/benchmark-plan.md`, `benchmarks/results/` | accepted |
| `design-system-agent` | README with descriptive title and flow diagram | `README.md` | accepted |
| `security-reuse-reviewer` | no secret, local attribution | `REFERENCES.md` | accepted |
| `release-ci-publisher` | CI tests, builds, measures, and validates | `.github/workflows/validate.yml` | accepted |

## Local-First Runtime

- Docker command: `docker run --rm ... load-test-suite:local benchmark`.
- Local services: the Go target in the same container.
- Kumo services: none.
- Real cloud adapter target: none.
- Config switch: `TARGET_URL`.
- Default path requires paid secret: no.

## Architecture Boundaries

- Domain boundaries: `internal/target` and the stable HTTP contract.
- Use-case boundaries: the k6 scenario and the k6 report.
- Ports: the HTTP contract and the summary format.
- Adapters: the Docker entrypoint and host scripts.
- Dependency direction rule: the target does not know the benchmark; the report does not know Go.

## Benchmark Handoff

- Metric: `p95_ms_at_max_vus`.
- Unit: `ms`.
- Higher or lower is better: lower p95 is better.
- Command: `pwsh -NoProfile -File scripts/publish-benchmark.ps1 -Build`.
- Result path: `benchmarks/results/29-p95-curve-v1.json`.
- Publication path: `benchmarks/publication/29-p95-curve-v2.json`.
- Dataset or fixture: `GET /work`, four slots and 2 ms, no external data.

## Open Risks

- Docker host variance can exceed target variance; the environment is always recorded.
- The profile does not represent a multi-container or cloud topology.

## Canonical Evidence

- Source SHA: `3146602070006665950e42aeddc5aca19a8670db`.
- Image SHA: `sha256:64f9c11c4de6a65cde252ccbb959091dd9b55e089e8c2499c070e14912af34f6`.
- V1: `benchmarks/results/29-p95-curve-v1.json`.
- V2: `benchmarks/publication/29-p95-curve-v2.json`.
- Result: `15.14099235 ms` median p95 at 20 VUs, 41,234 requests, 0 errors.

## Publication Gates

- [x] Docker path works
- [x] benchmark result exists
- [x] README starts with a descriptive title, claim, and benchmark
- [x] references are documented
- [x] no secret in files or git remote
- [x] validation passes
