import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { createMarkdownProcessor } from '@astrojs/markdown-remark'
import { compile, nodeTypes } from '@mdx-js/mdx'
import { parse } from 'node-html-parser'
import rehypeRaw from 'rehype-raw'

import { createMarkdownPlugins } from '../src/plugins/markdown-config.ts'
import { buildWikilinkIndex } from '../src/utils/wikilink-map.ts'

const plugins = createMarkdownPlugins(buildWikilinkIndex())
const source = [
  '| 项目 | 值 |',
  '| :--- | ---: |',
  '| **粗体** | `a\\|b` |',
  '',
  '~~删除线~~',
  '',
  '- [x] 已完成',
  '- [ ] 待处理',
  '',
  '$x^2$',
  '',
  '$$',
  '\\frac{1}{2}',
  '$$',
  '',
  '[[sdn-01-sdn-introduction|SDN 入门]]',
  '',
  '## 中文标题',
  '',
  '```mermaid',
  'flowchart LR',
  'A["<b>输入</b>"] --> B{判断}',
  '```',
  '',
  '```js',
  'const answer = 42',
  '```'
].join('\n')

// Deliberately omit gfm: the affected MDX integration passes undefined from
// Astro 6.4's optional top-level setting. The shared plugins must still work.
test('MDX 在没有隐式 gfm 默认值时仍编译表格、删除线和任务清单', async () => {
  const result = String(
    await compile(source, {
      remarkPlugins: plugins.remarkPlugins,
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }], ...plugins.rehypePlugins]
    })
  )
  assert.match(result, /table:/)
  assert.match(result, /thead:/)
  assert.match(result, /del:/)
  assert.match(result, /type: "checkbox"/)
  assert.match(result, /checked: true/)
})

test('MDX 的公式、双链、标题锚点和 Mermaid 转换保留', async () => {
  const result = String(
    await compile(source, {
      remarkPlugins: plugins.remarkPlugins,
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }], ...plugins.rehypePlugins]
    })
  )
  assert.match(result, /katex-display/)
  assert.match(result, /className: "katex"/)
  assert.match(result, /href: "\/blog\/sdn\/sdn-01-sdn-introduction"/)
  assert.match(result, /href: "#中文标题"/)
  assert.match(result, /className: "mermaid"/)
  assert.match(result, /B\{判断\}/)
  assert.doesNotMatch(result, /className: "language-mermaid"/)
})

test('Markdown 同样生成 GFM、公式、图表与 Shiki 高亮结构', async () => {
  const renderer = await createMarkdownProcessor(plugins)
  const { code } = await renderer.render(source)
  assert.match(code, /<table>/)
  assert.match(code, /<del>删除线<\/del>/)
  assert.match(code, /type="checkbox"/)
  assert.match(code, /class="katex-display"/)
  assert.match(code, /<pre class="mermaid">/)
  assert.equal(
    parse(code).querySelector('pre.mermaid')?.textContent,
    'flowchart LR\nA["<b>输入</b>"] --> B{判断}'
  )
  assert.equal(parse(code).querySelector('td code')?.textContent, 'a|b')
  assert.match(code, /href="\/blog\/sdn\/sdn-01-sdn-introduction"/)
  assert.match(code, /class="astro-code/)
})

test('表格中未转义的双链别名分隔符不会拆列或截断正文', async () => {
  const fixture = [
    '| 类型 | 内容 | 状态 |',
    '| --- | --- | --- |',
    '| 预告 | 见 [[sdn-01-sdn-introduction|SDN 入门]]，再读 [[sdn-02-architecture-deep-dive|三层架构]] | 正常 |',
    '| 代码 | `a\\|b` | 保留 |',
    '| 已转义 | [[sdn-01-sdn-introduction\\|SDN]] | 正常 |'
  ].join('\n')
  const renderer = await createMarkdownProcessor(plugins)
  const { code } = await renderer.render(fixture)
  const document = parse(code)
  const rows = document.querySelectorAll('tbody tr')
  assert.deepEqual(
    rows.map((row) => row.querySelectorAll('td').length),
    [3, 3, 3]
  )
  assert.deepEqual(
    document.querySelectorAll('td a').map((link) => link.textContent),
    ['SDN 入门', '三层架构', 'SDN']
  )
  assert.equal(document.querySelector('td code')?.textContent, 'a|b')
  assert.equal(document.querySelectorAll('td').at(-1)?.textContent, '正常')
  const mdx = String(
    await compile(fixture, {
      remarkPlugins: plugins.remarkPlugins,
      rehypePlugins: plugins.rehypePlugins
    })
  )
  assert.ok(mdx.includes('href: "/blog/sdn/sdn-02-architecture-deep-dive"'))
  assert.ok(!mdx.includes('[[sdn-'))
})

test('Astro 的 Markdown 与 MDX 配置都接入相同插件', () => {
  const config = fs.readFileSync(new URL('../astro.config.ts', import.meta.url), 'utf8')
  assert.match(config, /createMarkdownPlugins\(wikilinkIndex\)/)
  assert.match(config, /processor: unified\(\{[\s\S]*?remarkPlugins: markdownRemarkPlugins/)
  assert.equal((config.match(/^\s+remarkPlugins: markdownRemarkPlugins/gm) ?? []).length, 2)
})
