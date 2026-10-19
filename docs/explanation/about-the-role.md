*Explanation, for anyone who wants to understand what a Metal engineer does and why this plugin works the way it does.*

# About the Metal engineer role

## What the job is

A Metal engineer builds and maintains the code that runs on the GPU of
Apple devices through Metal, Apple's graphics and compute API. Postings
for the work describe a stable core: real-time rendering and compute on
Apple GPUs, profiling and optimising CPU, GPU and memory cost with
Apple's tools and counters, working in large existing codebases and
engines, shader authoring and compilation, and experience with other
GPU APIs to port from. Apple's own postings for engineers who help
games adopt Metal add the ecosystem side: integrating optimisations with
partner teams and explaining GPU behaviour to people who are not GPU
specialists.

The role is a platform specialisation of graphics programming. A
graphics programmer decides what the frame contains and what each device
tier can afford, in terms that hold on any API. The Metal engineer makes
that decision real on Apple hardware: how work is encoded, synchronised,
compiled, kept resident, presented, measured and tested on tile-based
Apple GPUs. On a small team one person may hold both; keeping them as
two roles keeps the design independent of the platform layer.

## Why only the 27 releases

The plugin targets iOS, iPadOS, macOS, tvOS and visionOS 27 with Xcode
27, Swift 6.4 and Metal Shading Language 4.1, and nothing older. Metal 4
reshaped the API (command allocators, argument tables, residency sets,
explicit barriers, a separate compiler object), and code written for
two command models carries two sets of bugs. A single floor means every
path is tested, every capability check is about hardware rather than OS
version, and the guidance never has to say "unless you also support".
When a project needs older releases, that is a different job with
different trade-offs, and the plugin says so rather than half-doing it.

## Why Apple's skills come first

Apple ships agent skills with Xcode 27 and, separately, a set of Metal
expert skills with the Game Porting Toolkit. They are the platform
owner's own guidance and are updated with the platform. Rewriting them
would produce a second copy that drifts, and a licence problem besides:
Apple's Metal skills are Apache-2.0, which is not compatible with
version 2 of the GPL, so copying them would push this
GPL-2.0-or-later plugin onto version 3 terms only.

So the plugin loads Apple's skills for API facts and adds what a role
needs around them: the version floor, the design method, device tiers
across every Apple platform rather than macOS alone, Swift concurrency
around the GPU, GPU tests that are honest about where they can run,
measurement discipline, and workflows that end in reviewed, documented
pull requests. Where Apple's skill and this plugin disagree on an API
fact, Apple's skill wins.

## Why bandwidth and passes matter so much

Apple GPUs render each pass tile by tile in fast on-chip memory and
write results out only when the pass ends. Apple's own guidance on
tile-based deferred rendering makes the consequence clear: the cheapest
memory traffic is the traffic you never cause. Load and store actions,
memoryless attachments and work that stays inside one pass are the
first levers on every Apple device, and they also decide heat and
battery life on phones. That is why the architecture skill designs the
pass graph before any code and why the profiling skill reads bandwidth
counters alongside time.

## Why measurement is so strict

A displayed frame waits for the display, so frame intervals floor at the
refresh rate and hide GPU cost. Virtual machines and the Simulator run
Metal on a GPU that is not the target's. Validation and captures change
timing. Each of these produces numbers that look real and are not. The
profiling skill therefore accepts only GPU time per pass from the target
device, in release, against a baseline measured in the same session, and
the testing skill keeps correctness (which can be proved almost
anywhere) apart from cost (which cannot).

## Why Swift concurrency is in a GPU role

Swift 6 checks data races between threads at compile time, which helps
the CPU side of a renderer a great deal. It does not see the GPU: a
buffer the CPU rewrites while the GPU still reads it compiles cleanly
and renders garbage. The concurrency skill puts the two together, an
ownership model the compiler checks plus frame slots and events that
order CPU and GPU, so neither side is trusted to cover the other.

## Boundaries with neighbouring roles

- **graphics-programmer** owns what the frame contains, engine-level
  budgets and the tier decision; the Metal engineer delivers it on
  Apple GPUs and reports cost per pass.
- **technical-artist** owns how materials and shaders look; the Metal
  engineer owns whether an MSL shader is correct, portable and within
  its agreed cost.
- **ui-developer** owns app UI, with Apple's SwiftUI and UIKit skills;
  the Metal engineer owns the view that hosts the Metal layer and the
  interface between them.
- **devops-engineer** owns CI runners, signing and store submission;
  the Metal engineer names what a GPU job needs.

## How the role grows

- **Junior:** implements shaders and passes in an existing renderer,
  with validation on and tests, under review.
- **Mid-level:** owns a GPU system end to end, profiles on devices
  independently, keeps capability gates and fallbacks complete.
- **Senior:** designs the Metal architecture of a renderer, sets
  per-pass budgets with the graphics programmer, leads ports from other
  APIs, mentors through review.
- **Principal:** the team's Apple GPU authority across projects, tracks
  each year's platform changes and decides when the floor moves.

See [SOURCES.md](../../SOURCES.md) for the full list of sources.
