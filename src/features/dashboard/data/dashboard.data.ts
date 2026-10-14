import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { CommentsTable, PostsTable, user as UserTable } from "@/lib/db/schema";

const postSummaryColumns = {
  id: PostsTable.id,
  title: PostsTable.title,
  status: PostsTable.status,
  pinnedAt: PostsTable.pinnedAt,
  updatedAt: PostsTable.updatedAt,
};

const publicPostTitle = sql<string>`coalesce(json_extract(${PostsTable.publicSnapshotJson}, '$.title'), ${PostsTable.title})`;

const postIsPublic = and(
  isNotNull(PostsTable.publicSnapshotJson),
  isNotNull(PostsTable.publicSlug),
);

export async function listRecentPosts(db: DB, limit: number) {
  return db
    .select(postSummaryColumns)
    .from(PostsTable)
    .orderBy(desc(PostsTable.updatedAt), desc(PostsTable.id))
    .limit(limit);
}

export async function findLatestDraft(db: DB) {
  const [draft] = await db
    .select(postSummaryColumns)
    .from(PostsTable)
    .where(eq(PostsTable.status, "draft"))
    .orderBy(desc(PostsTable.updatedAt), desc(PostsTable.id))
    .limit(1);
  return draft ?? null;
}

/** Public titles and slugs of the given Posts that are still public. */
export async function listPublicPostsByIds(db: DB, ids: Array<number>) {
  if (ids.length === 0) return [];
  const rows = await db
    .select({
      id: PostsTable.id,
      title: publicPostTitle,
      slug: PostsTable.publicSlug,
    })
    .from(PostsTable)
    .where(and(inArray(PostsTable.id, ids), postIsPublic));
  return rows.flatMap((row) =>
    row.slug ? [{ id: row.id, title: row.title, slug: row.slug }] : [],
  );
}

/** Published Comments on public Posts, in total and since `since`. */
export async function countPublicComments(db: DB, since: Date) {
  const [row] = await db
    .select({
      total: count(),
      recent: sql<number>`coalesce(sum(case when ${CommentsTable.createdAt} >= ${Math.floor(since.getTime() / 1000)} then 1 else 0 end), 0)`,
    })
    .from(CommentsTable)
    .innerJoin(PostsTable, eq(CommentsTable.postId, PostsTable.id))
    .where(and(eq(CommentsTable.status, "published"), postIsPublic));
  return { total: row?.total ?? 0, recent: Number(row?.recent ?? 0) };
}

const AdminReply = alias(CommentsTable, "admin_reply");
const AdminReplyAuthor = alias(UserTable, "admin_reply_author");

/**
 * A published Comment by a visitor on a public Post that no published Admin
 * Comment answers: none replies to it, and for a root Comment none sits in
 * its thread without a reply target (rows written before reply targets).
 */
function unrepliedVisitorComment(db: DB) {
  return and(
    eq(CommentsTable.status, "published"),
    postIsPublic,
    or(isNull(UserTable.role), ne(UserTable.role, "admin")),
    notExists(
      db
        .select({ id: AdminReply.id })
        .from(AdminReply)
        .innerJoin(AdminReplyAuthor, eq(AdminReply.userId, AdminReplyAuthor.id))
        .where(
          and(
            eq(AdminReply.postId, CommentsTable.postId),
            eq(AdminReply.status, "published"),
            eq(AdminReplyAuthor.role, "admin"),
            or(
              eq(AdminReply.replyToCommentId, CommentsTable.id),
              and(
                isNull(CommentsTable.rootId),
                isNull(AdminReply.replyToCommentId),
                eq(AdminReply.rootId, CommentsTable.id),
              ),
            ),
          ),
        ),
    ),
  );
}

export async function listUnrepliedComments(db: DB, limit: number) {
  return db
    .select({
      id: CommentsTable.id,
      postId: CommentsTable.postId,
      rootId: CommentsTable.rootId,
      content: CommentsTable.content,
      createdAt: CommentsTable.createdAt,
      userId: CommentsTable.userId,
      userName: UserTable.name,
      userImage: UserTable.image,
      userMutedAt: UserTable.mutedAt,
      postTitle: publicPostTitle,
      postSlug: PostsTable.publicSlug,
    })
    .from(CommentsTable)
    .innerJoin(PostsTable, eq(CommentsTable.postId, PostsTable.id))
    .leftJoin(UserTable, eq(CommentsTable.userId, UserTable.id))
    .where(unrepliedVisitorComment(db))
    .orderBy(desc(CommentsTable.createdAt), desc(CommentsTable.id))
    .limit(limit);
}

export async function countUnrepliedComments(db: DB) {
  const [row] = await db
    .select({ total: count() })
    .from(CommentsTable)
    .innerJoin(PostsTable, eq(CommentsTable.postId, PostsTable.id))
    .leftJoin(UserTable, eq(CommentsTable.userId, UserTable.id))
    .where(unrepliedVisitorComment(db));
  return row?.total ?? 0;
}
