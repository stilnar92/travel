import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";

type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];
type VendorInsert = Database["public"]["Tables"]["vendors"]["Insert"];
type VendorUpdate = Database["public"]["Tables"]["vendors"]["Update"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export type Vendor = VendorRow & {
  categories: Category[];
};

export type VendorCreateInput = VendorInsert & {
  categoryIds: string[];
};

export type VendorUpdateInput = VendorUpdate & {
  categoryIds?: string[];
};

export interface VendorFilters {
  city?: string;
  categoryId?: string;
}

export async function getVendors(
  client: SupabaseClient<Database>,
  filters?: VendorFilters
) {
  // If filtering by category, first get vendor IDs that have this category
  let vendorIdsWithCategory: string[] | null = null;
  if (filters?.categoryId) {
    const { data: vendorCategories, error: vcError } = await client
      .from("vendor_categories")
      .select("vendor_id")
      .eq("category_id", filters.categoryId);

    if (vcError) throw vcError;

    vendorIdsWithCategory = vendorCategories.map((vc) => vc.vendor_id);

    // Early return if no vendors have this category
    if (vendorIdsWithCategory.length === 0) {
      return [];
    }
  }

  let query = client
    .from("vendors")
    .select(`
      *,
      vendor_categories (
        categories (*)
      )
    `)
    .order("name");

  // Filter by vendor IDs (from category filter)
  if (vendorIdsWithCategory) {
    query = query.in("id", vendorIdsWithCategory);
  }

  // Filter by city (case-insensitive partial match)
  if (filters?.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((vendor) => ({
    ...vendor,
    categories: vendor.vendor_categories.map((vc) => vc.categories).filter(Boolean) as Category[],
  }));
}

export async function getVendorById(
  client: SupabaseClient<Database>,
  id: string
) {
  const { data, error } = await client
    .from("vendors")
    .select(`
      *,
      vendor_categories (
        categories (*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    categories: data.vendor_categories.map((vc) => vc.categories).filter(Boolean) as Category[],
  };
}

export async function createVendor(
  client: SupabaseClient<Database>,
  input: VendorCreateInput
) {
  const { categoryIds, ...vendorData } = input;

  // Create vendor
  const { data: vendor, error: vendorError } = await client
    .from("vendors")
    .insert(vendorData)
    .select()
    .single();

  if (vendorError) throw vendorError;

  // Create category associations
  if (categoryIds.length > 0) {
    const { error: categoryError } = await client
      .from("vendor_categories")
      .insert(categoryIds.map((categoryId) => ({
        vendor_id: vendor.id,
        category_id: categoryId,
      })));

    if (categoryError) throw categoryError;
  }

  return getVendorById(client, vendor.id);
}

export async function updateVendor(
  client: SupabaseClient<Database>,
  id: string,
  input: VendorUpdateInput
) {
  const { categoryIds, ...vendorData } = input;

  // Update vendor
  if (Object.keys(vendorData).length > 0) {
    const { error: vendorError } = await client
      .from("vendors")
      .update(vendorData)
      .eq("id", id);

    if (vendorError) throw vendorError;
  }

  // Update category associations if provided
  if (categoryIds !== undefined) {
    // Delete existing associations
    const { error: deleteError } = await client
      .from("vendor_categories")
      .delete()
      .eq("vendor_id", id);

    if (deleteError) throw deleteError;

    // Create new associations
    if (categoryIds.length > 0) {
      const { error: insertError } = await client
        .from("vendor_categories")
        .insert(categoryIds.map((categoryId) => ({
          vendor_id: id,
          category_id: categoryId,
        })));

      if (insertError) throw insertError;
    }
  }

  return getVendorById(client, id);
}

export async function deleteVendor(
  client: SupabaseClient<Database>,
  id: string
) {
  // Delete category associations first (due to FK constraint)
  const { error: categoryError } = await client
    .from("vendor_categories")
    .delete()
    .eq("vendor_id", id);

  if (categoryError) throw categoryError;

  // Delete vendor
  const { error } = await client.from("vendors").delete().eq("id", id);

  if (error) throw error;
}
