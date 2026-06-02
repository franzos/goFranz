const test = require('node:test')
const assert = require('node:assert/strict')
const s = require('./scoring.js')

const DATA = {
  profile: [
    { id: 'employees', q: 'Staff?' },
    { id: 'cloud', q: 'Cloud?' },
    { id: 'ai', q: 'AI?', unlocks: 'iso42001' },
  ],
  themes: [
    { id: 'management', iso_layer: '27001', label: 'Mgmt', items: [
      { id: 'm1', q: 'q', controls: ['Clause 6.1.2'] },
      { id: 'm2', q: 'q', controls: ['A.5.1'] },
    ] },
    { id: 'people', iso_layer: '27001', label: 'People', items: [
      { id: 'p-staff', q: 'q', na_if_no: 'employees', controls: ['A.6.1'] },
      { id: 'p-nda', q: 'q', controls: ['A.6.6'] },
    ] },
    { id: 'iso42001', iso_layer: '42001', label: 'AI', items: [
      { id: 'ai1', q: 'q', controls: ['Impact assessment'] },
    ] },
  ],
}

test('schemaVersion is stable for same ids and changes when ids change', () => {
  const v1 = s.schemaVersion(DATA)
  assert.equal(s.schemaVersion(JSON.parse(JSON.stringify(DATA))), v1)
  const mutated = JSON.parse(JSON.stringify(DATA))
  mutated.themes[0].items.push({ id: 'm3', q: 'q', controls: ['A.5.2'] })
  assert.notEqual(s.schemaVersion(mutated), v1)
})

test('resolveApplicability marks only the gated item N/A on "no", not the whole theme', () => {
  const r = s.resolveApplicability(DATA, { employees: false, ai: false })
  assert.equal(r.naItems.has('p-staff'), true)   // gated by employees
  assert.equal(r.naItems.has('p-nda'), false)    // universal — survives the gate
  assert.equal(r.naItems.has('ai1'), true)       // 42001 locked
  assert.equal(r.aiUnlocked, false)
})

test('resolveApplicability unlocks 42001 when AI is yes', () => {
  const r = s.resolveApplicability(DATA, { ai: true })
  assert.equal(r.naItems.has('ai1'), false)
  assert.equal(r.aiUnlocked, true)
})

test('unanswered gate question leaves the item applicable (strict === false)', () => {
  const r = s.resolveApplicability(DATA, {})
  assert.equal(r.naItems.has('p-staff'), false)
})

test('computeScore counts only applicable items of the layer', () => {
  const { naItems } = s.resolveApplicability(DATA, { employees: false, ai: false })
  // applicable 27001 items: m1, m2, p-nda (p-staff N/A) = 3; checked = 1
  assert.deepEqual(s.computeScore(DATA, { m1: true }, naItems, '27001'), { checked: 1, total: 3, percent: 33 })
})

test('a check left on a now-N/A item does not inflate the score', () => {
  const { naItems } = s.resolveApplicability(DATA, { employees: false, ai: false })
  assert.deepEqual(s.computeScore(DATA, { m1: true, 'p-staff': true }, naItems, '27001'), { checked: 1, total: 3, percent: 33 })
})

test('computeScore returns null when no applicable items (no divide-by-zero)', () => {
  const { naItems } = s.resolveApplicability(DATA, { ai: false })
  assert.equal(s.computeScore(DATA, {}, naItems, '42001'), null)
})

test('computeGaps groups unchecked applicable items by theme, skips N/A items', () => {
  const { naItems } = s.resolveApplicability(DATA, { employees: false, ai: false })
  const gaps = s.computeGaps(DATA, { m1: true }, naItems)
  assert.deepEqual(gaps.map(g => g.theme), ['Mgmt', 'People'])
  assert.deepEqual(gaps[0].items.map(i => i.id), ['m2'])
  assert.deepEqual(gaps[1].items.map(i => i.id), ['p-nda']) // p-staff excluded (N/A)
})

test('themeProgress omits a theme whose items are all N/A', () => {
  const { naItems } = s.resolveApplicability(DATA, { ai: false })
  const prog = s.themeProgress(DATA, { m1: true, m2: true }, naItems)
  assert.equal(prog.find(t => t.id === 'iso42001'), undefined) // 42001 locked → omitted
  const mgmt = prog.find(t => t.id === 'management')
  assert.deepEqual({ checked: mgmt.checked, total: mgmt.total, percent: mgmt.percent }, { checked: 2, total: 2, percent: 100 })
})
