import express from "express"
import "./auth/auth.js"
import { postsRouter } from "./routes/postsRouter.js"
import { usersRouter } from "./routes/usersRouter.js"
import { commentsRouter } from "./routes/commentsRouter.js"
import { authRouter } from "./routes/authRouter.js"

const app = express()

app.use(express.json())

app.use("/posts", postsRouter)
app.use("/users", usersRouter)
app.use("/comments", commentsRouter)
app.use("/auth", authRouter)

app.listen(3000, () => {
    console.log("http://localhost:3000")
})
