const scoring = require('./iso-assessment/scoring.js')

const STORE_KEY = 'iso-assessment'

function esc(s) {
  return String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function band(percent) {
  if (percent >= 85) return 'Audit-ready-ish'
  if (percent >= 60) return 'Foundations in place'
  if (percent >= 30) return 'Getting started'
  return 'Early days'
}

function readData() {
  const el = document.getElementById('assessment-data')
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
  } catch (e) { /* private mode / quota — assessment still works in-memory */ }
}

function profileHTML(data, profile) {
  const rows = data.profile.map(q => {
    const v = profile[q.id]
    return `<div class="ia-profile-q">
      <span>${esc(q.q)}</span>
      <span class="ia-toggle">
        <label><input type="radio" name="prof-${esc(q.id)}" data-prof="${esc(q.id)}" value="yes"${v === true ? ' checked' : ''}><span>Yes</span></label>
        <label><input type="radio" name="prof-${esc(q.id)}" data-prof="${esc(q.id)}" value="no"${v === false ? ' checked' : ''}><span>No</span></label>
      </span>
    </div>`
  }).join('')
  return `<section class="ia-panel">
    <h2>1 · Your profile</h2>
    <p class="ia-panel-sub">Answers mark whole areas Not Applicable, so you're only scored on what's relevant — like a Statement of Applicability.</p>
    ${rows}
  </section>`
}

function themeHTML(theme, checks) {
  const items = theme.items.map(item => {
    const controls = (item.controls || []).map(c => `<li>${esc(c)}</li>`).join('')
    return `<div class="ia-item">
      <label><input type="checkbox" data-item="${esc(item.id)}"${checks[item.id] ? ' checked' : ''}><span>${esc(item.q)}</span></label>
      <details><summary>Controls covered</summary><ul>${controls}</ul></details>
    </div>`
  }).join('')
  return `<section class="ia-theme" data-theme-id="${esc(theme.id)}" data-layer="${esc(theme.iso_layer)}">
    <div class="ia-theme-head"><h3>${esc(theme.label)}</h3><span class="ia-na-badge">Not applicable</span></div>
    ${items}
  </section>`
}

function controlsHTML(data, checks) {
  const opts = ['<option value="all">All areas</option>']
    .concat(data.themes.map(t => `<option value="${esc(t.id)}">${esc(t.label)}</option>`))
    .join('')
  const themes = data.themes.map(t => themeHTML(t, checks)).join('')
  return `<section class="ia-panel">
    <h2>2 · Work through the areas</h2>
    <p class="ia-panel-sub">Tick what you genuinely have in place. Expand any question to see the ISO controls it covers.</p>
    <div class="ia-toolbar">
      <label for="ia-filter">Filter:</label>
      <select id="ia-filter">${opts}</select>
    </div>
    ${themes}
  </section>`
}

function bar(t) {
  const pct = t.percent == null ? 0 : t.percent
  const label = t.percent == null ? 'n/a' : t.percent + '%'
  return `<div class="ia-bar">
    <div class="ia-bar-label"><span>${esc(t.label)}</span><span>${label} <small>(${t.checked}/${t.total})</small></span></div>
    <div class="ia-bar-track"><div class="ia-bar-fill" style="width:${pct}%"></div></div>
  </div>`
}

function resultsHTML(data, checks, naItems, aiUnlocked) {
  const core = scoring.computeScore(data, checks, naItems, '27001')
  const ai = scoring.computeScore(data, checks, naItems, '42001')
  const progress = scoring.themeProgress(data, checks, naItems)
  const gaps = scoring.computeGaps(data, checks, naItems)

  const scoreBlock = core == null
    ? `<p>No applicable controls — adjust your profile above.</p>`
    : `<div class="ia-score"><b>${core.percent}%</b><span class="ia-band">${esc(band(core.percent))}</span></div>
       <p class="ia-disclaimer">Rough self-assessment — not a certification. Based on ${core.checked}/${core.total} applicable items.</p>`

  const aiBlock = (aiUnlocked && ai != null)
    ? `<p class="ia-subscore"><b>AI governance (ISO 42001): ${ai.percent}%</b> — ${ai.checked}/${ai.total} items, scored separately from your 27001 result.</p>`
    : ''

  const bars = progress.map(bar).join('')

  const gapBlock = gaps.length
    ? `<div class="ia-gaps"><h3>Your gaps</h3>` + gaps.map(g =>
        `<h4>${esc(g.theme)}</h4><ul>${g.items.map(i => `<li>${esc(i.q)}</li>`).join('')}</ul>`
      ).join('') + `</div>`
    : `<p>No gaps in your applicable areas — nicely done.</p>`

  return `<section class="ia-panel">
    <h2>3 · Where you stand</h2>
    ${scoreBlock}
    ${aiBlock}
    ${bars}
    ${gapBlock}
    <div class="ia-cta">
      <p>Want help closing these gaps? I get teams to <em>aligned</em> — the state you need before certification.
      See <a href="/ai-security-review/">AI security review</a> and <a href="/ai-build/">AI build</a>.</p>
    </div>
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

// Mark N/A per item; a whole theme reads as N/A only when all its items are.
function applyApplicability(root, naItems) {
  root.querySelectorAll('.ia-theme').forEach(sec => {
    const items = sec.querySelectorAll('.ia-item')
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

// Keep the 42001 filter option in sync with the lock so it can't be selected into a blank panel.
function syncAiFilterOption(root, aiUnlocked) {
  const sel = root.querySelector('#ia-filter')
  if (!sel) return
  const opt = sel.querySelector('option[value="iso42001"]')
  if (opt) opt.disabled = !aiUnlocked
  if (!aiUnlocked && sel.value === 'iso42001') sel.value = 'all'
}

function currentFilter(root) {
  const sel = root.querySelector('#ia-filter')
  return sel ? sel.value : 'all'
}

// Single owner of `.is-hidden`: a theme is hidden by the filter, or because the
// 42001 layer is locked. Folding both here keeps them from clobbering each other.
function applyVisibility(root, filter, aiUnlocked) {
  root.querySelectorAll('.ia-theme').forEach(sec => {
    const id = sec.getAttribute('data-theme-id')
    const hiddenByFilter = filter !== 'all' && id !== filter
    const hiddenByLock = sec.getAttribute('data-layer') === '42001' && !aiUnlocked
    sec.classList.toggle('is-hidden', hiddenByFilter || hiddenByLock)
  })
}

function init() {
  const root = document.getElementById('iso-assessment')
  if (!root) return
  const data = readData()
  if (!data) { root.innerHTML = '<p>Could not load the assessment data.</p>'; return }

  const version = scoring.schemaVersion(data)
  const state = loadState(version)

  const resetNotice = state.reset
    ? `<div class="ia-reset">The assessment was updated since your last visit — your previous progress has been reset.</div>`
    : ''

  root.innerHTML = resetNotice
    + profileHTML(data, state.profile)
    + controlsHTML(data, state.checks)
    + `<div id="ia-results"></div>`

  const resultsEl = root.querySelector('#ia-results')

  function update() {
    const profile = readProfileFromDom(root)
    const { naItems, aiUnlocked } = scoring.resolveApplicability(data, profile)
    syncAiFilterOption(root, aiUnlocked)
    applyVisibility(root, currentFilter(root), aiUnlocked)
    applyApplicability(root, naItems)
    const checks = readChecksFromDom(root)
    resultsEl.innerHTML = resultsHTML(data, checks, naItems, aiUnlocked)
    saveState(version, profile, checks)
  }

  root.addEventListener('change', e => {
    if (e.target.id === 'ia-filter') {
      const { aiUnlocked } = scoring.resolveApplicability(data, readProfileFromDom(root))
      applyVisibility(root, e.target.value, aiUnlocked)
      return
    }
    if (e.target.matches('input[data-prof], input[data-item]')) update()
  })

  update()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
