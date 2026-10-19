*Tutorial, for someone using the metal-engineer plugin for the first time.*

# Write your first tested compute kernel

In this tutorial we will set up the toolchain, write a small Metal
compute kernel in MSL 4.1, prove it against a CPU reference with
validation on, and measure it on a real device. We will use the
`metal-engineer` agent and four of its skills. It takes about an hour.

We will use a neutral example throughout: a kernel that **adds two
arrays of floats**. It is small on purpose, so we can watch each step.

## Before we start

You need:

- the plugin installed (see the [README](../../README.md));
- an Apple silicon Mac with Xcode 27;
- a project (an empty Swift package is enough) with a `CLAUDE.md` that
  says where code, tests and docs live.

## 1. Check the toolchain

Start the agent:

```
Use the metal-engineer agent. Follow apple-platform-toolchain and give
me the toolchain note for this machine and project.
```

The output should look something like:

```
Xcode 27.0, Swift 6.4, macOS 27.0 (Apple silicon), SDK macosx 27.0
Deployment target: macOS 27   Swift language mode: 6   MSL: 4.1
Apple skills: Xcode 27 export loaded; game-porting-skills installed
```

Notice that the agent checks the language version as well as Xcode. If
anything is below the floor, it stops here and says which check failed.

## 2. Write the test first

Now ask:

```
Following gpu-testing, write a Swift Testing test for a compute kernel
`add_arrays` that adds two float arrays of 1,000,003 elements, compared
with a CPU loop. Run it with API and shader validation on. It should
fail because the kernel does not exist yet.
```

Notice the odd length: it makes sure the last threadgroup is partial,
which is where kernels most often read out of bounds. The test fails
because there is no kernel yet.

## 3. Write the kernel

```
Following metal-shading-language, write `add_arrays` in MSL 4.1 with a
bounds guard, compile it with -std=metal4.1 and warnings as errors, and
run the test again.
```

The test passes, and validation reports nothing. Ask the agent to remove
the bounds guard for a moment and run the test again: shader validation
now reports an out-of-bounds access. Put the guard back. This is what
validation is for.

## 4. Measure it on a device

```
Following metal-performance-profiling, measure the kernel's GPU time on
this Mac in a release build with validation off: median and p95 over
200 dispatches after 20 warm-up dispatches. Record the fields.
```

The output is a short table with the device, OS build, configuration and
GPU time. Notice that the agent measures with validation off and reads
GPU time from timestamps, not wall-clock time.

## 5. Document it

```
Write the reference page for add_arrays: entry point, inputs, outputs,
tolerances, test command and measured cost.
```

## What we did

We checked the toolchain, wrote a failing test, wrote a kernel that
passes it with validation clean, saw validation catch a real bug,
measured the kernel properly and documented it. Every Metal task in this
role follows the same shape, at a larger size. Next, try
[How to implement a Metal feature](../how-to/how-to-implement-a-metal-feature.md),
or read [About the Metal engineer role](../explanation/about-the-role.md).
