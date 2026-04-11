import { Router } from "express";

export const authorsRouter = Router()

authorsRouter.get("/", (req, res) => {
    return res.json({
        message: "ALL"
    })
})

authorsRouter.post("/", (req, res) => {
    return res.json({
        message: "UPLOAD"
    })
})

authorsRouter.get("/:id", (req, res) => {
    console.log("test")
    const { id } = req.params

    return res.json({
        message: `GET ${id}`
    })
})

authorsRouter.put("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `CHANGED ${id}`
    })
})

authorsRouter.delete("/:id", (req, res) => {
    const { id } = req.params

    return res.json({
        message: `DELETED ${id}`
    })
})
