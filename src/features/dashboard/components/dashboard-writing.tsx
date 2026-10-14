import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowRight, FilePen, FileText, Pin, Plus } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/page-heading";
import type { DashboardOverview } from "@/features/dashboard/dashboard.schema";
import { PostStatusBadge } from "@/features/posts/components/post-status-badge";
import { cn, formatTimeAgo } from "@/lib/utils";
import { m } from "@/paraglide/messages";

/** The latest draft to pick up, then the last few Posts edited. */
export function DashboardWriting({
  latestDraft,
  recentPosts,
  onCreate,
  isCreating,
  createLabel,
  className,
}: Pick<DashboardOverview, "latestDraft" | "recentPosts"> & {
  onCreate: () => void;
  isCreating: boolean;
  createLabel: string;
  className?: string;
}) {
  if (!latestDraft && recentPosts.length === 0) {
    return (
      <section className={cn("dashboard-panel dashboard-writing", className)}>
        <EmptyState
          size="compact"
          icon={FilePen}
          title={m.dashboard_first_post()}
          description={m.admin_posts_empty_library()}
          action={
            <Button
              variant="primary"
              onClick={onCreate}
              loading={isCreating}
              icon={<Plus size={18} />}
            >
              {createLabel}
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className={cn("dashboard-panel dashboard-writing", className)}>
      {latestDraft ? (
        <div className="dashboard-resume">
          <div className="dashboard-resume-copy">
            <h2 className="dashboard-eyebrow">
              <FilePen size={14} aria-hidden="true" />
              {m.admin_overview_continue_writing()}
            </h2>
            <p className="dashboard-resume-title">
              {latestDraft.title.trim() || m.common_untitled()}
            </p>
            <p className="dashboard-meta">
              <ClientOnly fallback="—">
                {formatTimeAgo(latestDraft.updatedAt)}
              </ClientOnly>
            </p>
          </div>
          <div className="dashboard-resume-action">
            <Link
              to="/admin/posts/edit/$id"
              params={{ id: String(latestDraft.id) }}
              className={buttonClass({ variant: "primary" })}
            >
              {m.dashboard_resume()}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      ) : null}
      {recentPosts.length > 0 ? (
        <div className="dashboard-recent">
          <SectionHeading
            size="sm"
            title={m.dashboard_recent_edits()}
            actions={
              <Link
                to="/admin/posts"
                className={buttonClass({ variant: "text", size: "sm" })}
              >
                {m.admin_overview_all_posts()}
                <ArrowRight size={16} />
              </Link>
            }
          />
          <ul className="dashboard-posts">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  to="/admin/posts/edit/$id"
                  params={{ id: String(post.id) }}
                  className="dashboard-post"
                >
                  <span className="dashboard-post-icon" aria-hidden="true">
                    <FileText size={17} />
                  </span>
                  <span className="dashboard-post-title">
                    <span className="dashboard-post-title-text">
                      {post.title.trim() || m.common_untitled()}
                    </span>
                    {post.pinnedAt ? (
                      <Pin
                        size={14}
                        className="dashboard-pin"
                        aria-label={m.admin_posts_pinned()}
                      />
                    ) : null}
                  </span>
                  <PostStatusBadge published={post.status === "published"} />
                  <time className="dashboard-time">
                    <ClientOnly fallback="—">
                      {formatTimeAgo(post.updatedAt)}
                    </ClientOnly>
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
