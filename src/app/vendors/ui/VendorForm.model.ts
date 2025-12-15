"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVendorAction, updateVendorAction } from "../actions";
import { vendorSchema, type VendorFormData } from "../logic";
import { routes } from "@/shared/lib/routes";
import type { Vendor } from "@/shared/adapters/supabase/repositories/vendors.server";

interface UseVendorFormOptions {
  vendor?: Vendor;
}

export function useVendorFormModel({ vendor }: UseVendorFormOptions = {}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditMode = !!vendor;

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name ?? "",
      city: vendor?.city ?? "",
      categoryIds: vendor?.categories?.map((c) => c.id) ?? [],
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    setServerError(null);

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("city", data.city);
    data.categoryIds.forEach((id) => formData.append("categoryIds", id));

    const result = isEditMode
      ? await updateVendorAction(vendor.id, formData)
      : await createVendorAction(formData);

    if (result.success) {
      router.push(routes.vendors.list);
    } else {
      setServerError(result.error);
    }
  };

  const handleCancel = () => {
    router.push(routes.vendors.list);
  };

  return {
    form,
    serverError,
    isEditMode,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    handleCancel,
  };
}
