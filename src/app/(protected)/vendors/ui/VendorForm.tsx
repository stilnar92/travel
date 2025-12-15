"use client";

import { type UseFormRegister } from "react-hook-form";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/forms/input";
import { Label } from "@/shared/ui/forms/label";
import { Checkbox } from "@/shared/ui/forms/checkbox";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
import { Alert } from "@/shared/ui/feedback/alert";
import { Card, CardContent } from "@/shared/ui/data-display/card";
import { useVendorFormModel } from "./VendorForm.model";
import type { VendorFormData } from "../logic";
import type { Category } from "@/shared/adapters/supabase/repositories/categories.server";
import type { Vendor } from "@/shared/adapters/supabase/repositories/vendors.server";

// Named field components
interface VendorNameFieldProps {
  register: UseFormRegister<VendorFormData>;
}

function VendorNameField({ register }: VendorNameFieldProps) {
  return (
    <Input
      id="name"
      {...register("name")}
      placeholder="Enter vendor name"
    />
  );
}

interface VendorCityFieldProps {
  register: UseFormRegister<VendorFormData>;
}

function VendorCityField({ register }: VendorCityFieldProps) {
  return (
    <Input
      id="city"
      {...register("city")}
      placeholder="Enter city"
    />
  );
}

interface VendorCategoriesCheckboxesProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (categoryId: string, checked: boolean) => void;
}

function VendorCategoriesCheckboxes({ categories, selectedIds, onToggle }: VendorCategoriesCheckboxesProps) {
  return (
    <Stack gap="xs">
      {categories.map((category) => (
        <Label key={category.id} className="cursor-pointer">
          <Stack direction="row" gap="sm" align="center">
            <Checkbox
              checked={selectedIds.includes(category.id)}
              onCheckedChange={(checked) => onToggle(category.id, checked === true)}
            />
            <Text>{category.name}</Text>
          </Stack>
        </Label>
      ))}
    </Stack>
  );
}

// Main component
interface VendorFormProps {
  categories: Category[];
  vendor?: Vendor;
}

export function VendorForm({ categories, vendor }: VendorFormProps) {
  const {
    serverError,
    isEditMode,
    isSubmitting,
    errors,
    register,
    watch,
    setValue,
    handleSubmit,
    handleCancel,
  } = useVendorFormModel({ vendor });

  const selectedCategoryIds = watch("categoryIds");

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const current = selectedCategoryIds || [];
    const updated = checked
      ? [...current, categoryId]
      : current.filter((id) => id !== categoryId);
    setValue("categoryIds", updated, { shouldValidate: true });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {serverError && <Alert variant="error">{serverError}</Alert>}

            <Stack gap="xs">
              <Label htmlFor="name">Name</Label>
              <VendorNameField register={register} />
              {errors.name && (
                <Alert variant="error">{errors.name.message}</Alert>
              )}
            </Stack>

            <Stack gap="xs">
              <Label htmlFor="city">City</Label>
              <VendorCityField register={register} />
              {errors.city && (
                <Alert variant="error">{errors.city.message}</Alert>
              )}
            </Stack>

            <Stack gap="xs">
              <Label>Categories</Label>
              <VendorCategoriesCheckboxes
                categories={categories}
                selectedIds={selectedCategoryIds}
                onToggle={handleCategoryToggle}
              />
              {errors.categoryIds && (
                <Alert variant="error">{errors.categoryIds.message}</Alert>
              )}
            </Stack>

            <Stack direction="row" gap="sm" justify="end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Save Vendor"
                    : "Create Vendor"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
