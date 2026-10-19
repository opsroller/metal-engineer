---
name: gpu-testing
description: Use when GPU work needs automated tests - compute kernels against a CPU reference with stated tolerances, render passes into offscreen textures compared with reviewed reference images, shared struct layout checks, validation on in tests, Swift Testing or XCTest structure, running on Apple silicon CI runners whose virtual or paravirtual GPU supports fewer features, and skipping honestly with a reason instead of passing silently.
---

# GPU testing

A GPU test proves the GPU computed the right thing. It never proves
how fast; that is `metal-performance-profiling`.

## What to test

| Subject | Test |
|---|---|
| Compute kernel | Fixed inputs; output compared with a CPU reference implementation of the same maths |
| Render pass | Fixed scene and camera into an offscreen texture; compared with a reviewed reference image |
| Shared layouts | `MemoryLayout` size, stride and offsets on the CPU equal the shader's (a kernel writes `sizeof` and `offsetof` values to a buffer) |
| Pipelines | Every pipeline variant the project lists compiles for every shipped SDK |
| Capability fallbacks | Each gated path and its fallback both run, forced by overriding the capabilities struct |
| Synchronization | The frame-slot logic with one frame in flight and with the maximum; results identical |

## How

- **Framework:** Swift Testing for new tests (Apple's `test-modernizer`
  skill covers migrating XCTest). Parameterize over variants and
  formats instead of copying tests.
- **Validation on:** API and shader validation enabled for the test
  process; any message fails the test.
- **Offscreen:** render into private textures, blit to a shared buffer,
  read back after the command buffer completes. No window, no drawable.
- **Tolerances:** state them per test in units that mean something:
  ULPs or absolute error for compute, per-channel difference and the
  share of pixels allowed to differ for images. Floating-point results
  can differ between GPU families; a tolerance that only passes on one
  family is a bug in the test or the shader.
- **Reference images** are reviewed by whoever owns the look (technical
  artist or graphics programmer) before they are committed, stored
  with the device family and OS build that produced them, and replaced
  only in a change that says why. A diff image is written next to a
  failure.
- **Determinism:** fixed seeds, fixed sizes, no time-dependent input.

## Where tests run

- **Apple silicon Macs** with a real GPU run everything.
- **Hosted CI runners on Apple silicon** are virtual machines. They
  expose a paravirtual Metal device (named like "Apple Paravirtual
  device") that compiles and runs shaders but reports fewer GPU
  families than the hardware and may lack features such as
  SIMD-group matrix operations. Read its families at test start, run
  what it supports, and skip the rest with the missing capability as
  the reason. Never treat its timings as measurements.
- **The Simulator** runs Metal on the host GPU; useful for app logic
  and smoke tests, not for capability or performance claims.
- **Linux** cannot run Metal. A GPU test that cannot run there is
  reported as not run, never as passed.

## Skips are results

A skipped test says which capability or device it needed. The test
report lists skips separately from passes. A suite that skips every GPU
test in CI is not green coverage; name a machine where they run (a real
Apple silicon runner, or the device lab) and run them there before
merging GPU changes, through the project's CI so the result is
recorded.

## Output

Tests in the project's test target, run by its test command and CI,
with validation on, tolerances stated, reference images reviewed and
skips reported with reasons.
