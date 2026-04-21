import { Request, Response } from "express";
import { createPost, getAllPosts, getPostFromId } from "../repos/postRepository.js";
import { CreatePostSchema } from "../validation/validateCreatePost.js";
import { PostCreateInput } from "../generated/prisma/models.js";


export const showAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await getAllPosts();
        return res.json(posts)
    }
    catch (ex) {
        console.log(ex)
    }
}

export const uploadPost = async (req: Request, res: Response) => {

    const result = CreatePostSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors
        })
    }

    if (!req.user) return res.status(400).json({ message: "Unauthorized" })

    try {
        const post = await createPost({
            title: result.data.title,
            content: result.data.content,
            published: result.data.published ?? false,
            user: { connect: { id: req.user.id } }
        })

        return res.status(201).json(post)
    }
    catch (ex) {
        console.log(ex)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const getPost = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" })

    try {
        const post = await getPostFromId(id)
        if (!post) return res.status(404).json({ message: "Post not found" })
        return res.json(post)
    }
    catch {
        return res.status(500).json({ message: "Internal server error" })
    }
}
