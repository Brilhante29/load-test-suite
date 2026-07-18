# Architecture Decision

## Status

Accepted

## Context

Project: `load-test-suite #29`

Claim: curva p95 de um alvo HTTP sob niveis de VUs.

Benchmark: `p95_curve` em milissegundos.

Problem forces:

- Domain complexity: low.
- Integration pressure: medium: Docker, k6 e filesystem precisam se conectar.
- UI state complexity: none.
- Data/ML reproducibility: high: o ensaio precisa de fixture e ambiente registrados.
- Auditability/event history: low.
- Throughput/async pressure: medium: o alvo deve aceitar concorrencia, mas nao precisa de broker.
- Independent deployability: low.

## Decision

Chosen architecture: `modular-monolith`, com fronteira hexagonal simples entre
o alvo, o cenario e o relatorio.

Reason:

O problema tem um unico deploy Docker e tres responsabilidades estaveis. A
separacao em `internal/target`, `k6/scenarios` e `k6/report` permite substituir
o alvo ou reaproveitar o cenario sem acoplar o benchmark ao handler. Um
microservico ou uma arquitetura hexagonal completa adicionaria ceremonia sem
uma integracao real que justificasse portas adicionais.

Dependency rule:

O handler usa apenas `net/http` e `io`. O cenario depende do contrato HTTP, mas
nao do codigo Go. O relatorio depende do formato de summary do k6, e o script
Docker e o unico adaptador que inicia os dois lados.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Hexagonal completa | Nao ha banco, broker ou provider externo para trocar; as fronteiras modulares cobrem o risco real. |
| Microservices | Um segundo servico aumentaria a variancia do benchmark e o custo de operacao local. |
| Layered API | Teria camadas de persistencia e servico sem dominio correspondente. |

## Folder Layout

```txt
cmd/load-target/       # processo HTTP e sinais
internal/target/       # contrato e handler testavel
k6/scenarios/           # niveis de VUs e metricas customizadas
k6/report/              # curva e JSON de resultado
scripts/                # adaptadores Docker PowerShell/POSIX
benchmarks/results/     # baseline versionado
```

## Testing Strategy

- Unit tests: handler Go com `httptest`, sem Docker ou k6.
- Integration test: o benchmark k6 roda contra o alvo iniciado pelo entrypoint.
- Benchmark: quatro cenarios sequenciais com thresholds de status e erro.

## Consequences

Positive:

- O alvo e minimo e barato o suficiente para uma curva local focada em carga.
- O cenario e reutilizavel para qualquer endpoint HTTP 2xx.
- A evidencia registra imagem e ambiente, permitindo comparar execucoes.

Tradeoffs:

- O resultado local mede uma imagem monoprocesso, nao uma topologia distribuida.
- O k6 summary e dependente da versao pinada da imagem.

Migration path:

Se o problema crescer para comparar adapters, o modulo target pode ganhar uma
porta de servico e implementacoes adicionais sem mover o cenario ou o contrato
de resultado.
