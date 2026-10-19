---
name: swift-metal-concurrency
description: Use when Swift, Objective-C or C++ code drives Metal - Swift 6.4 strict concurrency around a render loop, which thread or actor owns encoding, completion handlers and shared events, Sendable checking of GPU objects and buffers, data races between CPU writes and GPU reads, ownership and lifetimes across ARC and metal-cpp, and calling C++ renderer code from Swift.
---

# Swift, C++ and concurrency around the GPU

The GPU is a second, asynchronous processor writing to memory the CPU
can see. Swift's strict concurrency checks the CPU side; nothing checks
the CPU-GPU side for you. This skill keeps both race-free.

## Who owns what

Write it down in the design (`metal4-architecture`):

- **The render loop** runs on one owner: a dedicated thread driven by
  the display link, or a global actor the project defines for
  rendering. Never the main actor, unless the project's frames are
  trivially cheap and that is measured.
- **Encoding** happens on the render owner, or on worker threads it
  starts for parallel encoding, each with its own command allocator.
- **Completion** (command buffer handlers, shared event notifications)
  arrives on an arbitrary thread. Handlers only record results and
  signal the owner; they never touch render state directly.
- **UI** (SwiftUI, UIKit, AppKit) talks to the renderer through a small
  Sendable interface: settings in, statistics out. Apple's SwiftUI and
  UIKit skills cover the UI side.

## Swift 6.4 rules

- Build in the Swift 6 language mode with complete checking. Fix every
  concurrency diagnostic; do not silence one with `@unchecked Sendable`
  or `nonisolated(unsafe)` without a comment that names the mechanism
  (lock, event, frame slot) that makes it safe, and a test or capture
  that exercises it.
- Follow the SDK's own Sendable and isolation annotations on Metal
  types; where a type is not annotated, treat it as owned by one
  isolation domain and pass it only through that domain.
- Command buffers and encoders are used by one thread at a time; never
  share one across tasks.
- Do not `await` inside encoding of a frame; gather inputs first, then
  encode synchronously, so a frame's commands are never interleaved
  with another task's.
- Block nothing on the main actor waiting for the GPU. Waiting for a
  frame slot belongs on the render owner.

## CPU writes, GPU reads

The compiler does not see these races; the design must:

- Per-frame data lives in the frame slot the CPU has waited for
  (`metal4-architecture`). Writing to a slot the GPU may still read is
  a race even when Swift compiles cleanly.
- Data the GPU writes and the CPU reads (readbacks, query results) is
  read only after the frame's shared event has signalled.
- Raw pointers to buffer contents never escape the scope that holds
  the slot; wrap them in a non-Sendable type so Swift keeps them in one
  domain.

## Lifetimes

- **Swift and Objective-C:** ARC retains Metal objects; a command buffer
  keeps the resources it references alive only as the API documents,
  so keep anything the GPU uses alive until its frame completes
  (deferred destruction keyed to the frame's event).
- **metal-cpp:** ownership is manual. Follow Apple's
  `managing-metal-cpp-lifetimes` skill: smart pointers for owned
  objects, autorelease pools around each frame on threads that create
  autoreleased objects, and explicit transfer at ARC boundaries.
- **Swift and C++ together:** when a C++ renderer is called from Swift
  through Swift's C++ interoperability, keep the boundary narrow (a
  small C++ API of value types and opaque handles) and own each Metal
  object on one side only.

## Check it

- Swift builds with zero concurrency warnings in the Swift 6 language
  mode.
- Thread Sanitizer runs on the CPU-side tests (it does not see GPU
  access).
- Shader validation and a capture show no stale or racing reads
  (`metal-debugging`); run the frame-slot test with one frame in flight
  and with the maximum.

## Output

An ownership table in the design reference (thread or actor, what it
owns, how results cross), and code that compiles clean under strict
concurrency with every unchecked escape commented and tested.
