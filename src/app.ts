import express from "express"
import "dotenv/config";
import "./config/validateEnvFile.js"
import "./auth/googleStrategy.js"
import "./auth/githubStrategy.js"
import cookieParser from "cookie-parser"
import { routes } from "./routes/routes.js"
import { errorHandler, notFound } from "./middleware/errorHandler.js"

export const app = express()

app.use(express.json())
app.use(cookieParser())

if (process.env.NODE_ENV === "development") app.set("json spaces", 2)

app.use("/", routes);
app.use(notFound)
app.use(errorHandler)
