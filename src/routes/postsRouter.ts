import { Router } from "express";
import { getPost, getAllPosts } from "../controllers/postController.js";
import { commentsRouter } from "./commentsRouter.js";
import { validateId } from "../middleware/validateId.js";
import { likesRouter } from "./likesRouter.js";
import { VerifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

export const postsRouter = Router()

postsRouter.get("/", getAllPosts())

postsRouter.get("/admin", VerifyToken, requireRole("AUTHOR"), getAllPosts(true))
postsRouter.get("/admin/:id", VerifyToken, requireRole("AUTHOR"), getPost(true))

postsRouter.use("/:id", validateId())
postsRouter.get("/:id", getPost());
postsRouter.use("/:id/comments", commentsRouter)
postsRouter.use("/:id/likes", likesRouter)
