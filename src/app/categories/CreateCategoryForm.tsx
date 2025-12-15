"use client";

import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/forms/input";
import { Stack } from "@/shared/ui/layout/stack";
import { Alert } from "@/shared/ui/feedback/alert";
import { Plus, Check, X } from "lucide-react";
import { createCategoryAction } from "./actions";
import { categorySchema, type CategoryFormData } from "./logic";

interface CategoryNameFieldProps {
  register: UseFormRegister<CategoryFormData>;
  onEscape: () => void;
}

function CategoryNameField({ register, onEscape }: CategoryNameFieldProps) {
  return (
    <Input
      {...register("name")}
      placeholder="Category name"
      className="max-w-xs"
      autoFocus
      onKeyDown={(e) => {
        if (e.key === "Escape") onEscape();
      }}
    />
  );
}

export function CreateCategoryForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryFormData) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    const result = await createCategoryAction(formData);

    if (result.success) {
      reset();
      setIsCreating(false);
    } else {
      setServerError(result.error);
    }
  };

  const handleCancel = () => {
    reset();
    setServerError(null);
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <Button onClick={() => setIsCreating(true)}>
        <Plus className="h-4 w-4" />
        Add Category
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="sm">
        {serverError && <Alert variant="error">{serverError}</Alert>}
        {errors.name && <Alert variant="error">{errors.name.message}</Alert>}
        <Stack direction="row" gap="sm" align="center">
          <CategoryNameField register={register} onEscape={handleCancel} />
          <Button
            type="submit"
            size="icon-sm"
            variant="ghost"
            disabled={isSubmitting}
            aria-label="Create category"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={handleCancel}
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
