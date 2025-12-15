import { Card, CardContent } from "@/shared/ui/data-display/card";
import { Stack } from "@/shared/ui/layout/stack";
import { CategoryItem } from "./CategoryItem";
import { CreateCategoryForm } from "./CreateCategoryForm";
import type { Category } from "@/shared/adapters/supabase/repositories/categories";

interface CategoriesListProps {
  categories: Category[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  return (
    <Stack gap="md">
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {categories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <CreateCategoryForm />
    </Stack>
  );
}
