"use client";

import { type UseFormRegister } from "react-hook-form";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/forms/input";
import { Stack } from "@/shared/ui/layout/stack";
import { Alert } from "@/shared/ui/feedback/alert";
import { Text } from "@/shared/ui/data-display/text";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useCategoryItemModel } from "./CategoryItem.model";
import type { CategoryFormData } from "../logic";
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
  const {
    isEditing,
    serverError,
    isSubmitting,
    errors,
    register,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleDelete,
  } = useCategoryItemModel({ category });

  if (isEditing) {
    return (
      <li>
        <form onSubmit={handleSubmit}>
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
              onClick={handleEdit}
              aria-label="Edit category"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleDelete}
              aria-label="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </li>
  );
}
