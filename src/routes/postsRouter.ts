import { Router } from "express";
import { getPost, showAllPosts, uploadPost } from "../controllers/postController.js";

export const postsRouter = Router()

postsRouter.get("/", showAllPosts)

postsRouter.post("/", uploadPost);

postsRouter.get("/:id", getPost);

postsRouter.put("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `CHANGED ${id}`
    })
})

postsRouter.delete("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `DELETED ${id}`
    })
})
