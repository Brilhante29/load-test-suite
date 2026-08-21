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

- Architecture: modular-monolith com seams hexagonais simples.
- Stack profile: go-backend.
- API style: rest-http.
- Messaging: none.
- Cloud mode: none.
- Database/runtime: nenhum banco; um container com binario Go e k6.
- Library policy: net/http e APIs nativas k6, sem dependencias de aplicacao.

## Dependency Direction

`internal/target` nao conhece k6, Docker ou report. O scenario conhece apenas
o contrato HTTP. O report conhece apenas o summary do k6. Scripts fazem a
composicao externa.

## Principles Evidence

- SRP: target, scenario, report e scripts separados.
- OCP: `TARGET_URL` permite trocar o alvo sem alterar o perfil.
- LSP: qualquer endpoint 2xx com o contrato pode ser ensaiado.
- ISP: nenhuma interface artificial foi criada para o alvo minimo.
- DIP: o boundary de processo injeta o handler no servidor; a medicao depende do contrato.
- KISS/YAGNI: sem compose, broker, banco ou framework sem valor para a curva p95.

## Rejected Alternatives

- Hexagonal completa: muitas portas para poucas integracoes reais.
- Microservices: custo distribuido sem sinal de deploy independente.
- Python/Node server: runtime adicional sem aumentar o benchmark.
