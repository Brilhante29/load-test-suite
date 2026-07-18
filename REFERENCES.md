# References and Reuse

This repository uses `portfolio-reuse-kit` as its local source of truth. The
project-specific code and benchmark fixture are original to #29.

| Reused source | How it was applied |
|---|---|
| `.portfolio/catalog/` | Project #29 identity and delivery-observability-infra program fit. |
| `.portfolio/component-packs/manifest.yaml` | Selected `delivery-observability-infra` pack and its k6/release gates. |
| `.portfolio/architecture/decision-matrix.yaml` | Modular-monolith choice from problem forces. |
| `.portfolio/decision-brain/` | Stack, API, messaging, simplicity, and agent workflow decisions. |
| `.portfolio/harness/` and `contracts/benchmark-result.schema.json` | Metric naming and JSON result contract. |
| `.portfolio/templates/` and `.portfolio/sdd/templates/` | Repository layout, Docker, CI, SDD, and release conventions. |
| Grafana k6 | Runtime load generator used through the pinned Docker image `grafana/k6:0.49.0`. |

No external source code was copied into the target or report. Go uses only the
standard library. The k6 scenario uses the public k6 HTTP and metric APIs.

## License Notes

The repository remains under the included MIT license. Check the upstream
licenses for k6 and Go when distributing a built image; the image tag is
recorded in each benchmark result.
