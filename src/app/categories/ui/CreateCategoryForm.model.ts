"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategoryAction } from "../actions";
import { categorySchema, type CategoryFormData } from "../logic";

export function useCreateCategoryFormModel() {
  const [isCreating, setIsCreating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryFormData) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    const result = await createCategoryAction(formData);

    if (result.success) {
      form.reset();
      setIsCreating(false);
    } else {
      setServerError(result.error);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    form.reset();
    setServerError(null);
    setIsCreating(false);
  };

  return {
    isCreating,
    serverError,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    handleCreate,
    handleCancel,
  };
}
