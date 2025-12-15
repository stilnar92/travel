import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/data-display/card";
import { Badge } from "@/shared/ui/data-display/badge";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
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

interface VendorCardProps {
  vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{vendor.name}</CardTitle>
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
