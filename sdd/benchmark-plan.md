# Benchmark Plan: load-test-suite

## Hypothesis

Uma imagem fixa com alvo Go local e perfil k6 sequencial produz uma curva p95
comparavel entre 1, 5, 10 e 20 VUs sem depender de servicos externos.

## Command

```powershell
pwsh -NoProfile -File scripts/benchmark.ps1 -Build -ResultName p95-curve-baseline.json
```

## Environment

- OS: Windows 11 host com Docker Desktop, registrado no JSON.
- CPU/RAM: registrados como metadados da maquina quando disponiveis; o container registra a imagem e parametros.
- Docker image: `grafana/k6:0.49.0` mais binario Go estatico.
- Date: timestamp UTC no resultado.

## Inputs

- Fixture: `GET /health` do alvo local.
- Levels: `[1, 5, 10, 20]` VUs constantes.
- Warmup: 1 segundo.
- Sample window: 3 segundos por nivel.
- Repetitions: uma janela por nivel; repetir o comando para comparar maquinas.

## Metrics

| Metric | Unit | Source | Why it matters |
|---|---:|---|---|
| p95_curve | ms | Trend customizada por nivel k6 | mostra como a cauda muda com VUs |
| error_rate | ratio | Rate customizada por nivel | impede chamar uma curva falha de baseline |
| requests | count | Counter customizada por nivel | prova que cada janela teve amostras |

## Result schema

O JSON contem `project`, `metric`, `value`, `unit`, `timestamp`, `command`,
`summary`, `environment` e `curve`, seguindo o contrato do kit. `value` e o
maior p95 da curva; `curve` preserva todos os niveis.

## Post angle

#29 load-test-suite: uma suite de carga pequena, Dockerizada e reutilizavel
para transformar p95 em evidencia comparavel.
