
import { Request, Response } from "express";
import { deleteProviderFromId, getAccountById, getAllAccountsDb, getUserWithAccounts } from "../repos/userRepository.js";

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

export const unlinkProvider = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const userId = req.user!.id

    try {
        const user = await getUserWithAccounts(userId);
        if (!user) return res.status(401).json({ message: "Account no longer exists" })

        if (user.accounts.length <= 1) return res.status(400).json({ message: "Cannot unlink only remaining account" })

        const result = await deleteProviderFromId(id);
        return res.json({ message: "Unlinked Provider" })
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
