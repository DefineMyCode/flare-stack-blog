import { formatPublicPostDate } from "@/features/posts/utils/format-public-post-date";
import { ClientOnly, Link } from "@tanstack/react-router";
import { Pin, Trash2 } from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";
import { formatDate } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import type { TaxonomyReturn } from "@/components/admin/taxonomy-state";
import type { AdminPostListItem, SortField } from "../types";

interface PostRowProps {
  post: AdminPostListItem;
  sortBy: SortField;
  editorState?: () => { taxonomyReturn: TaxonomyReturn };
  onDelete: (
    post: AdminPostListItem,
    trigger: HTMLButtonElement | null,
  ) => void;
}

export function PostRow({ post, sortBy, onDelete, editorState }: PostRowProps) {
  const title = post.title.trim() || m.common_untitled();
  const date = post[sortBy];
  return (
    <tr>
      <td>
        <div className="post-list-title-cell">
          <span className="post-list-pin">
            {post.pinnedAt && (
              <Pin size={18} aria-label={m.admin_posts_pinned()} />
            )}
          </span>
          <Link
            to="/admin/posts/edit/$id"
            params={{ id: String(post.id) }}
            state={editorState}
            className="post-list-title-link"
          >
            <strong>{title}</strong>
            <span>{post.slug || m.admin_posts_slug_empty()}</span>
          </Link>
        </div>
      </td>
      <td>
        <span className={`post-list-status ${post.status}`}>
          {post.status === "published"
            ? m.admin_posts_status_published()
            : m.admin_posts_status_draft()}
        </span>
      </td>
      <td className="post-list-date">
        <span className="post-list-mobile-date-label">
          {sortBy === "publishedAt"
            ? m.admin_posts_time_published()
            : m.admin_posts_time_modified()}{" "}
        </span>
        {date ? (
          <time dateTime={date.toISOString()}>
            {sortBy === "publishedAt" ? (
              formatPublicPostDate(date)
            ) : (
              <ClientOnly fallback="—">{formatDate(date)}</ClientOnly>
            )}
          </time>
        ) : (
          "—"
        )}
      </td>
      <td>
        <div className="post-list-row-actions">
          <Link
            to="/admin/posts/edit/$id"
            params={{ id: String(post.id) }}
            state={editorState}
            aria-label={m.admin_posts_edit_named({ title })}
          >
            {m.admin_posts_action_edit()}
          </Link>
          <ActionMenu
            label={m.admin_posts_more_named({ title })}
            items={[
              {
                label: m.admin_posts_action_delete_post(),
                icon: Trash2,
                danger: true,
                onSelect: (trigger) => onDelete(post, trigger),
              },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}
