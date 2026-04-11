import express from "express"
import { postsRouter } from "./rotes/postsRouter.js"
import { authorsRouter } from "./rotes/authorsRouter.js"
import { usersRouter } from "./rotes/usersRouter.js"
import { commentsRouter } from "./rotes/commentsRouter.js"

const app = express()

app.use(express.json())

app.use("/posts", postsRouter)
app.use("/authors", authorsRouter)
app.use("/users", usersRouter)
app.use("/comments", commentsRouter)

app.listen(3000, () => {
    console.log("http://localhost:3000")
})
