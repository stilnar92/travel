"use client";

import { tv } from "tailwind-variants";
import { Input } from "@/shared/ui/forms/input";
import { Select } from "@/shared/ui/forms/select";
import { Label } from "@/shared/ui/forms/label";
import { Button } from "@/shared/ui/buttons/button";
import { Stack } from "@/shared/ui/layout/stack";
import { Card, CardContent } from "@/shared/ui/data-display/card";
import { X } from "lucide-react";
import { useVendorFiltersModel } from "./VendorFilters.model";
import type { Category } from "@/shared/adapters/supabase/repositories/categories.server";

const clearButton = tv({
  base: "transition-opacity",
  variants: {
    visible: {
      true: "opacity-100",
      false: "opacity-0 pointer-events-none",
    },
  },
});

// Named field components
interface VendorCityFilterFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function VendorCityFilterField({ value, onChange }: VendorCityFilterFieldProps) {
  return (
    <Input
      id="city-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Filter by city..."
    />
  );
}

interface VendorCategoryFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
}

function VendorCategoryFilterSelect({
  value,
  onChange,
  categories,
}: VendorCategoryFilterSelectProps) {
  return (
    <Select
      id="category-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </Select>
  );
}

interface VendorFiltersProps {
  categories: Category[];
}

export function VendorFilters({ categories }: VendorFiltersProps) {
  const {
    city,
    categoryId,
    hasFilters,
    handleCityChange,
    handleCategoryChange,
    handleClearFilters,
  } = useVendorFiltersModel();

  return (
    <Card>
      <CardContent className="pt-4">
        <Stack direction="row" gap="md" align="end">
          <Stack gap="xs" className="flex-1 min-w-[150px] max-w-[250px]">
            <Label htmlFor="city-filter">City</Label>
            <VendorCityFilterField value={city} onChange={handleCityChange} />
          </Stack>

          <Stack gap="xs" className="flex-1 min-w-[150px] max-w-[250px]">
            <Label htmlFor="category-filter">Category</Label>
            <VendorCategoryFilterSelect
              value={categoryId}
              onChange={handleCategoryChange}
              categories={categories}
            />
          </Stack>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className={clearButton({ visible: hasFilters }) + " h-9"}
            aria-hidden={!hasFilters}
            tabIndex={hasFilters ? 0 : -1}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
