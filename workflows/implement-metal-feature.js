// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'implement-metal-feature',
  description: 'Implement one Metal feature on Apple platforms at the 27 releases (a render or compute pass, a shader, a resource or synchronization scheme, presentation, MetalFX) from its spec: confirm the toolchain and load Apple\'s skills, plan the pass graph, capability gates and fallbacks, tests and GPU cost budget, build test-first with validation on, attack it in parallel independent read-only reviews (correctness and synchronization, tile-based GPU cost, capabilities and platforms, Swift concurrency and lifetimes), fix, document it and push it as a handoff for engineering-practices deliver-package or land-pr. args: { feature: "<feature name>", spec: "<spec or design, path or section>", devices?: "<devices or tiers to cover, default: the project profile>", wp?: "<work package id>", branch?: "<existing branch>", pr?: "<existing PR>" }',
  phases: [
    { title: 'Plan', detail: 'toolchain, Apple skills, pass graph, gates, tests, budget' },
    { title: 'Build', detail: 'tests first, validation on, then code; measure or estimate' },
    { title: 'Attack', detail: 'four independent read-only reviews return failing tests' },
    { title: 'Fix', detail: 'add the tests and fix until green' },
    { title: 'Docs', detail: 'reference and the other kinds the plan names' },
    { title: 'Check', detail: 'independent run of tests, budget and docs' },
    { title: 'Hand off', detail: 'push and open or update the draft PR' },
  ],
}

// --- run-modes v2 begin ---
const RUN = ((a, realAgent, realPhase, realLog) => {
  const opted = !!(a && typeof a === 'object' && a.run && typeof a.run === 'object')
  const c = opted ? a.run : {}
  const mode = c.mode === 'inline' ? 'inline' : 'agents'
  const results = c.results && typeof c.results === 'object' ? c.results : {}
  const reviewers = c.reviewers && typeof c.reviewers === 'object' ? c.reviewers : {}
  const only = Array.isArray(c.only) && c.only.length ? c.only.map(String) : null
  const from = c.from ? String(c.from) : null
  const titles = typeof meta !== 'undefined' && meta && Array.isArray(meta.phases) ? meta.phases.map((p) => p.title) : []
  const unknown = titles.length ? (from ? [from] : []).filter((t) => !titles.includes(t)) : []
  const error = c.mode && !['agents', 'inline'].includes(c.mode)
    ? `run.mode must be "agents" or "inline", got "${c.mode}"`
    : unknown.length ? `run.from names no phase: ${unknown.join(', ')}. Phases: ${titles.join(', ')}` : null
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k)
  // An answer must carry every required key of its schema, as the runtime
  // enforces for agents; returns the missing keys, or null when it fits.
  const missing = (v, schema) => {
    if (v === null || v === undefined) return 'an answer'
    if (!schema || schema.type !== 'object') return null
    if (typeof v !== 'object' || Array.isArray(v)) return 'a JSON object'
    const gap = (schema.required || []).filter((k) => !has(v, k) || v[k] === undefined)
    return gap.length ? gap.join(', ') : null
  }
  const seen = {}
  const out = {}
  // Who answered each step marked independent: "subagent" when this run
  // spawned it, else the reviewer named in run.reviewers, else "self".
  const by = {}
  const who = (k) => (typeof reviewers[k] === 'string' && reviewers[k].trim() ? reviewers[k].trim() : 'self')
  const skipped = []
  const next = []
  const logs = []
  let current = ''
  let reached = !from
  let halting = false
  let release = () => {}
  const halted = new Promise((r) => { release = r })
  const picked = (ph, label) => reached && (!only || only.some((s) => s === ph || s === label || label.startsWith(s + ':')))
  const agent = (prompt, opts) => {
    const op = opts || {}
    const independent = op.independent === true
    const ph = op.phase || current
    const base = op.label || ph || 'agent'
    seen[base] = (seen[base] || 0) + 1
    const key = seen[base] > 1 ? `${base}#${seen[base]}` : base
    let note = null
    if (has(results, key)) {
      const gap = missing(results[key], op.schema)
      if (!gap) { out[key] = results[key]; if (independent) by[key] = who(key); return Promise.resolve(results[key]) }
      note = `answer missing ${gap}; answer this brief again`
    }
    if (!picked(ph, base)) { skipped.push(key); return Promise.resolve(null) }
    if (mode === 'agents') {
      const pass = Object.assign({}, op)
      delete pass.independent
      return realAgent(prompt, opts ? pass : opts).then((r) => {
        if (r !== null && r !== undefined) { out[key] = r; if (independent) by[key] = 'subagent' }
        return r
      })
    }
    const brief = { key, phase: ph, prompt, schema: op.schema || null }
    if (independent) brief.independent = true
    if (note) brief.note = note
    next.push(brief)
    if (!halting) {
      halting = true
      // Wait 200 microtask turns before pausing, so every sibling in a
      // parallel() or pipeline() fan-out queues its brief into this pause.
      ;(async () => { for (let i = 0; i < 200; i++) await null; release('__run_halted__') })()
    }
    return new Promise(() => {})
  }
  const phase = (t) => { current = t; if (from && t === from) reached = true; return realPhase(t) }
  const log = (m) => { logs.push(String(m)); return realLog(m) }
  const finish = (value) => {
    if (!opted) return value
    const self_reviewed = Object.keys(by).filter((k) => by[k] === 'self')
    if (value === '__run_halted__') {
      return {
        run: 'inline', status: 'next', next, results: out, reviewers: by, self_reviewed, skipped, logs,
        how: 'Do each brief in next, in order: follow its prompt in this session (it may tell you to edit files, commit or push), and shape your answer to its schema when one is given, with every required field. A brief marked independent reviews work this run produced, so do not answer it yourself: send its prompt to a reviewer with no part in the work (the project\'s code-reviewer role, a fresh session or a fresh subagent), use their answer, and name them in run.reviewers under its key; if you must answer it yourself, it is listed in self_reviewed and must be reported as self-reviewed. A brief with a note was answered before without the fields it names. Add each answer to results under its key, then run this workflow again with the same args, run.results set to the merged results and run.reviewers to the merged reviewers. Repeat until status is "done". To avoid pasting results back on every call, drive the run with engineering-practices tools/run-inline.mjs and a state file instead: it stores each answer and prints only the next briefs.',
      }
    }
    return { run: mode, status: 'done', result: value, results: out, reviewers: by, self_reviewed, skipped, logs }
  }
  return { agent, phase, log, finish, halted, error }
})(typeof args === 'undefined' ? undefined : args, agent, phase, log)
if (RUN.error) return RUN.error
const RUN_OUT = await Promise.race([RUN.halted, (async (agent, phase, log) => {
// --- run-modes v2 end (workflow body follows; close it with the tail line) ---

const USAGE = 'usage: implement-metal-feature { feature: "<feature name>", spec: "<spec or design, path or section>", devices: "<devices or tiers, optional>", wp: "<work package id, optional>", branch: "<existing branch, optional>", pr: "<existing PR, optional>" }'
if (!args || !args.feature || !args.spec) return USAGE
const feature = String(args.feature)
const spec = String(args.spec)
const devices = args.devices ? String(args.devices) : 'every Apple device the project profile supports, weakest first'
const wp = args.wp ? String(args.wp) : ''
const where = args.pr
  ? `Work on the existing PR ${args.pr} and its head branch; do not create a new branch or PR.`
  : args.branch
    ? `Work on the existing branch ${args.branch} (reuse its open PR if one exists); do not create a new branch.`
    : 'Work on the current feature branch; if you are on the default branch, cut a Conventional branch (feat/<slug>) from the latest remote default branch.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs location (per the project profile), keep each page to one kind, title it by the project pattern (how-to names a goal, explanation reads "About ...", reference is named for the thing), and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

// Only failures block; notes never turn green work into "blocked".
const NOTES_RULE = 'Put a problem in the blocking list only if it is a failure you can point to: a test that still fails, a validation message, a suite or check that is red, a measured GPU cost over budget, a case you could not implement or fix. Everything else (observations, follow-up ideas, questions, things already fixed, "nothing found") goes in notes, never in the blocking list; an empty blocking list means done.'

const FLOOR = 'Target the 27 releases only (deployment target 27 on every Apple OS, Xcode 27, Swift 6.4 or later in the Swift 6 language mode, Metal 4 APIs, MSL 4.1); add no code paths or availability checks for older releases, and gate optional GPU features on capability queries, never on OS versions or device names (metal-engineer apple-gpu-capabilities).'

const PLAN = {
  type: 'object',
  properties: {
    toolchain: { type: 'string', description: 'Xcode, Swift, SDK and host versions found, deployment targets and MSL version checked, per apple-platform-toolchain' },
    appleSkills: { type: 'array', items: { type: 'string' }, description: 'Apple skills loaded for this feature (Xcode 27 export or game-porting-skills), or "not installed: <name>"' },
    design: { type: 'string', description: 'pass graph, frames in flight, residency, binding, synchronization and pipelines, per metal4-architecture' },
    gates: { type: 'array', items: { type: 'string' }, description: 'each "capability query -> path when present / fallback when absent"' },
    cases: { type: 'array', items: { type: 'string' }, description: 'one-line test cases: compute outputs against CPU references, render outputs against reviewed images, shared layouts, every pipeline variant compiling, each gated path and its fallback, frame-slot reuse with one and with the maximum frames in flight' },
    budget: { type: 'string', description: 'GPU time per pass budget per device tier from the project, the scenario it is measured on, and how' },
    measurable: { type: 'boolean', description: 'a release build runs on the weakest target device; never true for a Simulator, virtual machine or paravirtual GPU' },
    files: { type: 'array', items: { type: 'string' } },
    ambiguous: { type: 'array', items: { type: 'string' }, description: 'each "AMBIGUOUS: <question> -> default <value>"' },
    docKinds: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] }, page: { type: 'string' }, why: { type: 'string' } }, required: ['kind', 'page', 'why'] } },
    blockers: { type: 'array', items: { type: 'string' }, description: 'only what stops the work: no spec, a toolchain below the floor, a profile that targets older releases, no Apple silicon Mac to build on' },
  },
  required: ['toolchain', 'appleSkills', 'design', 'gates', 'cases', 'budget', 'measurable', 'ambiguous', 'docKinds'],
}
const BUILD = { type: 'object', properties: { green: { type: 'boolean' }, validationClean: { type: 'boolean' }, testFile: { type: 'string' }, testCommand: { type: 'string' }, skipped: { type: 'array', items: { type: 'string' }, description: 'GPU tests skipped where they ran, each with the missing capability' }, branch: { type: 'string' }, measured: { type: 'string', description: 'GPU time per pass per device with the record fields, or "estimate: ..."' }, non_original: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } }, required: ['green', 'validationClean', 'testFile', 'testCommand', 'branch'] }
const ATTACK = { type: 'object', properties: { failures: { type: 'array', items: { type: 'object', properties: { problem: { type: 'string' }, testCode: { type: 'string' } }, required: ['problem', 'testCode'] } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['failures'] }
const FIX = { type: 'object', properties: { green: { type: 'boolean' }, failing: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['green', 'failing'] }
const DOCS = { type: 'object', properties: { pages: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] } }, required: ['path', 'kind'] } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['pages', 'undocumented'] }
const CHECK = { type: 'object', properties: { pass: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } }, measured: { type: 'string' }, notes: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'problems'] }
const HANDOFF = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, head_sha: { type: 'string' }, tests_pass: { type: 'boolean' }, problem: { type: 'string' } }, required: ['branch', 'tests_pass'] }

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const notes = []

phase('Plan')
const plan = await agent(
  `You are the metal-engineer implementing the Metal feature "${feature}" for ${devices}. Onboard first (engineering-practices project-onboarding), then follow the metal-engineer skill apple-platform-toolchain: confirm the toolchain and project floor, and load the Apple skills that cover this feature (the Xcode 27 skills export and the game-porting-skills plugin); list each one loaded, or "not installed: <name>" if it is missing. Read ${spec}. ${FLOOR} ` +
  'Design the feature with the metal4-architecture skill (pass graph, frames in flight, residency, binding, synchronization, pipelines and when each compiles, failure paths), shaders with metal-shading-language, capability gates and fallbacks with apple-gpu-capabilities, and ownership across threads, actors and languages with swift-metal-concurrency. Take API facts from Apple\'s skills and the SDK documentation, not memory. ' +
  'Return every behaviour as a one-line test case per the gpu-testing skill, take the GPU time budget per pass and tier from the project, and say whether a release build can run on the weakest target device (a Simulator, virtual machine or paravirtual GPU never counts). ' +
  'State each gap as "AMBIGUOUS: <question> -> default <value>". Then plan documentation with the Diataxis compass: a new GPU system owes reference (interface, passes, resources, capability gates, budgets); an explanation if a design choice is made; a how-to if someone must do something new. List the files you will change. Do not edit files.',
  { schema: PLAN, phase: 'Plan', label: 'plan' })
if (!plan) return 'blocked: planning failed (no plan returned) for ' + feature
const blockers = strings(plan.blockers)
if (blockers.length) return { status: 'blocked', stage: 'plan', open: blockers }
if (!Array.isArray(plan.cases) || !plan.cases.length) return 'blocked: planning returned no case list for ' + feature
const ambiguous = strings(plan.ambiguous)
const gates = strings(plan.gates)
const docKinds = Array.isArray(plan.docKinds) ? plan.docKinds : []
const missingSkills = strings(plan.appleSkills).filter((s) => /^not installed/i.test(s))
if (missingSkills.length) notes.push('plan: Apple skills missing: ' + missingSkills.join('; '))
log(`${plan.cases.length} cases, ${gates.length} capability gates, ${ambiguous.length} ambiguous, ${docKinds.length} doc pages planned`)

phase('Build')
const build = await agent(
  `Implement the Metal feature "${feature}" following the metal-engineer skills metal4-architecture, metal-shading-language, apple-gpu-capabilities, swift-metal-concurrency and gpu-testing, Apple's skills listed here (${strings(plan.appleSkills).join(', ') || 'none loaded'}), and the project profile. ${where} ${FLOOR}\n` +
  `Design:\n${plan.design}\nCapability gates:\n- ${gates.join('\n- ') || '(none)'}\n` +
  'Write failing tests for these cases first, in one test file for this feature, with API and shader validation on for the test process, then the simplest code that passes, then refactor:\n- ' + plan.cases.join('\n- ') +
  '\nLabel every Metal object and pass as named in the design. Compile shaders with -std=metal4.1 and warnings as errors. Run the tests where the GPU can run them; on a virtual or paravirtual GPU, skip what it cannot run with the missing capability as the reason, and list those skips; a skip is not a pass. If a GPU job needs a CI change in a path another role owns, make the smallest change and say so in notes (engineering-practices peer-coordination).' +
  (ambiguous.length ? '\nImplement each stated default as a named value and keep this list:\n- ' + ambiguous.join('\n- ') : '') +
  `\nMeasure GPU time per pass against the budget (${plan.budget}) per the metal-performance-profiling skill` + (plan.measurable ? ' on the weakest target device, release configuration, validation off, median and p95, with the record fields.' : '; no target device is reachable, so give a sourced estimate and label it "estimate".') +
  '\nLog every non-original item you add (third-party code, shaders, data, or text from Apple\'s skills or samples) per the engineering-practices provenance skill, with its licence. Run the full test suite with the project\'s commands. Commit with Conventional Commits. Return whether the suite is green, whether validation reported nothing, the test file and test command, the skipped tests with reasons, the branch name, the measured or estimated cost, and the non-original items added (empty if none).',
  { schema: BUILD, phase: 'Build', label: 'build' })
if (!build || !build.green) return 'blocked: build did not reach green for ' + feature + (build && build.notes ? ': ' + build.notes : '')
if (!build.validationClean) return { status: 'blocked', stage: 'build', open: ['Metal API or shader validation reported messages; fix them before review'], notes: build.notes ? [build.notes] : [] }
if (build.notes) notes.push('build: ' + build.notes)
const skipped = strings(build.skipped)

phase('Attack')
const lenses = [
  'correctness and synchronization: every hazard in the pass graph has one ordering primitive at the right stages, frame slots are never reused before their event signals, per-frame data never overwrites memory the GPU may read, outputs match the CPU references or reviewed images within the stated tolerances, and validation stays clean (metal4-architecture, metal-debugging, gpu-testing)',
  `tile-based GPU cost: load and store actions, memoryless targets, pass count, bandwidth, precision, divergence, occupancy, pipelines compiled ahead of use, and GPU time per pass against ${plan.budget}; a measured pass over budget is a failure, an estimate is a note (metal-performance-profiling, metal-shading-language)`,
  'capabilities and platforms: every SDK the project ships compiles; every gated feature is checked by capability query with its fallback tested by forcing the capability off; nothing checks OS versions below 27 or device names; memory stays within each tier\'s budget; display, refresh-rate and thermal changes are handled (apple-gpu-capabilities)',
  'Swift concurrency and lifetimes: strict concurrency compiles with no warnings, every unchecked escape names its mechanism and has a test, encoding never awaits mid-frame, completion handlers only signal, the main actor never waits on the GPU, and every object the GPU uses outlives its frame in Swift, Objective-C and metal-cpp alike (swift-metal-concurrency)',
]
const attacks = await parallel(lenses.map((lens) => () => agent(
  `You are a metal-engineer reviewer giving an independent review of the new Metal feature "${feature}", which you did not write. Try to break it through ${lens}. Spec: ${spec}. Test file: ${build.testFile}; test command: ${build.testCommand}. Use Apple's skills for API facts. Do NOT edit any file. For each real problem, return a short description and the code of one failing test written for the project's test framework, ready to add to ${build.testFile}. Put only real, reproducible problems in failures; observations and ideas go in notes. Return an empty failures list if you find nothing.`,
  { schema: ATTACK, phase: 'Attack', label: 'attack:' + lens.split(':')[0].replace(/\s+/g, '-'), independent: true })))
const unverified = []
const failures = []
attacks.forEach((a, i) => {
  const name = lenses[i].split(':')[0]
  if (!a || !Array.isArray(a.failures)) unverified.push(name)
  else {
    a.failures.forEach((f) => failures.push(f))
    strings(a.notes).forEach((n) => notes.push(name + ': ' + n))
  }
})

if (failures.length) {
  phase('Fix')
  const fix = await agent(
    `Add these tests to ${build.testFile} in one edit, then fix the "${feature}" code until they pass, keeping every existing test green and validation clean. Follow the same skills and rules as the build. ${FLOOR} Commit.\n\n` +
    failures.map((f, i) => `${i + 1}. ${f.problem}\n${f.testCode}`).join('\n\n') +
    '\nReturn green (the full suite passes with validation clean), failing (each test or problem above that still fails after your fixes, one line each) and notes. ' + NOTES_RULE,
    { schema: FIX, phase: 'Fix', label: 'fix' })
  if (!fix) return { status: 'blocked', reason: 'fix agent failed', open: failures.map((f) => f.problem) }
  const failing = strings(fix.failing)
  strings(fix.notes).forEach((n) => notes.push('fix: ' + n))
  if (!fix.green || failing.length) return { status: 'blocked', open: failing.length ? failing : ['suite not green or validation not clean after fixes'], notes }
}

phase('Docs')
const docs = await agent(
  `Document the Metal feature "${feature}" in the same PR. Planned pages:\n` +
  (docKinds.length ? docKinds.map((d) => `- ${d.kind}: ${d.page} (${d.why})`).join('\n') : '- (none planned; re-run the compass)') +
  '\nThe reference page lists the public interface, the pass graph with labels as in the code, resources and residency, the synchronization table, pipelines and when each compiles, every capability gate with its fallback, the test command with any skips and their reasons, and GPU time per pass per device (measured with its record fields, or labelled estimate). ' +
  DOCS_FRAGMENT + ' Also update the project contracts doc if the interface is used by another role. Commit with a docs: or the feature commit per the project convention.',
  { schema: DOCS, phase: 'Docs', label: 'docs' })
if (!docs) return { status: 'blocked', reason: 'docs step failed; code without its docs is not done' }
const docPages = (Array.isArray(docs.pages) ? docs.pages : []).map((p) => (p && typeof p === 'object'
  ? { path: String(p.path || p.page || ''), kind: String(p.kind || '') }
  : { path: String(p), kind: '' })).filter((p) => p.path)
const docPaths = docPages.map((p) => p.path)
const docList = docPages.map((p) => (p.kind ? `${p.path} (${p.kind})` : p.path)).join(', ')

phase('Check')
const check = await agent(
  `You are a second metal-engineer giving an independent check of the "${feature}" work, which you did not write. 1) Run the full test suite (${build.testCommand}) with API and shader validation on; any failure or validation message is a problem. Skips need a named missing capability; the build reported ${skipped.length ? skipped.join('; ') : 'no skips'}. 2) Confirm GPU time per pass is within the budget (${plan.budget}); the build reported ${build.measured || 'no measurement'}. A cost labelled estimate is a note, not a problem; a measured cost over budget is a problem. 3) Confirm the code matches the design and capability gates in ${spec} and the plan, and adds nothing for releases below 27. ` +
  `4) For each touched docs page (${docList || 'none reported'}): it holds one Diataxis kind only, starts with a line saying its kind and audience, its title follows the pattern, and it links to the related pages of other kinds. Do not edit; report problems and notes separately. ` + NOTES_RULE + ' Set pass to true exactly when problems is empty.',
  { schema: CHECK, phase: 'Check', label: 'check', independent: true })
if (!check) return { status: 'unverified', reason: 'check agent failed', docs: docPaths, unverifiedLenses: unverified, notes }
const problems = strings(check.problems)
strings(check.notes).forEach((n) => notes.push('check: ' + n))
if (problems.length) return { status: 'blocked', open: problems, notes }
if (!check.pass) return { status: 'blocked', open: ['check reported a failure without naming it; run the check again'], notes }

phase('Hand off')
const handoff = await agent(
  `Hand off the "${feature}" work. ${where} Make sure every commit is pushed to the branch (${build.branch}). Look for an open pull request for that branch first${args.pr ? ` (the caller names ${args.pr})` : ''}: an earlier push or step may already have opened it. If one is open, update its body; open a draft PR titled as a Conventional Commit only if none is open. Either way the body ${wp ? `carries "Refs: ${wp}" and ` : ''}lists the docs pages by Diataxis kind (${docList || 'none reported'}), the test command and any skipped GPU tests with reasons, and GPU time per pass (measured or estimate)${ambiguous.length ? ', and the defaults taken for ambiguous points' : ''}; keep any lines already in an existing body that are not about these. Do not mark it ready, request review or merge: the engineering-practices workflow named in the result does that. Follow the engineering-practices git-workflow skill. Return the branch, PR URL, head commit SHA, and whether the full suite passes on that head.`,
  { schema: HANDOFF, phase: 'Hand off', label: 'handoff' })
if (!handoff || !handoff.branch) return { status: 'blocked', reason: 'hand-off failed; the work is committed on ' + build.branch + ' but may not be pushed', notes }
if (!handoff.tests_pass) return { status: 'blocked', open: ['suite not green on the pushed head' + (handoff.problem ? ': ' + handoff.problem : '')], notes }

const measured = check.measured || build.measured || ''
const pushed = { branch: handoff.branch, pr: handoff.pr || '', head_sha: handoff.head_sha || '' }
const handoffOut = {
  from: 'metal-engineer:implement-metal-feature',
  branch: handoff.branch,
  pr: handoff.pr || '',
  head_sha: handoff.head_sha || '',
  tests_pass: true,
  docs: docPaths,
  undocumented: docs.undocumented || [],
  non_original: strings(build.non_original),
  notes,
}

return {
  status: unverified.length ? 'unverified' : 'done',
  cases: plan.cases.length,
  gates,
  ambiguous,
  skipped,
  attackTestsAdded: failures.length,
  unverifiedLenses: unverified,
  measured,
  docs: docPaths,
  undocumented: docs.undocumented,
  notes,
  // An unverified run returns no handoff, so deliver-package cannot ship it
  // as if every lens had passed; pushed still names the branch.
  ...(unverified.length ? { pushed } : { handoff: handoffOut }),
  next: unverified.length
    ? `rerun the lenses that returned nothing with run.only: [${unverified.map((n) => JSON.stringify('attack:' + n.replace(/\s+/g, '-'))).join(', ')}] and run.results from this run; the run that verifies them returns the handoff`
    : wp
    ? `ship it without rebuilding: /engineering-practices:deliver-package { wp: "${wp}", prior: <this result> }; after the code reviewer passes, /engineering-practices:land-pr { pr: "<the PR>" }`
    : `land it (it marks the PR ready, asks the code reviewer, polls CI and squash-merges once passed): /engineering-practices:land-pr ${handoff.pr ? `{ pr: "${handoff.pr}" }` : `{ branch: "${handoff.branch}" }`}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
