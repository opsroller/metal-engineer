*Reference, for anyone looking up what the `metal4-architecture` skill covers while working.*

# metal4-architecture

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/metal4-architecture/SKILL.md`](../../skills/metal4-architecture/SKILL.md) |
| Loaded when | use when designing or changing how a renderer or compute path drives the GPU with Metal 4 - frames in flight, command queues, allocators and buffers, argument tables, residency sets, barriers and events, pipeline compilation and caching, render pass design for tile-based deferred rendering on Apple GPUs (load and store actions, memoryless targets, tile work), labels, and failure paths. |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Inputs

The rendering or compute design (from the graphics programmer or a spec); the device tiers; budgets.

## Outputs

A design reference: pass graph, frames in flight, residency, binding, synchronization table, pipelines and when each compiles, failure paths; labels in code match it.

## Design parts

| Item | Detail |
|---|---|
| Pass graph | Passes, reads, writes, attachments and formats |
| Frames in flight | Slot count, per-frame allocators and buffers, the event each slot waits on |
| Residency | Queue-level and per-frame residency sets, streaming |
| Synchronization | One barrier, fence or event per hazard, at the narrowest stages |
| Pipelines | Offline libraries, compile tasks at load, binary archives; variant list |
| Tile-based passes | Load and store actions, memoryless targets, on-chip reads |

## Quality bar

- Every hazard has exactly one ordering primitive.
- No pipeline compiles on first use on the critical path.
- Every object and pass carries a label from the design.

## Apple skills and guides it builds on

Apple's `translating-to-metal4-api`, `managing-metal4-resources`, `managing-metal4-synchronization`, `creating-metal4-shader-pipelines`, `presenting-metal-drawables`.

## Documentation owed

Reference (the design); explanation when a design choice was made. Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
