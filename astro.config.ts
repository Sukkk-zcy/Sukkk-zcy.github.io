import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
//import vercel from '@astrojs/vercel'
import AstroPureIntegration from 'astro-pure'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import mermaid from 'astro-mermaid'
// import { typst } from 'astro-typst'
// Local integrations
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts'
import p4Grammar from './src/plugins/p4-grammar.ts'
import remarkWikilinks from './src/plugins/remark-wikilinks.ts'
import { buildWikilinkIndex } from './src/utils/wikilink-map.ts'
// Shiki
import {
  addCollapse,
  addCopyButton,
  addLanguage,
  addTitle,
  updateStyle
} from './src/plugins/shiki-custom-transformers.ts'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from './src/plugins/shiki-official/transformers.ts'
import config from './src/site.config.ts'

// Scanned once at config load so `[[wikilinks]]` resolve to the canonical
// /blog/<category>/<slug> route instead of a bare-filename redirect page.
const wikilinkIndex = buildWikilinkIndex()

// https://astro.build/config
export default defineConfig({
  // [Performance]
  compressHTML: true,

  // [Basic]
  site: 'https://sukkk-zcy.github.io',
  // Deploy to a sub path
  // https://astro-pure.js.org/docs/setup/deployment#platform-with-base-path
  // base: '/astro-pure/',
  trailingSlash: 'never',
  // root: './my-project-directory',
  server: { host: true },
  // https://docs.astro.build/en/guides/prefetch/
  prefetch: {
    defaultStrategy: 'viewport'
  },

  // [Adapter]
  // https://docs.astro.build/en/guides/deploy/
  // GitHub Pages 使用静态输出
  // adapter: vercel(),
  // output: 'server',
  output: 'static',
  // Local (standalone)
  // adapter: node({ mode: 'standalone' }),
  // output: 'server',

  // [Assets]
  image: {
    responsiveStyles: true,
    service: { entrypoint: 'astro/assets/services/sharp' },
    // domains: ['ghchart.rshah.org'],
    remotePatterns: [{ protocol: 'https' }]
  },
  // Enable font preloading and optimization
  // https://docs.astro.build/en/guides/fonts/
  fonts: [],

  // [Markdown]
  markdown: {
    remarkPlugins: [
      remarkMath,
      [remarkWikilinks, { basePath: '/blog', index: wikilinkIndex }]
    ],
    rehypePlugins: [
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
    ],
    // https://docs.astro.build/en/guides/syntax-highlighting/
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      // Shiki ships no P4 grammar; without this every ```p4 block renders as
      // plain text. See src/plugins/p4-grammar.ts
      // @ts-ignore LanguageRegistration shape differs slightly between shiki versions
      langs: [p4Grammar],
      transformers: [
        // Two copies of @shikijs/types (one under node_modules
        // and another nested under @astrojs/markdown-remark → shiki).
        // Use type assertion to work around version mismatch
        // Official transformers
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerNotationDiff(),
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerNotationHighlight(),
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerRemoveNotationEscape(),
        // Custom transformers
        // @ts-ignore this happens due to multiple versions of shiki types
        updateStyle(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addTitle(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addLanguage(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addCopyButton(2000), // timeout in ms
        // @ts-ignore this happens due to multiple versions of shiki types
        addCollapse(15) // max lines that needs to collapse
      ]
    }
  },

  // [Integrations]
  integrations: [
    // Sitemap is normally added automatically by astro-pure. We configure it
    // explicitly so the filter keeps the canonical nested URLs
    // (/blog/<category>/<slug>) and drops the bare-filename redirect pages
    // (/blog/<slug>) that [...]id.astro generates.
    sitemap({
      filter: (page) => {
        const parts = new URL(page).pathname.split('/').filter(Boolean)
        if (parts[0] !== 'blog') return true
        if (parts.length === 1) return true // /blog (list page)
        if (parts.length === 2) return /^\d+$/.test(parts[1]) // pagination /blog/2
        return true // /blog/<category>/<slug> canonical article URLs
      }
    }),
    // astro-pure will automatically add mdx & unocss
    // mdx(),
    // https://github.com/astro-community/astro-mermaid
    mermaid({
      // 布局与视觉升级：base 主题 + 与博客主色调（紫调）一致的浅色配色
      // 深色模式配色由 global.css 中 .dark .mermaid 覆盖规则接管
      mermaidConfig: {
        securityLevel: 'loose',
        // base 主题允许完整自定义变量，避免默认主题的单一配色
        theme: 'base',
        themeVariables: {
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: '14px',
          // 浅色主题配色（与博客 --primary 紫调一致）
          primaryColor: '#f4f0ff',
          primaryBorderColor: '#b8a5f0',
          primaryTextColor: '#2a2438',
          lineColor: '#8a7fb8',
          secondaryColor: '#ffe9f3',
          tertiaryColor: '#e8f6ff',
          secondaryBorderColor: '#f5c8dc',
          tertiaryBorderColor: '#b3d9f0',
          edgeLabelBackground: '#ffffff',
          clusterBkg: '#fbf7ff',
          clusterBorder: '#cfc5ee',
          titleColor: '#2a2438',
          mainBkg: '#f4f0ff',
          nodeBorder: '#b8a5f0',
          nodeTextColor: '#2a2438',
          actorBkg: '#f4f0ff',
          actorBorder: '#b8a5f0',
          actorTextColor: '#2a2438',
          actorLineColor: '#8a7fb8',
          signalColor: '#8a7fb8',
          signalTextColor: '#2a2438',
          labelBoxBkgColor: '#fff5fa',
          labelBoxBorderColor: '#f5c8dc',
          labelTextColor: '#2a2438',
          loopTextColor: '#2a2438',
          noteBkgColor: '#e8f6ff',
          noteBorderColor: '#b3d9f0',
          noteTextColor: '#2a2438',
          activationBkgColor: '#f0e8ff',
          activationBorderColor: '#b8a5f0',
          sequenceNumberColor: '#ffffff',
          sectionBkgColor: '#f4f0ff',
          altSectionBkgColor: '#fbf7ff',
          sectionBkgColor2: '#fff0f6',
          excludeBkgColor: '#f2f2f2',
          taskBorderColor: '#8a7fb8',
          taskBkgColor: '#f4f0ff',
          taskTextLightColor: '#ffffff',
          taskTextColor: '#2a2438',
          taskTextDarkColor: '#2a2438',
          todayLineColor: '#e5788d',
          gridColor: '#e8e4f5',
          border1: '#b8a5f0',
          border2: '#f5c8dc',
          border3: '#b3d9f0',
          border4: '#a8e3c0',
          border5: '#f5e3a8',
          border6: '#c0bdf5',
          border7: '#e8b8b8',
          border8: '#b8e0e0',
          border9: '#e8c8e8',
          background: '#ffffff'
        },
        flowchart: {
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 45,
          padding: 8,
          htmlLabels: true,
          // 输出固定像素宽度，避免大图被压缩导致文字过小
          useMaxWidth: false,
          nodeMinWidth: 120
        },
        sequence: {
          mirrorActors: false,
          useMaxWidth: false,
          actorMargin: 60,
          boxMargin: 12,
          messageMargin: 40,
          width: 160 // 参与者框宽度
        },
        gantt: {
          useMaxWidth: false,
          barHeight: 28
        },
        pie: {
          useMaxWidth: false
        },
        er: {
          useMaxWidth: false
        }
      }
    }),
    // typst(),
    AstroPureIntegration(config)
  ],

  // [Experimental]
  experimental: {
    // Allow compatible editors to support intellisense features for content collection entries
    // https://docs.astro.build/en/reference/experimental-flags/content-intellisense/
    contentIntellisense: true,
    // Enable SVGO optimization for SVG assets
    // https://docs.astro.build/en/reference/experimental-flags/svg-optimization/
    svgo: true,
    // Enables using the new Rust-based compiler for Astro files.
    // https://docs.astro.build/en/reference/experimental-flags/rust-compiler/
    rustCompiler: false,
    // https://docs.astro.build/en/reference/experimental-flags/queued-rendering/
    queuedRendering: {
      enabled: true
    }
  },
  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
        }
      }
    },
    ssr: {
      external: ['astro-typst', '@myriaddreamin/typst-ts-node-compiler', 'cheerio']
    }
  }
})
