# Component Pack

## Selected Pack

- Pack: `delivery-observability-infra`.
- Program: `delivery-observability-infra`.
- Reason: o pack pede CI, k6 profile, resultado de benchmark e release gates para evidencia de carga.

## Skills

- `architecture-selector`
- `benchmark-harness`
- `go-backend`
- `language-standards`
- `design-system`
- `reuse-improvement-review`

## Decision Sources

- `.portfolio/catalog/programs.yaml`
- `.portfolio/catalog/projects.yaml`
- `.portfolio/component-packs/manifest.yaml`
- `.portfolio/architecture/decision-matrix.yaml`
- `.portfolio/decision-brain/stack-matrix.yaml`
- `.portfolio/decision-brain/api-style-matrix.yaml`

## Templates

- `.portfolio/templates/Dockerfile.go`
- `.portfolio/templates/github-actions-go.yml`
- `.portfolio/sdd/templates/`
- `.portfolio/openspec/schemas/portfolio-system/`

## Benchmark Assets

- k6 HTTP conventions.
- Benchmark result schema.
- Versioned baseline under `benchmarks/results/`.

## External Component Recommendations

Nenhuma instalacao externa e necessaria; Docker fornece o runtime do k6.

## Publication Gates

- project.yaml completo
- OpenSpec e SDD completos
- Docker build/run
- benchmark JSON versionado
- README numerado
- validacao estrita

## Rejected Packs

- `backend-reliability-platform`: o foco aqui e a ferramenta de carga e CI, nao um backend de dominio.
