"use client";

import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/forms/input";
import { Stack } from "@/shared/ui/layout/stack";
import { Alert } from "@/shared/ui/feedback/alert";
import { Text } from "@/shared/ui/data-display/text";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { updateCategoryAction, deleteCategoryAction } from "./actions";
import { categorySchema, type CategoryFormData } from "./logic";
import type { Category } from "@/shared/adapters/supabase/repositories/categories";

interface CategoryNameFieldProps {
  register: UseFormRegister<CategoryFormData>;
  onEscape: () => void;
}

function CategoryNameField({ register, onEscape }: CategoryNameFieldProps) {
  return (
    <Input
      {...register("name")}
      className="max-w-xs"
      autoFocus
      onKeyDown={(e) => {
        if (e.key === "Escape") onEscape();
      }}
    />
  );
}

interface CategoryItemProps {
  category: Category;
}

export function CategoryItem({ category }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category.name },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    const result = await updateCategoryAction(category.id, formData);

    if (result.success) {
      setIsEditing(false);
    } else {
      setServerError(result.error);
    }
  };

  const handleCancel = () => {
    reset({ name: category.name });
    setServerError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this category?")) {
      const result = await deleteCategoryAction(category.id);
      if (!result.success) {
        setServerError(result.error);
      }
    }
  };

  if (isEditing) {
    return (
      <li>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="sm" className="px-4 py-3">
            {serverError && <Alert variant="error">{serverError}</Alert>}
            {errors.name && <Alert variant="error">{errors.name.message}</Alert>}
            <Stack direction="row" gap="sm" align="center">
              <CategoryNameField register={register} onEscape={handleCancel} />
              <Button
                type="submit"
                size="icon-sm"
                variant="ghost"
                disabled={isSubmitting}
                aria-label="Save"
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
      </li>
    );
  }

  return (
    <li>
      <Stack gap="sm" className="px-4 py-3">
        {serverError && <Alert variant="error">{serverError}</Alert>}
        <Stack direction="row" align="center" justify="between">
          <Text weight="medium">{category.name}</Text>
          <Stack direction="row" gap="xs">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              aria-label="Edit category"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={handleDelete} aria-label="Delete category">
              <Trash2 className="h-4 w-4" />
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </li>
  );
}
