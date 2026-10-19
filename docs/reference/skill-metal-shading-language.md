*Reference, for anyone looking up what the `metal-shading-language` skill covers while working.*

# metal-shading-language

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/metal-shading-language/SKILL.md`](../../skills/metal-shading-language/SKILL.md) |
| Loaded when | use when writing, changing, reviewing or porting a Metal Shading Language shader or kernel - pinning MSL 4.1, types and half precision, address spaces, function constants and variants, SIMD-group and threadgroup work, tile functions and imageblocks, texture reads, atomics and memory order, tensors and Metal Performance Primitives, compile options and offline libraries, debug info, and checking a shader's cost and correctness. |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Inputs

The effect or kernel brief and its agreed cost; the GPU families supported.

## Outputs

Shader source pinned to MSL 4.1, its variant list, a test, its measured cost on the weakest GPU family and a reference entry.

## Checks before done

| Item | Detail |
|---|---|
| Correctness | Test against a CPU reference or reviewed image, shader validation on |
| Cost | Time, occupancy and limiters on the weakest GPU family |
| Portability | Compiles for every shipped SDK; every feature supported or gated |
| Review | Host layout agreement, precision, divergence, bounds, barriers, memory order |

## Quality bar

- `-std=metal4.1` everywhere shaders compile, warnings as errors.
- Every variant is listed and only those compile.
- Shared structs are checked on both sides by a test.

## Apple skills and guides it builds on

The MSL 4.1 specification; Apple's Metal shader converter skills for DXIL.

## Documentation owed

Reference (entry points, inputs, outputs, variants, gates, cost). Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
