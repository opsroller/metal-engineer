# Sources

*Reference: the research behind this plugin. Each entry: title, link, what it informed.*

## Job postings

- **Metal Game Engineer Manager, Apple** - https://www.themuse.com/jobs/apple/metal-game-engineer-manager - CPU, GPU and memory optimisation in games and engines on Metal, large third-party codebases, GPU counters and shader compilers, Xcode Instruments; partner integration (agent, explanation).
- **Metal API & Shader Instrumentation Engineer, Apple** - https://jobs.anitab.org/companies/apple/jobs/82946949-metal-api-shader-instrumentation-engineer-graphics-game-and-ml - modern GPU programming in Metal, DirectX or Vulkan; instrumentation and testing of API and shader behaviour (`metal-debugging`, `gpu-testing`).
- **Game Technologies 3D Graphics Engineer, Apple** - https://job.nweon.com/?p=194 - real-time graphics on Apple frameworks, mobile 3D applications, C/C++ and Objective-C, Xcode (explanation, career growth).

## Apple platform and tools

- **Xcode 27 announcement and release notes (summary)** - https://mjtsai.com/blog/2026/06/09/xcode-27-announced/ - Swift 6.4 in Xcode 27, 27 SDKs, host requirement macOS Tahoe 26.4 on Apple silicon, agent skills export, `xctrace record` options (`apple-platform-toolchain`).
- **Using Xcode 27's Agent Skills in Claude, Codex, and Cursor (SwiftLee)** - https://www.avanderlee.com/ai-development/using-xcode-27s-agent-skills-in-claude-codex-and-cursor/ - the exported Xcode 27 skills and which need Xcode's own agent tools (`apple-platform-toolchain`, agent).
- **WWDC 2026: Xcode 27 ships with Apple's own agent skills (DEV Community)** - https://dev.to/arshtechpro/wwdc-2026-xcode-27-ships-with-apples-own-agent-skills-what-they-are-and-how-to-use-them-3g2 - skill names, `xcrun agent skills export`, SKILL.md format, Metal guidance shipped separately with the Game Porting Toolkit (`apple-platform-toolchain`).
- **apple/game-porting-toolkit (GitHub)** - https://github.com/apple/game-porting-toolkit - the `game-porting-skills` plugin: Metal 4, MetalFX, validation, `gpucapture` and `gpudebug` skills and their scope; Apache-2.0 licence (agent, every skill's "Apple skills" pointers, explanation).
- **Speedrun your game port with agentic coding, WWDC26 session 357** - https://developer.apple.com/videos/play/wwdc2026/357/ - plugin install commands, `gpucapture` and `gpudebug` on macOS 27, Metal HUD MetalFX overlays (`apple-platform-toolchain`, `metal-debugging`).
- **WWDC26 Metal guide** - https://developer.apple.com/wwdc26/guides/metal/ - Metal 4 tensor and quantisation additions, the redesigned MetalFX upscaler, sub-rectangle processing for dynamic resolution (`apple-gpu-capabilities`, `metal-shading-language`).
- **Metal Shading Language Specification, version 4.1** - https://developer.apple.com/metal/Metal-Shading-Language-Specification.pdf - `-std=metal4.1` for the 27 releases, what is new in 4.1, `__METAL_VERSION__` (`metal-shading-language`).
- **Metal feature set tables** - https://developer.apple.com/metal/feature-sets - GPU families and limits per family (`apple-gpu-capabilities`).
- **Discover Metal 4, WWDC25 session 205** - https://developer.apple.com/videos/play/wwdc2025/205/ - command allocators, decoupled command buffers, argument tables, residency sets, the Metal 4 compiler, barriers; Metal 4 on M1 and A14 or later (`metal4-architecture`, agent version floor).
- **Metal developer workflows (Apple)** - https://developer.apple.com/documentation/xcode/metal-developer-workflows - API and shader validation, Performance HUD, Instruments Game Performance and Game Memory templates, Metal debugger, naming resources, capture scopes, embedded shader sources, occupancy, limiter and bandwidth counters (`metal-debugging`, `metal-performance-profiling`).
- **Optimizing GPU performance (Apple)** - https://developer.apple.com/documentation/xcode/optimizing-gpu-performance - performance timeline, per-line shader profiling (`metal-performance-profiling`).

## CI and virtual GPUs

- **Limited support for virtual devices on macOS 15+ (Metal.jl)** - https://github.com/JuliaGPU/Metal.jl/pull/789 - paravirtual GPUs report lower families than the hardware and partially support Metal 3 (`gpu-testing`, `apple-gpu-capabilities`).
- **macOS CI runners expose a working paravirtual Metal device (ocannl)** - https://github.com/ahrefs/ocannl/issues/942 - hosted macOS runners return "Apple Paravirtual device", which compiles and runs MSL; SIMD-group matrix work and timings are not to be relied on (`gpu-testing`).

## Method

- **Diataxis** - https://diataxis.fr/ - the docs layout of this plugin and the docs steps in every workflow.
