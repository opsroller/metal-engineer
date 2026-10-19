*Reference, for anyone looking up what the `apple-platform-toolchain` skill covers while working.*

# apple-platform-toolchain

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/apple-platform-toolchain/SKILL.md`](../../skills/apple-platform-toolchain/SKILL.md) |
| Loaded when | use before any Metal work on Apple platforms, and when setting one up - confirming Xcode 27, the 27 SDKs and deployment targets, Swift 6.4 language mode, compiling shaders offline to metallib with -std=metal4.1, exporting the agent skills that ship with Xcode 27 and installing Apple's Game Porting Toolkit skills, and the command-line tools for builds, Instruments traces and GPU captures (xcodebuild, xcrun metal, xctrace, gpucapture, gpudebug). |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Inputs

The project profile (platforms, targets, build commands); the machine the work runs on.

## Outputs

A toolchain note: Xcode, Swift, SDK and host versions; deployment targets and MSL version checked; Apple skills loaded; failed checks with the command that showed them.

## What it checks

| Item | Detail |
|---|---|
| Xcode | 27.x, from `xcodebuild -version` |
| Swift | 6.4 or later, Swift 6 language mode |
| Host | Apple silicon, macOS Tahoe 26.4 or later; macOS 27 for `gpucapture` and `gpudebug` |
| SDKs and targets | 27.x SDKs; deployment target 27 on every Apple OS |
| Shaders | `-std=metal4.1` or `MTL_LANGUAGE_REVISION` pinned; sources embedded in debug builds only |

## Quality bar

- Every check is recorded with the command that showed it.
- No toolchain is switched on a shared machine without its owner.
- Apple skills are loaded, not copied; any reuse has a provenance entry and a compatible licence.

## Apple skills and guides it builds on

Apple's Xcode 27 skills (`xcrun agent skills export`) and the `game-porting-skills` plugin.

## Documentation owed

How-to (setting up a Mac for this project); reference (versions, settings and tools the project uses). Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
