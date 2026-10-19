# Metal engineer

A role plugin for GPU work on Apple platforms with Metal. The Metal
engineer builds and maintains the code that drives Apple GPUs at the 27
releases of iOS, iPadOS, macOS, tvOS and visionOS, with Xcode 27, Swift
6.4 and Metal Shading Language 4.1: Metal 4 renderer and compute
architecture on tile-based Apple GPUs, shaders, capability checks and
device tiers, Swift concurrency and C++ interop around the GPU,
validation and GPU captures, counter-based profiling on real devices,
and GPU tests in CI.

It works alongside Apple's own agent skills rather than repeating them:
the skills that ship with Xcode 27 and the Metal skills in Apple's Game
Porting Toolkit.

## Install

```
/plugin marketplace add opsroller/claude-plugins
/plugin install metal-engineer@opsroller
```

It builds on `engineering-practices`; install that too. Then add
Apple's skills:

```
xcrun agent skills export --output-dir <a folder your agent reads skills from>
/plugin marketplace add apple/game-porting-toolkit
/plugin install game-porting-skills@game-porting-toolkit
```

## Documentation

**Start here.** [Write your first tested compute kernel](docs/tutorials/first-task.md)
walks through toolchain, test, kernel, measurement and docs.

**Doing the job.** Task guides:
[set up a Mac for Metal work](docs/how-to/how-to-set-up-a-mac-for-metal-work.md),
[implement a Metal feature](docs/how-to/how-to-implement-a-metal-feature.md),
[fix wrong rendering](docs/how-to/how-to-fix-wrong-rendering.md),
[find what limits GPU time](docs/how-to/how-to-find-what-limits-gpu-time.md) and
[run GPU tests in CI](docs/how-to/how-to-run-gpu-tests-in-ci.md).

**Looking things up.** The [reference](docs/reference/index.md) describes
the agent, the eight skills and the three workflows
(`implement-metal-feature`, `investigate-gpu-performance`,
`debug-metal-rendering`) with their arguments and outputs;
[SOURCES.md](SOURCES.md) lists the research behind them.

**Wondering why?** [About the Metal engineer role](docs/explanation/about-the-role.md)
explains the reasoning (one version floor, Apple's skills first,
bandwidth on tile-based GPUs, strict measurement) and the boundaries with
neighbouring roles.

## License

Copyright (C) 2026 the contributors. Licensed under the GNU General Public License v2.0 or later (`GPL-2.0-or-later`); see `LICENSE`.
