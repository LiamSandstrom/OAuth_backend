import express from "express"
import { authRouter } from "./authRouter.js"
import { usersRouter } from "./usersRouter.js"
import { postsRouter } from "./postsRouter.js"
import { adminRouter } from "./adminRouter.js"
import { unsafeVerifyToken, VerifyToken } from "../middleware/verifyToken.js"
import { requireRole } from "../middleware/requireRole.js"
import { Role } from "../generated/prisma/enums.js"

export const routes = express.Router()

routes.use("/posts", postsRouter)
routes.use("/users", usersRouter)
routes.use("/auth", unsafeVerifyToken, authRouter)
routes.use("/admin", VerifyToken, requireRole(Role.AUTHOR), adminRouter)
