import { NextFunction, Request, Response } from "express"
import { Prisma } from "../generated/prisma/client.js"
import { FeedbackUnavailableError } from "../services/aiFeedback.js"

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({ message: "Not found" })
}

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025" || err.code === "P2003") return res.status(404).json({ message: "Not found" })
        if (err.code === "P2002") return res.status(409).json({ message: "Already exists" })
    }

    if (err instanceof FeedbackUnavailableError) {
        return res.status(503).json({ message: err.message })
    }

    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ message: "Invalid JSON body" })
    }

    console.error(err)
    res.status(500).json({ message: "Internal server error" })
}
