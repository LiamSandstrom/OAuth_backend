import { Router } from "express";
import { getPost, getAllPosts } from "../controllers/postController.js";
import { commentsRouter } from "./commentsRouter.js";
import { validateId } from "../middleware/validateId.js";

export const postsRouter = Router()

postsRouter.use("/:id", validateId())
postsRouter.use("/:id/comments", commentsRouter)

postsRouter.get("/", getAllPosts)

postsRouter.get("/:id", getPost);
