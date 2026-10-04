# Architecture Record

## Problem Forces

- Domain complexity: low.
- Integration pressure: medium.
- UI state complexity: none.
- Data or ML reproducibility: high.
- Auditability: low.
- Throughput or async pressure: medium.
- Independent deployability: low.

## Decision

- Architecture: modular-monolith with simple hexagonal seams.
- Stack profile: go-backend.
- API style: rest-http.
- Messaging: none.
- Cloud mode: none.
- Database/runtime: no database; one container with the Go binary and k6.
- Library policy: net/http and native k6 APIs, with no application dependencies.

## Dependency Direction

`internal/target` does not know k6, Docker, or the report. The scenario knows
only the HTTP contract. The report knows only the k6 summary. Scripts perform
the external composition.

## Principles Evidence

- SRP: target, scenario, report, and scripts are separate.
- OCP: `TARGET_URL` swaps the target without changing the profile.
- LSP: any 2xx endpoint that honors the contract can be load-tested.
- ISP: no artificial interface was created for the minimal target.
- DIP: the process boundary injects the handler into the server; measurement depends on the contract.
- KISS/YAGNI: no Compose, broker, database, or framework that adds nothing to the p95 curve.

## Rejected Alternatives

- Full hexagonal: many ports for few real integrations.
- Microservices: distributed cost without an independent-deployment signal.
- Python or Node server: an additional runtime that does not improve the benchmark.
