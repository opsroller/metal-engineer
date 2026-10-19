*Reference, for anyone looking up the `implement-metal-feature` workflow's arguments, phases and results.*

# implement-metal-feature

| Field | Value |
|---|---|
| Type | Workflow |
| File | [`workflows/implement-metal-feature.js`](../../workflows/implement-metal-feature.js) |
| Invoke | `/metal-engineer:implement-metal-feature` |
| Skills used | apple-platform-toolchain, metal4-architecture, metal-shading-language, apple-gpu-capabilities, swift-metal-concurrency, gpu-testing, metal-performance-profiling, metal-debugging; Apple's Xcode 27 and game-porting-skills where installed; engineering-practices project-onboarding, provenance, peer-coordination, git-workflow |

Builds one Metal feature from a spec that already exists: a render or
compute pass, a shader, a resource or synchronization scheme,
presentation, MetalFX. It targets the 27 releases only and never decides
what the frame should contain; that is the graphics programmer's design.

## Arguments

| Arg | Required | Type | Meaning |
|---|---|---|---|
| `feature` | yes | string | Name of the feature, e.g. `shadow map pass` |
| `spec` | yes | string | The spec or design to implement, a docs path or section |
| `devices` | no | string | Devices or tiers to cover; default: every Apple device the project profile supports, weakest first |
| `wp` | no | string | Work package id. Goes into the PR body as `Refs:` and makes `next` point at deliver-package |
| `branch` | no | string | Existing branch to work on; its open PR is reused |
| `pr` | no | string | Existing PR to work on, with its head branch |

Missing `feature` or `spec` returns the usage string.

## Phases

| Phase | Agents | Edits files | Does |
|---|---|---|---|
| Plan | 1 | no | Confirms the toolchain and the 27 floor, loads Apple's skills (lists any not installed), designs pass graph, frames in flight, residency, binding, synchronization and pipelines, lists capability gates with fallbacks, test cases, GPU time budget per pass, whether the weakest device is reachable, `AMBIGUOUS:` defaults and doc kinds. Blocks on a toolchain below the floor or a profile targeting older releases |
| Build | 1 | yes | Failing tests first with API and shader validation on, then code; shaders at `-std=metal4.1` with warnings as errors; labels as designed. Reports skips on a paravirtual GPU with reasons. Measures GPU time per pass (or labels it estimate). Commits. Blocks if validation reports anything |
| Attack | 4, parallel, independent | no | Lenses: correctness and synchronization, tile-based GPU cost, capabilities and platforms, Swift concurrency and lifetimes. Each returns failing test code |
| Fix | 0-1 | yes | Adds all returned tests in one edit and fixes the code. Runs only if tests were returned |
| Docs | 1 | yes | Writes the planned pages; the reference lists interface, pass graph, resources, synchronization, pipelines, gates with fallbacks, test command and skips, GPU time per pass |
| Check | 1, independent | no | Runs the suite with validation, checks skips have reasons, cost against budget, code against the design and the 27 floor, and each touched page holds one kind. Only `problems` blocks |
| Hand off | 1 | no (pushes) | Pushes the branch; updates the open PR's body or opens a draft PR. Does not mark it ready, request review or merge |

## Results

| Field | Meaning |
|---|---|
| `status` | `done`; `unverified` (an Attack lens returned nothing, or the check failed to run); `blocked` with `open` or `reason`, and `notes` |
| `cases` | Number of cases planned |
| `gates` | Capability gates with their fallbacks |
| `ambiguous` | Defaults taken, as named values |
| `skipped` | GPU tests skipped where they ran, each with the missing capability |
| `attackTestsAdded` | Tests added from the Attack phase |
| `unverifiedLenses` | Attack lenses whose agent failed |
| `measured` | GPU time per pass, measured with its record fields, or labelled estimate |
| `docs`, `undocumented` | Pages touched; changes left undocumented and why |
| `notes` | Informational notes by step, including Apple skills that were not installed. Never blocking |
| `handoff` | `{ from, branch, pr, head_sha, tests_pass, docs, undocumented, non_original, notes }`, the object engineering-practices deliver-package takes as `prior`. Only when `status` is `done` |
| `pushed` | `{ branch, pr, head_sha }`, only when `status` is `unverified` |
| `next` | With `wp`: deliver-package with `prior`, then land-pr. Without: land-pr |

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run. Without `run`, the workflow and its outputs are as above.
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels, for `run.only` and `run.results`: `plan`, `build`, `attack:correctness-and-synchronization`, `attack:tile-based-GPU-cost`, `attack:capabilities-and-platforms`, `attack:Swift-concurrency-and-lifetimes`, `fix`, `docs`, `check`, `handoff`.

Independent steps: the four `attack:` steps and `check`. In inline mode these briefs come back marked `independent: true`; send them to a reviewer who did not do the work (the project's code-reviewer role, a fresh session or subagent) and name them in `run.reviewers`, or the run lists them under `self_reviewed` and you report them as self-reviewed.

Related: [How to implement a Metal feature](../how-to/how-to-implement-a-metal-feature.md) · [metal4-architecture](skill-metal4-architecture.md) · [gpu-testing](skill-gpu-testing.md) · [index](index.md)
