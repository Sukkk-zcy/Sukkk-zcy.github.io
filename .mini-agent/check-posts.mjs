// 临时审查脚本：扫描博客文章 frontmatter 规范性与 wikilink 有效性
import fs from 'node:fs'
import path from 'node:path'

const blogRoot = path.resolve('src/content/blog')
const files = []
;(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(md|mdx)$/.test(entry.name)) files.push(full)
  }
})(blogRoot)

// 解析简易 frontmatter（引号包裹的值）
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (!kv) continue
    let val = kv[2].trim()
    if (val.startsWith('[')) {
      try {
        fm[kv[1]] = JSON.parse(val.replace(/'/g, '"'))
      } catch {
        fm[kv[1]] = val
      }
    } else if (val.startsWith("'") || val.startsWith('"')) {
      fm[kv[1]] = val.slice(1, -1)
    } else {
      fm[kv[1]] = val
    }
  }
  return { fm, body: content.slice(m[0][0].length) }
}

const WIKI_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
const problems = []
const slugs = new Set()
const allPosts = []

for (const file of files) {
  const rel = path.relative(blogRoot, file).replace(/\\/g, '/')
  const dir = path.dirname(rel)
  const content = fs.readFileSync(file, 'utf-8')
  const parsed = parseFrontmatter(content)
  if (!parsed) {
    problems.push(`[${rel}] 缺少 frontmatter`)
    continue
  }
  const { fm, body } = parsed

  // slug 计算（与 content-paths.ts 一致）
  const idNoExt = rel.replace(/\.(md|mdx)$/, '')
  const canonical = fm.slug || idNoExt.toLowerCase()
  slugs.add(canonical)

  allPosts.push({ rel, dir, fm, body, canonical, idNoExt })

  // title 长度
  if (fm.title && fm.title.length > 60) problems.push(`[${rel}] title 超长(${fm.title.length}>60): ${fm.title}`)
  // description 长度
  if (fm.description && fm.description.length > 160) problems.push(`[${rel}] description 超长(${fm.description.length}>160)`)
  // 必填字段
  for (const key of ['title', 'description', 'publishDate']) {
    if (fm[key] === undefined) problems.push(`[${rel}] 缺少必填字段: ${key}`)
  }
  // categories 与目录匹配
  const cats = Array.isArray(fm.categories) ? fm.categories : []
  const dirName = dir === '.' ? '' : dir
  if (dirName && !cats.includes(dirName)) {
    problems.push(`[${rel}] categories(${cats.join(',')}) 与目录(${dirName})不匹配`)
  }
  if (cats.length > 1) problems.push(`[${rel}] categories 多于一个: ${cats.join(',')}`)
  // publishDate 格式与年份
  if (fm.publishDate) {
    const d = new Date(fm.publishDate)
    if (isNaN(d.getTime())) problems.push(`[${rel}] publishDate 无效: ${fm.publishDate}`)
    else if (d.getFullYear() > 2025) problems.push(`[${rel}] publishDate 年份可疑(${d.getFullYear()}): ${fm.publishDate}`)
  }
  // updatedDate 早于 publishDate
  if (fm.publishDate && fm.updatedDate) {
    const p = new Date(fm.publishDate)
    const u = new Date(fm.updatedDate)
    if (u < p) problems.push(`[${rel}] updatedDate(${fm.updatedDate}) 早于 publishDate(${fm.publishDate})`)
  }
  // tags 含大写异常（小写化后再检查知名缩写）
  const knownAcro = ['sdn', 'p4', 'ddos', 'esp32', 'vm', 'ai']
  if (Array.isArray(fm.tags)) {
    for (const tag of fm.tags) {
      if (tag !== tag.trim()) problems.push(`[${rel}] tag 含首尾空格: "${tag}"`)
    }
  }
  // 图片引用存在性
  const imgRefs = [...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1])
  for (const ref of imgRefs) {
    if (ref.startsWith('http') || ref.startsWith('/')) continue
    const resolved = path.resolve(path.dirname(file), ref)
    if (!fs.existsSync(resolved)) problems.push(`[${rel}] 图片不存在: ${ref}`)
  }
}

// wikilink 检查
for (const post of allPosts) {
  const matches = [...post.body.matchAll(WIKI_RE)]
  for (const m of matches) {
    let target = m[1].trim().replace(/\.(md|mdx)$/, '')
    const isRel = target.startsWith('./') || target.startsWith('../')
    if (isRel) continue
    const norm = target.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-/]/g, '')
    const full = norm.startsWith('blog/') || norm.startsWith('docs/') ? norm : `blog/${norm}`
    if (!slugs.has(norm) && !slugs.has(full)) {
      problems.push(`[${post.rel}] 无效 wikilink: [[${m[1]}]]`)
    }
  }
}

// 重复 slug
const slugCount = new Map()
for (const s of slugs) slugCount.set(s, (slugCount.get(s) || 0) + 1)
for (const [s, c] of slugCount) if (c > 1) problems.push(`重复 slug: ${s} (${c} 篇)`)

console.log('=== 文章统计 ===')
console.log(`共 ${allPosts.length} 篇`)
console.log('')
if (problems.length === 0) {
  console.log('✓ 未发现问题')
} else {
  console.log(`=== 发现 ${problems.length} 个问题 ===`)
  for (const p of problems) console.log('• ' + p)
}
