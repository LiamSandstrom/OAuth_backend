import { Request, Response } from "express";
import { deleteUserFromId, getAllUsersDb, getUserFromId, getUserWithAccounts, updateUserFromId } from "../repos/userRepository.js";
import { AdminUpdateUserDto, UpdateUserDto } from "../validation/validateUser.js";

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

export const updateUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const body = req.body as UpdateUserDto | AdminUpdateUserDto

    try {
        const result = await updateUserFromId(id, body);
        console.log(result)
        return res.json({ message: "Updated User" })
    }
    catch (ex) {
        return res.status(500).json({ message: "Internal server error" })
    }

}
