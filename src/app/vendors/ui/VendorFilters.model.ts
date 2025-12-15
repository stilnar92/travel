"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { useDebouncedCallback } from "@/shared/lib/hooks";

const vendorSearchParams = {
  city: parseAsString.withDefault("").withOptions({ shallow: false }),
  categoryId: parseAsString.withDefault("").withOptions({ shallow: false }),
} as const;

export function useVendorFiltersModel() {
  const [categoryId, setCategoryId] = useQueryState(
    "categoryId",
    vendorSearchParams.categoryId
  );

  const [urlCity, setUrlCity] = useQueryState(
    "city",
    vendorSearchParams.city
  );

  // Local state for city input (to avoid navigation on every keystroke)
  const [localCity, setLocalCity] = useState(urlCity);

  // Debounced URL update
  const debouncedSetUrlCity = useDebouncedCallback((value: string) => {
    setUrlCity(value || null);
  }, 300);

  const handleCityChange = useCallback(
    (value: string) => {
      setLocalCity(value);
      debouncedSetUrlCity(value);
    },
    [debouncedSetUrlCity]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategoryId(value || null);
    },
    [setCategoryId]
  );

  const handleClearFilters = useCallback(() => {
    setLocalCity("");
    debouncedSetUrlCity.cancel();
    setUrlCity(null);
    setCategoryId(null);
  }, [setUrlCity, setCategoryId, debouncedSetUrlCity]);

  const hasFilters = useMemo(() => {
    return localCity !== "" || categoryId !== "";
  }, [localCity, categoryId]);

  return {
    city: localCity,
    categoryId,
    hasFilters,
    handleCityChange,
    handleCategoryChange,
    handleClearFilters,
  };
}
