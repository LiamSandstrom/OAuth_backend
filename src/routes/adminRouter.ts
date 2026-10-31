import { Router } from "express"
import { validateId } from "../middleware/validateId.js"
import { validate } from "../middleware/validate.js"
import { CreatePostSchema, UpdatePostSchema } from "../validation/validateCreatePost.js"
import { UpdateUserSchema } from "../validation/validateUser.js"
import { deletePost, getAllPosts, getPost, updatePost, uploadPost } from "../controllers/postController.js"
import { deleteUser, updateUser } from "../controllers/userController.js"
import { deleteCommentOnPost, getAllComments } from "../controllers/commentController.js"

export const adminRouter = Router()

adminRouter.post("/posts", validate(CreatePostSchema), uploadPost)
adminRouter.get("/posts", getAllPosts(true))
adminRouter.use("/posts/:id", validateId())
adminRouter.get("/posts/:id", getPost(true))
adminRouter.patch("/posts/:id", validate(UpdatePostSchema), updatePost)
adminRouter.delete("/posts/:id", deletePost)

adminRouter.use("/users/:id", validateId())
adminRouter.patch("/users/:id", validate(UpdateUserSchema), updateUser)
adminRouter.delete("/users/:id", deleteUser)

adminRouter.get("/comments", getAllComments)
adminRouter.use("/comments/:commentId", validateId("commentId"))
adminRouter.delete("/comments/:commentId", deleteCommentOnPost)
