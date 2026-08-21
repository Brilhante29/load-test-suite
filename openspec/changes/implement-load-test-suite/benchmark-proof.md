# Benchmark Proof

## Primary Metric

- Metric: `p95_ms_at_max_vus`.
- Unit: `ms`.
- Direction: lower is better.
- Target: curva nao vazia, 0% de erros e p95 registrado em cada nivel.

## Reproducible Command

```powershell
pwsh -NoProfile -File scripts/publish-benchmark.ps1 -Build
```

## Fixture

O alvo Go responde `GET /work` por um pool controlado de quatro slots. O
perfil executa tres repeticoes, cada uma com warmup de 1s e 3s de carga em cada
nivel `[1, 5, 10, 20]`.

## Result Path

`benchmarks/results/29-p95-curve-v1.json` e
`benchmarks/publication/29-p95-curve-v2.json`.

## README Number

A tabela da raiz exibe p95, requests e error rate por nivel. O JSON guarda
tambem image tag, image id, commit e parametros.
