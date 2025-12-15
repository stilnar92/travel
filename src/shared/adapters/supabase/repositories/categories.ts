import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export async function getCategories(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getCategoryById(
  client: SupabaseClient<Database>,
  id: string
) {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCategory(
  client: SupabaseClient<Database>,
  category: CategoryInsert
) {
  const { data, error } = await client
    .from("categories")
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  client: SupabaseClient<Database>,
  id: string,
  category: CategoryUpdate
) {
  const { data, error } = await client
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(
  client: SupabaseClient<Database>,
  id: string
) {
  const { error } = await client.from("categories").delete().eq("id", id);

  if (error) throw error;
}

export type { Category, CategoryInsert, CategoryUpdate };
