"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/shared/adapters/supabase/client";
import { err, type ActionResult } from "@/shared/lib/action-result";
import { ErrorCode } from "@/shared/lib/errors";
import { routes } from "@/shared/lib/routes";
import { signInSchema, signUpSchema } from "./schemas";

export async function signInAction(
  formData: FormData
): Promise<ActionResult<null>> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return err("Invalid form data", ErrorCode.VALIDATION_ERROR);
  }

  const result = signInSchema.safeParse({ email, password });
  if (!result.success) {
    return err(result.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return err(error.message, ErrorCode.AUTH_ERROR);
  }

  redirect(routes.vendors.list);
}

export async function signUpAction(
  formData: FormData
): Promise<ActionResult<null>> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return err("Invalid form data", ErrorCode.VALIDATION_ERROR);
  }

  const result = signUpSchema.safeParse({ email, password });
  if (!result.success) {
    return err(result.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return err(error.message, ErrorCode.AUTH_ERROR);
  }

  redirect(routes.vendors.list);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect(routes.auth.login);
}
