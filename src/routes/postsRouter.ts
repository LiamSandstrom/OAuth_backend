import { Router } from "express";
import { getPost, getAllPosts } from "../controllers/postController.js";
import { commentsRouter } from "./commentsRouter.js";
import { validateId } from "../middleware/validateId.js";
import { likesRouter } from "./likesRouter.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

export const postsRouter = Router()

postsRouter.get("/", getAllPosts())

postsRouter.get("/admin", verifyToken, requireRole("AUTHOR"), getAllPosts(true))
postsRouter.get("/admin/:id", verifyToken, requireRole("AUTHOR"), getPost(true))

postsRouter.use("/:id", validateId())
postsRouter.get("/:id", getPost());
postsRouter.use("/:id/comments", commentsRouter)
postsRouter.use("/:id/likes", likesRouter)
