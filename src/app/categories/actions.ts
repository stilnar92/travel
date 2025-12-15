"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/shared/adapters/supabase/repositories/categories.server";
import { ok, err, type ActionResult } from "@/shared/lib/action-result";
import { ErrorCode, handleError } from "@/shared/lib/errors";
import { categorySchema } from "./logic";

export async function createCategoryAction(
  formData: FormData
): Promise<ActionResult<Category>> {
  const name = formData.get("name") as string;

  const result = categorySchema.safeParse({ name });
  if (!result.success) {
    return err(result.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
  }

  try {
    const category = await createCategory({ name: result.data.name });
    revalidatePath("/categories");
    return ok(category);
  } catch (error) {
    return err(handleError(error, ErrorCode.DATABASE_ERROR), ErrorCode.DATABASE_ERROR);
  }
}

export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Category>> {
  const name = formData.get("name") as string;

  const result = categorySchema.safeParse({ name });
  if (!result.success) {
    return err(result.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
  }

  try {
    const category = await updateCategory(id, { name: result.data.name });
    revalidatePath("/categories");
    return ok(category);
  } catch (error) {
    return err(handleError(error, ErrorCode.DATABASE_ERROR), ErrorCode.DATABASE_ERROR);
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    await deleteCategory(id);
    revalidatePath("/categories");
    return ok(null);
  } catch (error) {
    return err(handleError(error, ErrorCode.DATABASE_ERROR), ErrorCode.DATABASE_ERROR);
  }
}
