// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'investigate-gpu-performance',
  description: 'Investigate slow, stuttering or hot Metal work on one Apple device: fix a repeatable scenario, measure GPU time per pass against a matched baseline in a release build on the device itself, find the limiter with parallel read-only diagnosers (CPU encoding and waits, pass limiters and occupancy, bandwidth on the tile-based GPU, hitches from pipelines, uploads and heat), apply one change at a time and keep it only if the re-measure improves, document the results and have the docs checked independently. args: { symptom: "<what is wrong>", device: "<the Apple device or tier>", scenario?: "<how to reproduce>", budget?: "<GPU time budget, default: the project profile>" }',
  phases: [
    { title: 'Plan', detail: 'scenario, budget, device and build' },
    { title: 'Measure', detail: 'baseline GPU time per pass' },
    { title: 'Diagnose', detail: 'four read-only diagnosers' },
    { title: 'Fix', detail: 'one change at a time, re-measure, keep or revert' },
    { title: 'Docs', detail: 'results and budgets in the project docs' },
    { title: 'Docs check', detail: 'independent read-only docs check' },
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

const USAGE = 'usage: investigate-gpu-performance { symptom: "<what is wrong>", device: "<the Apple device or tier>", scenario: "<how to reproduce, optional>", budget: "<GPU time budget, optional>" }'
if (!args || !args.symptom || !args.device) return USAGE
const symptom = String(args.symptom)
const device = String(args.device)
const scenarioHint = args.scenario ? `Reproduction given by the requester: ${args.scenario}.` : 'Define a repeatable reproduction yourself (scene, camera path, input replay, warm-up).'
const budgetHint = args.budget ? `Budget given by the requester: ${args.budget}.` : 'Take the GPU time budget for this device from the project profile, or propose one and say so.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs location (per the project profile), keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

const PLAN = {
  type: 'object',
  properties: {
    scenario: { type: 'string' },
    budgetMs: { type: 'number', description: 'GPU time budget per frame in ms on this device' },
    build: { type: 'string', description: 'release build, validation off, no capture, and how to produce and install it' },
    method: { type: 'string', description: 'how GPU time per pass is read (counter-heap timestamps in the app, or xctrace with the Metal System Trace template) and how the matched baseline alternates with the change' },
    canMeasure: { type: 'boolean', description: 'false if the device itself or a release build is not reachable; a Simulator, virtual machine or paravirtual GPU never counts' },
    docsPlan: { type: 'array', items: { type: 'string' }, description: 'kind + page path + what changes' },
  },
  required: ['scenario', 'budgetMs', 'build', 'method', 'canMeasure', 'docsPlan'],
}
const MEASURE = {
  type: 'object',
  properties: {
    gpuMedianMs: { type: 'number' },
    gpuP95Ms: { type: 'number' },
    cpuMedianMs: { type: 'number' },
    passes: { type: 'array', items: { type: 'string' }, description: 'each "<pass label>: median ms / p95 ms"' },
    record: { type: 'string', description: 'device, OS build, Xcode, configuration, resolution, refresh rate, thermal state at start and end' },
    notes: { type: 'string' },
  },
  required: ['gpuMedianMs', 'gpuP95Ms', 'passes', 'record'],
}
const HYPOTHESES = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    hypotheses: {
      type: 'array',
      items: {
        type: 'object',
        properties: { cause: { type: 'string' }, evidence: { type: 'string' }, change: { type: 'string' }, expectedSavingMs: { type: 'number' } },
        required: ['cause', 'evidence', 'change', 'expectedSavingMs'],
      },
    },
  },
  required: ['area', 'hypotheses'],
}
const DOCCHECK = { type: 'object', properties: { ok: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'problems'] }

phase('Plan')
const plan = await agent(
  `You are the metal-engineer. Onboard first (engineering-practices project-onboarding), then follow the metal-engineer skills apple-platform-toolchain and metal-performance-profiling. Symptom: "${symptom}" on ${device}. ${scenarioHint} ${budgetHint}
Fix a repeatable scenario, name the release build (validation off, no capture), say how GPU time per pass is read and how the baseline and each change alternate in one session, and say whether the device itself and a release build are reachable (canMeasure). A Simulator, a virtual machine or a paravirtual GPU is not the device: its times are not measurements, so it never makes canMeasure true.
Docs plan: ${DOCS_FRAGMENT} Here only plan: list each page (kind, path, change). Do not edit anything.`,
  { schema: PLAN, phase: 'Plan', label: 'plan' },
)
if (!plan) return { status: 'blocked', reason: 'planning failed (no plan returned)' }
if (!plan.canMeasure) return { status: 'blocked', reason: `the ${device} device or a release build is not reachable, so nothing can be measured`, scenario: plan.scenario }

const measure = (label, phaseName) => agent(
  `You are the metal-engineer. Read only; do not edit files. Run this scenario on ${device} with ${plan.build} and report GPU time per frame and per pass (median and p95, over the sampled frames after warm-up), CPU time per frame, and the record fields, per the metal-performance-profiling skill. Method: ${plan.method}. Read GPU time from timestamps or the trace, never from the frame interval: a display-paced frame has a floor at the refresh interval. Scenario: ${plan.scenario}.`,
  { schema: MEASURE, phase: phaseName, label },
)

phase('Measure')
const baseline = await measure('baseline', 'Measure')
if (!baseline) return { status: 'blocked', reason: 'baseline measurement failed' }
log(`baseline GPU p95 ${baseline.gpuP95Ms} ms vs budget ${plan.budgetMs} ms`)

phase('Diagnose')
const AREAS = [
  ['cpu', 'CPU side: encoding cost, waits on frame slots or drawables, culling and app work, per-frame allocations, parallel encoding. Skills: metal4-architecture, swift-metal-concurrency.'],
  ['limiters', 'Passes that dominate GPU time: their limiter, utilization and occupancy counters, shader per-line cost, precision and divergence. Skills: metal-performance-profiling, metal-shading-language.'],
  ['bandwidth', 'Memory bandwidth on the tile-based GPU: load and store actions, memoryless targets, pass splits that force tile stores and reloads, texture formats and compression, overdraw. Skill: metal4-architecture.'],
  ['hitches', 'Long frames now and then: pipelines compiled on first use, resource uploads, allocations, residency changes, thermal state rising over the run. Skills: metal4-architecture, apple-gpu-capabilities.'],
]
const diag = await parallel(AREAS.map(([area, focus]) => () =>
  agent(`You are a metal-engineer diagnoser. Read only; do not edit files. Symptom "${symptom}" on ${device}. Baseline: ${JSON.stringify(baseline)}. Focus: ${focus}
Name causes only with evidence from a trace, counters, a capture or the code, each with one concrete change and an expected saving in ms of GPU time (or CPU time, for CPU causes). Return an empty list if this area is not on the critical path.`,
    { schema: HYPOTHESES, phase: 'Diagnose', label: area })))
const missingAreas = AREAS.map(([a]) => a).filter((a, i) => !diag[i])
if (missingAreas.length) log(`diagnosers that returned nothing (areas unverified): ${missingAreas.join(', ')}`)
const ranked = diag.filter(Boolean)
  .flatMap((d) => (Array.isArray(d.hypotheses) ? d.hypotheses : []).map((h) => ({ ...h, area: d.area })))
  .sort((a, b) => b.expectedSavingMs - a.expectedSavingMs)
if (!ranked.length) return { status: missingAreas.length ? 'unverified' : 'no evidenced cause found', baseline, unverifiedAreas: missingAreas }

phase('Fix')
let current = baseline
const kept = []
const tried = []
let measureFailed = false
for (const [i, h] of ranked.slice(0, 3).entries()) {
  const step = `${i + 1}-${h.area}`
  if (current.gpuP95Ms <= plan.budgetMs) break
  const applied = await agent(
    `You are the metal-engineer. Apply exactly this one change, nothing else, following the relevant metal-engineer skill, keep the project's tests green with validation on (gpu-testing), and commit it on the work branch: ${h.change} (cause: ${h.cause}).`,
    { phase: 'Fix', label: `apply:${step}` },
  )
  if (!applied) return { status: 'blocked', reason: `the apply agent for "${h.change}" returned nothing; check the branch for a partial change before continuing`, baseline, current }
  const after = await measure(`re-measure:${step}`, 'Fix')
  if (!after) {
    const undone = await agent(`You are the metal-engineer. Revert the last commit ("${h.change}"); its effect could not be measured. Use a revert commit.`, { phase: 'Fix', label: `revert-unmeasured:${step}` })
    if (!undone) return { status: 'blocked', reason: `re-measuring "${h.change}" failed and its revert failed; revert it by hand before continuing`, baseline, current }
    measureFailed = true
    tried.push(`${h.cause}: measurement failed, reverted; loop stopped`)
    break
  }
  if (after.gpuP95Ms < current.gpuP95Ms) {
    kept.push(`${h.cause}: GPU p95 ${current.gpuP95Ms} -> ${after.gpuP95Ms} ms`)
    current = after
  } else {
    const reverted = await agent(`You are the metal-engineer. Revert the last commit ("${h.change}"); it did not improve GPU p95 time. Use a revert commit.`, { phase: 'Fix', label: `revert:${step}` })
    if (!reverted) return { status: 'blocked', reason: `"${h.change}" did not help and its revert failed; revert it by hand before continuing`, baseline, current: after }
    tried.push(`${h.cause}: no improvement, reverted`)
  }
}
if (ranked.length > 3) log(`only the top 3 of ${ranked.length} hypotheses were tried`)
const summary = `baseline GPU p95 ${baseline.gpuP95Ms} ms; now ${current.gpuP95Ms} ms; budget ${plan.budgetMs} ms\nkept:\n- ${kept.join('\n- ') || 'none'}\ntried:\n- ${tried.join('\n- ') || 'none'}\nrecord: ${current.record}`

phase('Docs')
const docs = await agent(
  `You are the metal-engineer. Document this investigation in the same PR. Planned pages: ${JSON.stringify(plan.docsPlan)}. Results:\n${summary}\nPer-pass times before: ${JSON.stringify(baseline.passes)}; after: ${JSON.stringify(current.passes)}.
${DOCS_FRAGMENT} Budgets, scenarios and per-pass results go in reference with the record fields; a trade-off decision goes in an explanation. Commit the docs on the same branch.`,
  { phase: 'Docs', label: 'docs' },
)
if (!docs) return { status: 'blocked', reason: 'docs missing (agent returned nothing); work is not done', summary }

phase('Docs check')
const check = await agent(
  `Independently review the docs pages touched by this GPU performance investigation, which you did not write. Read only; do not edit anything. Check: one Diataxis kind per page; nothing instructional in reference or explanation; how-to titles name a user goal and explanation titles read "About ..."; pages link to related pages of the other kinds; every number names its device, build and scenario. Docs report: ${docs}`,
  { schema: DOCCHECK, phase: 'Docs check', label: 'docs-check', independent: true },
)
const gaps = []
if (measureFailed) gaps.push('a re-measurement failed')
if (missingAreas.length) gaps.push(`diagnosers returned nothing: ${missingAreas.join(', ')}`)
if (!check) gaps.push('docs not verified (checker returned nothing)')
else if (!check.ok) gaps.push('docs problems: ' + (Array.isArray(check.problems) ? check.problems.join('; ') : 'unnamed'))
const status = current.gpuP95Ms > plan.budgetMs ? 'blocked: still over budget' : gaps.length ? 'unverified' : 'within budget'
return {
  status,
  summary,
  baseline,
  current,
  kept,
  tried,
  gaps,
  next: status === 'within budget'
    ? 'land the branch: /engineering-practices:land-pr { branch: "<the work branch>" }'
    : status === 'unverified'
      ? 'check the listed gaps by hand or rerun the steps that returned nothing, then land the branch'
      : 'renegotiate the budget with whoever owns it, or schedule the remaining causes',
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
