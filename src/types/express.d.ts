import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface User {
            id: number
        }
        interface Request {
            token?: string;
        }

        interface Response {
            authData?: string | JwtPayload;
        }
    }
}

