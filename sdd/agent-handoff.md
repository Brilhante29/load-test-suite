# Agent Handoff

Project: `29 - load-test-suite`

## Principal Agent Summary

- Objective: medir uma curva p95 local sob quatro niveis de VUs.
- Portfolio program: `delivery-observability-infra`.
- Public proof claim: benchmark Dockerizado com resultado JSON versionado.
- Primary benchmark: `p95_ms_at_max_vus` em ms, com curva por VU.
- Default publication path: `scripts/publish-benchmark.ps1 -Build`.

## Subagent Decisions

| Role | Decision | Evidence Path | Status |
|---|---|---|---|
| `program-planner` | delivery-observability-infra | `project.yaml`, `openspec/changes/implement-load-test-suite/portfolio-impact.md` | accepted |
| `architecture-selector` | modular-monolith com seams hexagonais simples | `sdd/architecture-decision.md` | accepted |
| `engineering-principles-reviewer` | stdlib Go, dependencias inward | `sdd/technical-decision.md` | accepted |
| `stack-decision-agent` | Go + k6 + Docker | `project.yaml`, `sdd/technical-decision.md` | accepted |
| `api-style-agent` | HTTP REST minimo | `sdd/technical-decision.md` | accepted |
| `cloud-local-first-agent` | sem cloud; alvo local configuravel | `sdd/technical-decision.md` | accepted |
| `messaging-agent` | nenhum broker | `sdd/technical-decision.md` | accepted |
| `language-profile-agent` | go-backend + JavaScript k6 | `go.mod`, `k6/` | accepted |
| `benchmark-harness-agent` | curva p95 customizada por VU | `sdd/benchmark-plan.md`, `benchmarks/results/` | accepted |
| `design-system-agent` | README numerado e diagrama de fluxo | `README.md` | accepted |
| `security-reuse-reviewer` | sem segredo e com atribuicao local | `REFERENCES.md` | accepted |
| `release-ci-publisher` | CI testa, constroi, mede e valida | `.github/workflows/validate.yml` | accepted |

## Local-First Runtime

- Docker command: `docker run --rm ... load-test-suite:local benchmark`.
- Local services: alvo Go no mesmo container.
- Kumo services: nenhum.
- Real cloud adapter target: nenhum.
- Config switch: `TARGET_URL`.
- Default path requires paid secret: no.

## Architecture Boundaries

- Domain boundaries: `internal/target` e contrato HTTP estavel.
- Use-case boundaries: scenario k6 e report k6.
- Ports: contrato HTTP e formato de summary.
- Adapters: entrypoint Docker e scripts de host.
- Dependency direction rule: alvo nao conhece benchmark; report nao conhece Go.

## Benchmark Handoff

- Metric: `p95_ms_at_max_vus`.
- Unit: `ms`.
- Higher or lower is better: lower p95 is better.
- Command: `pwsh -NoProfile -File scripts/publish-benchmark.ps1 -Build`.
- Result path: `benchmarks/results/29-p95-curve-v1.json`.
- Publication path: `benchmarks/publication/29-p95-curve-v2.json`.
- Dataset or fixture: `GET /work`, quatro slots e 2 ms, sem dados externos.

## Open Risks

- Variacao de host Docker pode superar a variacao do alvo; o ambiente e sempre registrado.
- O perfil nao representa uma topologia multi-container ou cloud.

## Canonical Evidence

- Source SHA: `3146602070006665950e42aeddc5aca19a8670db`.
- Image SHA: `sha256:64f9c11c4de6a65cde252ccbb959091dd9b55e089e8c2499c070e14912af34f6`.
- V1: `benchmarks/results/29-p95-curve-v1.json`.
- V2: `benchmarks/publication/29-p95-curve-v2.json`.
- Result: `15.14099235 ms` median p95 at 20 VUs, 41,234 requests, 0 errors.

## Publication Gates

- [x] Docker path works
- [x] benchmark result exists
- [x] README starts with number, claim, and benchmark
- [x] references are documented
- [x] no secret in files or git remote
- [x] validation passes
