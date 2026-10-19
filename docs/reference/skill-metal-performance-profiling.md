*Reference, for anyone looking up what the `metal-performance-profiling` skill covers while working.*

# metal-performance-profiling

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/metal-performance-profiling/SKILL.md`](../../skills/metal-performance-profiling/SKILL.md) |
| Loaded when | use when measuring or improving how fast Metal work runs on Apple devices - GPU time per pass, the Metal Performance HUD, Instruments Metal System Trace and Game Performance templates from Xcode or xctrace, GPU timestamps and counter heaps, limiter, utilization and occupancy counters, memory bandwidth, shader per-line cost in the Metal debugger, display-paced frames, thermal soak, matched baselines, and one change per measurement. |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md) |

## Inputs

The frame or throughput budget per device; a scenario; the target device.

## Outputs

A results table per device: scenario, pass, GPU time median and p95, limiter, before and after, with the record fields.

## Tools, cheapest first

| Item | Detail |
|---|---|
| Metal Performance HUD | Is there a problem |
| Counter-heap timestamps | GPU time per pass in any build |
| Instruments (`xctrace`) | CPU and GPU timelines, pacing, thermal state |
| Metal debugger | Counters per pass and per-line shader cost; explains, does not measure |

## Quality bar

- Only the target device, in release, without validation or capture, counts.
- GPU time comes from timestamps or traces, not the frame interval.
- One change per measurement, against a matched baseline.

## Apple skills and guides it builds on

Apple's *Metal developer workflows* and *Optimizing GPU performance* guides.

## Documentation owed

Reference (budgets, scenarios, results); explanation for trade-offs. Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
