import type { RehypePlugins, RemarkPlugins } from 'astro'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import type { WikilinkIndex } from '../utils/wikilink-map.ts'
import rehypeAutolinkHeadings from './rehype-auto-link-headings.ts'
import { remarkMermaid } from './remark-mermaid.ts'
import remarkWikilinks from './remark-wikilinks.ts'

/** Shared by Astro's Markdown processor and @astrojs/mdx's legacy options. */
export function createMarkdownPlugins(index: WikilinkIndex) {
  const remarkPlugins = [
    // MDX 5 reads Astro's now-optional top-level `gfm`, not the processor's
    // default. Register explicitly so tables/tasks/strikethrough always parse.
    remarkGfm,
    remarkMermaid,
    remarkMath,
    [remarkWikilinks, { basePath: '/blog', index }]
  ] satisfies RemarkPlugins
  const rehypePlugins = [
    [rehypeKatex, {}],
    rehypeHeadingIds,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'append',
        properties: { className: ['anchor'] },
        content: { type: 'text', value: '#' }
      }
    ]
  ] satisfies RehypePlugins
  return { remarkPlugins, rehypePlugins }
}
