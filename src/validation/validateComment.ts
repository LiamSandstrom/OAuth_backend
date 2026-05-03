import { z } from 'zod'

export const CreateCommentSchema = z.object({
    text: z.string().min(1).max(255),
})

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>
