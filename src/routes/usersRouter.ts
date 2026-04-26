import { Router } from "express";
import { VerifyToken } from "../middleware/verifyToken.js";
import { prisma } from "../repos/client.js";

export const usersRouter = Router()

usersRouter.get("/", (req, res) => {
    return res.json({
        message: "ALL"
    })
})

usersRouter.post("/", (req, res) => {
    return res.json({
        message: "UPLOAD"
    })
})

usersRouter.get("/protected", VerifyToken, async (req, res) => {
    console.log(req.user)
    const user = await prisma.user.findUnique({
        where: {
            id: req.user!.id
        }
    })
    return res.json({
        message: `Logged in as USERNAME: ${user?.username}, EMAIL: ${user?.email}, ROLE: ${user?.role}`
    })
})

usersRouter.get("/:id", (req, res) => {
    console.log("test")
    const { id } = req.params

    return res.json({
        message: `GET ${id}`
    })
})

usersRouter.put("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `CHANGED ${id}`
    })
})

usersRouter.delete("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `DELETED ${id}`
    })
})
