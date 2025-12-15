"use server";

import { revalidatePath } from "next/cache";
import {
  createVendor,
  updateVendor,
  deleteVendor,
  type Vendor,
} from "@/shared/adapters/supabase/repositories/vendors.server";
import { ok, err, type ActionResult } from "@/shared/lib/action-result";
import { ErrorCode, handleError } from "@/shared/lib/errors";
import { vendorSchema } from "./logic";

export async function createVendorAction(
  formData: FormData
): Promise<ActionResult<Vendor>> {
  const name = formData.get("name") as string;
  const city = formData.get("city") as string;
  const categoryIds = formData.getAll("categoryIds") as string[];

  const result = vendorSchema.safeParse({ name, city, categoryIds });
  if (!result.success) {
    return err(result.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
  }

  try {
    const vendor = await createVendor({
      name: result.data.name,
      city: result.data.city,
      categoryIds: result.data.categoryIds,
    });
    revalidatePath("/vendors");
    return ok(vendor);
  } catch (error) {
    return err(handleError(error, ErrorCode.DATABASE_ERROR), ErrorCode.DATABASE_ERROR);
  }
}

export async function updateVendorAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Vendor>> {
  const name = formData.get("name") as string;
  const city = formData.get("city") as string;
  const categoryIds = formData.getAll("categoryIds") as string[];

  const result = vendorSchema.safeParse({ name, city, categoryIds });
  if (!result.success) {
    return err(result.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
  }

  try {
    const vendor = await updateVendor(id, {
      name: result.data.name,
      city: result.data.city,
      categoryIds: result.data.categoryIds,
    });
    revalidatePath("/vendors");
    return ok(vendor);
  } catch (error) {
    return err(handleError(error, ErrorCode.DATABASE_ERROR), ErrorCode.DATABASE_ERROR);
  }
}

export async function deleteVendorAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    await deleteVendor(id);
    revalidatePath("/vendors");
    return ok(null);
  } catch (error) {
    return err(handleError(error, ErrorCode.DATABASE_ERROR), ErrorCode.DATABASE_ERROR);
  }
}
