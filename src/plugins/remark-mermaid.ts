import { visit } from 'unist-util-visit'

/**
 * Converts Mermaid fences before Astro's Shiki pass turns code blocks into
 * highlighted HTML. astro-mermaid supplies the corresponding client renderer.
 */
export function remarkMermaid() {
  return (tree: any) => {
    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (node.lang !== 'mermaid' || index === undefined || !parent) return

      const source = String(node.value).replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }
        return entities[character]
      })

      parent.children[index] = {
        type: 'html',
        value: `<pre class="mermaid">${source}</pre>`
      }
    })
  }
}
