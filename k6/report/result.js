import { levels, sampleSeconds, targetUrl, warmupSeconds } from "../scenarios/p95-curve.js";

function values(data, name) {
  return data.metrics[name] ? data.metrics[name].values : {};
}

function numberOrZero(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function buildResult(data, metadata) {
  const curve = levels.map((vus) => {
    const duration = values(data, `request_duration_vus_${vus}`);
    const requestCount = values(data, `requests_vus_${vus}`);
    const errorRate = values(data, `request_error_vus_${vus}`);
    return {
      vus,
      requests: numberOrZero(requestCount.count),
      p50_ms: numberOrZero(duration.med),
      p90_ms: numberOrZero(duration["p(90)"]),
      p95_ms: numberOrZero(duration["p(95)"]),
      error_rate: numberOrZero(errorRate.rate)
    };
  });
  const p95Values = curve.map((point) => point.p95_ms);
  const totalRequests = curve.reduce((total, point) => total + point.requests, 0);
  const maxP95 = Math.max(...p95Values);
  const minP95 = Math.min(...p95Values);
  const totalErrors = curve.reduce((total, point) => total + point.requests * point.error_rate, 0);

  return {
    project: "load-test-suite",
    metric: "p95_curve",
    value: maxP95,
    unit: "ms",
    timestamp: new Date().toISOString(),
    command: metadata.command,
    repeat: 1,
    samples: p95Values,
    summary: {
      levels: curve.length,
      total_requests: totalRequests,
      min_p95_ms: minP95,
      max_p95_ms: maxP95,
      error_rate: totalRequests === 0 ? 1 : totalErrors / totalRequests
    },
    environment: {
      image_tag: metadata.imageTag,
      image_id: metadata.imageId,
      source_commit: metadata.sourceCommit,
      runtime: "docker",
      k6_image: "grafana/k6:0.49.0",
      target_url: targetUrl,
      warmup_seconds: String(warmupSeconds),
      sample_seconds: String(sampleSeconds),
      vus_levels: levels.join(",")
    },
    curve
  };
}

export function formatSummary(result) {
  const lines = [
    "p95 curve (ms)",
    "VUs | requests | p95_ms | error_rate",
    ...result.curve.map((point) => `${point.vus} | ${point.requests} | ${point.p95_ms} | ${point.error_rate}`),
    `max_p95_ms=${result.summary.max_p95_ms}`
  ];
  return `${lines.join("\n")}\n`;
}
