import { Router } from "express"
import { validateId } from "../middleware/validateId.js";
import { isPostOwner } from "../middleware/isPostOwner.js";
import { validate } from "../middleware/validate.js";
import { CreatePostSchema } from "../validation/validateCreatePost.js";
import { AdminUpdateUserSchema } from "../validation/validateUser.js";
import { deletePost, updatePost, uploadPost } from "../controllers/postController.js";
import { updateUser } from "../controllers/userController.js";
import { isAccountOwner } from "../middleware/isAccountOwner.js";
import { isSelf } from "../middleware/isSelf.js";
import { unlinkProvider } from "../controllers/accountController.js";

export const adminRouter = Router()

adminRouter.post("/posts", validate(CreatePostSchema), uploadPost)
adminRouter.use("/posts/:id", validateId())
adminRouter.put("/posts/:id", validate(CreatePostSchema), isPostOwner, updatePost)
adminRouter.delete("/posts/:id", isPostOwner, deletePost)

adminRouter.use("/users/:id", validateId(), isSelf)
adminRouter.patch("/users/:id", validate(AdminUpdateUserSchema), updateUser)

adminRouter.use("/accounts/:id", validateId(), isAccountOwner)
adminRouter.delete("/accounts/:id", unlinkProvider)
