import { Request, Response } from "express";
import { createPost, deletePostById, getAllPosts, getPostFromId, updatePostFromId } from "../repos/postRepository.js";
import { CreatePostDto } from "../validation/validateCreatePost.js";
import { getUser } from "../repos/userRepository.js";
import { Role } from "../generated/prisma/enums.js";


export const showAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await getAllPosts();
        return res.json(posts)
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const uploadPost = async (req: Request, res: Response) => {
    const body = req.body as CreatePostDto
    const user = req.user!

    try {
        const post = await createPost({
            title: body.title,
            content: body.content,
            published: body.published ?? false,
            user: { connect: { id: user.id } }
        })

        return res.status(201).json(post)
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const getPost = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const post = await getPostFromId(id)
        if (!post) return res.status(404).json({ message: "Post not found" })
        return res.json(post)
    }
    catch {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updatePost = async (req: Request, res: Response) => {
    const body = req.body as CreatePostDto
    const id = Number(req.params.id)

    try {
        const post = await updatePostFromId(id, {
            title: body.title,
            content: body.content,
            published: body.published ?? false,
        })
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

