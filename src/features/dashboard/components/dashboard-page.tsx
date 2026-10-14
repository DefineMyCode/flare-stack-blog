import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, FileText, Link2, MessageSquare, Plus } from "lucide-react";
import { useEffect } from "react";
import { useAdminChrome } from "@/components/admin/admin-chrome";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-heading";
import type { DashboardOverview } from "@/features/dashboard/dashboard.schema";
import { dashboardOverviewQuery } from "@/features/dashboard/queries";
import { orpc, orpcClient } from "@/lib/orpc";
import { m } from "@/paraglide/messages";
import "./dashboard.css";
import { DashboardComments } from "./dashboard-comments";
import { DashboardFriendLinks } from "./dashboard-friend-links";
import { DashboardNotices } from "./dashboard-notices";
import { DashboardPopular } from "./dashboard-popular";
import { DashboardWriting } from "./dashboard-writing";
import { formatCount, formatWindow } from "./format";
import { StatTile } from "./stat-tile";

export function DashboardPage() {
  const { data } = useSuspenseQuery({
    ...dashboardOverviewQuery,
    refetchOnMount: "always",
  });
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

  return (
    <div className="dashboard-workspace admin-workspace fuwari-card-base">
      <PageHeader
        className="dashboard-header"
        title={m.admin_overview_title()}
        description={m.dashboard_intro()}
        actions={
          <span className="dashboard-header-action">
            <Button
              onClick={() => createPost()}
              loading={isCreating}
              icon={<Plus size={18} />}
            >
              {createLabel}
            </Button>
          </span>
        }
      />
      <DashboardNotices
        update={data.update}
        popularityAlert={data.popularityAlert}
        adminEmailNeedsSetup={data.adminEmailNeedsSetup}
        defaultSiteIdentity={data.defaultSiteIdentity}
      />
      <DashboardStats stats={data.stats} popularity={data.popularity} />
      <div className="dashboard-grid">
        <div className="dashboard-column dashboard-column-main">
          <DashboardPopular
            className="dashboard-slot-popular"
            popularity={data.popularity}
          />
          <DashboardWriting
            className="dashboard-slot-writing"
            latestDraft={data.latestDraft}
            recentPosts={data.recentPosts}
            onCreate={() => createPost()}
            isCreating={isCreating}
            createLabel={createLabel}
          />
        </div>
        <div className="dashboard-column dashboard-column-side">
          <DashboardComments
            className="dashboard-slot-comments"
            comments={data.unrepliedComments.items}
            total={data.unrepliedComments.total}
          />
          <DashboardFriendLinks
            className="dashboard-slot-links"
            pendingFriendLinks={data.pendingFriendLinks}
          />
        </div>
      </div>
    </div>
  );
}

const UNREPLIED_SECTION_ID = "dashboard-unreplied";

/** The Admin layout opts out of the router's hash scrolling, so scroll here. */
function showUnreplied() {
  const section = document.getElementById(UNREPLIED_SECTION_ID);
  if (!section) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  section.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  section.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
}

function viewsDetail(popularity: DashboardOverview["popularity"]) {
  switch (popularity.state) {
    case "unconfigured":
      return m.dashboard_stat_views_unconfigured();
    case "missing":
      return m.dashboard_stat_views_missing();
    case "expired":
      return m.dashboard_stat_views_expired();
    case "ready":
      return popularity.windowStart !== null && popularity.windowEnd !== null
        ? formatWindow(popularity.windowStart, popularity.windowEnd)
        : "";
    default:
      popularity.state satisfies never;
      return "";
  }
}

function DashboardStats({
  stats,
  popularity,
}: Pick<DashboardOverview, "stats" | "popularity">) {
  const hasViews =
    popularity.state === "ready" || popularity.state === "expired";
  return (
    <ul className="dashboard-stats" aria-label={m.dashboard_stats_label()}>
      <li>
        <StatTile
          to="/admin/posts"
          icon={FileText}
          label={m.dashboard_stat_posts()}
          value={formatCount(stats.publishedPosts)}
          detail={
            stats.draftPosts > 0
              ? m.dashboard_stat_drafts({ count: stats.draftPosts })
              : m.dashboard_stat_no_drafts()
          }
        />
      </li>
      <li>
        <StatTile
          from="/"
          to="/admin/settings/maintenance"
          icon={Eye}
          label={m.dashboard_stat_views()}
          value={hasViews ? formatCount(popularity.totalViews) : "—"}
          detail={viewsDetail(popularity)}
          dot={popularity.state === "expired" ? "warning" : undefined}
        />
      </li>
      <li>
        <StatTile
          to="/admin"
          hash={UNREPLIED_SECTION_ID}
          onClick={showUnreplied}
          icon={MessageSquare}
          label={m.dashboard_stat_comments()}
          value={formatCount(stats.comments)}
          detail={
            stats.recentComments > 0
              ? m.dashboard_stat_comments_recent({
                  count: stats.recentComments,
                })
              : m.dashboard_stat_comments_none_recent()
          }
        />
      </li>
      <li>
        <StatTile
          to="/admin/friend-links"
          search={{
            status: stats.pendingFriendLinks > 0 ? "pending" : "approved",
            page: 1,
          }}
          icon={Link2}
          label={m.dashboard_stat_friend_links()}
          value={formatCount(stats.approvedFriendLinks)}
          detail={
            stats.pendingFriendLinks > 0
              ? m.dashboard_stat_friend_links_pending({
                  count: stats.pendingFriendLinks,
                })
              : m.dashboard_stat_friend_links_none_pending()
          }
          dot={stats.pendingFriendLinks > 0 ? "primary" : undefined}
        />
      </li>
    </ul>
  );
}
