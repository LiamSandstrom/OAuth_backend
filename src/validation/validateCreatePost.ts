import { z } from 'zod'

export const CreatePostSchema = z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(10).max(10000),
    published: z.boolean().optional(),
})

export const UpdatePostSchema = CreatePostSchema.partial().refine(
    obj => Object.keys(obj).length > 0,
    { message: "At least one field required" }
)

export type CreatePostDto = z.infer<typeof CreatePostSchema>
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>
