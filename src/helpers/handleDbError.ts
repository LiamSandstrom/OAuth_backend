import { Response } from "express";
import { Prisma } from "../generated/prisma/client.js";

export const handleDbError = (ex: unknown, res: Response) => {
    if (ex instanceof Prisma.PrismaClientKnownRequestError) {
        if (ex.code === "P2025" || ex.code === "P2003") return res.status(404).json({ message: "Not found" })
        if (ex.code === "P2002") return res.status(409).json({ message: "Already exists" })
    }
    return res.status(500).json({ message: "Internal server error" })
}
