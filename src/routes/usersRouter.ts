import { Router } from "express";
import { VerifyToken } from "../middleware/verifyToken.js";
import { prisma } from "../repos/client.js";
import { validateId } from "../middleware/validateId.js";
import { deleteUser, getAllUsers, getUser, updateUser } from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { UpdateUserSchema } from "../validation/validateUser.js";
import { isSelf } from "../middleware/isSelf.js";

export const usersRouter = Router()

usersRouter.get("/", getAllUsers)
usersRouter.get("/protected", VerifyToken, async (req, res) => {
    console.log(req.user)
    const user = await prisma.user.findUnique({
        where: {
            id: req.user!.id
        }
    })
    return res.json({
        message: `Logged in as USERNAME: ${user?.username}, EMAIL: ${user?.email}, ROLE: ${user?.role}`
    })
})

usersRouter.use("/:id", validateId())
usersRouter.get("/:id", getUser)
usersRouter.patch("/:id", VerifyToken, isSelf, validate(UpdateUserSchema), updateUser)
usersRouter.delete("/:id", VerifyToken, isSelf, deleteUser)
