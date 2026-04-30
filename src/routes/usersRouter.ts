import { Router } from "express";
import { VerifyToken } from "../middleware/verifyToken.js";
import { prisma } from "../repos/client.js";
import { validateId } from "../middleware/validateId.js";
import { getAllUsers, getUser } from "../controllers/userController.js";

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

//Dynamic routes
usersRouter.use("/:id", validateId())

usersRouter.get("/:id", getUser)


