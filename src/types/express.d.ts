import { JwtPayload } from "jsonwebtoken";
import { Role } from "../generated/prisma/enums.ts";

declare global {
    namespace Express {
        interface User {
            id: number
            role: Role
        }
        interface Request {
            token?: string;
        }
    }
}

