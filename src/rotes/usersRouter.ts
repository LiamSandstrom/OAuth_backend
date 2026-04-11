import { Router } from "express";

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
