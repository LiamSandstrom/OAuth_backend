import { Router } from "express";

export const commentsRouter = Router()

commentsRouter.get("/", (req, res) => {
    return res.json({
        message: "ALL"
    })
})

commentsRouter.post("/", (req, res) => {
    return res.json({
        message: "UPLOAD"
    })
})

commentsRouter.get("/:id", (req, res) => {
    console.log("test")
    const { id } = req.params

    return res.json({
        message: `GET ${id}`
    })
})

commentsRouter.put("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `CHANGED ${id}`
    })
})

commentsRouter.delete("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `DELETED ${id}`
    })
})
