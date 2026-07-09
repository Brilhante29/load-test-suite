# #29 load-test-suite

**Status:** scaffold

**Proves:** suite reutilizavel de carga.

**Benchmark target:** p95_curve.

**Stack:** k6, javascript, docker.

## Next milestone

Implement the smallest Docker-runnable version and produce the first JSON benchmark under enchmarks/results/.

## Run

`ash
docker build -t load-test-suite .
docker run --rm load-test-suite
`

## Benchmark

`ash
docker run --rm load-test-suite benchmark
`

| Metric | Value | Unit |
|---|---:|---|
| p95_curve | pending | pending |

## Architecture

Defined in sdd/spec.md before implementation.

## References

See REFERENCES.md.