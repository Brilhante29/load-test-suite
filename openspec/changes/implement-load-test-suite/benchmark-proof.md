# Benchmark Proof

## Primary Metric

- Metric: `p95_curve`.
- Unit: `ms`.
- Direction: lower is better.
- Target: curva nao vazia, 0% de erros e p95 registrado em cada nivel.

## Reproducible Command

```powershell
pwsh -NoProfile -File scripts/benchmark.ps1 -Build -ResultName p95-curve-baseline.json
```

## Fixture

O alvo Go responde `GET /health` com JSON estavel. O perfil executa warmup de
1s e 3s de carga em cada nivel `[1, 5, 10, 20]`.

## Result Path

`benchmarks/results/p95-curve-baseline.json`

## README Number

A tabela da raiz exibe p95, requests e error rate por nivel. O JSON guarda
tambem image tag, image id, commit e parametros.
