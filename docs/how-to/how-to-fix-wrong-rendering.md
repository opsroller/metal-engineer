*How-to guide, for someone who uses the plugin and has a Metal frame or compute result that is wrong.*

# How to fix wrong rendering

This guide finds and fixes a black frame, wrong colours, missing
geometry, flicker or a GPU error at its root cause, using the
`debug-metal-rendering` workflow.

## Run the workflow

```
/metal-engineer:debug-metal-rendering
args: { bug: "terrain flickers on iPad after the water pass was added", device: "iPad, smallest supported" }
```

- If you already captured the frame, pass `capture` with the `.gputrace`
  path.
- Install Apple's `game-porting-skills` first; the workflow uses its
  debugging and capture skills.

## Read the result

- `done`: the fix is pushed with a regression test, `rootCause` explains
  it in one sentence, and `siblingsFixed` says how many other sites had
  the same mistake. Land it as `next` says.
- `blocked` at `reproduce`: the bug did not show on any reachable device.
  Add the device, build or steps it needs and run again.
- `blocked` at `diagnose`: the cause found does not explain every
  symptom, so it is not the root cause. Read `evidence`, then run again
  with what you learned in `bug`.
- `unverified`: a sibling search returned nothing; rerun it as `next`
  says.

## If you need to debug by hand

Follow the [metal-debugging](../reference/skill-metal-debugging.md)
skill: validation first, capture, first wrong pass, root cause, fix at
the cause, siblings, regression test.

See the [debug-metal-rendering reference](../reference/workflow-debug-metal-rendering.md).
