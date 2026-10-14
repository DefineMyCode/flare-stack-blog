import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ClientOnly, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, Pin, Plus } from "lucide-react";
import { useEffect } from "react";
import { useAdminChrome } from "@/components/admin/admin-chrome";
import { Button, buttonClass } from "@/components/ui/button";
import { PageHeader, SectionHeading } from "@/components/ui/page-heading";
import type { DashboardOverview } from "@/features/dashboard/dashboard.schema";
import { dashboardOverviewQuery } from "@/features/dashboard/queries";
import { PostStatusBadge } from "@/features/posts/components/post-status-badge";
import { orpc, orpcClient } from "@/lib/orpc";
import { cn, formatTimeAgo } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import "@/components/ui/callout.css";
import "./dashboard.css";
import { DashboardComments } from "./dashboard-comments";
import { DashboardIdentity } from "./dashboard-identity";

export function DashboardPage() {
  const { data } = useSuspenseQuery({
    ...dashboardOverviewQuery,
    refetchOnMount: "always",
  });
  const {
    popularityAlert,
    adminEmailNeedsSetup,
    defaultSiteIdentity,
    recentPosts,
    pendingFriendLinks,
    recentComments,
  } = data;
  const pendingTotal =
    pendingFriendLinks.items.length + pendingFriendLinks.remainingCount;
  const showFriendLinks = pendingFriendLinks.items.length > 0;
  const showComments = recentComments.length > 0;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setPrimaryAction } = useAdminChrome();

  const createMutation = useMutation({
    mutationFn: () => orpcClient.posts.admin.create(),
    onSuccess: (createdPost) => {
      queryClient.invalidateQueries({ queryKey: orpc.posts.admin.list.key() });
      queryClient.invalidateQueries({
        queryKey: orpc.dashboard.overview.key(),
      });
      navigate({
        to: "/admin/posts/edit/$id",
        params: { id: String(createdPost.id) },
      });
    },
  });
  const createPost = createMutation.mutate;
  const isCreating = createMutation.isPending;
  const createLabel = isCreating
    ? m.admin_posts_creating()
    : m.admin_posts_create();

  useEffect(() => {
    setPrimaryAction({
      label: createLabel,
      onClick: () => createPost(),
      disabled: isCreating,
    });
    return () => setPrimaryAction(null);
  }, [createLabel, createPost, isCreating, setPrimaryAction]);

  const [latest, ...otherPosts] = recentPosts;
  const showTasks =
    showFriendLinks ||
    adminEmailNeedsSetup ||
    defaultSiteIdentity ||
    !!popularityAlert;

  return (
    <div className="dashboard-workspace admin-workspace fuwari-card-base">
      <PageHeader
        className="dashboard-header"
        title={m.admin_overview_title()}
        description={m.dashboard_intro()}
        actions={
          <Button
            onClick={() => createPost()}
            loading={isCreating}
            icon={<Plus size={18} />}
          >
            {createLabel}
          </Button>
        }
      />
      <div className="dashboard-layout">
        <section
          className="dashboard-resume"
          aria-label={m.admin_overview_continue_writing()}
        >
          {latest ? (
            <>
              <div className="dashboard-resume-copy">
                <p className="dashboard-eyebrow">
                  {m.admin_overview_continue_writing()}
                </p>
                <div className="dashboard-resume-title">
                  <h2>{latest.title.trim() || m.common_untitled()}</h2>
                  <PostStatusBadge published={latest.status === "published"} />
                </div>
                <p className="dashboard-meta">
                  <FileText size={16} />
                  <ClientOnly fallback="—">
                    {formatTimeAgo(latest.updatedAt)}
                  </ClientOnly>
                </p>
              </div>
              <Link
                to="/admin/posts/edit/$id"
                params={{ id: String(latest.id) }}
                className={buttonClass({ variant: "primary" })}
              >
                {m.dashboard_resume()}
                <ArrowRight size={18} />
              </Link>
            </>
          ) : (
            <>
              <div className="dashboard-resume-copy">
                <h2>{m.dashboard_first_post()}</h2>
                <p>{m.admin_posts_empty_library()}</p>
              </div>
              <Button
                variant="primary"
                onClick={() => createPost()}
                loading={isCreating}
                icon={<Plus size={18} />}
              >
                {createLabel}
              </Button>
            </>
          )}
        </section>
        {otherPosts.length > 0 && (
          <section className="dashboard-recent">
            <SectionHeading
              className="dashboard-section-heading"
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
              {otherPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    to="/admin/posts/edit/$id"
                    params={{ id: String(post.id) }}
                    className="dashboard-post"
                  >
                    <span className="dashboard-icon">
                      <FileText size={22} />
                    </span>
                    <div className="dashboard-post-copy">
                      <div className="dashboard-post-title">
                        <strong>
                          {post.title.trim() || m.common_untitled()}
                        </strong>
                        <PostStatusBadge
                          published={post.status === "published"}
                        />
                      </div>
                      <p className="dashboard-meta">
                        {post.pinnedAt && (
                          <span className="dashboard-pin">
                            <Pin size={12} />
                            {m.admin_posts_pinned()}
                          </span>
                        )}
                        <ClientOnly fallback="—">
                          {formatTimeAgo(post.updatedAt)}
                        </ClientOnly>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {(showTasks || showComments) && (
          <div
            className={cn(
              "dashboard-activity",
              showTasks && showComments && "dashboard-activity-split",
            )}
          >
            {showTasks && (
              <section className="dashboard-tasks">
                <SectionHeading
                  className="dashboard-section-heading"
                  size="md"
                  title={m.dashboard_tasks()}
                />
                <div className="dashboard-task-scroll">
                  {showFriendLinks && (
                    <>
                      <Link
                        to="/admin/friend-links"
                        search={{ status: "pending", page: 1 }}
                        className="dashboard-task-summary"
                      >
                        <span>
                          {m.dashboard_pending_links({ count: pendingTotal })}
                        </span>
                        <ArrowRight size={17} />
                      </Link>
                      <ul className="dashboard-list">
                        {pendingFriendLinks.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              to="/admin/friend-links"
                              search={{
                                status: "pending",
                                page: 1,
                                search: item.siteUrl,
                              }}
                              className="dashboard-link-row"
                            >
                              <DashboardIdentity
                                kind="site"
                                image={item.logoUrl}
                                siteUrl={item.siteUrl}
                              />
                              <div className="dashboard-row-copy">
                                <strong>{item.siteName}</strong>
                                <p>{siteHost(item.siteUrl)}</p>
                              </div>
                              <time className="dashboard-time">
                                <ClientOnly fallback="—">
                                  {formatTimeAgo(item.createdAt)}
                                </ClientOnly>
                              </time>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/admin/friend-links"
                        search={{ status: "pending", page: 1 }}
                        className={buttonClass({
                          variant: "text",
                          size: "sm",
                          className: "dashboard-review-all",
                        })}
                      >
                        {m.admin_overview_review_friend_links()}
                        <ArrowRight size={16} />
                      </Link>
                    </>
                  )}
                  <AttentionChips
                    popularityAlert={popularityAlert}
                    adminEmailNeedsSetup={adminEmailNeedsSetup}
                    defaultSiteIdentity={defaultSiteIdentity}
                  />
                </div>
              </section>
            )}
            {showComments && <DashboardComments comments={recentComments} />}
          </div>
        )}
      </div>
    </div>
  );
}

function siteHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function AttentionChips({
  popularityAlert,
  adminEmailNeedsSetup,
  defaultSiteIdentity,
}: {
  popularityAlert: DashboardOverview["popularityAlert"];
  adminEmailNeedsSetup: boolean;
  defaultSiteIdentity: boolean;
}) {
  if (!popularityAlert && !adminEmailNeedsSetup && !defaultSiteIdentity) {
    return null;
  }

  return (
    <div className="dashboard-notices">
      {adminEmailNeedsSetup ? (
        <Link
          from="/"
          to="/admin/settings/notifications"
          className="fuwari-callout"
          data-tone="warning"
        >
          {m.admin_overview_email_needs_setup()}
        </Link>
      ) : null}
      {popularityAlert === "expired" ? (
        <Link
          from="/"
          to="/admin/settings/maintenance"
          className="fuwari-callout"
          data-tone="warning"
        >
          {m.admin_overview_popularity_expired()}
        </Link>
      ) : null}
      {popularityAlert === "failed" ? (
        <Link
          from="/"
          to="/admin/settings/maintenance"
          className="fuwari-callout"
          data-tone="danger"
        >
          {m.admin_overview_popularity_failed()}
        </Link>
      ) : null}
      {defaultSiteIdentity ? (
        <Link
          from="/"
          to="/admin/settings/site"
          className="fuwari-callout"
          data-tone="info"
        >
          {m.admin_overview_default_site_identity()}
        </Link>
      ) : null}
    </div>
  );
}
