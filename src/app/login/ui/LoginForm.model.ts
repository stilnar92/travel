"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInAction, signUpAction } from "../actions";
import { signInSchema, signUpSchema, type SignInFormData, type SignUpFormData } from "../logic";

type AuthMode = "signin" | "signup";

export function useLoginFormModel() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = mode === "signin" ? signInSchema : signUpSchema;
  type FormData = typeof mode extends "signin" ? SignInFormData : SignUpFormData;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);

    const action = mode === "signin" ? signInAction : signUpAction;
    const result = await action(formData);

    // If we get here, there was an error (success redirects)
    if (!result.success) {
      setServerError(result.error);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setServerError(null);
    form.reset();
  };

  return {
    mode,
    serverError,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    toggleMode,
  };
}
