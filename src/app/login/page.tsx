import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/shared/adapters/supabase/client";
import { routes } from "@/shared/lib/routes";
import { Stack } from "@/shared/ui/layout/stack";
import { LoginForm } from "./ui/LoginForm";

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect(routes.vendors.list);
  }

  return (
    <Stack gap="lg" align="center" justify="center" className="min-h-screen">
      <LoginForm />
    </Stack>
  );
}
