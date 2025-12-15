import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/data-display/card";
import { Badge } from "@/shared/ui/data-display/badge";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
import { Button } from "@/shared/ui/buttons/button";
import { Pencil } from "lucide-react";
import { DeleteVendorButton } from "./DeleteVendorButton";
import { routes } from "@/shared/lib/routes";
import type { Vendor } from "@/shared/adapters/supabase/repositories/vendors.server";

interface VendorCategoriesBadgesProps {
  categories: Vendor["categories"];
}

function VendorCategoriesBadges({ categories }: VendorCategoriesBadgesProps) {
  if (categories.length === 0) return null;

  return (
    <Stack direction="row" gap="xs" wrap>
      {categories.map((category) => (
        <Badge key={category.id} variant="secondary">
          {category.name}
        </Badge>
      ))}
    </Stack>
  );
}

interface VendorCardActionsProps {
  vendorId: string;
  vendorName: string;
}

function VendorCardActions({ vendorId, vendorName }: VendorCardActionsProps) {
  return (
    <Stack direction="row" gap="xs">
      <Button asChild size="icon-sm" variant="ghost" aria-label="Edit vendor">
        <Link href={routes.vendors.edit(vendorId)}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <DeleteVendorButton vendorId={vendorId} vendorName={vendorName} />
    </Stack>
  );
}

interface VendorCardProps {
  vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card>
      <CardHeader>
        <Stack direction="row" justify="between" align="start">
          <CardTitle>{vendor.name}</CardTitle>
          <VendorCardActions vendorId={vendor.id} vendorName={vendor.name} />
        </Stack>
      </CardHeader>
      <CardContent>
        <Stack gap="sm">
          <Text color="muted">{vendor.city}</Text>
          <VendorCategoriesBadges categories={vendor.categories} />
        </Stack>
      </CardContent>
    </Card>
  );
}
