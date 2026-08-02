// Pure readiness logic — no DOM. Runnable under `node --test` and bundled by esbuild.

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

// An item is N/A when its `na_if_no` profile question was answered "no". Unanswered
// profile questions leave everything applicable, so a blank form still scores.
function resolveApplicability(data, profile) {
  const naItems = new Set()
  for (const theme of data.themes) {
    for (const item of theme.items) {
      if (item.na_if_no && profile[item.na_if_no] === false) naItems.add(item.id)
    }
  }
  return naItems
}

// null when the profile ruled out every item.
function computeScore(data, checks, naItems) {
  let total = 0, checked = 0
  for (const theme of data.themes) {
    for (const item of theme.items) {
      if (naItems.has(item.id)) continue
      total++
      if (checks[item.id]) checked++
    }
  }
  if (total === 0) return null
  return { checked, total, percent: Math.round((checked / total) * 100) }
}

// Per-theme progress over applicable items only. Themes with nothing applicable are omitted.
function themeProgress(data, checks, naItems) {
  const out = []
  for (const theme of data.themes) {
    const applicable = theme.items.filter(i => !naItems.has(i.id))
    if (applicable.length === 0) continue
    const checked = applicable.filter(i => checks[i.id]).length
    out.push({
      id: theme.id, label: theme.label, checked, total: applicable.length,
      percent: Math.round((checked / applicable.length) * 100),
    })
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

function band(percent) {
  if (percent >= 85) return {
    label: 'You may not need me',
    read: "You're further along than most teams who ask. Talk to me anyway if you want the agent-building half, but be honest with yourself about whether a workshop is the missing piece.",
  }
  if (percent >= 60) return {
    label: 'Ready to build',
    read: "The foundations are there. The value for you is in day two: picking real workflows and building agents that survive contact with your stack.",
  }
  if (percent >= 45) return {
    label: 'Uneven',
    read: "Some people are flying and most aren't, which is the most common shape. Two days is the right size: one to level the room, one to build.",
  }
  return {
    label: 'Cold start',
    read: "Plenty of enthusiasm, not much scaffolding. That's fine, it's where most teams are, but expect the first day to go on the basics rather than on agents.",
  }
}

module.exports = {
  collectItemIds, schemaVersion, resolveApplicability,
  computeScore, themeProgress, computeGaps, band,
}
