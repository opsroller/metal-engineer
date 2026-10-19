*Reference, for anyone looking up what the `metal-debugging` skill covers while working.*

# metal-debugging

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/metal-debugging/SKILL.md`](../../skills/metal-debugging/SKILL.md) |
| Loaded when | use when a Metal app renders wrong, crashes or hangs on the GPU, or before saying GPU work is correct - turning on API and shader validation, labels and debug groups, capture scopes, capturing a frame with Xcode or gpucapture and reading it with the Metal debugger or gpudebug, comparing against a reference, finding the first wrong pass, fixing at the cause and keeping a regression test. |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Inputs

A bug report; the device and build it shows on; an existing capture if any.

## Outputs

A failing test or exact steps that now pass, the root cause in one sentence, sibling sites checked, validation clean.

## Always on

| Item | Detail |
|---|---|
| API validation | Every debug run and GPU test |
| Shader validation | GPU tests and memory-error hunts |
| Labels and debug groups | Every object and stage, named as in the design |
| Capture scope | One frame or job, triggerable by anyone |

## Quality bar

- A validation message is a bug, never silenced.
- The root cause explains every symptom.
- The fix sits at the cause and keeps its regression test.

## Apple skills and guides it builds on

Apple's `debugging-rendering-issues`, `using-metal-validation`, `using-gpucapture`, `using-gpudebug`.

## Documentation owed

Reference updates when behaviour changed; how-to for a new debugging procedure. Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
