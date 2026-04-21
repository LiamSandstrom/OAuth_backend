import express from "express"
import "./auth/googleStrategy.js"
import cookieParser from "cookie-parser"
import { routes } from "./routes/routes.js"

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/", routes);

app.listen(3000, () => {
    console.log("http://localhost:3000")
})
