"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCategoryAction, deleteCategoryAction } from "../actions";
import { categorySchema, type CategoryFormData } from "../logic";
import type { Category } from "@/shared/adapters/supabase/repositories/categories";

interface UseCategoryItemModelOptions {
  category: Category;
}

export function useCategoryItemModel({ category }: UseCategoryItemModelOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CategoryFormData>({
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset({ name: category.name });
    setServerError(null);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setServerError(null);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setServerError(null);

    const result = await deleteCategoryAction(category.id);

    if (result.success) {
      setIsDeleteDialogOpen(false);
    } else {
      setServerError(result.error);
    }

    setIsDeleting(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setServerError(null);
  };

  return {
    isEditing,
    serverError,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    handleEdit,
    handleCancel,
    isDeleteDialogOpen,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    setIsDeleteDialogOpen,
  };
}
