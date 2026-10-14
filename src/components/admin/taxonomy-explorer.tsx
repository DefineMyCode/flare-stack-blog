import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { m } from "@/paraglide/messages";
import type { TaxonomyState } from "./taxonomy-state";
import type {
  TaxonomyEntry,
  TaxonomySelection,
} from "./taxonomy-workspace.model";

export function TaxonomyExplorer({
  selection,
  status,
  onRetry,
  onChoose,
  action,
}: {
  selection: TaxonomySelection;
  status: "pending" | "error" | "ready";
  onRetry: () => void;
  onChoose: (kind: TaxonomyState["kind"], id?: number) => void;
  action: ReactNode;
}) {
  const { tagMode, items, selected, uncategorized } = selection;
  const [navSearch, setNavSearch] = useState("");
  const pending = status === "pending";
  const navError = status === "error";
  const visibleItems = items.filter(
    (item) =>
      !tagMode ||
      item.name.toLowerCase().includes(navSearch.trim().toLowerCase()),
  );
  const navRow = (item: TaxonomyEntry) => (
    <button
      key={`${item.kind}:${item.id}`}
      type="button"
      className="taxonomy-nav-item"
      aria-pressed={selected?.kind === item.kind && selected?.id === item.id}
      onClick={() => onChoose(item.kind, item.id ?? undefined)}
    >
      <span className="taxonomy-nav-name">{item.name}</span>
      <span className="taxonomy-nav-count">
        {item.postCount}
        {item.publicPostCount > 0 && item.postCount === 0 ? (
          <small>
            {m.taxonomy_public_short({ count: item.publicPostCount })}
          </small>
        ) : null}
      </span>
    </button>
  );

  return (
    <aside
      className="taxonomy-explorer"
      aria-label={m.taxonomy_manager_title()}
    >
      <SegmentedControl
        className="taxonomy-mode-tabs"
        aria-label={m.taxonomy_manager_title()}
        stretch
        value={tagMode ? "tag" : "category"}
        onValueChange={(kind) => {
          if (kind === "category") setNavSearch("");
          onChoose(kind);
        }}
        items={[
          { value: "category", label: m.category_manager_title() },
          { value: "tag", label: m.tag_manager_title() },
        ]}
      />
      {tagMode ? (
        <SearchField
          className="taxonomy-nav-search"
          aria-label={m.tag_manager_search_placeholder()}
          placeholder={m.tag_manager_search_placeholder()}
          value={navSearch}
          onValueChange={setNavSearch}
          clearLabel={m.tag_manager_clear_search()}
        />
      ) : null}
      <div className="taxonomy-nav-scroll custom-scrollbar">
        {pending ? (
          <div className="taxonomy-loading">
            <Spinner size={18} />
          </div>
        ) : navError ? (
          <EmptyState
            size="compact"
            role="alert"
            description={m.error_desc()}
            action={
              <Button variant="text" onClick={onRetry}>
                {m.error_retry()}
              </Button>
            }
          />
        ) : (
          <>
            {visibleItems.map(navRow)}
            {tagMode && visibleItems.length === 0 ? (
              <EmptyState
                size="compact"
                description={
                  items.length
                    ? m.tag_manager_no_match()
                    : m.tag_manager_empty()
                }
              />
            ) : null}
            {!tagMode ? (
              <div className="taxonomy-uncategorized">
                {navRow(uncategorized)}
              </div>
            ) : null}
          </>
        )}
      </div>
      <div className="taxonomy-mobile-picker">
        <Select
          value={
            selected?.kind === "uncategorized"
              ? "uncategorized"
              : String(selected?.id ?? "")
          }
          options={[
            ...visibleItems.map((item) => ({
              value: String(item.id),
              label: `${item.name} · ${item.postCount}`,
            })),
            ...(!tagMode
              ? [
                  {
                    value: "uncategorized",
                    label: `${uncategorized.name} · ${uncategorized.postCount}`,
                  },
                ]
              : []),
          ]}
          onChange={(value) =>
            value === "uncategorized"
              ? onChoose("uncategorized")
              : onChoose(tagMode ? "tag" : "category", Number(value))
          }
          disabled={pending || navError}
        />
        {action}
      </div>
    </aside>
  );
}
