import { createServerSupabaseClient } from "../client";
import {
  getCategories as _getCategories,
  getCategoryById as _getCategoryById,
  createCategory as _createCategory,
  updateCategory as _updateCategory,
  deleteCategory as _deleteCategory,
  type CategoryInsert,
  type CategoryUpdate,
} from "./categories";

export async function getCategories() {
  const client = await createServerSupabaseClient();
  return _getCategories(client);
}

export async function getCategoryById(id: string) {
  const client = await createServerSupabaseClient();
  return _getCategoryById(client, id);
}

export async function createCategory(data: CategoryInsert) {
  const client = await createServerSupabaseClient();
  return _createCategory(client, data);
}

export async function updateCategory(id: string, data: CategoryUpdate) {
  const client = await createServerSupabaseClient();
  return _updateCategory(client, id, data);
}

export async function deleteCategory(id: string) {
  const client = await createServerSupabaseClient();
  return _deleteCategory(client, id);
}

export type { Category, CategoryInsert, CategoryUpdate } from "./categories";
