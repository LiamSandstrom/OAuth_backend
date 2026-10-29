import { Router } from "express";
import { getAllLikesOnPost, likePost, removeLike } from "../controllers/likeController.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const likesRouter = Router({ mergeParams: true })

likesRouter.get("/", getAllLikesOnPost)
likesRouter.post("/", verifyToken, likePost)
likesRouter.delete("/", verifyToken, removeLike)
