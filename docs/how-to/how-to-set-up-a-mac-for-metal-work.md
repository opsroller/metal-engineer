*How-to guide, for someone about to do Metal work on a Mac that has not been checked for the 27 releases.*

# How to set up a Mac for Metal work

This guide gets one Apple silicon Mac and one project to the floor the
`metal-engineer` role works at, and loads Apple's agent skills.

## Check the machine

Run these and keep the output with your work:

```
xcodebuild -version
swift --version
sw_vers
xcrun --sdk macosx --show-sdk-version
xcrun metal --version
```

You want Xcode 27.x, Swift 6.4 or later, macOS Tahoe 26.4 or later on
Apple silicon (macOS 27 if you need `gpucapture` or `gpudebug`), and 27.x
SDKs. If the command line points at another Xcode, set `DEVELOPER_DIR`
for your shell rather than changing the machine for everyone.

## Check the project

- Every Apple target has deployment target 27.
- Swift builds in the Swift 6 language mode.
- Shaders compile with `-std=metal4.1` (`MTL_LANGUAGE_REVISION` in Xcode).

If the project targets older releases, stop and raise it with whoever
owns the project profile.

## Load Apple's skills

Export the skills that ship with Xcode 27:

```
xcrun agent skills export --output-dir <a folder your agent reads skills from>
```

Install Apple's Metal skills:

```
/plugin marketplace add apple/game-porting-toolkit
/plugin install game-porting-skills@game-porting-toolkit
```

Re-export the Xcode skills after each Xcode update.

## Confirm

Ask the agent:

```
Use the metal-engineer agent. Follow apple-platform-toolchain and give me
the toolchain note for this machine and project.
```

The note lists versions, targets, the language version and the Apple
skills loaded. Anything that failed is named with the command that
showed it.

See the [apple-platform-toolchain reference](../reference/skill-apple-platform-toolchain.md).
