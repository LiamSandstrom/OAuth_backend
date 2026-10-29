import { Request, Response } from "express"
import { prisma } from "../repos/client.js"

export const getHealth = async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        return res.json({ status: "ok" })
    } catch {
        return res.status(503).json({ status: "unavailable" })
    }
}
