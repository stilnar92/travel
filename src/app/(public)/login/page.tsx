import { Stack } from "@/shared/ui/layout/stack";
import { LoginForm } from "./ui/LoginForm";

export default function LoginPage() {
  return (
    <Stack gap="lg" align="center" justify="center" className="min-h-screen">
      <LoginForm />
    </Stack>
  );
}
