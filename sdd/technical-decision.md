# Technical Decision

## Status

Accepted

## Decision Type

`runtime + stack + benchmark`

## Context

Project: `load-test-suite #29`

Problem: medir carga HTTP local com runtime simples e evidencia versionada.

Portfolio program: `delivery-observability-infra`.

Public signal: Go de baixo overhead, k6, Docker, CI e benchmark reproduzivel.

Benchmark: `p95_curve`.

## Selected Option

Selected: Go standard library como alvo estatico e grafana/k6 0.49.0 como
executor.

Reason:

Go oferece um binario pequeno, sem dependencias em runtime, inicializacao
rapida e comportamento previsivel sob concorrencia. k6 e a ferramenta adequada
para VUs e percentis; sua imagem fixa torna a execucao independente de Node,
Python ou pacotes locais.

## Decision Brain Fields

- Stack profile: `go-backend`.
- API style: `rest-http`.
- Messaging: `none`.
- Cloud mode: `none`.
- Database/runtime: nenhum banco; um container com binario Go e k6.
- Library policy: biblioteca padrao Go e APIs nativas k6; sem dependencia de aplicacao.

## Engineering Principles

Coupling boundary:

O alvo Go nao importa k6, Docker ou o relatorio. O relatorio recebe apenas o
objeto de summary do k6 e produz o contrato JSON.

SOLID application:

- SRP: handler, scenario, report e scripts tem uma responsabilidade cada.
- OCP: `TARGET_URL` troca o alvo sem alterar a logica de medicao.
- LSP: qualquer endpoint HTTP que cumpra o contrato 2xx pode substituir o alvo local.
- ISP: o alvo expoe somente os endpoints HTTP necessarios; nao ha interface artificial.
- DIP: o processo Go recebe um `http.Handler` concreto construido no boundary e o k6 depende do contrato HTTP, nao da implementacao.

Simplicity:

- KISS: um entrypoint inicia o alvo e o k6, sem compose ou broker.
- YAGNI: nao foram adicionados banco, observabilidade ou dashboard porque nao provam p95_curve.
- DRY: niveis e metricas sao descritos uma vez no cenario e formatados uma vez no relatorio.

Testability evidence:

- `internal/target/handler_test.go` executa sem infraestrutura.
- `go vet`, `node --check`, build Docker e benchmark formam o teste de contrato integrado.

## Rejected Options

| Option | Why rejected |
|---|---|
| Python stdlib server | Runtime maior e menor sinal para o perfil de baixo overhead. |
| Node.js server | Duplicaria o runtime JavaScript; o JavaScript necessario ja e executado pelo k6. |
| k6 instalado no host | Quebraria a reproducibilidade por versao e adicionaria pre-requisito local. |
| Docker Compose | O caso tem um unico container executavel e nao precisa orquestrar servicos. |

## API Contract

Contract artifact: contrato HTTP minimo documentado em `sdd/spec.md`.

- `GET /health` retorna `200 application/json` e fixture estavel.
- `GET /payload` retorna fixture estavel com seed 42.
- Outros metodos retornam `405` com `Allow: GET`.

## Cloud Local-First

Local provider: `none`.

Real provider target: `none`.

Config switch:

```txt
TARGET_URL=http://127.0.0.1:8080/health
```

Unsupported local behaviors: nenhum; o benchmark nao faz claim de paridade cloud.

## Benchmark Impact

Expected impact:

- O alvo Go reduz ruido de runtime e torna visivel a curva de p95 do HTTP.
- O JSON registra image tag, image id, commit, niveis e duracoes.

Validation command:

```powershell
pwsh -NoProfile -File tools/validate-project.ps1 -Strict
```

## Operational Cost

- Docker services added: nenhum servico externo.
- Local demo complexity: low.
- Failure case required: yes; thresholds falham em status nao-2xx ou erro acima de 1%.

## Follow-up

- Reavaliar a arquitetura se o projeto passar a comparar multiplos providers ou topologias.
