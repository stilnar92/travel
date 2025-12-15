import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/buttons/button";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
import { Grid } from "@/shared/ui/layout/grid";
import { Plus } from "lucide-react";
import { routes } from "@/shared/lib/routes";
import { fetchVendors, fetchCategories } from "./data";
import { VendorCard } from "./ui/VendorCard";
import { VendorFilters } from "./ui/VendorFilters";

interface VendorsPageProps {
  searchParams: Promise<{ city?: string; categoryId?: string }>;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const params = await searchParams;
  const [vendors, categories] = await Promise.all([
    fetchVendors({
      city: params.city,
      categoryId: params.categoryId,
    }),
    fetchCategories(),
  ]);

  const hasFilters = params.city || params.categoryId;

  return (
    <Stack gap="lg">
      <Stack direction="row" justify="between" align="center">
        <Text as="h1" size="3xl" weight="bold">
          Vendors
        </Text>
        <Button asChild>
          <Link href={routes.vendors.new}>
            <Plus className="h-4 w-4" />
            Add Vendor
          </Link>
        </Button>
      </Stack>

      <Suspense fallback={null}>
        <VendorFilters categories={categories} />
      </Suspense>

      {vendors.length === 0 ? (
        <Text color="muted">
          {hasFilters
            ? "No vendors match your filters."
            : "No vendors yet. Create your first one!"}
        </Text>
      ) : (
        <Grid colsMd={2} colsLg={3}>
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </Grid>
      )}
    </Stack>
  );
}
