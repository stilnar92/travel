import { z } from "zod";

export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  city: z.string().min(1, "City is required").max(100, "City is too long"),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
