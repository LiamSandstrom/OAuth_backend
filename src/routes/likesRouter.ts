import { Router } from "express";
import { getAllLikesOnPost, LikePost, removeLike } from "../controllers/likeController.js";
import { VerifyToken } from "../middleware/verifyToken.js";

export const likesRouter = Router({ mergeParams: true })

likesRouter.get("/", getAllLikesOnPost)
likesRouter.post("/", VerifyToken, LikePost)
likesRouter.delete("/", VerifyToken, removeLike)
