import { Request, Response } from "express";
import { deleteUserFromId, getAllUsersDb, getUserFromId, updateUserFromId } from "../repos/userRepository.js";
import { AdminUpdateUserDto, UpdateUserDto } from "../validation/validateUser.js";

export const getUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const result = await getUserFromId(id)
    if (!result) return res.status(404).json({ message: "Not found" })
    return res.json(result)
}

export const getUserData = async (req: Request, res: Response) => {
    const userId = req.user!.id

    const user = await getUserFromId(userId)
    if (!user) return res.status(404).json({ message: "Not found" })

    return res.json({
        message: `Logged in as USERNAME: ${user.username}, EMAIL: ${user.email}, ROLE: ${user.role}`
    })
}

export const getAllUsers = async (req: Request, res: Response) => {
    const result = await getAllUsersDb()
    return res.json(result)
}

//delete whole account
export const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    await deleteUserFromId(id);
    return res.json({ message: "Deleted User" })
}

export const updateUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const body = req.body as UpdateUserDto | AdminUpdateUserDto

    await updateUserFromId(id, body);
    return res.json({ message: "Updated User" })
}
