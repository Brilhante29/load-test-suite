import http from "k6/http";
import { check } from "k6";
import execution from "k6/execution";
import { Counter, Rate, Trend } from "k6/metrics";

export const levels = [1, 5, 10, 20];
export const repeats = Number(__ENV.REPEATS || 3);
export const sampleSeconds = Number(__ENV.SAMPLE_SECONDS || 3);
export const warmupSeconds = Number(__ENV.WARMUP_SECONDS || 1);
export const maxP95Ms = Number(__ENV.MAX_P95_MS || 100);
export const targetUrl = __ENV.TARGET_URL || "http://127.0.0.1:8080/work";

const duration = `${sampleSeconds}s`;
const durationMetrics = {};
const requestMetrics = {};
const errorMetrics = {};

for (let repeat = 1; repeat <= repeats; repeat += 1) {
  durationMetrics[repeat] = {};
  requestMetrics[repeat] = {};
  errorMetrics[repeat] = {};
  for (const level of levels) {
    durationMetrics[repeat][level] = new Trend(`request_duration_run_${repeat}_vus_${level}`, true);
    requestMetrics[repeat][level] = new Counter(`requests_run_${repeat}_vus_${level}`);
    errorMetrics[repeat][level] = new Rate(`request_error_run_${repeat}_vus_${level}`);
  }
}

function scenario(vus, repeat, levelIndex) {
  const repeatSeconds = warmupSeconds + levels.length * sampleSeconds;
  return {
    executor: "constant-vus",
    vus,
    duration,
    startTime: `${(repeat - 1) * repeatSeconds + warmupSeconds + levelIndex * sampleSeconds}s`,
    exec: `level${vus}`,
    gracefulStop: "1s",
    tags: { repeat: String(repeat), vus_level: String(vus) }
  };
}

const scenarios = {};
const thresholds = {
  checks: ["rate==1"],
  http_req_failed: ["rate==0"]
};
for (let repeat = 1; repeat <= repeats; repeat += 1) {
  const repeatSeconds = warmupSeconds + levels.length * sampleSeconds;
  scenarios[`warmup_run_${repeat}`] = {
    executor: "constant-vus",
    vus: 1,
    duration: `${warmupSeconds}s`,
    startTime: `${(repeat - 1) * repeatSeconds}s`,
    exec: "warmup",
    gracefulStop: "1s"
  };
  levels.forEach((level, index) => {
    scenarios[`run_${repeat}_level_${level}`] = scenario(level, repeat, index);
    thresholds[`request_error_run_${repeat}_vus_${level}`] = ["rate==0"];
    thresholds[`request_duration_run_${repeat}_vus_${level}`] = [`p(95)<${maxP95Ms}`];
  });
}

export const options = {
  scenarios,
  thresholds,
  summaryTrendStats: ["min", "med", "p(90)", "p(95)", "max"]
};

export function warmup() {
  const response = http.get(targetUrl, { tags: { scenario: "warmup" } });
  check(response, { "warmup status is 2xx": (res) => res.status >= 200 && res.status < 300 });
}

function runLevel(level) {
  const match = execution.scenario.name.match(/^run_(\d+)_level_/);
  if (!match) {
    throw new Error(`unexpected scenario name: ${execution.scenario.name}`);
  }
  const repeat = Number(match[1]);
  const response = http.get(targetUrl, { tags: { scenario: `p95_vus_${level}` } });
  const ok = check(response, {
    "target status is 2xx": (res) => res.status >= 200 && res.status < 300
  });
  durationMetrics[repeat][level].add(response.timings.duration);
  requestMetrics[repeat][level].add(1);
  errorMetrics[repeat][level].add(ok ? 0 : 1);
}

export function level1() {
  runLevel(1);
}

export function level5() {
  runLevel(5);
}

export function level10() {
  runLevel(10);
}

export function level20() {
  runLevel(20);
}
