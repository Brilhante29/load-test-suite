import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { checks: ["rate==1"] }
};

export default function () {
  const response = http.get(__ENV.TARGET_URL);
  check(response, { "target is ready": (value) => value.status === 200 });
}