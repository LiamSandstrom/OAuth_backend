import { Router } from "express";
import { getPost, showAllPosts, updatePost, uploadPost } from "../controllers/postController.js";
import { commentsRouter } from "./commentsRouter.js";
import { validateId } from "../middleware/validateId.js";

export const postsRouter = Router()

// Validates id on all :id routes!! order matters
postsRouter.use("/:id", validateId)
postsRouter.use("/:id/comments", commentsRouter)

postsRouter.get("/", showAllPosts)

postsRouter.get("/:id", getPost);
