// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'debug-metal-rendering',
  description: 'Find and fix a Metal rendering or compute bug on Apple platforms (wrong pixels, black frames, flicker, GPU errors or hangs): reproduce it as a failing test or exact steps with validation on, capture the wrong frame, find the first wrong pass and the root cause with Apple\'s debugging skills, fix at the cause, check sibling sites in parallel independent read-only reviews, document it in the same PR and push it as a handoff for engineering-practices deliver-package or land-pr. args: { bug: "<issue link or description>", device?: "<device it shows on>", capture?: "<path to an existing .gputrace, optional>", wp?: "<work package id>", branch?: "<existing branch>", pr?: "<existing PR>" }',
  phases: [
    { title: 'Reproduce', detail: 'failing test or exact steps, validation on' },
    { title: 'Diagnose', detail: 'capture, first wrong pass, root cause' },
    { title: 'Fix', detail: 'fix at the cause; the reproduction passes' },
    { title: 'Siblings', detail: 'independent read-only search for the same mistake' },
    { title: 'Docs', detail: 'reference and how-to updates the fix owes' },
    { title: 'Check', detail: 'independent run of the suite and docs check' },
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

const USAGE = 'usage: debug-metal-rendering { bug: "<issue link or description>", device: "<device, optional>", capture: "<path to .gputrace, optional>", wp: "<work package id, optional>", branch: "<existing branch, optional>", pr: "<existing PR, optional>" }'
if (!args || !args.bug) return USAGE
const bug = String(args.bug)
const device = args.device ? String(args.device) : 'the device the report names, or the weakest supported device that shows it'
const given = args.capture ? `A capture already exists at ${args.capture}; start from it.` : 'No capture exists yet.'
const wp = args.wp ? String(args.wp) : ''
const where = args.pr
  ? `Work on the existing PR ${args.pr} and its head branch; do not create a new branch or PR.`
  : args.branch
    ? `Work on the existing branch ${args.branch} (reuse its open PR if one exists); do not create a new branch.`
    : 'Work on the current feature branch; if you are on the default branch, cut a Conventional branch (fix/<slug>) from the latest remote default branch.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs location (per the project profile), keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

const NOTES_RULE = 'Put a problem in the blocking list only if it is a failure you can point to: a test that still fails, a validation message, a suite or check that is red. Everything else goes in notes; an empty blocking list means done.'

const REPRO = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['test', 'steps'], description: 'test when the wrong output can be checked by a GPU test, steps otherwise' },
    testFile: { type: 'string', description: 'file holding the new failing test, or "" for steps' },
    testCommand: { type: 'string' },
    steps: { type: 'string', description: 'exact steps, device, build and scenario that show the bug' },
    failsNow: { type: 'boolean', description: 'the test fails, or the steps show the bug, on the current head' },
    validation: { type: 'array', items: { type: 'string' }, description: 'API or shader validation messages seen with the bug, verbatim' },
    branch: { type: 'string' },
    blockers: { type: 'array', items: { type: 'string' }, description: 'only what stops the work: cannot reproduce on any reachable device, no build' },
  },
  required: ['kind', 'testCommand', 'steps', 'failsNow', 'validation', 'branch'],
}
const DIAG = {
  type: 'object',
  properties: {
    capture: { type: 'string', description: 'capture file or "none" with why' },
    firstWrongPass: { type: 'string', description: 'label of the first pass whose output is wrong while its inputs are right' },
    rootCause: { type: 'string', description: 'one sentence that explains every symptom' },
    evidence: { type: 'string' },
    fix: { type: 'string', description: 'the change at the cause' },
    explainsAll: { type: 'boolean' },
    appleSkills: { type: 'array', items: { type: 'string' } },
  },
  required: ['firstWrongPass', 'rootCause', 'evidence', 'fix', 'explainsAll'],
}
const FIX = { type: 'object', properties: { green: { type: 'boolean' }, validationClean: { type: 'boolean' }, reproPasses: { type: 'boolean' }, failing: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['green', 'validationClean', 'reproPasses', 'failing'] }
const SIBS = { type: 'object', properties: { sites: { type: 'array', items: { type: 'object', properties: { where: { type: 'string' }, problem: { type: 'string' }, testCode: { type: 'string' } }, required: ['where', 'problem'] } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['sites'] }
const DOCS = { type: 'object', properties: { pages: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] } }, required: ['path', 'kind'] } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['pages', 'undocumented'] }
const CHECK = { type: 'object', properties: { pass: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'problems'] }
const HANDOFF = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, head_sha: { type: 'string' }, tests_pass: { type: 'boolean' }, problem: { type: 'string' } }, required: ['branch', 'tests_pass'] }

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const notes = []

phase('Reproduce')
const repro = await agent(
  `You are the metal-engineer. Onboard first (engineering-practices project-onboarding), then follow the metal-engineer skills apple-platform-toolchain, metal-debugging and gpu-testing, and load Apple's debugging-rendering-issues and using-metal-validation skills if the game-porting-skills plugin is installed. Bug: ${bug}. Device: ${device}. ${given} ${where}
Reproduce it with API and shader validation on. If the wrong output can be checked automatically (a compute result, an offscreen render compared with a reviewed image), write the failing test in the project's test target and commit it; otherwise write exact steps. Record every validation message verbatim. Do not change product code yet.`,
  { schema: REPRO, phase: 'Reproduce', label: 'reproduce' })
if (!repro) return { status: 'blocked', reason: 'reproduction step returned nothing' }
const reproBlockers = strings(repro.blockers)
if (reproBlockers.length) return { status: 'blocked', stage: 'reproduce', open: reproBlockers }
if (!repro.failsNow) return { status: 'blocked', stage: 'reproduce', open: ['could not reproduce the bug on the current head'], steps: repro.steps }

phase('Diagnose')
const diag = await agent(
  `You are the metal-engineer. Diagnose this Metal bug per the metal-debugging skill, using Apple's debugging-rendering-issues, using-gpucapture and using-gpudebug skills where installed. Bug: ${bug}. Reproduction: ${repro.steps}. Validation messages: ${JSON.stringify(strings(repro.validation))}. ${given}
Validation messages first. Then capture the wrong frame (Xcode GPU capture, or gpucapture on macOS 27), walk the passes in order and find the first one whose output is wrong while its inputs are right; inside it check pipeline state, bindings, resource contents, shader logic, then synchronization. State the root cause in one sentence and whether it explains every symptom; propose the fix at the cause. Read only; do not edit product code.`,
  { schema: DIAG, phase: 'Diagnose', label: 'diagnose' })
if (!diag) return { status: 'blocked', reason: 'diagnosis returned nothing', steps: repro.steps }
if (!diag.explainsAll) return { status: 'blocked', stage: 'diagnose', open: ['the root cause found does not explain every symptom: ' + diag.rootCause], evidence: diag.evidence }

phase('Fix')
const fix = await agent(
  `You are the metal-engineer. Fix this bug at its cause: ${diag.fix} (root cause: ${diag.rootCause}). ${where} Keep the change minimal and follow the metal-engineer skill for the area (metal4-architecture, metal-shading-language, apple-gpu-capabilities or swift-metal-concurrency). Make the reproduction pass (${repro.kind === 'test' ? `${repro.testFile}, run with ${repro.testCommand}` : `steps: ${repro.steps}`}), keep the full suite green with API and shader validation on, and commit with a fix: Conventional Commit. Return green, validationClean, reproPasses, failing and notes. ` + NOTES_RULE,
  { schema: FIX, phase: 'Fix', label: 'fix' })
if (!fix) return { status: 'blocked', reason: 'fix step returned nothing' }
strings(fix.notes).forEach((n) => notes.push('fix: ' + n))
if (!fix.green || !fix.validationClean || !fix.reproPasses || strings(fix.failing).length) {
  return { status: 'blocked', stage: 'fix', open: strings(fix.failing).length ? strings(fix.failing) : ['suite, validation or reproduction not green after the fix'], notes }
}

phase('Siblings')
const lenses = [
  ['passes', 'the same mistake in other passes, encoders or pipelines of this codebase'],
  ['shaders', 'the same mistake in other shaders, variants or function-constant combinations'],
  ['platforms', 'the same mistake on other Apple platforms, SDKs or GPU families the project ships, and in capability fallbacks'],
]
const sibs = await parallel(lenses.map(([name, lens]) => () => agent(
  `You are a metal-engineer reviewer giving an independent review, after a fix you did not write. Root cause: ${diag.rootCause}. Fix: ${diag.fix}. Search for ${lens}. Read only; do not edit anything. For each real site, return where it is, the problem, and the code of one failing test for the project's test framework if one can show it. Return an empty sites list if there are none.`,
  { schema: SIBS, phase: 'Siblings', label: 'siblings:' + name, independent: true })))
const unverified = []
const sites = []
sibs.forEach((s, i) => {
  if (!s || !Array.isArray(s.sites)) unverified.push(lenses[i][0])
  else {
    s.sites.forEach((x) => sites.push(x))
    strings(s.notes).forEach((n) => notes.push('siblings: ' + n))
  }
})
if (sites.length) {
  const sibFix = await agent(
    `You are the metal-engineer. Add the tests given here and fix each sibling site of the same root cause (${diag.rootCause}), keeping the full suite green with validation on. Commit.\n` +
    sites.map((s, i) => `${i + 1}. ${s.where}: ${s.problem}${s.testCode ? '\n' + s.testCode : ''}`).join('\n') +
    '\nReturn green, validationClean, reproPasses (the original reproduction still passes), failing and notes. ' + NOTES_RULE,
    { schema: FIX, phase: 'Siblings', label: 'fix-siblings' })
  if (!sibFix) return { status: 'blocked', reason: 'sibling fix step returned nothing', open: sites.map((s) => s.where) }
  strings(sibFix.notes).forEach((n) => notes.push('fix-siblings: ' + n))
  if (!sibFix.green || !sibFix.validationClean || !sibFix.reproPasses || strings(sibFix.failing).length) {
    return { status: 'blocked', stage: 'siblings', open: strings(sibFix.failing).length ? strings(sibFix.failing) : ['suite, validation or reproduction not green after sibling fixes'], notes }
  }
}

phase('Docs')
const docs = await agent(
  `You are the metal-engineer. Document this fix in the same PR. Root cause: ${diag.rootCause}. Fix: ${diag.fix}. Sibling sites fixed: ${sites.length}. A bug fix updates the reference page of any GPU system whose behaviour, passes, synchronization or capability gates changed; a new debugging procedure people must follow gets a how-to. ${DOCS_FRAGMENT} Commit on the same branch.`,
  { schema: DOCS, phase: 'Docs', label: 'docs' })
if (!docs) return { status: 'blocked', reason: 'docs step failed; a fix without its docs is not done' }
const docPages = (Array.isArray(docs.pages) ? docs.pages : []).map((p) => (p && typeof p === 'object'
  ? { path: String(p.path || p.page || ''), kind: String(p.kind || '') }
  : { path: String(p), kind: '' })).filter((p) => p.path)
const docPaths = docPages.map((p) => p.path)
const docList = docPages.map((p) => (p.kind ? `${p.path} (${p.kind})` : p.path)).join(', ')

phase('Check')
const check = await agent(
  `You are a second metal-engineer giving an independent check of this fix, which you did not write. 1) Run the full test suite (${repro.testCommand}) with API and shader validation on; any failure or validation message is a problem. 2) Confirm the reproduction (${repro.kind === 'test' ? repro.testFile : repro.steps}) now passes and the change sits at the stated cause (${diag.rootCause}), not where the symptom showed. 3) For each touched docs page (${docList || 'none reported'}): one Diataxis kind, a first line naming kind and audience, a title by pattern, links to related kinds. Do not edit; report problems and notes separately. ` + NOTES_RULE + ' Set pass to true exactly when problems is empty.',
  { schema: CHECK, phase: 'Check', label: 'check', independent: true })
if (!check) return { status: 'unverified', reason: 'check agent failed', rootCause: diag.rootCause, docs: docPaths, notes }
const problems = strings(check.problems)
strings(check.notes).forEach((n) => notes.push('check: ' + n))
if (problems.length) return { status: 'blocked', open: problems, notes }
if (!check.pass) return { status: 'blocked', open: ['check reported a failure without naming it; run the check again'], notes }

phase('Hand off')
const handoff = await agent(
  `Hand off this fix. ${where} Make sure every commit is pushed to ${repro.branch}. Look for an open pull request for that branch first${args.pr ? ` (the caller names ${args.pr})` : ''}; update its body if one is open, and open a draft PR titled as a fix: Conventional Commit only if none is open. The body ${wp ? `carries "Refs: ${wp}" and ` : ''}states the root cause in one sentence, the reproduction, the sibling sites fixed (${sites.length}) and the docs pages by Diataxis kind (${docList || 'none reported'}); keep lines already in an existing body that are not about these. Do not mark it ready, request review or merge. Follow the engineering-practices git-workflow skill. Return the branch, PR URL, head commit SHA, and whether the full suite passes on that head.`,
  { schema: HANDOFF, phase: 'Hand off', label: 'handoff' })
if (!handoff || !handoff.branch) return { status: 'blocked', reason: 'hand-off failed; the fix is committed on ' + repro.branch + ' but may not be pushed', notes }
if (!handoff.tests_pass) return { status: 'blocked', open: ['suite not green on the pushed head' + (handoff.problem ? ': ' + handoff.problem : '')], notes }

const pushed = { branch: handoff.branch, pr: handoff.pr || '', head_sha: handoff.head_sha || '' }
const handoffOut = {
  from: 'metal-engineer:debug-metal-rendering',
  branch: handoff.branch,
  pr: handoff.pr || '',
  head_sha: handoff.head_sha || '',
  tests_pass: true,
  docs: docPaths,
  undocumented: docs.undocumented || [],
  non_original: [],
  notes,
}
return {
  status: unverified.length ? 'unverified' : 'done',
  rootCause: diag.rootCause,
  firstWrongPass: diag.firstWrongPass,
  reproduction: repro.kind === 'test' ? repro.testFile : repro.steps,
  siblingsFixed: sites.length,
  unverifiedSiblingSearches: unverified,
  docs: docPaths,
  undocumented: docs.undocumented,
  notes,
  ...(unverified.length ? { pushed } : { handoff: handoffOut }),
  next: unverified.length
    ? `rerun the sibling searches that returned nothing with run.only: [${unverified.map((n) => JSON.stringify('siblings:' + n)).join(', ')}] and run.results from this run; the run that verifies them returns the handoff`
    : wp
    ? `ship it without rebuilding: /engineering-practices:deliver-package { wp: "${wp}", prior: <this result> }; after the code reviewer passes, /engineering-practices:land-pr { pr: "<the PR>" }`
    : `land it: /engineering-practices:land-pr ${handoff.pr ? `{ pr: "${handoff.pr}" }` : `{ branch: "${handoff.branch}" }`}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
