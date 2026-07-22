import type { CollectionEntry } from 'astro:content'

type BlogPost = CollectionEntry<'blog'>

export interface CategorySegment {
  name: string
  path: string
}

function normalizePath(value: string): string {
  return value
    .replaceAll('\\', '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/')
}

export function getPostSlug(post: BlogPost): string {
  if (post.data.slug) return normalizePath(post.data.slug)

  return normalizePath(post.id).replace(/\.(md|mdx)$/, '').replace(/\/index$/, '')
}

export function getPostPath(post: BlogPost): string {
  return `/blog/${getPostSlug(post)}`
}

export function getPostSourceId(post: BlogPost): string {
  if (!post.filePath) return normalizePath(post.id)

  return normalizePath(post.filePath)
    .replace(/^src\/content\/blog\//, '')
    .replace(/\.(md|mdx)$/, '')
}

export function getPostCategory(post: BlogPost): string | undefined {
  const sourceId = getPostSourceId(post)
  const separator = sourceId.lastIndexOf('/')
  return separator === -1 ? undefined : sourceId.slice(0, separator)
}

export function getCategorySegments(category?: string): CategorySegment[] {
  if (!category) return []

  return normalizePath(category)
    .split('/')
    .filter(Boolean)
    .map((name, index, parts) => ({
      name,
      path: parts.slice(0, index + 1).join('/')
    }))
}

export function getPostCategorySegments(post: BlogPost): CategorySegment[] {
  return getCategorySegments(getPostCategory(post))
}

// Map of known acronyms to preserve correct casing
const KNOWN_ACRONYMS: Record<string, string> = {
  sdn: 'SDN',
  p4: 'P4',
  ddos: 'DDoS',
  esp32: 'ESP32',
  vm: 'VM',
  ai: 'AI'
}

export function getCategoryLabel(category: string): string {
  // Check if the entire category is a known acronym
  const lower = category.toLowerCase()
  if (KNOWN_ACRONYMS[lower]) return KNOWN_ACRONYMS[lower]

  return category
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => {
      const partLower = part.toLowerCase()
      if (KNOWN_ACRONYMS[partLower]) return KNOWN_ACRONYMS[partLower]
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

export function getAllCategories(posts: BlogPost[]): Map<string, BlogPost[]> {
  const categories = new Map<string, BlogPost[]>()

  for (const post of posts) {
    const category = getPostCategory(post)
    if (!category) continue

    const segments = getCategorySegments(category)
    for (const segment of segments) {
      const categoryPosts = categories.get(segment.path) ?? []
      categoryPosts.push(post)
      categories.set(segment.path, categoryPosts)
    }
  }

  // Sort posts within each category by filename for reading order
  for (const [, posts] of categories) {
    posts.sort((a, b) => getPostSourceId(a).localeCompare(getPostSourceId(b)))
  }

  return categories
}
