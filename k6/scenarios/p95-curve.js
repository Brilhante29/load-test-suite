import http from "k6/http";
import { check } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

export const levels = [1, 5, 10, 20];
export const sampleSeconds = Number(__ENV.SAMPLE_SECONDS || 3);
export const warmupSeconds = Number(__ENV.WARMUP_SECONDS || 1);
export const targetUrl = __ENV.TARGET_URL || "http://127.0.0.1:8080/health";

const duration = `${sampleSeconds}s`;
const durations = {
  1: new Trend("request_duration_vus_1", true),
  5: new Trend("request_duration_vus_5", true),
  10: new Trend("request_duration_vus_10", true),
  20: new Trend("request_duration_vus_20", true)
};
const requests = {
  1: new Counter("requests_vus_1"),
  5: new Counter("requests_vus_5"),
  10: new Counter("requests_vus_10"),
  20: new Counter("requests_vus_20")
};
const errors = {
  1: new Rate("request_error_vus_1"),
  5: new Rate("request_error_vus_5"),
  10: new Rate("request_error_vus_10"),
  20: new Rate("request_error_vus_20")
};

function scenario(vus, index, exec) {
  return {
    executor: "constant-vus",
    vus,
    duration,
    startTime: `${warmupSeconds + index * sampleSeconds}s`,
    exec,
    gracefulStop: "1s",
    tags: { vus_level: String(vus) }
  };
}

export const options = {
  scenarios: {
    warmup: {
      executor: "constant-vus",
      vus: 1,
      duration: `${warmupSeconds}s`,
      exec: "warmup",
      gracefulStop: "1s"
    },
    level_1: scenario(1, 0, "level1"),
    level_5: scenario(5, 1, "level5"),
    level_10: scenario(10, 2, "level10"),
    level_20: scenario(20, 3, "level20")
  },
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
    request_error_vus_1: ["rate<0.01"],
    request_error_vus_5: ["rate<0.01"],
    request_error_vus_10: ["rate<0.01"],
    request_error_vus_20: ["rate<0.01"]
  }
};

export function warmup() {
  const response = http.get(targetUrl, { tags: { scenario: "warmup" } });
  check(response, { "warmup status is 2xx": (res) => res.status >= 200 && res.status < 300 });
}

function runLevel(level) {
  const response = http.get(targetUrl, { tags: { scenario: `p95_vus_${level}` } });
  const ok = check(response, {
    "target status is 2xx": (res) => res.status >= 200 && res.status < 300
  });
  durations[level].add(response.timings.duration);
  requests[level].add(1);
  errors[level].add(ok ? 0 : 1);
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
