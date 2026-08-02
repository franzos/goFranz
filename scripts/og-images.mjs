// Renders a 1200x630 share card per post, matching assets/images/og-default.png.
// Output lands in assets/images/og/<slug>.png; _plugins/og_image.rb points each
// post's og:image at its card when one exists.
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import matter from 'gray-matter'
import { readFileSync, writeFileSync, mkdirSync, statSync, readdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = join(root, '_posts')
const outDir = join(root, 'assets/images/og')
const force = process.argv.includes('--force')

// Filament tokens, sampled from og-default.png
const bg = '#f6f2ea'
const ink = '#1a1611'
const amber = '#b4621f'
const rule = '#e2a55f'
const muted = '#8a7f6c'

// Build-only faces: the site ships 900 as a woff2 variable font that no rasteriser
// reads, and the shipped mono TTF crashes satori's shaper. src/fonts holds a static
// wght=900 instance and a mono copy with its layout tables stripped.
const fonts = [
  { name: 'Overpass', data: readFileSync(join(root, 'src/fonts/overpass-900.ttf')), weight: 900, style: 'normal' },
  { name: 'Overpass Mono', data: readFileSync(join(root, 'src/fonts/overpass-mono.ttf')), weight: 400, style: 'normal' },
]

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function findPosts(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.name.startsWith('.')) return [] // hidden drafts Jekyll ignores too
    if (entry.isDirectory()) return findPosts(full)
    return entry.name.endsWith('.md') ? [full] : []
  })
}

function slugOf(file) {
  return basename(file, '.md').replace(/^\d{4}-\d{1,2}-\d{1,2}-/, '')
}

function eyebrowOf(data, file) {
  const category = [].concat(data.category || data.categories || []).filter(Boolean)[0]
  const stamp = basename(file).match(/^(\d{4})-(\d{1,2})-(\d{1,2})-/)
  const date = stamp ? `${Number(stamp[3])} ${MONTHS[Number(stamp[2]) - 1]} ${stamp[1]}` : null
  return [category, date].filter(Boolean).join('  ·  ').toUpperCase()
}

// Overpass 900 is wide; these sizes keep a title inside three lines at 1024px.
function titleSize(title) {
  if (title.length <= 24) return 92
  if (title.length <= 40) return 78
  if (title.length <= 62) return 64
  return 54
}

function card(title, eyebrow) {
  const text = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } })
  return text(
    {
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '1200px',
      height: '630px',
      backgroundColor: bg,
      padding: '92px 88px 76px 88px',
    },
    [
      text({ fontFamily: 'Overpass Mono', fontSize: 24, letterSpacing: '0.16em', color: amber }, eyebrow),
      text({ flexDirection: 'column' }, [
        text(
          { fontFamily: 'Overpass', fontWeight: 900, fontSize: titleSize(title), lineHeight: 1.08, letterSpacing: '-0.02em', color: ink },
          title,
        ),
        { type: 'div', props: { style: { width: '160px', height: '10px', marginTop: '44px', backgroundColor: rule } } },
      ]),
      text({ fontFamily: 'Overpass Mono', fontSize: 22, color: muted }, 'gofranz.com  //  Franz Geffke'),
    ],
  )
}

async function render(title, eyebrow) {
  const svg = await satori(card(title, eyebrow), { width: 1200, height: 630, fonts })
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
}

const selfMtime = statSync(fileURLToPath(import.meta.url)).mtimeMs
mkdirSync(outDir, { recursive: true })

let written = 0
for (const file of findPosts(postsDir)) {
  const out = join(outDir, `${slugOf(file)}.png`)
  if (!force) {
    try {
      const existing = statSync(out).mtimeMs
      if (existing > statSync(file).mtimeMs && existing > selfMtime) continue
    } catch {
      // no card yet
    }
  }
  const { data } = matter(readFileSync(file, 'utf8'))
  if (!data.title) continue
  writeFileSync(out, await render(String(data.title), eyebrowOf(data, file)))
  written += 1
}

console.log(written ? `✅ OG cards rendered (${written})` : '✅ OG cards up to date')
