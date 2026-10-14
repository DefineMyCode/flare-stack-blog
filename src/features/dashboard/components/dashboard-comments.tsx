import { useQueryClient } from "@tanstack/react-query";
import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Turnstile, useTurnstile } from "@/components/common/turnstile";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { SectionHeading } from "@/components/ui/page-heading";
import { CommentConfirmationModal } from "@/features/comments/components/comment-confirmation-modal";
import { CommentEditor } from "@/features/comments/components/comment-editor";
import { CommentReveal } from "@/features/comments/components/comment-reveal";
import { useComments } from "@/features/comments/hooks/use-comments";
import type { DashboardOverview } from "@/features/dashboard/dashboard.schema";
import { useMutedUsers } from "@/features/muted-users/hooks/use-muted-users";
import { useMediaQuery } from "@/hooks/use-motion";
import { authClient } from "@/lib/auth/auth-client";
import { orpc } from "@/lib/orpc";
import { formatTimeAgo } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import "@/features/comments/components/comments.css";
import { DashboardIdentity } from "./dashboard-identity";

type RecentComment = DashboardOverview["recentComments"][number];
type PendingAction =
  | { kind: "delete"; comment: RecentComment }
  | { kind: "mute"; comment: RecentComment; userId: string };

export function DashboardComments({
  comments,
}: {
  comments: Array<RecentComment>;
}) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const replyTrigger = useRef<HTMLButtonElement | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<PendingAction | null>(null);
  const replying = comments.find((comment) => comment.id === replyingId);
  const target = pending?.comment ?? replying;
  const { createComment, deleteComment, isCreating, isDeleting } = useComments(
    target?.postId,
  );
  const { muteUser, isMuting } = useMutedUsers(target?.postId, {
    linkMutedList: true,
  });
  const {
    isPending: challengePending,
    reset: resetChallenge,
    turnstileProps,
  } = useTurnstile("comment");
  const compactChallenge = useMediaQuery("(max-width: 380px)");

  const refreshOverview = () =>
    queryClient.invalidateQueries({ queryKey: orpc.dashboard.overview.key() });
  const closeReply = () => {
    setReplyingId(null);
    replyTrigger.current?.focus({ preventScroll: true });
  };
  const submitReply = async (content: string) => {
    if (!replying) return;
    try {
      await createComment({
        postId: replying.postId,
        content,
        rootId: replying.rootId ?? replying.id,
        replyToCommentId: replying.id,
      });
      setDrafts(({ [replying.id]: _sent, ...rest }) => rest);
      closeReply();
      toast.success(m.admin_overview_reply_sent());
      void refreshOverview();
    } finally {
      resetChallenge();
    }
  };
  const confirmPending = async () => {
    if (!pending) return;
    if (pending.kind === "delete") {
      await deleteComment({ id: pending.comment.id });
      if (replyingId === pending.comment.id) setReplyingId(null);
    } else {
      await muteUser({ userId: pending.userId });
    }
    setPending(null);
    await refreshOverview();
  };

  return (
    <section className="dashboard-comments">
      <SectionHeading
        className="dashboard-section-heading"
        size="md"
        title={m.admin_overview_recent_comments()}
        titleProps={{ ref: headingRef, tabIndex: -1 }}
      />
      <ul className="dashboard-list">
        {comments.map((comment) => {
          const userName =
            comment.userName || m.admin_overview_activity_anonymous();
          const userId = comment.userId;
          const actions: Array<ActionMenuItem> = [
            {
              label: m.comments_item_reply(),
              onSelect: (trigger) => {
                replyTrigger.current = trigger;
                setReplyingId(comment.id);
              },
            },
            {
              label: m.comments_item_delete(),
              danger: true,
              onSelect: () => setPending({ kind: "delete", comment }),
            },
          ];
          if (userId && userId !== session?.user.id && !comment.userMuted)
            actions.push({
              label: m.admin_overview_comment_mute(),
              danger: true,
              onSelect: () => setPending({ kind: "mute", comment, userId }),
            });
          return (
            <li key={comment.id}>
              <div className="dashboard-comment-row">
                <Link
                  to="/post/$slug"
                  params={{ slug: comment.postSlug }}
                  search={{ comment: comment.id }}
                  className="dashboard-comment"
                >
                  <DashboardIdentity kind="user" image={comment.userImage} />
                  <div className="dashboard-row-copy">
                    <div className="dashboard-comment-byline">
                      <strong>{userName}</strong>
                      <time className="dashboard-time">
                        <ClientOnly fallback="—">
                          {formatTimeAgo(comment.createdAt)}
                        </ClientOnly>
                      </time>
                    </div>
                    {comment.snippet && (
                      <p className="dashboard-comment-snippet">
                        {comment.snippet}
                      </p>
                    )}
                    <p className="dashboard-comment-source">
                      {comment.postTitle}
                      <ArrowRight size={14} />
                    </p>
                  </div>
                </Link>
                <div className="dashboard-comment-actions">
                  <ActionMenu
                    items={actions}
                    label={m.comments_more_actions()}
                    placement="bottom-end"
                  />
                </div>
              </div>
              <CommentReveal open={replyingId === comment.id}>
                <div className="dashboard-comment-reply">
                  <CommentEditor
                    value={drafts[comment.id] ?? ""}
                    onChange={(value) =>
                      setDrafts((previous) => ({
                        ...previous,
                        [comment.id]: value,
                      }))
                    }
                    onSubmit={submitReply}
                    isSubmitting={isCreating}
                    challengePending={challengePending}
                    autoFocus
                    onCancel={closeReply}
                    submitLabel={m.comments_editor_submit_reply()}
                    label={m.comments_item_reply_to({ name: userName })}
                    challenge={
                      <Turnstile
                        {...turnstileProps}
                        size={compactChallenge ? "compact" : "normal"}
                      />
                    }
                  />
                </div>
              </CommentReveal>
            </li>
          );
        })}
      </ul>
      <CommentConfirmationModal
        isOpen={pending?.kind === "delete"}
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
        title={m.comments_delete_title()}
        message={m.comments_delete_desc()}
        confirmLabel={m.comments_delete_confirm()}
        isDanger={true}
        isLoading={isDeleting}
        fallbackFocus={() => headingRef.current}
      />
      <CommentConfirmationModal
        isOpen={pending?.kind === "mute"}
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
        title={m.comments_mute_title()}
        message={m.comments_mute_desc({
          name:
            pending?.comment.userName || m.admin_overview_activity_anonymous(),
        })}
        confirmLabel={m.comments_mute_confirm()}
        isLoading={isMuting}
        fallbackFocus={() => headingRef.current}
      />
    </section>
  );
}
