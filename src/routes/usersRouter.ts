import { Router } from "express";
import { VerifyToken } from "../middleware/verifyToken.js";
import { deleteUser, getAllUsers, getUser, getUserData, updateUser } from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { UpdateUserSchema } from "../validation/validateUser.js";
import { isSelf } from "../middleware/isSelf.js";
import { requireRole } from "../middleware/requireRole.js";

export const usersRouter = Router()

usersRouter.get("/", VerifyToken, requireRole("AUTHOR"), getAllUsers)
usersRouter.get("/protected", VerifyToken, getUserData)

usersRouter.get("/:id", VerifyToken, requireRole("AUTHOR"), getUser)

usersRouter.patch("/:id", VerifyToken, isSelf, validate(UpdateUserSchema), updateUser)
usersRouter.delete("/:id", VerifyToken, isSelf, deleteUser)
