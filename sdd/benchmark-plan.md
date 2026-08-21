# Benchmark Plan: load-test-suite

## Hypothesis

Uma imagem fixa com alvo Go local e perfil k6 sequencial produz uma curva p95
comparavel entre 1, 5, 10 e 20 VUs sem depender de servicos externos.

## Command

```powershell
pwsh -NoProfile -File scripts/publish-benchmark.ps1 -Build
```

## Environment

- OS: Windows 11 host com Docker Desktop, registrado no JSON.
- CPU/RAM: registrados como metadados da maquina quando disponiveis; o container registra a imagem e parametros.
- Docker image: `grafana/k6:2.1.0` mais binario Go 1.26.6 estatico.
- Date: timestamp UTC no resultado.

## Inputs

- Fixture: `GET /work`, com quatro slots e 2 ms de servico controlado.
- Levels: `[1, 5, 10, 20]` VUs constantes.
- Warmup: 1 segundo.
- Sample window: 3 segundos por nivel.
- Repetitions: tres curvas completas no mesmo processo, sem sobreposicao.

## Metrics

| Metric | Unit | Source | Why it matters |
|---|---:|---|---|
| p95_ms_at_max_vus | ms | mediana do p95 em 20 VUs, tres repeticoes | oferece um numero publicavel sem perder a curva |
| error_rate | ratio | Rate customizada por nivel | impede chamar uma curva falha de baseline |
| requests | count | Counter customizada por nivel | prova que cada janela teve amostras |

## Result schema

O V1 contem `project`, `metric`, `value`, `samples`, `summary`,
`environment`, `curve` e `runs`. `value` e a mediana do p95 em 20 VUs,
`samples` guarda uma medicao por repeticao e `runs` preserva os 12 pontos.
O V2 liga esse artefato ao commit limpo, imagem e digests de fixture/config.

## Post angle

#29 load-test-suite: uma suite de carga pequena, Dockerizada e reutilizavel
para transformar p95 em evidencia comparavel.
