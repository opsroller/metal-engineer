*How-to guide, for someone who uses the plugin and has a written spec for a Metal pass, shader or GPU system.*

# How to implement a Metal feature

This guide takes one Metal feature from its spec to a draft pull request
with tests, docs and a measured cost, using the `implement-metal-feature`
workflow.

## Before you run it

- The spec exists: what the feature must produce, on which devices, and
  its GPU time budget. If the frame's design is not decided, get it from
  the graphics programmer first.
- The Mac is set up ([How to set up a Mac for Metal work](how-to-set-up-a-mac-for-metal-work.md)).

## Run the workflow

```
/metal-engineer:implement-metal-feature
args: { feature: "shadow map pass", spec: "docs/reference/shadows.md", wp: "WP-12" }
```

- Leave `devices` out to cover every device the project supports.
- Pass `branch` or `pr` to continue existing work instead of starting a
  branch.

## Read the result

- `done`: the draft PR is pushed with tests, docs and GPU time per pass.
  Follow `next`: deliver-package with this result as `prior` if you gave
  a `wp`, otherwise land-pr.
- `blocked` at `plan`: the toolchain is below the floor, the profile
  targets older releases, or the spec is missing. Fix that first.
- `blocked` with a validation message: Metal validation reported
  something during the build. It is a bug; fix it and run again with
  `branch`.
- `unverified`: a review lens returned nothing. Rerun just that lens
  with `run.only` as `next` says.
- `skipped` is not empty: some GPU tests could not run where they ran
  (for example on a CI runner's paravirtual GPU). Run them on a Mac
  with a real GPU before the PR merges.

See the [implement-metal-feature reference](../reference/workflow-implement-metal-feature.md).
