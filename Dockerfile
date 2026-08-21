# syntax=docker/dockerfile:1
FROM golang:1.26.6-alpine AS target-build

WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/load-target ./cmd/load-target

FROM grafana/k6:2.1.0

WORKDIR /work
COPY --from=target-build /out/load-target /usr/local/bin/load-target
COPY k6 ./k6
COPY scripts/entrypoint.sh /usr/local/bin/load-test-entrypoint

# The result directory is commonly a host bind mount; root avoids UID mismatch
# between Docker Desktop and Linux CI while the image remains benchmark-only.
USER root
RUN mkdir -p /results && chmod 0777 /results && chmod +x /usr/local/bin/load-test-entrypoint

ENV TARGET_URL=http://127.0.0.1:8080/work
ENV RESULT_DIR=/results
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/load-test-entrypoint"]
CMD ["benchmark"]
