import type { CardListData, Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  // [Basic]
  title: 'Sukkk',
  author: 'Sukkk',
  description: '记录技术笔记和成长历程',
  favicon: '/favicon.ico',
  socialCard: '/images/social-card.png',
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  logo: {
    src: '/src/assets/avatar.png',
    alt: 'Sukkk'
  },

  titleDelimiter: '•',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  head: [],
  customCss: [],

  header: {
    menu: [
      { title: '博客', link: '/blog' },
      { title: '分类', link: '/categories' },
      { title: '标签', link: '/tags' },
      { title: '时光机', link: '/archives' },
      { title: '关于', link: '/about' }
    ]
  },

  footer: {
    year: `© ${new Date().getFullYear()}`,
    links: [],
    credits: true,
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/Sukkk-zcy' },
      { icon: 'rss', label: 'RSS', href: '/rss.xml' }
    ]
  },

  content: {
    externalLinks: {
      content: ' ↗',
      properties: { style: 'user-select:none' }
    },
    blogPageSize: 8,
    share: ['weibo', 'x', 'bluesky']
  }
}

export const integ: IntegrationUserConfig = {
  links: {
    logbook: [],
    applyTip: [
      { name: 'Name', val: theme.title },
      { name: 'Desc', val: theme.description || 'Null' },
      { name: 'Link', val: 'https://sukkk-zcy.github.io/' },
      { name: 'Avatar', val: 'https://sukkk-zcy.github.io/favicon.ico' }
    ],
    cacheAvatar: false
  },
  quote: {
    server: 'https://dummyjson.com/quotes/random',
    target: `(data) => (data.quote.length > 80 ? \`\${data.quote.slice(0, 80)}...\` : data.quote || 'Error')`
  },
  typography: {
    class: 'prose text-base',
    blockquoteStyle: 'italic',
    inlineCodeBlockStyle: 'modern'
  },
  mediumZoom: {
    enable: true,
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable'
    }
  },
  waline: {
    enable: false
  },
  giscus: {
    enable: false,
    repo: '',
    repoId: '',
    category: '',
    categoryId: ''
  }
}

export const terms: CardListData = {
  title: 'Terms content',
  list: []
}

const config = { ...theme, integ } as Config
export default config
