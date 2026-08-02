const scoring = require('./training-assessment/scoring.js')

const STORE_KEY = 'training-assessment'

function esc(s) {
  return String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function readData() {
  const el = document.getElementById('training-assessment-data')
  if (!el) return null
  try { return JSON.parse(el.textContent) } catch (e) { return null }
}

function loadState(version) {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { profile: {}, checks: {}, reset: false }
    const p = JSON.parse(raw)
    if (p && p.version === version) {
      return { profile: p.profile || {}, checks: p.checks || {}, reset: false }
    }
    return { profile: {}, checks: {}, reset: true }
  } catch (e) {
    return { profile: {}, checks: {}, reset: false }
  }
}

function saveState(version, profile, checks) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ version, profile, checks }))
  } catch (e) { /* private mode / quota — the check still works in-memory */ }
}

function profileHTML(data, profile) {
  const rows = data.profile.map(q => `<div class="ta-profile-q">
      <span>${esc(q.q)}</span>
      <span class="ta-toggle">
        <label><input type="radio" name="prof-${esc(q.id)}" data-prof="${esc(q.id)}" value="yes"${profile[q.id] === true ? ' checked' : ''}><span>Yes</span></label>
        <label><input type="radio" name="prof-${esc(q.id)}" data-prof="${esc(q.id)}" value="no"${profile[q.id] === false ? ' checked' : ''}><span>No</span></label>
      </span>
    </div>`).join('')
  return `<section class="ta-panel">
    <h3>1 · Your setup</h3>
    <p class="ta-panel-sub">Three questions so you're only scored on what applies to you.</p>
    ${rows}
  </section>`
}

function themeHTML(theme, checks) {
  const items = theme.items.map(item => `<div class="ta-item" data-item-row="${esc(item.id)}">
      <label><input type="checkbox" data-item="${esc(item.id)}"${checks[item.id] ? ' checked' : ''}><span>${esc(item.q)}</span></label>
      <details><summary>Why this matters</summary><p>${esc(item.note)}</p></details>
    </div>`).join('')
  return `<section class="ta-theme" data-theme-id="${esc(theme.id)}">
    <div class="ta-theme-head"><h4>${esc(theme.label)}</h4><span class="ta-na-badge">Not applicable</span></div>
    ${items}
  </section>`
}

function questionsHTML(data, checks) {
  return `<section class="ta-panel">
    <h3>2 · Where you're at</h3>
    <p class="ta-panel-sub">Tick what's genuinely true today, not what's on the roadmap. Nothing here is submitted unless you send the form.</p>
    ${data.themes.map(t => themeHTML(t, checks)).join('')}
  </section>`
}

function bar(t) {
  return `<div class="ta-bar">
    <div class="ta-bar-label"><span>${esc(t.label)}</span><span>${t.percent}% <small>(${t.checked}/${t.total})</small></span></div>
    <div class="ta-bar-track"><div class="ta-bar-fill" style="width:${t.percent}%"></div></div>
  </div>`
}

function resultsHTML(data, checks, naItems) {
  const score = scoring.computeScore(data, checks, naItems)
  if (score == null) {
    return `<section class="ta-panel"><h3>3 · The read</h3><p>Nothing applies with that setup. Adjust your answers above.</p></section>`
  }

  const b = scoring.band(score.percent)
  const gaps = scoring.computeGaps(data, checks, naItems)
  const bars = scoring.themeProgress(data, checks, naItems).map(bar).join('')

  const gapBlock = gaps.length
    ? `<div class="ta-gaps"><h4>What I'd want to fix first</h4>` + gaps.map(g =>
        `<h5>${esc(g.theme)}</h5><ul>${g.items.map(i => `<li>${esc(i.q)}</li>`).join('')}</ul>`
      ).join('') + `</div>`
    : `<p class="ta-nogaps">No gaps at all. Either you're in great shape or you're being generous with yourself.</p>`

  return `<section class="ta-panel">
    <h3>3 · The read</h3>
    <div class="ta-score"><b>${score.percent}%</b><span class="ta-band">${esc(b.label)}</span></div>
    <p class="ta-read">${esc(b.read)}</p>
    <p class="ta-disclaimer">Based on ${score.checked} of ${score.total} applicable points. It's a rough read, not a verdict.</p>
    ${bars}
    ${gapBlock}
  </section>`
}

function readProfileFromDom(root) {
  const profile = {}
  root.querySelectorAll('input[data-prof]:checked').forEach(el => {
    profile[el.getAttribute('data-prof')] = el.value === 'yes'
  })
  return profile
}

function readChecksFromDom(root) {
  const checks = {}
  root.querySelectorAll('input[data-item]').forEach(el => {
    if (el.checked) checks[el.getAttribute('data-item')] = true
  })
  return checks
}

function applyApplicability(root, naItems) {
  root.querySelectorAll('.ta-theme').forEach(sec => {
    const items = sec.querySelectorAll('.ta-item')
    let na = 0
    items.forEach(it => {
      const cb = it.querySelector('input[data-item]')
      const isNa = naItems.has(cb.getAttribute('data-item'))
      it.classList.toggle('is-na', isNa)
      cb.disabled = isNa
      if (isNa) na++
    })
    sec.classList.toggle('is-na', items.length > 0 && na === items.length)
  })
}

// Carry the result into the enquiry form so I get the same picture the visitor just saw.
function syncForm(data, checks, naItems, score) {
  const summary = document.querySelector('[name="readiness_summary"]')
  const detail = document.querySelector('[name="readiness_detail"]')
  if (!summary || !detail) return

  if (score == null) {
    summary.value = ''
    detail.value = ''
    return
  }

  summary.value = `${score.percent}% (${score.checked}/${score.total}) — ${scoring.band(score.percent).label}`
  const gaps = scoring.computeGaps(data, checks, naItems)
  detail.value = gaps.length
    ? gaps.map(g => `${g.theme}: ` + g.items.map(i => i.q).join(' | ')).join('\n')
    : 'No gaps reported.'
}

function init() {
  const root = document.getElementById('training-assessment')
  if (!root) return
  const data = readData()
  if (!data) { root.innerHTML = '<p>Could not load the readiness check.</p>'; return }

  const version = scoring.schemaVersion(data)
  const state = loadState(version)

  root.innerHTML = (state.reset
      ? `<div class="ta-reset">The questions changed since your last visit, so your previous answers were cleared.</div>`
      : '')
    + profileHTML(data, state.profile)
    + questionsHTML(data, state.checks)
    + `<div id="ta-results"></div>`

  const resultsEl = root.querySelector('#ta-results')

  function update() {
    const profile = readProfileFromDom(root)
    const naItems = scoring.resolveApplicability(data, profile)
    applyApplicability(root, naItems)
    const checks = readChecksFromDom(root)
    resultsEl.innerHTML = resultsHTML(data, checks, naItems)
    syncForm(data, checks, naItems, scoring.computeScore(data, checks, naItems))
    saveState(version, profile, checks)
  }

  root.addEventListener('change', e => {
    if (e.target.matches('input[data-prof], input[data-item]')) update()
  })

  update()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
