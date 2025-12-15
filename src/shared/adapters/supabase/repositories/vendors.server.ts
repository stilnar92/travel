import { createServerSupabaseClient } from "../client";
import {
  getVendors as _getVendors,
  getVendorById as _getVendorById,
  createVendor as _createVendor,
  updateVendor as _updateVendor,
  deleteVendor as _deleteVendor,
  type VendorCreateInput,
  type VendorUpdateInput,
} from "./vendors";

export async function getVendors() {
  const client = await createServerSupabaseClient();
  return _getVendors(client);
}

export async function getVendorById(id: string) {
  const client = await createServerSupabaseClient();
  return _getVendorById(client, id);
}

export async function createVendor(data: VendorCreateInput) {
  const client = await createServerSupabaseClient();
  return _createVendor(client, data);
}

export async function updateVendor(id: string, data: VendorUpdateInput) {
  const client = await createServerSupabaseClient();
  return _updateVendor(client, id, data);
}

export async function deleteVendor(id: string) {
  const client = await createServerSupabaseClient();
  return _deleteVendor(client, id);
}

export type { Vendor, VendorCreateInput, VendorUpdateInput } from "./vendors";
