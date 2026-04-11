import express from "express"
import { postsRouter } from "./rotes/postsRouter"
import { authorsRouter } from "./rotes/authorsRouter"
import { usersRouter } from "./rotes/usersRouter"
import { commentsRouter } from "./rotes/commentsRouter"

const app = express()

app.use(express.json())

app.use("/posts", postsRouter)
app.use("/authors", authorsRouter)
app.use("/users", usersRouter)
app.use("/comments", commentsRouter)

app.listen(3000, () => {
    console.log("http://localhost:3000")
})
