---
name: metal4-architecture
description: Use when designing or changing how a renderer or compute path drives the GPU with Metal 4 - frames in flight, command queues, allocators and buffers, argument tables, residency sets, barriers and events, pipeline compilation and caching, render pass design for tile-based deferred rendering on Apple GPUs (load and store actions, memoryless targets, tile work), labels, and failure paths.
---

# Metal 4 architecture

This skill is the design method. For the exact API of each object,
load Apple's Game Porting Toolkit skills (`apple-platform-toolchain`):
`translating-to-metal4-api` (types and the TBDR model),
`managing-metal4-resources`, `managing-metal4-synchronization`,
`creating-metal4-shader-pipelines` and `presenting-metal-drawables`.

## Design before code

Write the design down (it becomes the reference page) before encoding
anything:

1. **Passes.** Every render and compute pass in order, what it reads,
   what it writes, its attachments and their formats. Draw it as a
   graph: passes are nodes, resources are edges.
2. **Frames in flight.** How many frames the CPU may encode ahead of the
   GPU (usually 2 or 3), and which resources are per frame (uniforms,
   dynamic vertex data, command allocators) versus shared.
3. **Residency.** Which resources live in long-lived residency sets
   attached to the queue, which in per-frame sets, and how streamed
   resources join and leave.
4. **Binding.** One argument table per stage layout, sized to the bind
   points actually used; bindless data reached through argument buffers
   and GPU addresses where the design calls for it.
5. **Synchronization.** Every hazard in the pass graph and the barrier,
   fence or event that orders it, at the narrowest stage pair that is
   correct.
6. **Pipelines.** Every pipeline state the frame needs, when it is
   compiled, and from what (offline metallib, binary archive, async
   compile at load).
7. **Failure paths.** What happens when a pipeline fails to compile, a
   capability is missing, an allocation fails or the device is lost.

## Frames in flight

- A frame owns its command allocator, its per-frame buffers and a slot
  index. The CPU waits on that slot's shared event (signalled by the
  GPU when the frame's work completes) before reusing the slot. Never
  wait on the whole queue to reuse one slot.
- Reset an allocator only after the GPU finished every command buffer
  allocated from it.
- Write per-frame data into the slot's own region, never into memory
  the GPU may still read.
- Measure the slot wait: time spent there is CPU time lost to a GPU
  that is behind, and is the first sign the GPU is the bottleneck.

## Commands and encoding

- Command buffers are separate from queues in Metal 4: encode on
  several threads, each with its own allocator, and commit in a defined
  order. Parallel encoding pays only when encoding is a measured CPU
  cost; start with one thread.
- Group work into as few passes as the dependencies allow: each render
  pass boundary costs a tile load and store on Apple GPUs.
- Label every command buffer, encoder, pass and resource, and push debug
  groups for logical stages, so captures and traces are readable.

## Passes on tile-based Apple GPUs

Apple GPUs render each pass tile by tile in on-chip memory. The scarce
resource is memory bandwidth, which is also heat and battery.

- **Load actions:** `clear` or `dontCare` unless the previous contents
  are really needed. A `load` is a full read of the attachment.
- **Store actions:** `dontCare` for anything not read after the pass
  (depth, intermediate G-buffer channels, MSAA samples after resolve).
- **Memoryless targets** (`MTLStorageModeMemoryless`) for attachments
  that live and die inside one pass: depth for a forward pass, G-buffer
  channels in a single-pass deferred renderer, MSAA colour resolved in
  the pass.
- **Keep data on chip:** programmable blending and tile shaders or
  imageblocks let later stages of a pass read what earlier stages wrote
  without a store and reload. Prefer one pass with on-chip reads to two
  passes with a texture round trip.
- **Hidden surface removal** happens before fragment shading for opaque
  geometry; draw opaque first, then alpha-tested, then blended. Writing
  depth or discarding in a shader limits it.

## Resources and residency

- Prefer shared storage for CPU-written per-frame data on unified
  memory, private storage for GPU-only resources, and upload once
  through a blit or copy.
- Heaps for resources with related lifetimes; aliasing only where the
  pass graph proves the lifetimes do not overlap, with a barrier at the
  hand-over.
- A resource the GPU touches must be in a residency set the command
  buffer sees. A non-resident resource is a GPU fault, not a slow path.
- Track GPU memory against the device budget (`apple-gpu-capabilities`)
  and free with deferred destruction keyed to frame completion.

## Pipelines

- Compile pipelines before they are needed: offline metallibs from the
  build, Metal 4 compiler tasks at load time on a background priority,
  and binary archives or pipeline data sets to skip recompilation on
  later runs.
- Function constants specialize one source into variants; list the
  variants the game uses and compile only those. An unbounded variant
  count is a design bug.
- Pipeline creation failure is an expected error: log the descriptor
  label and the compiler message, and fall back to a defined simpler
  pipeline.

## Synchronization

- Barriers order stages within and across passes on one queue; pick the
  producing and consuming stages exactly (for example dispatch to
  fragment). Over-wide barriers serialize work that could overlap.
- Shared events order work across queues and between GPU and CPU.
- Every hazard in the pass graph has exactly one ordering primitive.
  Shader validation and a capture prove it; a missing one shows as
  flicker or stale data that changes from run to run.

## Failure and device loss

- Missing capability: the decided fallback from
  `apple-gpu-capabilities`.
- Command buffer error: read its error and log the labels involved; a
  GPU timeout or page fault is a bug to capture, not to retry.
- Display changes (a window moving to another display, a resolution or
  refresh-rate change, an external display on iPad): rebuild drawables
  and anything sized to the display on the change notification.

## Output

The design written as reference: pass graph, frames in flight,
residency, binding, synchronization table, pipeline list with when each
compiles, failure paths. Code labels match the names in the doc.
