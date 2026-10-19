*Reference, for anyone looking up what the `swift-metal-concurrency` skill covers while working.*

# swift-metal-concurrency

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/swift-metal-concurrency/SKILL.md`](../../skills/swift-metal-concurrency/SKILL.md) |
| Loaded when | use when Swift, Objective-C or C++ code drives Metal - Swift 6.4 strict concurrency around a render loop, which thread or actor owns encoding, completion handlers and shared events, Sendable checking of GPU objects and buffers, data races between CPU writes and GPU reads, ownership and lifetimes across ARC and metal-cpp, and calling C++ renderer code from Swift. |
| Referenced by | [implement-metal-feature](workflow-implement-metal-feature.md), [investigate-gpu-performance](workflow-investigate-gpu-performance.md), [debug-metal-rendering](workflow-debug-metal-rendering.md) |

## Inputs

The renderer design; the languages around the GPU (Swift, Objective-C, C++).

## Outputs

An ownership table in the design reference and code that compiles clean under Swift 6 strict concurrency, with every unchecked escape commented and tested.

## Owners

| Item | Detail |
|---|---|
| Render loop | A dedicated thread or a project-defined global actor; not the main actor |
| Encoding | The render owner, or workers each with their own allocator |
| Completion | Handlers record and signal only |
| UI | A small Sendable interface: settings in, statistics out |

## Quality bar

- Zero concurrency warnings in the Swift 6 language mode.
- No CPU write to memory the GPU may still read.
- Every GPU object outlives its frame.

## Apple skills and guides it builds on

Apple's `managing-metal-cpp-lifetimes`; the Swift and SwiftUI skills that ship with Xcode 27.

## Documentation owed

Reference (ownership table); explanation if the threading model was chosen against an alternative. Written in the same PR as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
