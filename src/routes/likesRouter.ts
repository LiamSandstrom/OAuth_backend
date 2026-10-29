import { Router } from "express";
import { getAllLikesOnPost, likePost, removeLike } from "../controllers/likeController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isPublishedPost } from "../middleware/isPublishedPost.js";

export const likesRouter = Router({ mergeParams: true })

likesRouter.get("/", getAllLikesOnPost)
likesRouter.post("/", verifyToken, isPublishedPost, likePost)
likesRouter.delete("/", verifyToken, removeLike)
