# Spec: load-test-suite

## Number

#29

## Claim

Uma suite Dockerizada mede uma curva p95 reproduzivel de um alvo HTTP local
sob 1, 5, 10 e 20 VUs.

## Stack

Go standard library, k6 0.49.0, JavaScript, Docker e GitHub Actions.

## User-visible output

- `docker build -t load-test-suite:local .`
- `docker run --rm -v ...:/results load-test-suite:local benchmark`
- `benchmarks/results/p95-curve-baseline.json`
- README com uma linha para cada nivel de VUs.

## Scope

In:

- Alvo HTTP local minimo e estavel.
- Cenario k6 reutilizavel com niveis configuraveis no perfil.
- Relatorio JSON com p95, requests, erros, imagem e ambiente.
- Docker, CI, testes e validacao estrita.

Out:

- Integracao com cloud, banco, broker ou segredo pago.
- Dashboard persistente ou comparacao estatistica entre maquinas.
- Publicacao ou push remoto.

## Architecture

`Docker entrypoint -> target module + k6 scenario -> report module -> JSON`

O modular monolith separa os modulos por responsabilidade sem introduzir
deploys ou processos externos adicionais.

## Benchmark

- name: `p95_curve`
- unit: `ms`
- levels: 1, 5, 10, 20 VUs
- fixture: `GET /health`, corpo JSON estavel, seed 42 no endpoint `/payload`
- warmup: 1s
- sample window: 3s por nivel
- result: `benchmarks/results/p95-curve-baseline.json`

## Definition of done

- [x] Docker build e Docker run funcionam a partir do checkout.
- [x] README inicia com numero, claim e resultado versionado.
- [x] Benchmark escreve JSON compativel com o contrato.
- [x] Testes cobrem o contrato HTTP principal.
- [x] REFERENCES.md explica o reuso.
- [x] Nenhum segredo ou credencial paga e necessario.
