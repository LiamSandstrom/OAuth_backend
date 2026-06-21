import { Request, Response } from "express";
import { createPost, deletePostById, getAllPostsDb, getPostById, updatePostFromId } from "../repos/postRepository.js";
import { CreatePostDto, UpdatePostDto } from "../validation/validateCreatePost.js";
import { toNum } from "../helpers/toNum.js";
import { parsePost } from "../helpers/mdToAst.js";


export const getAllPosts = (admin = false) => async (req: Request, res: Response) => {
    const id = toNum(req.query.id)
    const title = typeof req.query.title === 'string' ? req.query.title : undefined
    const limit = toNum(req.query.limit)
    const page = toNum(req.query.page)
    const withComments = req.query.withComments === 'true'

    try {
        const posts = await getAllPostsDb(id, title, page, limit, withComments, admin);
        return res.json(posts)
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const uploadPost = async (req: Request, res: Response) => {
    const body = req.body as CreatePostDto
    const userId = 8

    try {
        const post = await createPost({
            title: body.title,
            content: body.content,
            published: body.published ?? false,
            user: { connect: { id: userId } }
        })

        return res.status(201).json(post)
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getPost = (admin = false) => async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const format = req.query.format

    try {
        const post = await getPostById(id, admin)
        if (!post) return res.status(404).json({ message: "Post not found" })

        if (format === "raw") {
            return res.json(post)
        }

        const { meta, ast } = parsePost(post.content)
        return res.json({ id: post.id, title: post.title, published: post.published, createdAt: post.createdAt, updatedAt: post.updatedAt, meta, ast })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updatePost = async (req: Request, res: Response) => {
    const body = req.body as UpdatePostDto
    const id = Number(req.params.id)

    try {
        const post = await updatePostFromId(id, body)
        if (!post) return res.status(404).json({ message: "Post not found" })
        return res.json(post)
    }
    catch {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deletePost = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const result = await deletePostById(id);
        console.log(result)
        return res.json({ message: "Deleted Post" })
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

