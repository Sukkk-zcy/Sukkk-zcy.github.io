# AGENTS.md

## 语言偏好

**必须使用中文**与用户交互。这是一个博客运维项目。

## Project Overview

Astro Theme Iris - an Astro 6.x blog theme with knowledge management features (wikilinks, knowledge graph, FlexSearch). Based on astro-theme-pure, customized for a personal knowledge base.

## Critical Commands

```bash
# Install (MUST use --legacy-peer-deps due to TypeScript 6.x conflicts)
npm install --legacy-peer-deps

# Development
npm run dev              # Start dev server
npm run dev:check        # Dev with type checking

# Build (runs checks first)
npm run build            # astro-pure check && astro check && astro build

# Lint & Format
npm run lint             # ESLint with Astro plugin
npm run format           # Prettier (Astro + import sorting)
npm run yijiansilian     # One-click: lint + sync + check + format

# Clean build cache (Windows)
Remove-Item -Path ".astro","dist" -Recurse -Force
```

## Architecture

### Monorepo Structure
- `packages/pure/` - Theme component library (astro-pure), provides components, utils, types
- `src/` - Blog content and customizations
- Root `package.json` defines workspaces for `packages/*`

### Key Paths
- `src/site.config.ts` - Site configuration (title, author, social links, integrations)
- `astro.config.ts` - Astro framework config (integrations, build options)
- `src/content/blog/<Category>/` - Blog posts in MDX format
- `src/components/` - Astro components (custom + theme)
- `src/utils/content-paths.ts` - Category/tag path utilities

### Content Collections
- `blog` - Blog posts (MDX files in `src/content/blog/`)
- `docs` - Documentation pages (if used)
- Schema defined in `src/content.config.ts`

### Integrations
- **astro-pure** - Main theme framework (auto-adds sitemap, MDX, UnoCSS)
- **mermaid** - Diagram support
- **uno.config.ts** - UnoCSS configuration with custom typography
- **Typst** - Currently disabled (dependency issues)
- **Giscus/Waline** - Comment systems (currently disabled/unconfigured)

## Known Gotchas

### Windows-Specific
- **Category case sensitivity**: Windows filesystem doesn't preserve case. Use `KNOWN_ACRONYMS` mapping in `src/utils/content-paths.ts` to handle `sdn` → `SDN`, `p4` → `P4`, etc.
- **Renaming directories**: Use intermediate names (`sdn` → `sdn_tmp` → `SDN`) to avoid conflicts

### Content Rules
- **Categories are directory-based**: Structure in `src/content/blog/<Category>/` determines category
- **Frontmatter `categories` field**: Must match directory name (case-sensitive)
- **Tags**: Must use correct case (`SDN` not `sdn`, `DDoS` not `ddos`)
- **File naming**: Use kebab-case (`sdn-04-new-topic.mdx`)

### Build & Deploy
- **Output**: Static site to `dist/` directory
- **Deployment**: GitHub Pages via `gh-pages` branch
- **CI**: `.github/workflows/deploy.yml` uses Node.js 20
- **Manual deploy**: Uses token-in-URL approach (see `BLOG-OPS.md`)

### Dependencies
- `node_modules` is ~520MB, don't delete unless necessary
- TypeScript 6.x requires `--legacy-peer-deps` for npm install
- Some packages have version conflicts (use `bun` as alternative)

## Configuration Files

| File | Purpose |
|------|---------|
| `src/site.config.ts` | Site title, author, menu, footer, integrations |
| `astro.config.ts` | Astro config, integrations, markdown plugins |
| `uno.config.ts` | UnoCSS styling, typography, theme colors |
| `tsconfig.json` | TypeScript config with path aliases |
| `eslint.config.mjs` | ESLint with Astro plugin |
| `prettier.config.mjs` | Prettier config with Astro + import sorting |
| `packages/pure/package.json` | Theme component library |

## Path Aliases

TypeScript path aliases defined in `tsconfig.json`:
- `@/assets/*` → `./src/assets/*`
- `@/components/*` → `./src/components/*`
- `@/layouts/*` → `./src/layouts/*`
- `@/utils` → `./src/utils/index.ts`
- `@/site-config` → `./src/site.config.ts`

## Style Conventions

- **No semicolons** (Prettier config)
- **Single quotes** (Prettier config)
- **Import ordering**: Managed by `@ianvs/prettier-plugin-sort-imports`
- **End of line**: LF (`.editorconfig`)
- **Tab width**: 2 spaces

## Disabled Features

- **Typst integration**: Dependency issues, disabled in `astro.config.ts`
- **Remote fonts**: Network issues, disabled
- **Giscus comments**: Not configured (empty repo/ID fields)
- **Waline comments**: Disabled

## Reference Documents

- `BLOG-OPS.md` - Detailed operations manual (deployment, troubleshooting)
- `README.md` / `README-zh-CN.md` - Project documentation
- `packages/pure/README.md` - Theme component library docs
