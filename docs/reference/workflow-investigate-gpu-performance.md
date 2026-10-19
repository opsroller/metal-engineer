*Reference, for anyone looking up the `investigate-gpu-performance` workflow's arguments, phases and results.*

# investigate-gpu-performance

| Field | Value |
|---|---|
| Type | Workflow |
| File | [`workflows/investigate-gpu-performance.js`](../../workflows/investigate-gpu-performance.js) |
| Invoke | `/metal-engineer:investigate-gpu-performance` |
| Skills used | apple-platform-toolchain, metal-performance-profiling, metal4-architecture, metal-shading-language, swift-metal-concurrency, apple-gpu-capabilities, gpu-testing; engineering-practices project-onboarding |

Finds and fixes what makes Metal work slow, stuttering or hot on one
Apple device, by measurement on the device itself.

## Arguments

| Arg | Required | Type | Meaning |
|---|---|---|---|
| `symptom` | yes | string | What is wrong, e.g. `GPU time over 8 ms in the forest scene` |
| `device` | yes | string | The Apple device or tier to investigate on |
| `scenario` | no | string | How to reproduce; default: the agent defines one |
| `budget` | no | string | GPU time budget; default: the project profile |

Missing `symptom` or `device` returns the usage string.

## Phases

| Phase | Agents | Edits files | Does |
|---|---|---|---|
| Plan | 1 | no | Scenario, budget in ms, release build, how GPU time per pass is read and how baseline and change alternate, whether the device is reachable. A Simulator, virtual machine or paravirtual GPU never counts. Blocks if the device is unreachable |
| Measure | 1 | no | Baseline: GPU time per frame and per pass (median, p95), CPU time, record fields |
| Diagnose | 4, parallel, read-only | no | Areas: `cpu` (encoding, waits), `limiters` (counters, occupancy, shader cost), `bandwidth` (tile loads and stores, memoryless, formats), `hitches` (pipelines, uploads, heat). Each returns evidenced causes with one change and an expected saving |
| Fix | up to 3 x (apply, re-measure, revert) | yes | Top three causes by expected saving, one at a time, while over budget. A change is kept only if GPU p95 improved; otherwise reverted with a revert commit |
| Docs | 1 | yes | Budgets, scenarios and per-pass results in reference with record fields; trade-offs in an explanation |
| Docs check | 1, independent | no | One kind per page, titles, links, every number with its device, build and scenario |

## Results

| Field | Meaning |
|---|---|
| `status` | `within budget`; `unverified` (within budget but a re-measure, diagnoser or docs check failed); `blocked: still over budget`; `blocked` with `reason`; `no evidenced cause found` |
| `summary` | Baseline and current GPU p95, budget, kept and tried changes, record |
| `baseline`, `current` | The measurements |
| `kept`, `tried` | Changes kept with their effect; changes reverted and why |
| `gaps` | What makes an `unverified` result unverified |
| `next` | Land the branch, check the gaps, or renegotiate the budget |

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `plan`, `baseline`, `cpu`, `limiters`, `bandwidth`, `hitches`, `apply:<n>-<area>`, `re-measure:<n>-<area>`, `revert:<n>-<area>`, `revert-unmeasured:<n>-<area>` (n is 1 to 3 in the order tried), `docs`, `docs-check`.

Independent steps: `docs-check`. In inline mode its brief comes back marked `independent: true`; send it to a reviewer who did not do the work and name them in `run.reviewers`, or the run lists it under `self_reviewed`.

Related: [How to find what limits GPU time](../how-to/how-to-find-what-limits-gpu-time.md) · [metal-performance-profiling](skill-metal-performance-profiling.md) · [index](index.md)
