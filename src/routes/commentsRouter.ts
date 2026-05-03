import { Router } from "express";
import { createCommentOnPost, deleteCommentOnPost, editCommentOnPost, getAllCommentsOnPost, getCommentOnPost } from "../controllers/commentController.js";
import { validateId } from "../middleware/validateId.js";
import { validate } from "../middleware/validate.js";
import { CreateCommentSchema } from "../validation/validateComment.js";
import { VerifyToken } from "../middleware/verifyToken.js";
import { isPostOrCommentOwner } from "../middleware/isPostOrCommentOwner.js";
import { isCommentOwner } from "../middleware/isCommentOwner.js";
import { filterToxicComments } from "../middleware/filterToxicComments.js";

//This route could just be on posts but i wanted to try subroute with mergeParams
export const commentsRouter = Router({ mergeParams: true })

commentsRouter.get("/", getAllCommentsOnPost)
commentsRouter.post("/", VerifyToken, validate(CreateCommentSchema), filterToxicComments, createCommentOnPost)

commentsRouter.use("/:commentId", validateId("commentId"))
commentsRouter.get("/:commentId", getCommentOnPost)
commentsRouter.delete("/:commentId", VerifyToken, isPostOrCommentOwner, deleteCommentOnPost)
commentsRouter.patch("/:commentId", VerifyToken, isCommentOwner, validate(CreateCommentSchema), filterToxicComments, editCommentOnPost)
