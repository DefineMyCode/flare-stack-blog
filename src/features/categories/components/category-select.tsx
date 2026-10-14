import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import {
  CategoryManager,
  type CategoryEdit,
} from "@/features/categories/components/category-manager";
import { categoryOptionsQuery } from "@/features/categories/queries";
import { m } from "@/paraglide/messages";

const CREATE = "create";

interface CategorySelectProps {
  id?: string;
  value: number | null;
  onChange: (categoryId: number | null) => void;
}

export function CategorySelect({ id, value, onChange }: CategorySelectProps) {
  const { data: categories = [], isLoading } = useQuery(categoryOptionsQuery);
  const [creating, setCreating] = useState<CategoryEdit | null>(null);

  return (
    <>
      <Select
        id={id}
        value={value == null ? "" : String(value)}
        disabled={isLoading}
        onChange={(next) => {
          if (next === CREATE)
            setCreating({
              id: null,
              name: "",
              postCount: 0,
              publicPostCount: 0,
            });
          else onChange(next === "" ? null : Number(next));
        }}
        options={[
          { value: "", label: m.editor_meta_uncategorized() },
          ...categories.map((category) => ({
            value: String(category.id),
            label: category.name,
          })),
          { value: CREATE, label: m.editor_meta_category_create() },
        ]}
      />
      <CategoryManager
        editing={creating}
        onClose={() => setCreating(null)}
        onCreated={onChange}
      />
    </>
  );
}
