import { useQuery } from "@tanstack/react-query";
import { Select } from "@/components/ui/select";
import { categoryOptionsQuery } from "@/features/categories/queries";
import { m } from "@/paraglide/messages";

interface CategorySelectProps {
  id?: string;
  value: number | null;
  onChange: (categoryId: number | null) => void;
}

export function CategorySelect({ id, value, onChange }: CategorySelectProps) {
  const { data: categories = [], isLoading } = useQuery(categoryOptionsQuery);

  return (
    <Select
      id={id}
      value={value == null ? "" : String(value)}
      disabled={isLoading}
      onChange={(next) => onChange(next === "" ? null : Number(next))}
      options={[
        { value: "", label: m.editor_meta_uncategorized() },
        ...categories.map((category) => ({
          value: String(category.id),
          label: category.name,
        })),
      ]}
    />
  );
}
