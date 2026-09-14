# syntax=docker/dockerfile:1
FROM golang:1.26.8-alpine3.24 AS k6-build
RUN go mod download go.k6.io/k6/v2@v2.2.0 && \
    cp -a /go/pkg/mod/go.k6.io/k6/v2@v2.2.0 /k6 && chmod -R u+w /k6
WORKDIR /k6
RUN go get golang.org/x/crypto@v0.57.0 google.golang.org/grpc@v1.83.2 && \
    CGO_ENABLED=0 go build -trimpath -o /out/k6 .

FROM golang:1.26.8-alpine3.24 AS target-build

WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN go test ./... && go vet ./... && \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/load-target ./cmd/load-target

FROM grafana/k6:2.2.0@sha256:9bd01d6941fca969cb61bb57d2da5ee9b385fe2aa8881df3798c196564d6ace6

WORKDIR /work
COPY --from=k6-build /out/k6 /usr/bin/k6
COPY --from=k6-build /k6/LICENSE.md /usr/share/licenses/k6/LICENSE.md
COPY --from=target-build /out/load-target /usr/local/bin/load-target
COPY k6 ./k6
COPY scripts/entrypoint.sh /usr/local/bin/load-test-entrypoint

# The result directory is commonly a host bind mount; root avoids UID mismatch
# between Docker Desktop and Linux CI while the image remains benchmark-only.
USER root
RUN apk upgrade --no-cache && \
    mkdir -p /results && chmod 0777 /results && chmod +x /usr/local/bin/load-test-entrypoint

ENV TARGET_URL=http://127.0.0.1:8080/work
ENV RESULT_DIR=/results
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/load-test-entrypoint"]
CMD ["benchmark"]
