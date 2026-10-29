import { describe, it, expect } from "vitest"
import { toNum } from "../../src/helpers/toNum.js"
import { parsePost } from "../../src/helpers/mdToAst.js"

describe("toNum", () => {
    it("converts numeric strings", () => {
        expect(toNum("42")).toBe(42)
    })

    it.each([undefined, "abc", ["1", "2"]])("returns undefined for %j", (value) => {
        expect(toNum(value)).toBeUndefined()
    })
})

describe("parsePost", () => {
    it("extracts frontmatter into meta", () => {
        const { meta } = parsePost("---\ntitle: Hello\ntags: [a, b]\n---\n# Body")
        expect(meta).toEqual({ title: "Hello", tags: ["a", "b"] })
    })

    it("returns a markdown AST", () => {
        const { ast } = parsePost("# Heading\n\nParagraph")
        expect(ast.type).toBe("root")
        expect(ast.children.map(n => n.type)).toEqual(["heading", "paragraph"])
    })

    it("parses custom directives", () => {
        const { ast } = parsePost(":::note\nhi\n:::")
        expect(ast.children[0].type).toBe("containerDirective")
    })

    it("strips position info to keep responses small", () => {
        const { ast } = parsePost("# Heading\n\nSome *emphasis*")
        expect(JSON.stringify(ast)).not.toContain("position")
    })

    it("handles content without frontmatter", () => {
        expect(parsePost("Just text").meta).toEqual({})
    })
})
