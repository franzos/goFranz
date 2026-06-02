// Pure assessment logic — no DOM. Runnable under `node --test` and bundled by esbuild.

function collectItemIds(data) {
  const ids = []
  for (const theme of data.themes) for (const item of theme.items) ids.push(item.id)
  return ids
}

// FNV-1a over the sorted item ids: the localStorage version, so reworded questions don't reset saved progress.
function schemaVersion(data) {
  const str = collectItemIds(data).sort().join('|')
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16)
}

// Applicability is per-item: an item is N/A if its `na_if_no` profile answer is "no",
// or if it belongs to the 42001 layer and AI isn't unlocked. Returns the set of N/A
// item ids so universally-applicable controls survive a profile gate.
function resolveApplicability(data, profile) {
  const naItems = new Set()
  let aiUnlocked = false
  for (const q of data.profile) {
    if (q.unlocks && profile[q.id] === true) aiUnlocked = true
  }
  for (const theme of data.themes) {
    const locked = theme.iso_layer === '42001' && !aiUnlocked
    for (const item of theme.items) {
      if (locked || (item.na_if_no && profile[item.na_if_no] === false)) naItems.add(item.id)
    }
  }
  return { naItems, aiUnlocked }
}

// Score for one ISO layer ('27001' | '42001'). null when no applicable items.
function computeScore(data, checks, naItems, layer) {
  let total = 0, checked = 0
  for (const theme of data.themes) {
    if (theme.iso_layer !== layer) continue
    for (const item of theme.items) {
      if (naItems.has(item.id)) continue
      total++
      if (checks[item.id]) checked++
    }
  }
  if (total === 0) return null
  return { checked, total, percent: Math.round((checked / total) * 100) }
}

// Per-theme progress over applicable items only. Themes with no applicable items are omitted.
function themeProgress(data, checks, naItems) {
  const out = []
  for (const theme of data.themes) {
    const applicable = theme.items.filter(i => !naItems.has(i.id))
    if (applicable.length === 0) continue
    const checked = applicable.filter(i => checks[i.id]).length
    out.push({ id: theme.id, label: theme.label, layer: theme.iso_layer,
      checked, total: applicable.length, percent: Math.round((checked / applicable.length) * 100) })
  }
  return out
}

// Unchecked applicable items, grouped by theme in document order.
function computeGaps(data, checks, naItems) {
  const groups = []
  for (const theme of data.themes) {
    const items = theme.items.filter(i => !naItems.has(i.id) && !checks[i.id])
    if (items.length) groups.push({ themeId: theme.id, theme: theme.label, items })
  }
  return groups
}

module.exports = {
  collectItemIds, schemaVersion, resolveApplicability,
  computeScore, themeProgress, computeGaps,
}
