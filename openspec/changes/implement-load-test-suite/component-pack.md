# Component Pack

## Selected Pack

- Pack: `delivery-observability-infra`.
- Program: `delivery-observability-infra`.
- Reason: the pack calls for CI, a k6 profile, a benchmark result, and release gates for load evidence.

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

No external installation is needed; Docker provides the k6 runtime.

## Publication Gates

- complete project.yaml
- complete OpenSpec and SDD
- Docker build/run
- versioned benchmark JSON
- README with a descriptive title and the benchmark result
- strict validation

## Rejected Packs

- `backend-reliability-platform`: the focus here is the load tool and CI, not a domain backend.
