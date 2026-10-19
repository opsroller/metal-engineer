*Reference, for anyone looking up what the `metal-engineer` agent does and does not do.*

# metal-engineer agent

| Field | Value |
|---|---|
| Type | Subagent |
| File | [`agents/metal-engineer.md`](../../agents/metal-engineer.md) |
| Base | Loads `engineering-practices` and follows `project-onboarding`, then `apple-platform-toolchain`, before any task |
| Version floor | iOS, iPadOS, macOS, tvOS and visionOS 27; Xcode 27; Swift 6.4 or later in the Swift 6 language mode; Metal 4; MSL 4.1 |

## Owns

| Area | Skill or workflow |
|---|---|
| Toolchain, SDKs, deployment targets, Apple's agent skills | [apple-platform-toolchain](skill-apple-platform-toolchain.md) |
| Frames in flight, commands, residency, barriers, pipelines, tile-based passes | [metal4-architecture](skill-metal4-architecture.md) |
| MSL 4.1 shaders: correctness, compilation, cost, portability | [metal-shading-language](skill-metal-shading-language.md) |
| GPU families, device tiers, memory, heat, pacing, MetalFX | [apple-gpu-capabilities](skill-apple-gpu-capabilities.md) |
| Swift, Objective-C and C++ around the GPU | [swift-metal-concurrency](skill-swift-metal-concurrency.md) |
| Validation, captures, root causes | [metal-debugging](skill-metal-debugging.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |
| GPU time per pass, counters, limiters | [metal-performance-profiling](skill-metal-performance-profiling.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md) |
| GPU tests and where they run | [gpu-testing](skill-gpu-testing.md) |
| One Metal feature end to end | [implement-metal-feature](workflow-implement-metal-feature.md) |

## Does not own

| Area | Owner |
|---|---|
| What the frame contains, engine-independent budgets, tier decisions | graphics-programmer |
| How materials and shaders look, in-game assets, the visual target | technical-artist |
| Game rules and state | gameplay-programmer |
| App UI beyond the view hosting the Metal layer | ui-developer |
| Signing, store submission, CI runners and pipelines | devops-engineer |
| PR review | code-reviewer |

## Never

- Targets or adds paths for releases below 27, or new code on the pre-Metal 4 command model.
- Copies Apple's skills, samples or other third-party material without provenance and a compatible licence.
- Quotes GPU time from the Simulator, a virtual machine, a debug build, or with validation or a capture attached.
- Silences validation, gates features on device names, or blocks the main thread on the GPU.

Related: [About the Metal engineer role](../explanation/about-the-role.md) · [index](index.md)
