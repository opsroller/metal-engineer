*Reference landing page, for anyone looking up a part of the metal-engineer plugin.*

# Reference

These pages describe each part of the plugin as it is. They mirror the
repository: one page for the agent, one per skill, one per workflow.

## Agent

- [metal-engineer](agent.md): what the agent owns, the version floor,
  the Apple skills it loads, what it leaves to neighbouring roles, and
  its "never" list.

## Skills

**Setting up**
- [apple-platform-toolchain](skill-apple-platform-toolchain.md): Xcode 27, SDKs and targets, MSL 4.1, Apple's agent skills, command-line tools.

**Building GPU work**
- [metal4-architecture](skill-metal4-architecture.md): frames in flight, commands, residency, barriers, pipelines, tile-based passes.
- [metal-shading-language](skill-metal-shading-language.md): writing, compiling and checking MSL 4.1 shaders.
- [apple-gpu-capabilities](skill-apple-gpu-capabilities.md): GPU families, device tiers, memory, heat, pacing, MetalFX.
- [swift-metal-concurrency](skill-swift-metal-concurrency.md): Swift 6.4 concurrency, ownership and lifetimes around the GPU.

**Proving it**
- [gpu-testing](skill-gpu-testing.md): compute and render tests, tolerances, CI on Apple silicon, honest skips.
- [metal-debugging](skill-metal-debugging.md): validation, labels, captures, root causes.
- [metal-performance-profiling](skill-metal-performance-profiling.md): GPU time per pass, counters, limiters, matched baselines.

## Workflows

| Workflow | Args | Page |
|---|---|---|
| `implement-metal-feature` | `{ feature, spec, devices?, wp?, branch?, pr? }` | [implement-metal-feature](workflow-implement-metal-feature.md) |
| `investigate-gpu-performance` | `{ symptom, device, scenario?, budget? }` | [investigate-gpu-performance](workflow-investigate-gpu-performance.md) |
| `debug-metal-rendering` | `{ bug, device?, capture?, wp?, branch?, pr? }` | [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Apple skills it loads

Not part of this plugin; installed beside it
([apple-platform-toolchain](skill-apple-platform-toolchain.md) says how).

| Set | Get it | Used for |
|---|---|---|
| Xcode 27 skills | `xcrun agent skills export --output-dir <dir>` | SwiftUI, UIKit modernization, Swift Testing, C bounds safety, security settings, device interaction, toolchain notes |
| Game Porting Toolkit skills | `/plugin marketplace add apple/game-porting-toolkit`, then `/plugin install game-porting-skills@game-porting-toolkit` | Metal 4 API reference and translation, resources, synchronization, pipelines, presentation, metal-cpp, shader converter, MetalFX, validation, `gpucapture`, `gpudebug`, rendering diagnosis |

## plugin.json fields

| Field | Value |
|---|---|
| `name` | `metal-engineer` |
| `version` | `0.1.0` |
| `author.name` | `opsroller` |
| `repository` | `https://github.com/opsroller/metal-engineer` |
| `license` | `GPL-2.0-or-later` |
| `keywords` | `role`, `job-function`, `metal`, `gpu`, `apple`, `shaders`, `msl`, `profiling`, `ios`, `macos`, `visionos`, `tvos` |

## Sources

The research behind the plugin is listed in [SOURCES.md](../../SOURCES.md).
