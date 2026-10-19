*How-to guide, for someone who needs a project's Metal tests to run in continuous integration.*

# How to run GPU tests in CI

This guide gets Metal tests running on Apple silicon CI runners and
reports what could not run, following the `gpu-testing` skill. The
pipeline itself belongs to the devops engineer; give them this list.

## What the job needs

- An Apple silicon macOS runner with Xcode 27 selected (`DEVELOPER_DIR`
  or the runner's Xcode selection step).
- API and shader validation on for the test process
  (`MTL_DEBUG_LAYER=1`, `MTL_SHADER_VALIDATION=1`).
- The project's test command, unchanged from local runs.
- Test results published with skips listed separately from passes.

## Expect a paravirtual GPU on hosted runners

Hosted macOS runners are virtual machines. Their Metal device compiles
and runs shaders but reports fewer GPU families than real hardware.
Tests read the device's families at start, run what it supports and skip
the rest with the missing capability as the reason. Never assert on
timings there.

## Cover what was skipped

If GPU tests are skipped on hosted runners, name where they do run: a
self-hosted Apple silicon runner with a real GPU, or a device lab. Run
the full GPU suite there, through CI so the result is recorded, before
merging changes to GPU code.

See the [gpu-testing reference](../reference/skill-gpu-testing.md).
