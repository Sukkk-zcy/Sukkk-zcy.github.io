/**
 * Remark plugin to transform Obsidian-style wikilinks [[link]] to standard markdown links
 * 将 Obsidian 风格的双链 [[link]] 转换为标准 markdown 链接
 *
 * Resolution order for `[[target]]`:
 *   1. explicit path relative to the current post (`./sibling`)
 *   2. exact content id (`sdn/sdn-03-openflow-protocol`)
 *   3. unique bare filename (`sdn-03-openflow-protocol`)
 *
 * Unresolved links keep a `/blog/<target>` fallback and are marked
 * `wikilink-broken` so mistakes show up in the browser instead of 404-ing
 * silently.
 */
import type { Link, Root, Text } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

// Relative import: this module is also loaded from astro.config.ts, before
// Vite aliases are available.
import type { WikilinkIndex } from '../utils/wikilink-map'

export interface WikilinkOptions {
  /** Base path for blog posts */
  basePath?: string
  /** Build-time reference index produced by `buildWikilinkIndex` */
  index?: WikilinkIndex
}

// Regex to match [[wikilink]], [[wikilink|display text]] and [[wikilink#heading]]
const WIKILINK_REGEX = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g

/** Keep unicode letters/digits so Chinese filenames survive normalisation. */
function slugify(value: string): string {
  return value
    .trim()
    .replaceAll('\\', '/')
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_/]/gu, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/')
    .toLowerCase()
}

function toPosix(value: string): string {
  return value.replaceAll('\\', '/')
}

/**
 * Work out which content directory the current file lives in, so bare
 * `[[sibling]]` references resolve the way Obsidian users expect.
 */
function currentDirectory(filePath: string | undefined): string {
  if (!filePath) return ''

  const normalised = toPosix(filePath)
  const relative = normalised.replace(/^.*?src\/content\/blog\//, '')
  if (relative === normalised) return ''

  const separator = relative.lastIndexOf('/')
  return separator === -1 ? '' : relative.slice(0, separator).toLowerCase()
}

export const remarkWikilinks: Plugin<[WikilinkOptions?], Root> = function (options = {}) {
  const { basePath = '/blog', index } = options

  return function (tree, file) {
    const contentBasePath = file.path?.includes('/content/docs/') ? '/docs' : basePath
    const sourceDir = currentDirectory(file.path)

    /** Resolve a raw reference into a canonical URL, or undefined when unknown. */
    const resolve = (rawTarget: string): string | undefined => {
      const isExplicitRelative = /^\.\.?\//.test(rawTarget.trim())
      const target = slugify(rawTarget)

      if (!index) return undefined

      if (isExplicitRelative && sourceDir) {
        const joined = slugify(`${sourceDir}/${target.replace(/^\.\.?\//, '')}`)
        const relativeHit = index.byFullId.get(joined)
        if (relativeHit) return relativeHit
      }

      const fullHit = index.byFullId.get(target)
      if (fullHit) return fullHit

      if (!target.includes('/')) {
        const bareHit = index.byBasename.get(target)
        if (bareHit) return bareHit
      }

      return undefined
    }

    visit(tree, 'text', (node: Text, idx, parent) => {
      if (!parent || idx === undefined) return

      const text = node.value
      const matches = [...text.matchAll(WIKILINK_REGEX)]

      if (matches.length === 0) return

      const newChildren: (Text | Link)[] = []
      let lastIndex = 0

      for (const match of matches) {
        const [fullMatch, rawTarget, rawAnchor, rawDisplay] = match
        const matchStart = match.index!
        const matchEnd = matchStart + fullMatch.length

        if (matchStart > lastIndex) {
          newChildren.push({ type: 'text', value: text.slice(lastIndex, matchStart) })
        }

        const target = rawTarget.trim()
        const anchor = rawAnchor?.trim()
        const displayText = (rawDisplay?.trim() || target).replace(/^\.\.?\//, '')

        const canonical = resolve(target)
        const isValid = canonical !== undefined

        // Keep unresolved links navigable-ish but visibly flagged.
        let linkUrl = canonical ?? `${contentBasePath}/${slugify(target).replace(/^\.\.?\//, '')}`
        if (anchor) linkUrl += `#${slugify(anchor)}`

        newChildren.push({
          type: 'link',
          url: linkUrl,
          title: isValid ? null : '⚠️ 此链接可能无效',
          children: [{ type: 'text', value: displayText }],
          data: {
            hProperties: {
              class: isValid ? 'wikilink' : 'wikilink wikilink-broken',
              'data-wikilink': 'true'
            }
          }
        } as Link)

        lastIndex = matchEnd
      }

      if (lastIndex < text.length) {
        newChildren.push({ type: 'text', value: text.slice(lastIndex) })
      }

      if (newChildren.length > 0) {
        parent.children.splice(idx, 1, ...newChildren)
      }
    })
  }
}

export default remarkWikilinks
