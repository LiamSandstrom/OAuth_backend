import { NextFunction, Request, Response } from "express";
import z, { ZodType } from "zod";


export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
        const flat = result.error.flatten()
        return res.status(400).json({
            message: "Validation failed",
            errors: flat.fieldErrors,
            formErrors: flat.formErrors
        })
    }

    req.body = result.data
    next()
}
