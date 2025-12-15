import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
