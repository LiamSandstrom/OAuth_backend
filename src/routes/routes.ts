import { Router } from "express"
import { authRouter } from "./authRouter.js"
import { usersRouter } from "./usersRouter.js"
import { postsRouter } from "./postsRouter.js"
import { adminRouter } from "./adminRouter.js"
import { unsafeVerifyToken, VerifyToken } from "../middleware/verifyToken.js"
import { requireRole } from "../middleware/requireRole.js"
import { Role } from "../generated/prisma/enums.js"
import { accountRouter } from "./accountRouter.js"

export const routes = Router()

routes.use("/posts", postsRouter)
routes.use("/users", usersRouter)
routes.use("/accounts", accountRouter)
routes.use("/auth", unsafeVerifyToken, authRouter)
routes.use("/admin", VerifyToken, requireRole(Role.AUTHOR), adminRouter)
