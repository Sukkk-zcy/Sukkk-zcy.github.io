import path from 'node:path'
import type { Element, Root as HastRoot } from 'hast'
import type { PhrasingContent, Root, RootContent } from 'mdast'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { SKIP, visit } from 'unist-util-visit'

import remarkWikilinks from '../plugins/remark-wikilinks.ts'
import type { WikilinkIndex } from './wikilink-map.ts'

export interface RssContentOptions {
  body?: string
  filePath?: string
  postUrl: URL
  wikilinkIndex: WikilinkIndex
  /** Return an optimized URL only when the source image exists in the build glob. */
  resolveImage?: (url: string) => Promise<string | undefined>
  heroImage?: { url: string; alt?: string }
}

/** Resolve source images from the actual Markdown directory, not its content id. */
export function resolveRssImagePath(
  filePath: string | undefined,
  imageUrl: string,
  projectRoot = process.cwd()
): string | undefined {
  if (!filePath || /^[a-z][a-z\d+.-]*:|^[\\/]/i.test(imageUrl)) return undefined

  let imagePath: string
  try {
    imagePath = decodeURIComponent(imageUrl.split(/[?#]/, 1)[0]).replaceAll('\\', '/')
  } catch {
    return undefined
  }
  if (!imagePath || imagePath.startsWith('/') || imagePath.includes('\0')) return undefined

  const root = projectRoot.replaceAll('\\', '/').replace(/\/$/, '')
  let source = filePath.replaceAll('\\', '/')
  // Astro filePath can be project-relative or absolute, including a Windows drive.
  if (source.toLowerCase().startsWith(`${root.toLowerCase()}/`)) {
    source = source.slice(root.length + 1)
  }
  source = source.replace(/^\/?src\//, '/src/')
  if (!source.startsWith('/src/content/blog/')) return undefined

  const resolved = path.posix.resolve(path.posix.dirname(source), imagePath)
  // Source assets can be beside articles or in src/assets, but never outside src.
  return resolved.startsWith('/src/') ? resolved : undefined
}

function absoluteUrl(value: string, postUrl: URL, image = false): string | undefined {
  const trimmed = value.trim().replace(/[\u0000-\u001f\u007f]/g, '')
  if (image && !trimmed) return undefined
  try {
    const url = new URL(trimmed, postUrl)
    const protocols = image ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:', 'tel:', 'ftp:']
    return protocols.includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

/** Parse MDX but never evaluate it. Only literal a/img attributes are retained. */
function remarkReadableMdx() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (index === undefined || !parent) return
      if (
        node.type === 'mdxjsEsm' ||
        node.type === 'mdxFlowExpression' ||
        node.type === 'mdxTextExpression'
      ) {
        parent.children.splice(index, 1)
        return [SKIP, index]
      }
      if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return

      const attribute = (name: string): string | undefined => {
        const attr = node.attributes.find(
          (item) => item.type === 'mdxJsxAttribute' && item.name === name
        )
        return attr?.type === 'mdxJsxAttribute' && typeof attr.value === 'string'
          ? attr.value
          : undefined
      }
      let replacement: RootContent[] = node.children
      if (node.name === 'script' || node.name === 'style') {
        replacement = []
      } else if (node.name === 'img') {
        const src = attribute('src')
        replacement =
          src === undefined
            ? []
            : [
                {
                  type: 'image',
                  url: src,
                  alt: attribute('alt') ?? '',
                  title: attribute('title')
                }
              ]
      } else if (node.name === 'a' && attribute('href') !== undefined) {
        replacement = [
          {
            type: 'link',
            url: attribute('href')!,
            title: attribute('title'),
            children: node.children as PhrasingContent[]
          }
        ]
      }
      if (
        node.type === 'mdxJsxFlowElement' &&
        (node.name === 'a' || node.name === 'img') &&
        replacement.length
      ) {
        replacement = [{ type: 'paragraph', children: replacement as PhrasingContent[] }]
      }
      // Revisit inserted nodes so nested JSX and expressions are also stripped.
      const siblings = parent.children as RootContent[]
      siblings.splice(index, 1, ...replacement)
      return [SKIP, index]
    })
  }
}

function rehypeAbsoluteUrls(options: RssContentOptions) {
  return async (tree: HastRoot) => {
    const images: Promise<void>[] = []
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && typeof node.properties.href === 'string') {
        const url = absoluteUrl(node.properties.href, options.postUrl)
        if (url === undefined) delete node.properties.href
        else node.properties.href = url
      }
      if (node.tagName !== 'img' || typeof node.properties.src !== 'string') return
      const source = node.properties.src
      if (!absoluteUrl(source, options.postUrl, true)) {
        delete node.properties.src
        return
      }
      images.push(
        (async () => {
          const optimized = await options.resolveImage?.(source)
          const url = absoluteUrl(optimized ?? source, options.postUrl, true)
          if (url === undefined) delete node.properties.src
          else node.properties.src = url
        })()
      )
    })
    await Promise.all(images)
  }
}

export async function renderRssContent(options: RssContentOptions): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkReadableMdx)
    .use(remarkWikilinks, { index: options.wikilinkIndex })
    .use(() => (tree: Root) => {
      if (options.heroImage) {
        tree.children.unshift({
          type: 'paragraph',
          children: [
            {
              type: 'image',
              url: options.heroImage.url,
              alt: options.heroImage.alt ?? ''
            }
          ]
        })
      }
    })
    .use(remarkRehype)
    .use(rehypeAbsoluteUrls, options)
    .use(rehypeStringify)

  return String(await processor.process({ value: options.body ?? '', path: options.filePath }))
}
