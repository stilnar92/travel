"use client";

import { type UseFormRegister } from "react-hook-form";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/forms/input";
import { Label } from "@/shared/ui/forms/label";
import { Stack } from "@/shared/ui/layout/stack";
import { Alert } from "@/shared/ui/feedback/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/data-display/card";
import { useLoginFormModel } from "./LoginForm.model";
import type { SignInFormData } from "../logic";

interface EmailFieldProps {
  register: UseFormRegister<SignInFormData>;
}

function EmailField({ register }: EmailFieldProps) {
  return (
    <Input
      id="email"
      type="email"
      {...register("email")}
      placeholder="Enter your email"
      autoComplete="email"
    />
  );
}

interface PasswordFieldProps {
  register: UseFormRegister<SignInFormData>;
}

function PasswordField({ register }: PasswordFieldProps) {
  return (
    <Input
      id="password"
      type="password"
      {...register("password")}
      placeholder="Enter your password"
      autoComplete="current-password"
    />
  );
}

export function LoginForm() {
  const {
    mode,
    serverError,
    isSubmitting,
    errors,
    register,
    handleSubmit,
    toggleMode,
  } = useLoginFormModel();

  const isSignIn = mode === "signin";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignIn ? "Sign In" : "Sign Up"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {serverError && <Alert variant="error">{serverError}</Alert>}

            <Stack gap="xs">
              <Label htmlFor="email">Email</Label>
              <EmailField register={register} />
              {errors.email && (
                <Alert variant="error">{errors.email.message}</Alert>
              )}
            </Stack>

            <Stack gap="xs">
              <Label htmlFor="password">Password</Label>
              <PasswordField register={register} />
              {errors.password && (
                <Alert variant="error">{errors.password.message}</Alert>
              )}
            </Stack>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? isSignIn
                  ? "Signing in..."
                  : "Signing up..."
                : isSignIn
                  ? "Sign In"
                  : "Sign Up"}
            </Button>

            <Button type="button" variant="link" onClick={toggleMode} className="w-full">
              {isSignIn
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
