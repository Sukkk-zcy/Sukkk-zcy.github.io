import type { AstroGlobal, ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import type { CollectionEntry } from 'astro:content'
import rss from '@astrojs/rss'
import config from 'virtual:config'

import { getBlogCollection, sortMDByDate } from 'astro-pure/server'
import { getPostPath } from '@/utils/content-paths'
import { renderRssContent, resolveRssImagePath } from '@/utils/rss-content'
import { buildWikilinkIndex } from '@/utils/wikilink-map'

const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/**/*.{jpeg,jpg,png,gif,avif,webp,svg}'
)
const imageLoaders = new Map(
  Object.entries(imagesGlob).map(([key, loader]) => [
    process.platform === 'win32' ? key.toLowerCase() : key,
    loader
  ])
)
// One index and image cache per RSS module, not one filesystem scan per article.
const wikilinkIndex = buildWikilinkIndex()
const optimizedImages = new Map<string, Promise<string>>()

const renderContent = async (post: CollectionEntry<'blog'>, site: URL) => {
  const hero = post.data.heroImage
  const heroUrl = hero
    ? typeof hero.src === 'string'
      ? hero.src
      : (await getImage({ src: hero.src })).src
    : undefined

  return renderRssContent({
    body: post.body,
    filePath: post.filePath,
    postUrl: new URL(getPostPath(post), site),
    wikilinkIndex,
    heroImage: heroUrl ? { url: heroUrl, alt: hero?.alt } : undefined,
    resolveImage: async (url) => {
      const sourcePath = resolveRssImagePath(post.filePath, url)
      if (!sourcePath) return undefined
      const key = process.platform === 'win32' ? sourcePath.toLowerCase() : sourcePath
      const loader = imageLoaders.get(key)
      if (!loader) return undefined
      let optimized = optimizedImages.get(key)
      if (!optimized) {
        optimized = loader().then(async ({ default: src }) => (await getImage({ src })).src)
        optimizedImages.set(key, optimized)
      }
      return optimized
    }
  })
}

const GET = async (context: AstroGlobal) => {
  const allPostsByDate = sortMDByDate(await getBlogCollection()) as CollectionEntry<'blog'>[]
  const siteUrl = context.site ?? new URL(import.meta.env.SITE)

  return rss({
    trailingSlash: false,
    stylesheet: '/scripts/pretty-feed-v3.xsl',
    title: config.title,
    description: config.description,
    site: siteUrl,
    items: await Promise.all(
      allPostsByDate.map(async (post) => ({
        ...post.data,
        pubDate: post.data.publishDate,
        link: getPostPath(post),
        // A normal RSS content field lets the serializers escape hero URLs/alt text.
        // Do not emit an enclosure without a known byte length and media type.
        content: await renderContent(post, siteUrl)
      }))
    )
  })
}

export { GET }
