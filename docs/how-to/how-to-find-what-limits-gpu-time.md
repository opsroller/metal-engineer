*How-to guide, for someone who uses the plugin and has Metal work that is too slow, stutters or runs hot on an Apple device.*

# How to find what limits GPU time

This guide finds the limiter and fixes it one change at a time, using
the `investigate-gpu-performance` workflow.

## Before you run it

- The device itself is connected and can install a release build. The
  Simulator and virtual machines do not count.
- You know the budget, or the project profile has it.

## Run the workflow

```
/metal-engineer:investigate-gpu-performance
args: { symptom: "GPU time 11 ms in the harbour scene, budget 8 ms", device: "iPhone, smallest supported", scenario: "harbour fly-through, 60 s after 10 s warm-up" }
```

Investigate one device per run, weakest first.

## Read the result

- `within budget`: kept changes are committed with before and after GPU
  times per pass. Land the branch.
- `blocked: still over budget`: the top three evidenced causes were
  tried; `kept` and `tried` say what helped. Renegotiate the budget or
  schedule the remaining causes.
- `blocked` with an unreachable device: connect the device or produce a
  release build first.
- `unverified`: within budget, but a step failed; `gaps` lists which.

## Read the numbers right

A displayed frame waits for the display, so frame time stops at the
refresh interval. Compare GPU time per pass, not the frame interval, and
compare against a baseline measured in the same session.

See the [investigate-gpu-performance reference](../reference/workflow-investigate-gpu-performance.md)
and [metal-performance-profiling](../reference/skill-metal-performance-profiling.md).
