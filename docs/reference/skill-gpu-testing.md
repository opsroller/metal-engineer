*Reference, for anyone looking up what the `gpu-testing` skill covers while working.*

# gpu-testing

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/gpu-testing/SKILL.md`](../../skills/gpu-testing/SKILL.md) |
| Loaded when | use when GPU work needs automated tests - compute kernels against a CPU reference with stated tolerances, render passes into offscreen textures compared with reviewed reference images, shared struct layout checks, validation on in tests, Swift Testing or XCTest structure, running on Apple silicon CI runners whose virtual or paravirtual GPU supports fewer features, and skipping honestly with a reason instead of passing silently. |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Inputs

The behaviours to prove; reference implementations or reviewed images; the CI runners available.

## Outputs

Tests in the project's test target, run by its test command and CI, with validation on, tolerances stated, reference images reviewed and skips reported with reasons.

## Where tests run

| Item | Detail |
|---|---|
| Apple silicon Mac | Everything |
| Hosted Apple silicon CI runner | What its paravirtual GPU supports; the rest skipped with the missing capability |
| Simulator | App logic and smoke tests only |
| Linux | Nothing on the GPU; reported as not run |

## Quality bar

- Validation messages fail tests.
- Tolerances are stated in meaningful units and hold on every supported GPU family.
- Skips are reported separately and never counted as passes.

## Apple skills and guides it builds on

Apple's `test-modernizer` skill (XCTest to Swift Testing).

## Documentation owed

How-to (running GPU tests for this project); reference (test commands, tolerances, reference images, skips). Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
