import { Router } from "express";
import { getPost, getAllPosts } from "../controllers/postController.js";
import { commentsRouter } from "./commentsRouter.js";
import { validateId } from "../middleware/validateId.js";

export const postsRouter = Router()

postsRouter.get("/", getAllPosts)

postsRouter.use("/:id", validateId())
postsRouter.get("/:id", getPost);
postsRouter.use("/:id/comments", commentsRouter)
