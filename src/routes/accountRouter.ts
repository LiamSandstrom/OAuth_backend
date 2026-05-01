import { Router } from "express"
import { getAccount, getAllAccounts } from "../controllers/accountController.js";
import { validateId } from "../middleware/validateId.js";

export const accountRouter = Router();

accountRouter.get("/", getAllAccounts)

accountRouter.use("/:id", validateId())
accountRouter.get("/:id", getAccount)


