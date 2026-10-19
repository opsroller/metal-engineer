---
name: apple-platform-toolchain
description: Use before any Metal work on Apple platforms, and when setting one up - confirming Xcode 27, the 27 SDKs and deployment targets, Swift 6.4 language mode, compiling shaders offline to metallib with -std=metal4.1, exporting the agent skills that ship with Xcode 27 and installing Apple's Game Porting Toolkit skills, and the command-line tools for builds, Instruments traces and GPU captures (xcodebuild, xcrun metal, xctrace, gpucapture, gpudebug).
---

# Apple platform toolchain

The role targets the 27 releases only. This skill gets a machine and a
project to that floor, and loads Apple's own agent skills so you work
from Apple's guidance instead of memory.

## 1. Confirm the machine

Record the answers with the work:

- `xcodebuild -version`: Xcode 27.x. If it is not, `xcode-select -p`
  shows which Xcode the command line uses; switch with
  `xcode-select -s` or `DEVELOPER_DIR`, never by editing the project.
- `swift --version`: 6.4 or later.
- `sw_vers`: the host OS. Xcode 27 needs an Apple silicon Mac on macOS
  Tahoe 26.4 or later; the macOS 27 GPU tools below need macOS 27.
- `xcrun --sdk macosx --show-sdk-version` (and `iphoneos`,
  `appletvos`, `xros`): each SDK the project builds is 27.x.
- `xcrun metal --version`: the Metal compiler from the same Xcode.

A machine that fails any check is not a build or measurement machine
for this role. Say which check failed; do not install or switch
toolchains on a shared machine without its owner.

## 2. Confirm the project floor

- Deployment target 27 for every Apple OS target in the project
  (`IPHONEOS_DEPLOYMENT_TARGET`, `MACOSX_DEPLOYMENT_TARGET`,
  `TVOS_DEPLOYMENT_TARGET`, `XROS_DEPLOYMENT_TARGET`, or the
  `platforms:` of a Swift package).
- Swift 6 language mode (`SWIFT_VERSION = 6` or
  `swiftLanguageModes: [.v6]`) with complete strict concurrency.
- Shader language version pinned: `MTL_LANGUAGE_REVISION` set to Metal
  4.1 in Xcode targets, or `-std=metal4.1` wherever shaders compile
  outside Xcode. Never leave it to the compiler default: a default can
  change with the next Xcode.
- Shader debug info: embedded sources (`MTL_ENABLE_DEBUG_INFO`, or
  `-frecord-sources` and `-gline-tables-only`) in debug builds only.

If the profile disagrees with the floor, stop and raise it; do not
change targets on your own.

## 3. Load Apple's skills

Apple's skills are reference material from the platform owner. Load the
ones that fit the task before writing code.

**Xcode 27 skills.** Export them once per Xcode version:

```
xcrun agent skills export --output-dir <dir>
```

The export writes one folder per skill (a `SKILL.md` and its
references). Point the agent at that folder (for example a skills
folder the agent tool discovers). They cover SwiftUI, what is new in
SwiftUI for the 27 releases, UIKit app modernization, migrating XCTest
to Swift Testing, C bounds safety, auditing Xcode security settings,
device and Simulator interaction, and notes on the current toolchain.
`device-interaction` and the security audit lean on tools only Xcode's
own agent has; outside Xcode, follow them by hand. Re-export after every
Xcode update; the set is versioned with Xcode.

**Game Porting Toolkit skills.** Apple publishes its Metal expert
skills as a plugin:

```
/plugin marketplace add apple/game-porting-toolkit
/plugin install game-porting-skills@game-porting-toolkit
```

Despite the name, most of them are general Metal 4 references, useful
for any Metal work: `translating-to-metal4-api`,
`managing-metal4-resources`, `managing-metal4-synchronization`,
`creating-metal4-shader-pipelines`, `presenting-metal-drawables`,
`managing-metal-cpp-lifetimes`, `using-metalfx-temporal-upscaler`,
`using-metalfx-frame-interpolation`, `using-metal-validation`,
`using-gpucapture`, `using-gpudebug`, `debugging-rendering-issues`,
`using-game-controller`, the Metal shader converter pair, and
`setting-up-macos-window` for macOS hosts. Its `porting-*` workflow
skills and porting agent are for porting a game from another API; use
them only for that.

**Licences.** Apple's skills are published under Apple's terms (the
Game Porting Toolkit repository is Apache-2.0). Load and follow them;
never paste their text or code into the project or this role's output
without checking the licence is compatible with the project's and
recording it (engineering-practices `provenance`). Apache-2.0 material,
for example, cannot go into a GPL-2.0-only work.

## 4. The command-line tools

| Need | Tool |
|---|---|
| Build, test, archive | `xcodebuild` with `-scheme`, `-destination`, `-configuration`; `swift build` / `swift test` for packages |
| Compile shaders offline | `xcrun -sdk <sdk> metal -std=metal4.1 -c x.metal -o x.air`, then `xcrun -sdk <sdk> metallib x.air -o x.metallib`; one library per SDK |
| Profile | `xcrun xctrace record --template 'Metal System Trace'` (or the Game Performance template) `--device <udid> --launch -- <app>`; Xcode 27's `xctrace record` takes Instruments recording options on the command line |
| Capture a GPU frame | `gpucapture` (macOS 27): writes a `.gputrace` from a running app; Apple's `using-gpucapture` skill |
| Read a capture | `gpudebug` (macOS 27): encoders, draws, bindings, resource contents, shader source; Apple's `using-gpudebug` skill |
| Live overlay | Metal Performance HUD (`MTL_HUD_ENABLED=1`), with MetalFX overlays on macOS 27 |
| Devices | `xcrun devicectl list devices`; `xcrun simctl` for Simulators |

Use the project's own build commands where the profile names them; the
table is what they wrap.

## 5. Where work runs

- **Builds and shader compilation** run on any Apple silicon Mac with
  Xcode 27, including CI. Linux containers cannot compile MSL to a
  metallib; say so and hand the step to a Mac or CI job rather than
  skipping it.
- **GPU tests** run on Apple silicon with a real or paravirtual GPU
  (`gpu-testing`).
- **Measurements** run on the target device only
  (`metal-performance-profiling`).

## Output

A toolchain note with the work: Xcode, Swift, SDK and host versions, the
deployment targets and language versions checked, the Apple skills
loaded, and anything that failed with the check that showed it.
