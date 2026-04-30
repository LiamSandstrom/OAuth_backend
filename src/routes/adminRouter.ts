import { Router } from "express"
import { validateId } from "../middleware/validateId.js";
import { isPostOwner } from "../middleware/isPostOwner.js";
import { validate } from "../middleware/validate.js";
import { CreatePostSchema } from "../validation/validateCreatePost.js";
import { deletePost, updatePost, uploadPost } from "../controllers/postController.js";
import { deleteUser, unlinkProvider } from "../controllers/userController.js";
import { isAccountOwner } from "../middleware/isAccountOwner.js";
import { isSelf } from "../middleware/isSelf.js";

export const adminRouter = Router()

adminRouter.post("/posts", validate(CreatePostSchema), uploadPost)
adminRouter.use("/posts/:id", validateId())
adminRouter.put("/posts/:id", validate(CreatePostSchema), isPostOwner, updatePost)
adminRouter.delete("/posts/:id", isPostOwner, deletePost)


adminRouter.use("/users/:id", validateId(), isSelf)
adminRouter.delete("/users/:id", deleteUser)

adminRouter.use("/accounts/:id", validateId(), isAccountOwner)
adminRouter.delete("/accounts/:id", unlinkProvider)
