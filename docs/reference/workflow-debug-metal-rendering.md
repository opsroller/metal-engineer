*Reference, for anyone looking up the `debug-metal-rendering` workflow's arguments, phases and results.*

# debug-metal-rendering

| Field | Value |
|---|---|
| Type | Workflow |
| File | [`workflows/debug-metal-rendering.js`](../../workflows/debug-metal-rendering.js) |
| Invoke | `/metal-engineer:debug-metal-rendering` |
| Skills used | apple-platform-toolchain, metal-debugging, gpu-testing, and the skill for the area of the fix; Apple's debugging-rendering-issues, using-metal-validation, using-gpucapture and using-gpudebug where installed; engineering-practices project-onboarding, git-workflow |

Finds and fixes one Metal rendering or compute bug at its root cause,
with a regression test, and checks for the same mistake elsewhere.

## Arguments

| Arg | Required | Type | Meaning |
|---|---|---|---|
| `bug` | yes | string | Issue link or description |
| `device` | no | string | Device it shows on; default: the one the report names, or the weakest supported device that shows it |
| `capture` | no | string | Path to an existing `.gputrace` to start from |
| `wp` | no | string | Work package id, for the PR body and `next` |
| `branch` | no | string | Existing branch to work on |
| `pr` | no | string | Existing PR to work on |

Missing `bug` returns the usage string.

## Phases

| Phase | Agents | Edits files | Does |
|---|---|---|---|
| Reproduce | 1 | yes (test only) | Failing GPU test, or exact steps, with validation on; validation messages verbatim. Blocks if it cannot reproduce |
| Diagnose | 1 | no | Capture, first wrong pass, root cause in one sentence and whether it explains every symptom, the fix at the cause. Blocks if the cause does not explain every symptom |
| Fix | 1 | yes | Minimal fix at the cause; the reproduction passes; suite green with validation clean |
| Siblings | 3, parallel, independent; then 0-1 fix | no; the fix step edits | Searches: other passes, other shaders and variants, other platforms and GPU families. Sites found are fixed with tests in one step |
| Docs | 1 | yes | Reference updates where behaviour changed; a how-to for a new procedure |
| Check | 1, independent | no | Suite with validation, reproduction passes, fix at the cause, docs one kind per page |
| Hand off | 1 | no (pushes) | Pushes; updates or opens a draft `fix:` PR with root cause, reproduction, siblings and docs. Does not mark it ready or merge |

## Results

| Field | Meaning |
|---|---|
| `status` | `done`; `unverified` (a sibling search or the check returned nothing); `blocked` with `open` or `reason` |
| `rootCause`, `firstWrongPass` | The diagnosis |
| `reproduction` | Test file, or the steps |
| `siblingsFixed` | Sibling sites fixed |
| `unverifiedSiblingSearches` | Searches whose agent returned nothing |
| `docs`, `undocumented`, `notes` | As in the other workflows |
| `handoff` | The deliver-package `prior` object, only when `status` is `done` |
| `pushed` | Where the work was pushed, only when `unverified` |
| `next` | deliver-package with `prior` when `wp` is set, else land-pr |

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `reproduce`, `diagnose`, `fix`, `siblings:passes`, `siblings:shaders`, `siblings:platforms`, `fix-siblings`, `docs`, `check`, `handoff`.

Independent steps: the three `siblings:` searches and `check`. In inline mode send them to a reviewer who did not do the work and name them in `run.reviewers`, or the run lists them under `self_reviewed`.

Related: [How to fix wrong rendering](../how-to/how-to-fix-wrong-rendering.md) · [metal-debugging](skill-metal-debugging.md) · [index](index.md)
