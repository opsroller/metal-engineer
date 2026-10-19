---
name: apple-gpu-capabilities
description: Use when deciding what GPU features a project may use on each Apple device, or setting device tiers across iPhone, iPad, Mac, Apple Vision Pro and Apple TV - GPU families and feature queries, the Metal feature set tables, memory budgets and working-set limits, thermal state and low power mode, refresh rates and frame pacing, MetalFX upscaling and frame interpolation as scaling levers, and the fallback each optional feature needs.
---

# Apple GPU capabilities and device tiers

What the frame should contain on each tier is the graphics programmer's
decision; what the GPU can do and how a Metal path detects it is yours.
This skill turns a project's device list into capability gates and
tiers you can test.

## Capabilities, not devices

- Query the device: `supportsFamily(_:)` for GPU families
  (`MTLGPUFamilyApple7` and later on the 27 floor, `MTLGPUFamilyMetal4`
  for Metal 4 itself), plus the specific queries for features outside a
  family (ray tracing, specific pixel formats, sample counts, texture
  sizes, MetalFX support).
- Look limits up in Apple's *Metal feature set tables* for the SDK in
  use, never from memory or another API's limits.
- Gate on the capability, at one place in the code (a capabilities
  struct filled at start-up), and log it. Never gate on a device model,
  chip marketing name or OS version.
- A virtual or paravirtual GPU (CI, virtual machines) reports fewer
  families than the hardware under it; treat it as its own device with
  its own capabilities (`gpu-testing`).

## The device list

From the project profile, list every device the project supports, by
platform:

| Platform | What to record |
|---|---|
| iPhone | Smallest supported GPU family, smallest memory, display sizes and refresh rates (60 Hz and ProMotion up to 120 Hz) |
| iPad | Same, plus external display use if supported |
| Mac | Smallest Apple silicon chip supported, unified memory sizes, displays (including several high-resolution displays) |
| Apple Vision Pro | Rendering through the platform's compositor at its frame rate; foveation and per-eye cost |
| Apple TV | GPU family, 4K output, 60 Hz typical, controller input only |

The weakest device per platform sets the floor tier. Measure there
(`metal-performance-profiling`).

## Memory

- Unified memory is shared with the CPU and the rest of the system.
  On Mac, `recommendedMaxWorkingSetSize` is the GPU working set to
  stay within. On iPhone, iPad, Apple TV and Apple Vision Pro the limit
  is the app's memory limit: read the remaining headroom with
  `os_proc_available_memory()` and respond to memory warnings by
  dropping caches, never by crashing.
- Budget GPU memory per tier (render targets, textures, buffers,
  pipelines) and track `currentAllocatedSize` against it in debug
  builds.
- Memoryless attachments and compressed or lossless-compressed textures
  are the first savings on tile-based GPUs (`metal4-architecture`).

## Heat and power

- Watch `ProcessInfo.thermalState` and `isLowPowerModeEnabled`; scale
  quality down in small steps when the state rises, and back up with
  hysteresis.
- Soak-test on the weakest phone for 15 minutes or more; a frame rate
  that holds for one minute may not hold for ten.

## Refresh rate and frame pacing

- Pace frames with `CAMetalDisplayLink` (or the platform's display
  link) at a rate the GPU can hold on that device, and declare the
  preferred rate range; on ProMotion displays a steady 80 Hz beats an
  unsteady 120 Hz.
- Apple's `presenting-metal-drawables` skill covers the drawable
  contract, vsync and HDR or EDR layers.

## Scaling levers, in order

1. Render resolution with MetalFX temporal upscaling (Apple's
   `using-metalfx-temporal-upscaler` skill); the 27 releases add
   sub-rectangle processing for dynamic resolution and a redesigned
   upscaler on the newest chips.
2. Pass and effect quality behind function constants.
3. Shadow, reflection and post resolution.
4. Frame interpolation with MetalFX (Apple's
   `using-metalfx-frame-interpolation` skill) only when latency is
   acceptable for the input model and the base frame rate is already
   steady.

Each lever has a capability check, a fallback, and a measured saving per
tier.

## Output

A capabilities reference: the device list per platform, the capability
gates the code checks with the fallback for each, the tier each device
falls into, memory budgets per tier, and the scaling levers with their
measured savings.
