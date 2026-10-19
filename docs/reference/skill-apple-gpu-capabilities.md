*Reference, for anyone looking up what the `apple-gpu-capabilities` skill covers while working.*

# apple-gpu-capabilities

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/apple-gpu-capabilities/SKILL.md`](../../skills/apple-gpu-capabilities/SKILL.md) |
| Loaded when | use when deciding what GPU features a project may use on each Apple device, or setting device tiers across iPhone, iPad, Mac, Apple Vision Pro and Apple TV - GPU families and feature queries, the Metal feature set tables, memory budgets and working-set limits, thermal state and low power mode, refresh rates and frame pacing, MetalFX upscaling and frame interpolation as scaling levers, and the fallback each optional feature needs. |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Inputs

The project's device list per platform; the graphics programmer's tier decision.

## Outputs

A capabilities reference: device list, capability gates with fallbacks, tier per device, memory budgets, scaling levers with measured savings.

## Limits it tracks

| Item | Detail |
|---|---|
| GPU features | `supportsFamily`, feature queries, the Metal feature set tables |
| Memory | `recommendedMaxWorkingSetSize` on Mac; `os_proc_available_memory()` elsewhere |
| Heat and power | `ProcessInfo.thermalState`, low power mode, 15-minute soak |
| Pacing | `CAMetalDisplayLink`, preferred frame rate ranges, ProMotion |
| Scaling | MetalFX upscaling, function-constant quality, effect resolution, frame interpolation |

## Quality bar

- Gates are capabilities, never OS versions or device names.
- Every gate has a tested fallback.
- Paravirtual GPUs are treated as their own device.

## Apple skills and guides it builds on

Apple's `presenting-metal-drawables`, `using-metalfx-temporal-upscaler`, `using-metalfx-frame-interpolation`.

## Documentation owed

Reference (capabilities and tiers); explanation for tier trade-offs. Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
