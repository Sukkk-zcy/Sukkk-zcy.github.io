import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8')

test('文章页串联阅读导览、系列导航与知识关联组件', () => {
  const post = read('src/layouts/BlogPost.astro')

  assert.match(post, /import ArticleOverview from ['"]@\/components\/blog\/ArticleOverview\.astro['"]/)
  assert.match(post, /import ArticleKnowledge from ['"]@\/components\/blog\/ArticleKnowledge\.astro['"]/)
  assert.match(post, /<ArticleOverview/)
  assert.match(post, /<ArticleKnowledge/)
  assert.match(post, /articleHasSeries=/)
})

test('文章 Hero 使用中文更新时间文案', () => {
  const hero = read('packages/pure/components/pages/Hero.astro')

  assert.match(hero, /更新于/)
  assert.doesNotMatch(hero, />\s*Update\s*</)
})

test('文章布局提供窄屏阅读工具条与中文目录控制', () => {
  const layout = read('src/layouts/ContentLayout.astro')

  assert.match(layout, /article-mobile-actions/)
  assert.match(layout, /data-mobile-reading-progress/)
  assert.match(layout, /data-mobile-toc/)
  assert.match(layout, /打开目录/)
})

test('系列导航提供锚点和语义化进度条', () => {
  const series = read('src/components/blog/SeriesNav.astro')

  assert.match(series, /id='series-navigation'/)
  assert.match(series, /role='progressbar'/)
  assert.match(series, /aria-valuenow/)
})

test('关闭的知识关联区会延后初始化局部图谱', () => {
  const knowledge = read('src/components/blog/ArticleKnowledge.astro')
  const graph = read('packages/pure/components/pages/scripts/graph-view.ts')

  assert.match(knowledge, /<details/)
  assert.match(knowledge, /id='wikilinks-section'/)
  assert.match(graph, /closest(?:<HTMLDetailsElement>)?\('details:not\(\[open\]\)'\)/)
  assert.match(graph, /addEventListener\(\s*'toggle'/)
})
