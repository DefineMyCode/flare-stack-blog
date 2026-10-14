import { z } from "zod";

const coercedDate = z.union([z.date(), z.string().pipe(z.coerce.date())]);

const DashboardRecentPostSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  status: z.enum(["draft", "published"]),
  pinnedAt: coercedDate.nullable(),
  updatedAt: coercedDate,
});

const DashboardPendingFriendLinkSchema = z.object({
  id: z.number().int().positive(),
  siteName: z.string(),
  siteUrl: z.string(),
  logoUrl: z.string().nullable(),
  createdAt: coercedDate,
});

const DashboardRecentCommentSchema = z.object({
  id: z.number().int().positive(),
  postId: z.number().int().positive(),
  rootId: z.number().int().positive().nullable(),
  userId: z.string().nullable(),
  userName: z.string().nullable(),
  userImage: z.string().nullable(),
  userMuted: z.boolean(),
  postTitle: z.string(),
  postSlug: z.string(),
  snippet: z.string(),
  createdAt: coercedDate,
});

export const DashboardOverviewSchema = z.object({
  popularityAlert: z.enum(["failed", "expired"]).nullable(),
  adminEmailNeedsSetup: z.boolean(),
  defaultSiteIdentity: z.boolean(),
  recentPosts: z.array(DashboardRecentPostSchema),
  pendingFriendLinks: z.object({
    items: z.array(DashboardPendingFriendLinkSchema),
    remainingCount: z.number().int().nonnegative(),
  }),
  recentComments: z.array(DashboardRecentCommentSchema),
});

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;
