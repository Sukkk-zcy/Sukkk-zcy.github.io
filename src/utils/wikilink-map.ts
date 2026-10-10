/**
 * Build-time index that maps wikilink references to canonical blog URLs.
 *
 * The remark plugin runs inside the Markdown pipeline, where no Astro content
 * collection is available. Without an index it can only guess, and the old
 * guess (`/blog/<bare-filename>`) pointed at a redirect page instead of the
 * canonical `/blog/<category>/<slug>` route. This module scans the content
 * directory once at config load time so the plugin can emit real URLs.
 */
import fs from 'node:fs'
import path from 'node:path'

export const BLOG_CONTENT_ROOT = 'src/content/blog'

export interface WikilinkIndex {
  /** `sdn/sdn-03-openflow-protocol` -> `/blog/sdn/sdn-03-openflow-protocol` */
  byFullId: Map<string, string>
  /** `sdn-03-openflow-protocol` -> `/blog/sdn/sdn-03-openflow-protocol` (only when unique) */
  byBasename: Map<string, string>
}

export function normalizeReference(value: string): string {
  return value
    .replaceAll('\\', '/')
    .replace(/^\/?(?:blog|docs)\//, '')
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\/index$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/')
    .toLowerCase()
}

/**
 * Read an explicit `slug:` from the frontmatter without pulling in a YAML
 * parser. Posts that declare one are routed at the site root rather than under
 * their category folder, so the index has to honour it.
 */
function readDeclaredSlug(file: string): string | undefined {
  let raw: string
  try {
    raw = fs.readFileSync(file, 'utf-8')
  } catch {
    return undefined
  }

  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  if (!frontmatter) return undefined

  const declared = /^slug:[ \t]*["']?([^"'\r\n#]+?)["']?[ \t]*$/m.exec(frontmatter[1])
  return declared?.[1]?.trim() || undefined
}

function walkMarkdownFiles(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return acc
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkMarkdownFiles(full, acc)
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      acc.push(full)
    }
  }

  return acc
}

/**
 * Scan the blog content directory and build the wikilink lookup index.
 */
export function buildWikilinkIndex(
  root: string = path.resolve(process.cwd(), BLOG_CONTENT_ROOT),
  basePath = '/blog'
): WikilinkIndex {
  const byFullId = new Map<string, string>()
  /** basename -> canonical urls; more than one entry means ambiguous */
  const basenameCandidates = new Map<string, string[]>()

  for (const file of walkMarkdownFiles(root)) {
    const relative = path.relative(root, file).replaceAll('\\', '/')
    const fullId = normalizeReference(relative)

    const declared = readDeclaredSlug(file)
    const canonical = `${basePath}/${declared ? normalizeReference(declared) : fullId}`

    byFullId.set(fullId, canonical)

    const basename = fullId.split('/').at(-1)
    if (!basename) continue
    const candidates = basenameCandidates.get(basename) ?? []
    candidates.push(canonical)
    basenameCandidates.set(basename, candidates)
  }

  const byBasename = new Map<string, string>()
  for (const [basename, candidates] of basenameCandidates) {
    // Ambiguous bare filenames stay unresolved so authors get a visible warning
    // instead of a silently wrong link.
    if (candidates.length === 1) byBasename.set(basename, candidates[0])
  }

  return { byFullId, byBasename }
}
