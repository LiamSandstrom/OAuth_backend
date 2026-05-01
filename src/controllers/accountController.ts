
import { Request, Response } from "express";
import { getAccountById, getAllAccountsDb } from "../repos/userRepository.js";

export const getAllAccounts = async (req: Request, res: Response) => {
    try {
        const result = await getAllAccountsDb()
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }

}

export const getAccount = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const result = await getAccountById(id)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
