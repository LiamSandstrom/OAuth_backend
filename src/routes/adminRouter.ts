import { Router } from "express"
import { validateId } from "../middleware/validateId.js";
import { isPostOwner } from "../middleware/isPostOwner.js";
import { validate } from "../middleware/validate.js";
import { CreatePostSchema } from "../validation/validateCreatePost.js";
import { deletePost, updatePost, uploadPost } from "../controllers/postController.js";

export const adminRouter = Router()
adminRouter.use("/posts/:id", validateId)

adminRouter.post("/posts", validate(CreatePostSchema), uploadPost)
adminRouter.put("/posts/:id", isPostOwner, updatePost)
adminRouter.delete("/posts/:id", isPostOwner, deletePost)


