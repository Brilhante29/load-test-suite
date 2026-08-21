import { levels, repeats, sampleSeconds, targetUrl, warmupSeconds } from "../scenarios/p95-curve.js";

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
  const runResults = [];
  for (let repeat = 1; repeat <= repeats; repeat += 1) {
    const curve = levels.map((vus) => pointFor(data, repeat, vus));
    runResults.push({ repeat, curve });
  }
  const curve = levels.map((vus) => aggregateLevel(runResults, vus));
  const maxVus = Math.max(...levels);
  const headlineSamples = runResults.map((run) => run.curve.find((point) => point.vus === maxVus).p95_ms);
  const headline = median(headlineSamples);
  const totalRequests = curve.reduce((total, point) => total + point.requests, 0);
  const totalErrors = curve.reduce((total, point) => total + point.requests * point.error_rate, 0);

  return {
    project: "load-test-suite",
    metric: "p95_ms_at_max_vus",
    value: headline,
    unit: "ms",
    timestamp: new Date().toISOString(),
    command: metadata.command,
    repeat: repeats,
    samples: headlineSamples,
    failures: Math.round(totalErrors),
    summary: {
      levels: curve.length,
      repeats,
      max_vus: maxVus,
      total_requests: totalRequests,
      median_p95_ms_at_max_vus: headline,
      min_p95_ms_at_max_vus: Math.min(...headlineSamples),
      max_p95_ms_at_max_vus: Math.max(...headlineSamples),
      error_rate: totalErrors / totalRequests
    },
    environment: {
      image_tag: metadata.imageTag,
      image_id: metadata.imageId,
      source_commit: metadata.sourceCommit,
      runtime: "docker",
      k6_image: "grafana/k6:2.1.0",
      target_url: targetUrl,
      warmup_seconds: String(warmupSeconds),
      sample_seconds: String(sampleSeconds),
      vus_levels: levels.join(","),
      repeats: String(repeats),
      target_worker_slots: "4",
      target_service_time_ms: "2"
    },
    curve,
    runs: runResults
  };
}

function pointFor(data, repeat, vus) {
  const durationName = `request_duration_run_${repeat}_vus_${vus}`;
  const requestName = `requests_run_${repeat}_vus_${vus}`;
  const errorName = `request_error_run_${repeat}_vus_${vus}`;
  const duration = values(data, durationName);
  const requestCount = values(data, requestName);
  const errorRate = values(data, errorName);
  const requests = requiredNumber(requestCount.count, `${requestName}.count`);
  if (requests <= 0) {
    throw new Error(`benchmark run ${repeat} level ${vus} produced no requests`);
  }
  return {
    vus,
    requests,
    p50_ms: requiredNumber(duration.med, `${durationName}.med`),
    p90_ms: requiredNumber(duration["p(90)"], `${durationName}.p90`),
    p95_ms: requiredNumber(duration["p(95)"], `${durationName}.p95`),
    error_rate: requiredNumber(errorRate.rate, `${errorName}.rate`)
  };
}

function median(samples) {
  const sorted = [...samples].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function aggregateLevel(runResults, vus) {
  const points = runResults.map((run) => run.curve.find((point) => point.vus === vus));
  const requests = points.reduce((total, point) => total + point.requests, 0);
  const errors = points.reduce((total, point) => total + point.requests * point.error_rate, 0);
  return {
    vus,
    requests,
    requests_per_second: requests / (sampleSeconds * repeats),
    p50_ms: median(points.map((point) => point.p50_ms)),
    p90_ms: median(points.map((point) => point.p90_ms)),
    p95_ms: median(points.map((point) => point.p95_ms)),
    p95_samples_ms: points.map((point) => point.p95_ms),
    error_rate: errors / requests
  };
}

export function formatSummary(result) {
  const lines = [
    "p95 curve (ms)",
    "VUs | requests | p95_ms | error_rate",
    ...result.curve.map((point) => `${point.vus} | ${point.requests} | ${point.p95_ms} | ${point.error_rate}`),
    `median_p95_ms_at_${result.summary.max_vus}_vus=${result.value}`,
    `repeat_samples_ms=${result.samples.join(",")}`
  ];
  return `${lines.join("\n")}\n`;
}
