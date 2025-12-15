import { getCategories } from "@/shared/adapters/supabase/repositories/categories.server";

export async function fetchCategories() {
  return getCategories();
}
