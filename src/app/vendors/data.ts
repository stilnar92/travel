import { getVendors, getVendorById } from "@/shared/adapters/supabase/repositories/vendors.server";
import { getCategories } from "@/shared/adapters/supabase/repositories/categories.server";

export async function fetchVendors() {
  return getVendors();
}

export async function fetchVendorById(id: string) {
  return getVendorById(id);
}

export async function fetchCategories() {
  return getCategories();
}
