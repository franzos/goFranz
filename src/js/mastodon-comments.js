// Client-side blog comments sourced from replies to a Mastodon post.
// No backend, no auth: a post's `mastodon_id` front matter points at a public
// toot, and we render its reply thread. Every field from the API is untrusted —
// content HTML is allowlist-sanitized and every URL is scheme-checked before use.

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'A', 'SPAN', 'EM', 'STRONG', 'B', 'I', 'U', 'DEL',
  'UL', 'OL', 'LI', 'BLOCKQUOTE', 'CODE', 'PRE',
])
const ALLOWED_ATTRS = { A: ['href'], SPAN: ['class'] }

const MAX_COMMENTS = 200
const MAX_DEPTH = 6

// Returns a safe absolute http(s) URL, or null. `httpsOnly` rejects plain http.
function safeHttpUrl(value, httpsOnly) {
  if (!value) return null
  try {
    const url = new URL(value, location.href)
    if (url.protocol === 'https:' || (!httpsOnly && url.protocol === 'http:')) {
      return url.href
    }
  } catch (e) { /* not a parseable URL */ }
  return null
}

function sanitizeToFragment(html) {
  const template = document.createElement('template')
  template.innerHTML = html
  scrubNode(template.content)
  return template.content
}

function scrubNode(parent) {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) continue
    if (node.nodeType !== Node.ELEMENT_NODE) { node.remove(); continue }

    if (!ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(document.createTextNode(node.textContent))
      continue
    }

    const allowed = ALLOWED_ATTRS[node.tagName] || []
    for (const attr of Array.from(node.attributes)) {
      if (!allowed.includes(attr.name)) node.removeAttribute(attr.name)
    }
    if (node.tagName === 'A') {
      const href = safeHttpUrl(node.getAttribute('href'))
      if (href) {
        node.setAttribute('href', href)
        node.setAttribute('rel', 'nofollow noopener noreferrer')
        node.setAttribute('target', '_blank')
      } else {
        node.removeAttribute('href')
      }
    }
    scrubNode(node)
  }
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

function formatDate(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(d)
}

// An <a> when the URL is safe, otherwise an inert <span> with the same text.
function linkOrSpan(className, url, text) {
  const href = safeHttpUrl(url)
  const el = document.createElement(href ? 'a' : 'span')
  el.className = className
  el.textContent = text
  if (href) {
    el.href = href
    el.target = '_blank'
    el.rel = 'noopener noreferrer'
  }
  return el
}

function renderComment(status, depth) {
  if (!status || !status.account) return null
  const account = status.account

  const li = document.createElement('li')
  li.className = 'mc-comment'
  if (depth > 0) li.style.setProperty('--mc-depth', String(Math.min(depth, MAX_DEPTH)))

  const avatar = document.createElement('img')
  avatar.className = 'mc-avatar'
  const src = safeHttpUrl(account.avatar_static || account.avatar, true)
  if (src) avatar.src = src
  avatar.alt = ''
  avatar.loading = 'lazy'
  avatar.width = 42
  avatar.height = 42

  const body = document.createElement('div')
  body.className = 'mc-body'

  const head = document.createElement('div')
  head.className = 'mc-meta'

  const displayName = account.display_name || account.acct || account.username || 'Someone'
  head.appendChild(linkOrSpan('mc-name', account.url, displayName))

  if (account.acct) {
    const handle = document.createElement('span')
    handle.className = 'mc-handle'
    handle.textContent = `@${account.acct}`
    head.appendChild(handle)
  }

  const when = formatDate(status.created_at)
  if (when) head.appendChild(linkOrSpan('mc-when', status.url, when))

  const content = document.createElement('div')
  content.className = 'mc-content'
  content.appendChild(sanitizeToFragment(status.content || ''))

  body.append(head, content)

  if (status.favourites_count || status.reblogs_count) {
    const stats = document.createElement('div')
    stats.className = 'mc-stats'
    if (status.reblogs_count) stats.append(`↗ ${status.reblogs_count}`)
    if (status.favourites_count) stats.append(`★ ${status.favourites_count}`)
    body.appendChild(stats)
  }

  li.append(avatar, body)
  return li
}

// Distance from the root toot, so nested replies can be indented (0 = direct reply).
function depthOf(status, byId, rootId) {
  let depth = 0
  let current = status
  const seen = new Set()
  while (current && current.in_reply_to_id && current.in_reply_to_id !== rootId) {
    if (seen.has(current.id)) break
    seen.add(current.id)
    current = byId.get(current.in_reply_to_id)
    depth++
    if (depth > MAX_DEPTH) break
  }
  return depth
}

async function load(root) {
  const { instance, tootId } = root.dataset
  const list = root.querySelector('.mc-list')
  const status = root.querySelector('.mc-status')
  const button = root.querySelector('.mc-load')

  button.disabled = true
  status.hidden = false
  status.textContent = 'Loading…'

  try {
    const context = await fetchJson(
      `https://${instance}/api/v1/statuses/${tootId}/context`,
    )
    const replies = (context.descendants || []).filter((s) => s && s.id !== tootId)

    if (!replies.length) {
      status.textContent = 'No replies yet — be the first.'
      button.remove()
      return
    }

    const byId = new Map(replies.map((s) => [s.id, s]))
    const fragment = document.createDocumentFragment()
    for (const reply of replies.slice(0, MAX_COMMENTS)) {
      try {
        const node = renderComment(reply, depthOf(reply, byId, tootId))
        if (node) fragment.appendChild(node)
      } catch (e) { /* skip a malformed reply rather than dropping the thread */ }
    }
    list.appendChild(fragment)

    const total = replies.length
    let label = `${total} ${total === 1 ? 'reply' : 'replies'}`
    if (total > MAX_COMMENTS) label += ` · showing first ${MAX_COMMENTS}`
    status.textContent = label
    button.remove()
  } catch (err) {
    status.textContent = 'Could not load comments. Try the thread on Mastodon instead.'
    button.disabled = false
  }
}

function init() {
  const root = document.getElementById('mastodon-comments')
  if (!root) return
  const button = root.querySelector('.mc-load')
  if (button) button.addEventListener('click', () => load(root))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
