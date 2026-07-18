import {
  level1,
  level5,
  level10,
  level20,
  options,
  warmup
} from "./scenarios/p95-curve.js";
import { buildResult, formatSummary } from "./report/result.js";

export { options, warmup, level1, level5, level10, level20 };

export function handleSummary(data) {
  const result = buildResult(data, {
    command: __ENV.BENCHMARK_COMMAND || "docker run --rm load-test-suite:local benchmark",
    imageTag: __ENV.BENCHMARK_IMAGE || "load-test-suite:local",
    imageId: __ENV.BENCHMARK_IMAGE_ID || "not-recorded",
    sourceCommit: __ENV.BENCHMARK_COMMIT || "working-tree"
  });
  const resultDir = __ENV.RESULT_DIR || "/results";
  const resultName = __ENV.RESULT_FILE_NAME || "p95-curve-latest.json";
  const resultPath = `${resultDir}/${resultName}`;

  return {
    [resultPath]: JSON.stringify(result, null, 2),
    stdout: formatSummary(result)
  };
}
