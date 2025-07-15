import { z } from "zod";

export const DeleteSystemPermissionRequestSchema = z.object({
    ids: z.array(z.string()).min(1),
});

export const DeleteSystemPermissionResponseSchema = z.object({
   failed: z.array(z.string()),
   success: z.array(z.string()),
}).strict(); 