import Link from "next/link";
import { Button } from "@/shared/ui/buttons/button";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
import { ArrowLeft } from "lucide-react";
import { routes } from "@/shared/lib/routes";
import { fetchCategories } from "../data";
import { VendorForm } from "../ui/VendorForm";

export default async function NewVendorPage() {
  const categories = await fetchCategories();

  return (
    <Stack gap="lg">
      <Stack direction="row" gap="sm" align="center">
        <Button asChild variant="ghost" size="icon">
          <Link href={routes.vendors.list}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Text as="h1" size="3xl" weight="bold">
          New Vendor
        </Text>
      </Stack>

      <VendorForm categories={categories} />
    </Stack>
  );
}
