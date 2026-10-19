---
name: metal-debugging
description: Use when a Metal app renders wrong, crashes or hangs on the GPU, or before saying GPU work is correct - turning on API and shader validation, labels and debug groups, capture scopes, capturing a frame with Xcode or gpucapture and reading it with the Metal debugger or gpudebug, comparing against a reference, finding the first wrong pass, fixing at the cause and keeping a regression test.
---

# Metal debugging

Diagnosis of a specific symptom (black screen, wrong colours, missing
geometry, flicker) is covered step by step by Apple's
`debugging-rendering-issues` skill, with `using-metal-validation`,
`using-gpucapture` and `using-gpudebug` for the tools. Load them. This
skill is the discipline around them, so a bug is found once and stays
fixed.

## Always on

- **API validation** (`MTL_DEBUG_LAYER=1`, or the scheme's Metal API
  Validation) in every debug run and every GPU test.
- **Shader validation** (`MTL_SHADER_VALIDATION=1`, or per pipeline
  through the pipeline options) in GPU tests and when chasing memory
  errors; it is slow, so not in performance runs.
- **Labels** on every queue, command buffer, encoder, pass, pipeline,
  buffer and texture, and debug groups around logical stages, named as
  in the design reference.
- **Embedded shader sources** in debug builds.
- **A capture scope** around one frame (or one compute job) the project
  can trigger from a key, an argument or an environment variable, so
  anyone can capture the same thing.

A validation message is a bug. Fix it, or record why it is a false
positive with a link; never silence the layer.

## Method

1. **Reproduce** with a fixed scenario on a named device and build.
   Write it as a test if the bug is visible in a render or compute
   output (`gpu-testing`); otherwise as exact steps.
2. **Run with validation** first. Many bugs end here.
3. **Capture** the frame that is wrong: Xcode's GPU capture, or
   `gpucapture` on macOS 27 for an agent with no Xcode window.
4. **Find the first wrong pass.** Walk the frame in order and inspect
   each pass's outputs until one is wrong while its inputs are right.
   With a known-good reference (an earlier build, another device),
   compare captures pass by pass with `gpudebug`.
5. **Inside that pass**, check in this order: pipeline state (formats,
   blending, depth and stencil, culling, winding), bindings and their
   offsets, resource contents, shader logic, then synchronization (a
   result that changes between runs points at a missing barrier or
   event).
6. **Name the root cause** in one sentence that explains every symptom.
   If it does not explain all of them, keep looking.
7. **Fix at the cause**, not where the symptom shows, and make the test
   from step 1 pass. Search for siblings: the same mistake in other
   passes, shaders or platforms.
8. **Keep the evidence:** the test, the capture names, and a line in
   the change describing cause and fix.

## GPU errors and hangs

- Read the command buffer's error and its encoder infos; with labels,
  they name the failing pass.
- A GPU timeout usually means an unbounded loop or a huge dispatch; a
  page fault usually means a non-resident or freed resource
  (`metal4-architecture`, residency). Both are bugs to capture, never
  to retry.

## Output

A failing test (or exact steps) that now passes, the root cause in one
sentence, the sibling sites checked, and validation clean on the fixed
build.
