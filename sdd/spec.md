# Spec: load-test-suite

## Number

#29

## Claim

Uma suite Dockerizada mede uma curva p95 reproduzivel de um alvo HTTP local
sob 1, 5, 10 e 20 VUs.

## Stack

Go 1.26.6 standard library, k6 2.1.0, JavaScript, Docker e GitHub Actions.

## User-visible output

- `docker build -t load-test-suite:local .`
- `docker run --rm -v ...:/results load-test-suite:local benchmark`
- `benchmarks/results/29-p95-curve-v1.json`
- `benchmarks/publication/29-p95-curve-v2.json`
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
- Dashboard persistente ou execucao de carga distribuida.

## Architecture

`Docker entrypoint -> target module + k6 scenario -> report module -> JSON`

O modular monolith separa os modulos por responsabilidade sem introduzir
deploys ou processos externos adicionais.

## Benchmark

- name: `p95_ms_at_max_vus`
- unit: `ms`
- levels: 1, 5, 10, 20 VUs
- fixture: `GET /work`, quatro slots e 2 ms de servico
- warmup: 1s
- sample window: 3s por nivel
- repetitions: 3
- result: `benchmarks/results/29-p95-curve-v1.json`
- publication: `benchmarks/publication/29-p95-curve-v2.json`

## Definition of done

- [x] Docker build e Docker run funcionam a partir do checkout.
- [x] README inicia com numero, claim e resultado versionado.
- [x] Benchmark escreve JSON compativel com o contrato.
- [x] Testes cobrem o contrato HTTP principal.
- [x] REFERENCES.md explica o reuso.
- [x] Nenhum segredo ou credencial paga e necessario.
- [x] V2 liga resultado, commit, imagem, fixture, configuracao e lock.
- [x] CI smoke usa artefato separado do resultado publicado.
