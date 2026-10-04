# Reuse Improvement Review

Project: `29 - load-test-suite`

## Review Points

- [x] after scaffold
- [x] after architecture decision
- [x] after first working slice
- [x] after benchmark result
- [x] before publication
- [x] after CI failure, if applicable: no CI failure observed locally

## Findings

| Finding | Classification | Kit Area | Action | Status |
|---|---|---|---|---|
| The template requires a committed result, but the scaffold `.gitignore` ignores it by default. | patch_now | templates | Keep the ignore rule for local runs and explicitly allow the versioned baseline. | recorded |
| The harness offered only a k6 smoke run and did not govern repetitions, curves, or V2. | patch_now | harness + skills | Promote a generic contract and skill for multi-run k6 curves; keep the concrete target and scenarios local. | applied |
| The HTTP target is specific to this benchmark. | reject | harness | Do not promote the fixture to the kit; it is project evidence. | recorded |

## Patch Now Decisions

- The baseline versioning rule was applied only in this project.

## Reusable Patch

- The kit now governs per-repetition samples, the aggregated curve, fail-closed
  thresholds, smoke runs isolated from published evidence, and commit provenance.

## Rejected Improvements

- Do not add a generic HTTP server to `portfolio-reuse-kit`; the Go target is part of the #29 claim.

## Final Gate

- [x] Reusable improvements were patched or recorded.
- [x] Project-specific implementation was not moved into the kit.
- [x] Validation reflects V1/V2, three repetitions, exact source provenance, and isolated CI smoke.
