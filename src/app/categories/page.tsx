import { fetchCategories } from "./data";
import { CategoriesList } from "./ui/CategoriesList";
import { Stack } from "@/shared/ui/layout/stack";
import { Text } from "@/shared/ui/data-display/text";

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <Stack gap="lg">
      <Text as="h1" size="3xl" weight="bold">
        Categories
      </Text>
      <CategoriesList categories={categories} />
    </Stack>
  );
}
