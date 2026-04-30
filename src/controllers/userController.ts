import { Request, Response } from "express";
import { deleteProviderFromId, deleteUserFromId, getAllUsersDb, getUserFromId, getUserWithAccounts } from "../repos/userRepository.js";

export const getUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const result = await getUserFromId(id)
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await getAllUsersDb()
        if (!result) return res.status(404).json({ message: "Not found" })
        return res.json(result)
    } catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

//delete whole account
export const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    try {
        const result = await deleteUserFromId(id);
        return res.json({ message: "Deleted User" })
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

//delete provider
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
