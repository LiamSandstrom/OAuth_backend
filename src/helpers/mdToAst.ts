import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import { matter } from 'vfile-matter'
import { VFile } from 'vfile'
import { visit } from 'unist-util-visit'

const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkDirective)

export const parsePost = (content: string) => {
    const file = new VFile(content)
    matter(file)
    const tree = processor.parse(file)

    visit(tree, (node) => {
        delete node.position
    })

    return { meta: file.data.matter, ast: tree }
}
