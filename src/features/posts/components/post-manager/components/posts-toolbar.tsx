import type { Ref } from "react";
import DropdownMenu from "@/components/ui/dropdown-menu";
import { SearchField } from "@/components/ui/search-field";
import type { AdminPostStatusCounts } from "@/features/posts/schema/posts.schema";
import { m } from "@/paraglide/messages";
import type { SortField, StatusFilter } from "../types";
import { STATUS_FILTERS } from "../types";

interface PostsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchRef: Ref<HTMLInputElement>;
  status: StatusFilter;
  statusCounts?: AdminPostStatusCounts;
  onStatusChange: (status: StatusFilter) => void;
  sortBy: SortField;
  onSortByChange: (sortBy: SortField) => void;
}

export function PostsToolbar({
  searchTerm,
  onSearchChange,
  searchRef,
  status,
  statusCounts,
  onStatusChange,
  sortBy,
  onSortByChange,
}: PostsToolbarProps) {
  const labels: Record<StatusFilter, string> = {
    ALL: m.admin_posts_filter_all(),
    PUBLISHED: m.admin_posts_filter_published(),
    DRAFT: m.admin_posts_filter_draft(),
  };
  const counts = statusCounts
    ? {
        ALL: statusCounts.draft + statusCounts.published,
        PUBLISHED: statusCounts.published,
        DRAFT: statusCounts.draft,
      }
    : undefined;
  return (
    <>
      <div
        className="post-list-tabs"
        role="group"
        aria-label={m.admin_posts_filter_status()}
      >
        {STATUS_FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            className={status === value ? "selected" : undefined}
            onClick={() => onStatusChange(value)}
          >
            {labels[value]}
            <span>{counts?.[value] ?? "—"}</span>
          </button>
        ))}
      </div>
      <div className="post-list-controls">
        <SearchField
          ref={searchRef}
          className="post-list-search"
          aria-label={m.admin_posts_search_placeholder()}
          placeholder={m.admin_posts_search_placeholder()}
          value={searchTerm}
          onValueChange={onSearchChange}
          clearLabel={m.admin_posts_clear_search()}
        />
        <div className="post-list-sort">
          <span>{m.admin_posts_sort_label()}</span>
          <DropdownMenu
            value={sortBy}
            ariaLabel={m.admin_posts_sort_label()}
            triggerClassName="post-list-sort-trigger"
            onChange={(value) => onSortByChange(value as SortField)}
            options={[
              { value: "updatedAt", label: m.admin_posts_sort_recent_upd() },
              { value: "publishedAt", label: m.admin_posts_sort_recent_pub() },
            ]}
          />
        </div>
      </div>
    </>
  );
}
