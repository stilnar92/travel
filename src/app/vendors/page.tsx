import Link from "next/link";
import { Button } from "@/shared/ui/buttons/button";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
import { Grid } from "@/shared/ui/layout/grid";
import { Plus } from "lucide-react";
import { fetchVendors } from "./data";
import { VendorCard } from "./ui/VendorCard";

export default async function VendorsPage() {
  const vendors = await fetchVendors();

  return (
    <Stack gap="lg">
      <Stack direction="row" justify="between" align="center">
        <Text as="h1" size="3xl" weight="bold">
          Vendors
        </Text>
        <Button asChild>
          <Link href="/vendors/new">
            <Plus className="h-4 w-4" />
            Add Vendor
          </Link>
        </Button>
      </Stack>

      {vendors.length === 0 ? (
        <Text color="muted">No vendors yet. Create your first one!</Text>
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
