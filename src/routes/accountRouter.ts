import { Router } from "express"
import { getAccount, getAllAccounts, unlinkProvider } from "../controllers/accountController.js";
import { validateId } from "../middleware/validateId.js";
import { isAccountOwnerOrAuthor } from "../middleware/isAccountOwner.js";
import { requireRole } from "../middleware/requireRole.js";
import { Role } from "../generated/prisma/enums.js";

export const accountRouter = Router();

accountRouter.get("/", requireRole(Role.AUTHOR), getAllAccounts)

accountRouter.use("/:id", validateId(), isAccountOwnerOrAuthor)
accountRouter.get("/:id", getAccount)
accountRouter.delete("/:id", unlinkProvider)
