---
name: metal-performance-profiling
description: Use when measuring or improving how fast Metal work runs on Apple devices - GPU time per pass, the Metal Performance HUD, Instruments Metal System Trace and Game Performance templates from Xcode or xctrace, GPU timestamps and counter heaps, limiter, utilization and occupancy counters, memory bandwidth, shader per-line cost in the Metal debugger, display-paced frames, thermal soak, matched baselines, and one change per measurement.
---

# Metal performance profiling

The frame budget comes from the graphics programmer and the project
profile. This skill measures Metal work against it on Apple hardware
and finds what limits it. The rules: real device, release
configuration, fixed scenario, per pass, against a matched baseline.

## What counts as a measurement

- **Device:** the target Apple device itself. Not the Simulator, not a
  virtual machine or paravirtual GPU, not a Mac standing in for an
  iPhone.
- **Build:** release configuration with optimisation, no API or shader
  validation, no capture attached, no debug overlay except the HUD when
  it is the tool.
- **Scenario:** the same scene, camera path and input replay each run,
  with a warm-up dropped before sampling.
- **Numbers:** GPU time per pass and per frame, median and p95 or p99,
  over enough frames to see variance; CPU time per frame beside it.
  Never average FPS alone.
- **Record:** device, OS build, Xcode, build configuration, scenario,
  resolution, refresh rate, thermal state at start and end.

## Display pacing

A displayed frame waits for the display: frame time has a floor at the
refresh interval (16.67 ms at 60 Hz) whatever the GPU costs. To see GPU
cost, read GPU time per pass from timestamps or a trace, not the frame
interval. Compare a change against a baseline measured in the same
session, alternating builds, so device state and pacing are the same
for both.

## Tools, cheapest first

1. **Metal Performance HUD** (`MTL_HUD_ENABLED=1`): frame interval, GPU
   time, memory, live. Use it to see whether a problem exists; it can
   log reports to a file for a run.
2. **GPU timestamps in the app:** Metal 4 counter heaps sampled at
   pass boundaries give GPU time per pass in every build, on every
   device, with no tool attached; report them in the project's
   benchmark output.
3. **Instruments** with the Metal System Trace or Game Performance
   template: CPU and GPU timelines together, encoder durations, frame
   pacing, thermal state, drawable waits. Record from the command line
   with `xcrun xctrace record` so runs are scripted and repeatable.
4. **Metal debugger** on a capture: the performance timeline, counters
   per pass and draw, and per-line shader cost for the shader that
   dominates. Captures change timing; use them to explain, not to
   measure.

## Find the limiter

1. **CPU or GPU?** If the CPU waits on a frame slot or drawable, the GPU
   is behind. If the GPU is idle between frames, the CPU is behind:
   profile encoding, culling and the app's own work with the Time
   Profiler.
2. **Which pass?** Sort passes by GPU time. Work only on the top ones.
3. **Which limiter?** Read the pass's limiter and utilization counters
   (Apple's *Reducing shader bottlenecks* guide names them): arithmetic
   (ALU, F16 and F32), texture read and filtering, buffer read and
   write, threadgroup or imageblock memory, tile memory, rasterisation,
   last-level cache. The highest limiter is the bottleneck.
4. **Occupancy:** low occupancy with high register or threadgroup memory
   use means fewer threads hide latency; trim registers, threadgroup
   memory or threadgroup size.
5. **Bandwidth:** measure memory bandwidth per pass; on tile-based GPUs
   unneeded loads and stores, missing memoryless targets and
   uncompressed textures show here first (`metal4-architecture`).
6. **Hitches:** a long frame now and then is usually a pipeline compiled
   on first use, a resource upload, or an allocation; the trace shows
   which.

## Change one thing

- One change per measurement, against the matched baseline; keep it only
  if the measured pass got faster and nothing else got slower; revert
  otherwise.
- Re-check correctness after each kept change (`gpu-testing`).
- Soak on the weakest device for 15 minutes or more before calling a
  budget met; record the thermal state.

## Output

A results table per device: scenario, pass, GPU time median and p95,
limiter, before and after, with the record fields above, kept in the
project's reference docs and quoted in the change.
