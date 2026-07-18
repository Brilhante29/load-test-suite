# Reuse Delta

## Reusable Discoveries

| Candidate | Decision | Reason | Follow-up |
|---|---|---|---|
| Baseline JSON explicitamente versionado | patch-now | O contrato do kit e benchmark-driven, mas o scaffold ignora todos os JSON. | Regra local no `.gitignore`. |
| Helper generico de p95 por VU | backlog | Pode beneficiar outros repos, mas precisa de schema e compatibilidade. | Avaliar no harness do kit. |
| Fixture Go local | reject | E especifico do claim #29, nao uma abstracao do kit. | Manter no projeto. |

## Kit Patch

Nenhum arquivo do `portfolio-reuse-kit` foi alterado nesta tarefa. A melhoria
de versionamento foi aplicada apenas no projeto e documentada acima.

## Backlog

Propor um template opcional no harness para curvas de metricas tagged por
cenario, com metadados de imagem.

## Rejected

Nao transformar o alvo HTTP estavel em componente global.

## Final Gate

- [x] Cada descoberta foi patch-now, backlog ou reject.
- [x] Nenhuma implementacao especifica foi movida para o kit.
