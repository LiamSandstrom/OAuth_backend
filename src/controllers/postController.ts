import { Request, Response } from "express"
import { createPost, deletePostById, getAllPostsDb, getPostById, updatePostFromId } from "../repos/postRepository.js"
import { CreatePostDto, UpdatePostDto } from "../validation/validateCreatePost.js"
import { toNum } from "../helpers/toNum.js"
import { parsePost } from "../helpers/mdToAst.js"
import { getUserWithEmail } from "../repos/userRepository.js"
import { Role } from "../generated/prisma/enums.js"
import { getLikesByPostId } from "../repos/likeRepository.js"
import { getAllCommentsOnPostDb } from "../repos/commentsRepository.js"
import { getDraftFeedback, getPublishedFeedback } from "../services/aiFeedback.js"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export const getAllPosts =
    (admin = false) =>
    async (req: Request, res: Response) => {
        const id = toNum(req.query.id)
        const title = typeof req.query.title === "string" ? req.query.title : undefined
        const limit = Math.min(Math.max(Math.floor(toNum(req.query.limit) ?? DEFAULT_LIMIT), 1), MAX_LIMIT)
        const page = Math.max(Math.floor(toNum(req.query.page) ?? 1), 1)
        const withComments = req.query.withComments === "true"

        const posts = await getAllPostsDb(id, title, page, limit, withComments, admin)
        return res.json(posts)
    }

export const uploadPost = async (req: Request, res: Response) => {
    const body = req.body as CreatePostDto

    const author = await getUserWithEmail(process.env.ADMIN_EMAIL!)
    if (!author || author.role !== Role.AUTHOR) {
        return res.status(400).json({ message: "ADMIN_EMAIL must belong to an existing AUTHOR user" })
    }

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

export const getFeedback = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const post = await getPostById(id, true)
    if (!post) return res.status(404).json({ message: "Post not found" })
    if (post.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" })

    if (!post.published) {
        const feedback = await getDraftFeedback(post)
        return res.json({ type: "draft", feedback })
    }

    const likes = await getLikesByPostId(id)
    const comments = await getAllCommentsOnPostDb(id)

    const feedback = await getPublishedFeedback(
        post,
        likes,
        comments.map(c => c.text)
    )
    return res.json({ type: "published", feedback })
}
