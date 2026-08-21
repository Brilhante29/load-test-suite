# Intent

## Measurable Claim

Uma suite Dockerizada mede uma curva p95 reproduzivel de um alvo HTTP local
sob 1, 5, 10 e 20 VUs.

## Problem

O portfolio precisa de um perfil de carga que seja executavel sem setup local
de linguagem, produza p95 por nivel e deixe o ambiente registrado junto da
evidencia.

## In Scope

- Alvo HTTP minimo em Go.
- Perfil k6 com warmup, quatro niveis e thresholds.
- Relatorio JSON, Docker, scripts, CI e validacao estrita.

## Out of Scope

- Cloud, broker, banco, dashboard ou carga distribuida.

## Default Demo Path

- Runs with Docker: yes.
- Requires no paid secret: yes.
- Uses local-first substitutes when cloud behavior is needed: not applicable; o alvo e local.

## Public Proof

- Benchmark: `p95_ms_at_max_vus` em ms, com curva completa por VU.
- README number: tabela de p95 para 1, 5, 10 e 20 VUs.
