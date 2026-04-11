import "express";
import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            token?: string;
            user?: User | { id: number }
        }

        interface Response {
            authData?: string | JwtPayload;
        }
    }
}

