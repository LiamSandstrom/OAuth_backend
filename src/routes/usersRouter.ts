import { Router } from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { deleteUser, getAllUsers, getUser, getUserData, updateUser } from "../controllers/userController.js"
import { validate } from "../middleware/validate.js"
import { UpdateUserSchema } from "../validation/validateUser.js"
import { isSelf } from "../middleware/isSelf.js"
import { requireRole } from "../middleware/requireRole.js"
import { validateId } from "../middleware/validateId.js"

export const usersRouter = Router()

usersRouter.get("/", verifyToken, requireRole("AUTHOR"), getAllUsers)
usersRouter.get("/protected", verifyToken, getUserData)

usersRouter.get("/:id", verifyToken, requireRole("AUTHOR"), validateId(), getUser)

usersRouter.patch("/:id", verifyToken, isSelf, validate(UpdateUserSchema), updateUser)
usersRouter.delete("/:id", verifyToken, isSelf, deleteUser)
