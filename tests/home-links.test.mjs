import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8')

test('首页不渲染缺少真实目标的赞助和兴趣占位卡片', () => {
  const home = read('src/pages/index.astro')
  assert.doesNotMatch(home, /<(?:SponsorWidget|HobbiesWidget)\b/)
  assert.doesNotMatch(home, /import\s+(?:SponsorWidget|HobbiesWidget)\b/)
})

test('技术方向卡片链接到关于页真实存在的章节', () => {
  const widget = read('src/components/bento/widgets/SkillsWidget.astro')
  const about = read('src/pages/about/index.astro')
  const target = /href=['"]\/about#([^'"]+)['"]/.exec(widget)
  assert.ok(target)
  assert.match(about, new RegExp(`id=['"]${target[1]}['"]`))
})

test('项目卡片指向本人的公开代码仓库而非不存在的作品集', () => {
  const widget = read('src/components/bento/widgets/LinksWidget.astro')
  assert.match(widget, /href=['"]https:\/\/github\.com\/Sukkk-zcy\?tab=repositories['"]/)
  assert.doesNotMatch(widget, /href=['"]\/projects|View my portfolio/)
  assert.match(widget, /GitHub Projects/)
})

test('首页引用的 bento 组件文件均存在', () => {
  const home = read('src/pages/index.astro')
  const imports = [...home.matchAll(/from ['"]@\/components\/bento\/([^'"]+)['"]/g)]
  assert.ok(imports.length > 0)
  for (const [, name] of imports) {
    assert.ok(fs.existsSync(fileURLToPath(new URL(`src/components/bento/${name}`, root))))
  }
})
