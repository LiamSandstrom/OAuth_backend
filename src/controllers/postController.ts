import { Request, Response } from "express"
import { createPost, deletePostById, getAllPostsDb, getPostById, updatePostFromId } from "../repos/postRepository.js"
import { CreatePostDto, UpdatePostDto } from "../validation/validateCreatePost.js"
import { toNum } from "../helpers/toNum.js"
import { parsePost } from "../helpers/mdToAst.js"
import { getFirstAuthor } from "../repos/userRepository.js"

export const getAllPosts =
    (admin = false) =>
    async (req: Request, res: Response) => {
        const id = toNum(req.query.id)
        const title = typeof req.query.title === "string" ? req.query.title : undefined
        const limit = toNum(req.query.limit)
        const page = toNum(req.query.page)
        const withComments = req.query.withComments === "true"

        const posts = await getAllPostsDb(id, title, page, limit, withComments, admin)
        return res.json(posts)
    }

export const uploadPost = async (req: Request, res: Response) => {
    const body = req.body as CreatePostDto

    const author = await getFirstAuthor()
    if (!author) return res.status(400).json({ message: "No AUTHOR user exists to own the post" })

    const post = await createPost({
        title: body.title,
        content: body.content,
        published: body.published ?? false,
        user: { connect: { id: author.id } }
    })

    return res.status(201).json(post)
}

export const getPost =
    (admin = false) =>
    async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const format = req.query.format

        const post = await getPostById(id, admin)
        if (!post) return res.status(404).json({ message: "Post not found" })

        if (format === "raw") {
            return res.json(post)
        }

        const { meta, ast } = parsePost(post.content)
        return res.json({
            id: post.id,
            title: post.title,
            published: post.published,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            meta,
            ast
        })
    }

export const updatePost = async (req: Request, res: Response) => {
    const body = req.body as UpdatePostDto
    const id = Number(req.params.id)

    const post = await updatePostFromId(id, body)
    return res.json(post)
}

export const deletePost = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    await deletePostById(id)
    return res.json({ message: "Deleted Post" })
}
