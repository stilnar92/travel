import {
  getVendors,
  getVendorById,
  type VendorFilters,
} from "@/shared/adapters/supabase/repositories/vendors.server";
import { getCategories } from "@/shared/adapters/supabase/repositories/categories.server";

export async function fetchVendors(filters?: VendorFilters) {
  return getVendors(filters);
}

export async function fetchVendorById(id: string) {
  return getVendorById(id);
}

export async function fetchCategories() {
  return getCategories();
}

export type { VendorFilters };
