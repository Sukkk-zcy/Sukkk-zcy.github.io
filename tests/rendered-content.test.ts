import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { parseFrontmatter } from '@astrojs/markdown-remark'
import { parse } from 'node-html-parser'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import remarkWikilinks from '../src/plugins/remark-wikilinks.ts'
import { buildWikilinkIndex } from '../src/utils/wikilink-map.ts'

const root = path.resolve('dist')
const index = buildWikilinkIndex()
const parser = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkWikilinks, { index })
const text = (node: any): string => node.value ?? (node.children ?? []).map(text).join('')
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()
const typography = (value: string) => normalize(value).replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
const rows: Record<string, unknown>[] = []
const sourceFiles = fs
  .readdirSync('src/content/blog', { recursive: true })
  .filter((file) => /\.mdx?$/.test(String(file)))
  .map(String)
  .sort()

assert.ok(fs.existsSync(path.join(root, 'index.html')), '请先运行 npm run build')

for (const file of sourceFiles) {
  const fullPath = path.resolve('src/content/blog', file)
  const { frontmatter, content } = parseFrontmatter(fs.readFileSync(fullPath, 'utf8'))
  if (frontmatter.draft) continue
  const slug =
    frontmatter.slug ??
    file
      .split(path.sep)
      .join('/')
      .replace(/\.mdx?$/, '')
      .toLowerCase()
  test(`文章渲染结构与源码一致：${file}`, async () => {
    const tree = await parser.run(parser.parse(content), { path: fullPath })
    const source: Record<string, any[]> = {
      table: [],
      mermaid: [],
      code: [],
      math: [],
      heading: [],
      image: [],
      wikilink: [],
      delete: [],
      task: []
    }
    visit(tree, (node: any) => {
      if (node.type === 'table') source.table.push(node)
      if (node.type === 'code') source[node.lang === 'mermaid' ? 'mermaid' : 'code'].push(node)
      if (node.type === 'math' || node.type === 'inlineMath') source.math.push(node)
      if (node.type === 'heading') source.heading.push(node)
      if (node.type === 'image') source.image.push(node)
      if (node.type === 'delete') source.delete.push(node)
      if (node.type === 'listItem' && typeof node.checked === 'boolean') source.task.push(node)
      if (node.type === 'link' && node.data?.hProperties?.['data-wikilink'])
        source.wikilink.push(node)
    })
    const page = parse(fs.readFileSync(path.join(root, 'blog', slug, 'index.html'), 'utf8'), {
      blockTextElements: { script: true, style: true }
    })
    const article = page.querySelector('#content')
    assert.ok(article, '缺少文章正文容器')
    const selectors = {
      table: 'table',
      mermaid: 'pre.mermaid',
      code: '.astro-code',
      math: '.katex',
      heading: 'h1, h2, h3, h4, h5, h6',
      image: 'img',
      wikilink: 'a[data-wikilink]',
      delete: 'del',
      task: 'input[type="checkbox"]'
    }
    const result: Record<string, unknown> = { file, slug }
    for (const [kind, selector] of Object.entries(selectors)) {
      const actual = article.querySelectorAll(selector)
      result[kind] = { expected: source[kind].length, actual: actual.length }
      // Components may add headings and images of their own; source content
      // must not disappear, but extra component markup is not a rendering error.
      if (kind === 'image' || kind === 'heading') {
        assert.ok(actual.length >= source[kind].length, `${kind} 丢失`)
      } else {
        assert.equal(actual.length, source[kind].length, `${kind} 数量与源码不符`)
      }
    }
    const tables = article.querySelectorAll('table')
    source.table.forEach((table, i) => {
      const expected = table.children.flatMap((row: any) => row.children.map(text)).map(typography)
      const actual = tables[i]
        .querySelectorAll('th, td')
        .map((cell) => typography(cell.textContent))
      assert.deepEqual(actual, expected, `表格 ${i + 1} 的单元格丢失或内容改变`)
      assert.ok(tables[i].parentNode?.classList.contains('overflow-x-auto'), '表格缺少横向滚动容器')
    })
    source.mermaid.forEach((node, i) => {
      assert.equal(
        article.querySelectorAll('pre.mermaid')[i].textContent.trim(),
        node.value.trim(),
        `Mermaid ${i + 1} 源码损坏`
      )
    })
    source.code.forEach((node, i) => {
      const block = article.querySelectorAll('.astro-code')[i]
      assert.equal(
        normalize(block.querySelector('code')?.textContent ?? ''),
        normalize(node.value),
        `代码块 ${i + 1} 内容丢失`
      )
      assert.ok(block.querySelector('code .line'), '代码块缺少 Shiki 行结构')
    })
    source.wikilink.forEach((node, i) => {
      const link = article.querySelectorAll('a[data-wikilink]')[i]
      assert.equal(link.getAttribute('href'), node.url, '双链目标不符')
    })
    assert.equal(article.querySelectorAll('.wikilink-broken').length, 0, '存在未解析双链')
    assert.equal(
      article.querySelectorAll('[data-language="mermaid"]').length,
      0,
      'Mermaid 被高亮成代码'
    )
    assert.equal(article.querySelectorAll('.katex-error').length, 0, '存在公式错误')
    for (const paragraph of article.querySelectorAll('p, td')) {
      // Ignore intentionally literal examples inside inline code.
      const visible = parse(paragraph.innerHTML.replace(/<code[\s\S]*?<\/code>/g, '')).textContent
      assert.ok(
        !/\*\*[^*\n]+\*\*|\[\[[^\]]+\]\]/.test(visible),
        `正文出现未渲染标记：${visible.slice(0, 160)}`
      )
    }
    rows.push(result)
  })
}

test('构建后全部 HTML 的站内链接、锚点与本地资源有效', () => {
  const files = fs
    .readdirSync(root, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.html'))
  const cache = new Map<string, ReturnType<typeof parse>>()
  const documentAt = (file: string) => {
    if (!cache.has(file)) cache.set(file, parse(fs.readFileSync(file, 'utf8')))
    return cache.get(file)!
  }
  const errors = new Set<string>()
  let checked = 0
  for (const file of files) {
    const full = path.join(root, file)
    const page = documentAt(full)
    const base = new URL(
      '/' +
        file
          .split(path.sep)
          .join('/')
          .replace(/index\.html$/, ''),
      'https://sukkk-zcy.github.io'
    )
    for (const element of page.querySelectorAll('[href], [src]')) {
      const raw = element.getAttribute('href') ?? element.getAttribute('src')
      if (!raw || /^(?:data:|mailto:|tel:|javascript:)/i.test(raw)) continue
      const url = new URL(raw, base)
      if (url.origin !== base.origin) continue
      const target = path.join(root, decodeURIComponent(url.pathname))
      let resolved = target
      if (fs.existsSync(target) && fs.statSync(target).isDirectory())
        resolved = path.join(target, 'index.html')
      else if (!fs.existsSync(target) && !path.extname(target)) {
        resolved = fs.existsSync(`${target}.html`)
          ? `${target}.html`
          : path.join(target, 'index.html')
      }
      checked++
      if (!fs.existsSync(resolved)) {
        errors.add(`${file}: ${raw}（目标不存在）`)
        continue
      }
      if (url.hash && resolved.endsWith('.html')) {
        const id = decodeURIComponent(url.hash.slice(1))
        // KnowledgeGraph.astro intercepts this application route to open a
        // dialog; it is not an ordinary document fragment.
        const targetPage = documentAt(resolved)
        if (
          id.startsWith('knowledge-graph') &&
          targetPage.querySelector('[data-knowledge-graph-dialog]')
        )
          continue
        if (id && !targetPage.querySelectorAll('[id]').some((node) => node.id === id)) {
          errors.add(`${file}: ${raw}（锚点不存在）`)
        }
      }
    }
  }
  console.log(`已检查 ${files.length} 个 HTML、${checked} 处站内链接/资源引用`)
  assert.deepEqual([...errors], [], '发现无效站内链接或资源')
})

test.after(() => {
  if (process.env.RENDER_AUDIT_REPORT) {
    fs.writeFileSync(
      process.env.RENDER_AUDIT_REPORT,
      JSON.stringify({ checkedAt: new Date().toISOString(), rows }, null, 2)
    )
  }
})
