import express from "express"
import { authRouter } from "./authRouter.js"
import { commentsRouter } from "./commentsRouter.js"
import { usersRouter } from "./usersRouter.js"
import { postsRouter } from "./postsRouter.js"

export const routes = express.Router()

routes.use("/posts", postsRouter)
routes.use("/users", usersRouter)
routes.use("/comments", commentsRouter)
routes.use("/auth", authRouter)
