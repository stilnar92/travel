import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/shared/ui/buttons/button";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
import { ArrowLeft } from "lucide-react";
import { routes } from "@/shared/lib/routes";
import { fetchVendorById, fetchCategories } from "../../data";
import { VendorForm } from "../../ui/VendorForm";

interface EditVendorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVendorPage({ params }: EditVendorPageProps) {
  const { id } = await params;
  const [vendor, categories] = await Promise.all([
    fetchVendorById(id),
    fetchCategories(),
  ]);

  if (!vendor) {
    notFound();
  }

  return (
    <Stack gap="lg">
      <Stack direction="row" gap="sm" align="center">
        <Button asChild variant="ghost" size="icon">
          <Link href={routes.vendors.list}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Text as="h1" size="3xl" weight="bold">
          Edit Vendor
        </Text>
      </Stack>

      <VendorForm categories={categories} vendor={vendor} />
    </Stack>
  );
}
