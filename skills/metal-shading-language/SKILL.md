---
name: metal-shading-language
description: Use when writing, changing, reviewing or porting a Metal Shading Language shader or kernel - pinning MSL 4.1, types and half precision, address spaces, function constants and variants, SIMD-group and threadgroup work, tile functions and imageblocks, texture reads, atomics and memory order, tensors and Metal Performance Primitives, compile options and offline libraries, debug info, and checking a shader's cost and correctness.
---

# Metal Shading Language

The language is specified in Apple's *Metal Shading Language
Specification*, version 4.1 for the 27 releases. Read the section for
any feature before using it; this skill is the working method around
the spec, not a copy of it. How a shader looks is the technical
artist's call; whether it is correct, portable across Apple GPUs and
within its cost is yours.

## Pin the language

- Compile with `-std=metal4.1` (or the Xcode `MTL_LANGUAGE_REVISION`
  setting) everywhere: Xcode targets, command-line builds, runtime
  compilation options. Runtime compiles take the version from their
  compile options; set it there too.
- Gate any feature newer than the pinned version with
  `#if __METAL_VERSION__ >= 410` only if the project deliberately
  supports two versions; at the 27 floor it normally does not.
- New in 4.1, among others: placement new, packed numeric types and
  block-scaled tensors, interleave and deinterleave, acquire and release
  memory order on barriers and atomics, clamp-to-edge and multi-pixel
  texture reads, and `function_id` on ray intersection results. Check
  the spec's "What's new" section for the full list.

## Write it

- **One entry point, one job.** Name entry points for what they compute
  (`shade_opaque_fragment`, `cull_instances_kernel`), and keep shared
  code in headers included by both shaders and host code (shared structs
  with explicit alignment so CPU and GPU layouts agree; check
  `sizeof` and offsets on both sides with a test).
- **Precision.** Use `half` for colour, normals and most fragment
  arithmetic; keep positions, depth, texture coordinates on large
  textures and accumulations in `float`. Check banding and precision
  loss on a capture, not by eye in the source.
- **Address spaces.** `constant` for small read-only data uniform
  across a draw or dispatch, `device` for large or written buffers,
  `threadgroup` for data shared inside a threadgroup. Wrong choice
  costs bandwidth or correctness.
- **Function constants** for variants (features on or off, sample
  counts, quality levels). List every variant the project compiles,
  and compile only those; no runtime branching on values that are
  constant per pipeline.
- **Branching.** Divergent branches inside a SIMD-group execute both
  sides. Branch on values uniform per draw or per SIMD-group where you
  can; use `simd_*` functions (ballot, shuffle, prefix sums) instead of
  threadgroup memory round trips.
- **Threadgroups.** Size them from the pipeline's
  `threadExecutionWidth` and `maxTotalThreadsPerThreadgroup`, not a
  constant from another GPU; guard every dispatch for partial
  threadgroups at the grid edge.
- **Tile work.** Tile functions and imageblocks keep per-pixel data on
  chip between stages of one render pass; use them for deferred
  lighting, order-independent transparency and similar per-tile work
  (`metal4-architecture`).
- **Atomics and memory order.** Use the weakest order that is correct,
  and the 4.1 acquire and release orders instead of full barriers when
  only one hand-over needs ordering. Comment why each order is enough.
- **Tensors and matrix work.** For machine-learning or large matrix
  work inside shaders, use the tensor types and Metal Performance
  Primitives the spec describes rather than hand-written loops; check
  the supported data types on the target GPU family.
- **No undefined behaviour.** Out-of-bounds buffer access, reading
  uninitialised threadgroup memory, and data races in device memory are
  bugs shader validation can catch; run it (`metal-debugging`).

## Compile it

- Offline: `xcrun -sdk <sdk> metal -std=metal4.1 -c` per source, then
  `metallib`, per SDK. One library per platform; never ship a library
  built for another SDK.
- Warnings are errors (`-Werror`) in the project's shader build.
- Debug builds embed sources and line tables so captures show shader
  source and per-line cost; release builds strip them.
- Pipelines from these libraries are compiled ahead of use
  (`metal4-architecture`). A shader that is only compiled at runtime
  from source needs a reason in the design.

## Check it

1. **Correctness:** a test runs the shader on known inputs and compares
   with a CPU reference or a reviewed image (`gpu-testing`), with shader
   validation on.
2. **Cost:** a capture of the real scene shows its time, occupancy and
   limiter counters on the weakest supported GPU family
   (`metal-performance-profiling`). Compare against the cost the
   technical artist and graphics programmer agreed.
3. **Portability:** it compiles for every SDK the project ships, and
   every feature it uses is supported by every GPU family the project
   supports, or sits behind a function constant with a capability
   check (`apple-gpu-capabilities`).
4. **Review:** read it as a reviewer would: layout agreement with the
   host, precision, divergence, bounds, barriers and memory order.

## Porting a shader from HLSL or GLSL

For DXIL produced from HLSL, Apple's Metal shader converter skills
(`compiling-with-metal-shaderconverter`,
`integrating-metal-shaderconverter-shaders`) cover conversion and
binding. When the shader is rewritten by hand in MSL instead, keep the
original's tests and compare outputs on the same inputs; record the
original's licence if any of its code is kept (engineering-practices
`provenance`).

## Output

The shader source with the pinned version, its variant list, a test, its
measured cost on the weakest GPU family, and a reference entry: entry
points, inputs and outputs, variants, capability gates and cost.
