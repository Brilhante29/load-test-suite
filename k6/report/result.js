import { levels, sampleSeconds, targetUrl, warmupSeconds } from "../scenarios/p95-curve.js";

function values(data, name) {
  return data.metrics[name] ? data.metrics[name].values : {};
}

function requiredNumber(value, metric) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`missing or invalid k6 metric: ${metric}`);
  }
  return value;
}

export function buildResult(data, metadata) {
  const curve = levels.map((vus) => {
    const durationName = `request_duration_vus_${vus}`;
    const requestName = `requests_vus_${vus}`;
    const errorName = `request_error_vus_${vus}`;
    const duration = values(data, durationName);
    const requestCount = values(data, requestName);
    const errorRate = values(data, errorName);
    const requests = requiredNumber(requestCount.count, `${requestName}.count`);
    if (requests <= 0) {
      throw new Error(`benchmark level ${vus} produced no requests`);
    }
    return {
      vus,
      requests,
      p50_ms: requiredNumber(duration.med, `${durationName}.med`),
      p90_ms: requiredNumber(duration["p(90)"], `${durationName}.p90`),
      p95_ms: requiredNumber(duration["p(95)"], `${durationName}.p95`),
      error_rate: requiredNumber(errorRate.rate, `${errorName}.rate`)
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
      error_rate: totalErrors / totalRequests
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