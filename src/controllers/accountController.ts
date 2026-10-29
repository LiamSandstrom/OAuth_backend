import { Request, Response } from "express";
import { deleteProviderFromId, getAccountById, getAllAccountsDb, getUserWithAccounts } from "../repos/userRepository.js";

export const getAllAccounts = async (req: Request, res: Response) => {
    const result = await getAllAccountsDb()
    return res.json(result)
}

export const getAccount = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const result = await getAccountById(id)
    if (!result) return res.status(404).json({ message: "Not found" })
    return res.json(result)
}

export const unlinkProvider = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const userId = req.user!.id

    const user = await getUserWithAccounts(userId);
    if (!user) return res.status(401).json({ message: "Account no longer exists" })

    if (user.accounts.length <= 1) return res.status(400).json({ message: "Cannot unlink only remaining account" })

    await deleteProviderFromId(id);
    return res.json({ message: "Unlinked Provider" })
}
