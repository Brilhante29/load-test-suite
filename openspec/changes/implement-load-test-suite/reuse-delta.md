# Reuse Delta

## Reusable Discoveries

| Candidate | Decision | Reason | Follow-up |
|---|---|---|---|
| Explicitly versioned baseline JSON | patch-now | The kit contract is benchmark-driven, but the scaffold ignores all JSON. | Local rule in `.gitignore`. |
| Generic p95-per-VU helper | backlog | It may benefit other repositories, but it needs a schema and compatibility. | Evaluate in the kit harness. |
| Local Go fixture | reject | It is specific to the #29 claim, not a kit abstraction. | Keep it in the project. |

## Kit Patch

No `portfolio-reuse-kit` file was changed in this task. The versioning
improvement was applied only in the project and is documented above.

## Backlog

Propose an optional harness template for metric curves tagged by scenario,
with image metadata.

## Rejected

Do not turn the stable HTTP target into a global component.

## Final Gate

- [x] Every discovery was patch-now, backlog, or reject.
- [x] No project-specific implementation was moved into the kit.
