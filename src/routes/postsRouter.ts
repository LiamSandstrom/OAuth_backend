import { Router } from "express";

export const postsRouter = Router()

postsRouter.get("/", (req, res) => {
    return res.json({
        message: "ALL"
    })
})

postsRouter.get("/protected", (req, res) => {
    res.json({
        message: "You are in"
    })
})

postsRouter.post("/", (req, res) => {
    return res.json({
        message: "UPLOAD"
    })
})

postsRouter.get("/:id", (req, res) => {
    console.log("test")
    const { id } = req.params

    return res.json({
        message: `GET ${id}`
    })
})

postsRouter.put("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `CHANGED ${id}`
    })
})

postsRouter.delete("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `DELETED ${id}`
    })
})
