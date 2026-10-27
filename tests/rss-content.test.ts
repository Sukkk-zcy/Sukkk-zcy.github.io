import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getRssString } from '@astrojs/rss'

import { renderRssContent, resolveRssImagePath } from '../src/utils/rss-content.ts'
import type { WikilinkIndex } from '../src/utils/wikilink-map.ts'

const postUrl = new URL('https://example.com/blog/devtools/current')
const wikilinkIndex: WikilinkIndex = {
  byFullId: new Map([['sdn/target', '/blog/sdn/target']]),
  byBasename: new Map([['target', '/blog/sdn/target']])
}

function render(body: string, extra: Partial<Parameters<typeof renderRssContent>[0]> = {}) {
  return renderRssContent({
    body,
    filePath: 'src/content/blog/Devtools/current.mdx',
    postUrl,
    wikilinkIndex,
    ...extra
  })
}

test('MDX imports, exports and expressions are removed without executing JavaScript', async () => {
  const html = await render(`import missing from 'module-that-must-not-be-loaded'
export const secret = 'SECRET_EXPORT'

<Aside title={(() => { throw new Error('NO_ATTRIBUTE_EXECUTION') })()}>

Useful **children** and {(() => { throw new Error('NO_INLINE_EXECUTION') })()} text.

<Nested>Nested readable child.</Nested>

</Aside>

{(() => { throw new Error('NO_FLOW_EXECUTION') })()}

<script>DO_NOT_KEEP_SCRIPT</script>

<style>DO_NOT_KEEP_STYLE</style>

\`\`\`js
import example from 'keep-this-code'
const result = { value: 1 }
\`\`\``)

  assert.match(html, /Useful <strong>children<\/strong>/)
  assert.match(html, /Nested readable child/)
  assert.match(html, /import example from 'keep-this-code'/)
  assert.match(html, /const result = \{ value: 1 \}/)
  assert.doesNotMatch(html, /SECRET_EXPORT|NO_\w+_EXECUTION|DO_NOT_KEEP|module-that|<Aside|<Nested/)
})

test('wikilinks resolve through the shared index including Chinese anchors', async () => {
  const html = await render('[[target#中文 标题|中文链接]] and [[sdn/target]]')
  assert.match(
    html,
    /href="https:\/\/example.com\/blog\/sdn\/target#%E4%B8%AD%E6%96%87-%E6%A0%87%E9%A2%98"/
  )
  assert.match(html, />中文链接<\/a>/)
  assert.match(html, /href="https:\/\/example.com\/blog\/sdn\/target"/)
  assert.doesNotMatch(html, /\[\[/)
})

test('GFM tables and strikethrough render as HTML', async () => {
  const html = await render('| Feature | State |\n| --- | --- |\n| RSS | ~~broken~~ fixed |')
  assert.match(html, /<table>/)
  assert.match(html, /<th>Feature<\/th>/)
  assert.match(html, /<td><del>broken<\/del> fixed<\/td>/)
})

test('relative, root-relative, fragment and external links become safe absolute URLs', async () => {
  const html = await render(`[relative](./next?x=1&y=2)
[root](/about)
[anchor](#中文)
[up](../other)
[external](https://other.example/x)
[protocol-relative](//cdn.example/x)
[email](mailto:hello@example.com)
[reference][ref]

[ref]: ./reference#heading`)
  for (const expected of [
    'https://example.com/blog/devtools/next?x=1&#x26;y=2',
    'https://example.com/about',
    'https://example.com/blog/devtools/current#%E4%B8%AD%E6%96%87',
    'https://example.com/blog/other',
    'https://other.example/x',
    'https://cdn.example/x',
    'mailto:hello@example.com',
    'https://example.com/blog/devtools/reference#heading'
  ]) {
    assert.ok(html.includes(`href="${expected}"`), expected)
  }
})

test('Markdown and static MDX images and links share URL and image transformations', async () => {
  const seen: string[] = []
  const html = await render(
    `![local](./fig.png)
![root](/images/root.png)
![remote](https://cdn.example/remote.png)
![protocol](//cdn.example/protocol.png)
![reference][pic]

[pic]: ../shared.png

<img src="./jsx.png" alt="JSX image" onerror="bad()" />

<a href="./jsx-target" onClick={() => { throw new Error('DO_NOT_RUN') }}>JSX link</a>

<img src={dangerousExpression} alt="dynamic source" />`,
    {
      resolveImage: async (url) => {
        seen.push(url)
        return url === './fig.png' || url === './jsx.png' ? '/_astro/optimized.png' : undefined
      }
    }
  )
  assert.equal((html.match(/src="https:\/\/example.com\/_astro\/optimized.png"/g) ?? []).length, 2)
  assert.match(html, /src="https:\/\/example.com\/images\/root.png"/)
  assert.match(html, /src="https:\/\/cdn.example\/remote.png"/)
  assert.match(html, /src="https:\/\/cdn.example\/protocol.png"/)
  assert.match(html, /src="https:\/\/example.com\/blog\/shared.png"/)
  assert.match(html, /href="https:\/\/example.com\/blog\/devtools\/jsx-target"/)
  assert.ok(seen.includes('../shared.png'))
  assert.doesNotMatch(html, /onerror|onClick|DO_NOT_RUN|dangerousExpression/)
})

test('dangerous and non-image URL schemes are stripped, including obfuscated JSX URLs', async () => {
  const html = await render(`[bad](javascript:alert%281%29)
![bad](data:image/png;base64,AAAA)
![not-image](mailto:hello@example.com)

<a href="java&#x09;script:alert(1)">Obfuscated</a>

<img src="vbscript:bad" />`)
  assert.doesNotMatch(html, /(?:href|src)="(?:javascript|data|mailto|vbscript):/i)
  assert.doesNotMatch(html, /(?:href|src)="java/i)
  assert.match(html, />bad<\/a>/)
  assert.match(html, />Obfuscated<\/a>/)
})

test('hero image is serialized as escaped HTML in RSS content, never hand-built XML', async () => {
  const html = await render('Body', {
    heroImage: { url: '/hero.png?x=1&y=2', alt: 'A "quote" & <tag>' }
  })
  assert.match(html, /src="https:\/\/example.com\/hero.png\?x=1&#x26;y=2"/)
  assert.match(html, /alt="A &#x22;quote&#x22; &#x26; <tag>"/)
  assert.match(html, /Body/)
  assert.doesNotMatch(html, /<enclosure|<h:img/)
  const xml = await getRssString({
    title: 'Test RSS',
    description: 'RSS test',
    site: 'https://example.com',
    items: [{ title: 'Article', link: postUrl.href, content: html }]
  })
  assert.match(xml, /<content:encoded>/)
  assert.match(xml, /&lt;tag&gt;/)
  assert.doesNotMatch(xml, /<enclosure|<h:img|<tag>/)
})

test('local image source paths use the actual post file directory, not post.id', () => {
  assert.equal(
    resolveRssImagePath('src/content/blog/Devtools/current.mdx', './fig.png', 'E:/BLOG'),
    '/src/content/blog/Devtools/fig.png'
  )
  assert.equal(
    resolveRssImagePath(
      'E:\\BLOG\\src\\content\\blog\\Devtools\\current.mdx',
      '../shared/my%20figure.png?v=1#x',
      'E:/BLOG'
    ),
    '/src/content/blog/shared/my figure.png'
  )
  assert.equal(
    resolveRssImagePath(
      '/repo/src/content/blog/Devtools/current.mdx',
      '../../../assets/fig.png',
      '/repo'
    ),
    '/src/assets/fig.png'
  )
  for (const url of [
    '/images/x.png',
    '//cdn.example/x.png',
    'https://cdn.example/x.png',
    '../../../../outside.png',
    '%2fetc/file.png',
    './bad%ZZ.png'
  ]) {
    assert.equal(
      resolveRssImagePath('src/content/blog/Devtools/current.mdx', url, 'E:/BLOG'),
      undefined,
      url
    )
  }
  assert.equal(resolveRssImagePath(undefined, './fig.png', 'E:/BLOG'), undefined)
  assert.equal(resolveRssImagePath('elsewhere/post.mdx', './fig.png', 'E:/BLOG'), undefined)
})
