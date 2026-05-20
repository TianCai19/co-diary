import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { recordCommentActivity } from "@/lib/stats";
import { commentSchema } from "@/lib/validators";

export async function POST(request: Request, context: { params: Promise<{ entryId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/login?error=请先登录", request.url));
  }

  const { entryId } = await context.params;
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      notebookId: true,
      authorId: true,
    },
  });

  if (!entry) {
    return NextResponse.redirect(new URL("/notebooks?error=目标日记不存在", request.url));
  }

  const membership = await prisma.notebookMember.findUnique({
    where: {
      userId_notebookId: {
        userId,
        notebookId: entry.notebookId,
      },
    },
  });

  if (!membership) {
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent("你不是该日记本成员")}`, request.url));
  }

  const formData = await request.formData();
  const parsed = commentSchema.safeParse({
    content: formData.get("content"),
    parentId: formData.get("parentId") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "评论失败";
    return NextResponse.redirect(
      new URL(`/notebooks/${entry.notebookId}/entries/${entryId}?error=${encodeURIComponent(message)}`, request.url),
    );
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      authorId: userId,
      entryId,
      parentId: parsed.data.parentId || null,
    },
  });
  await recordCommentActivity(userId, entry.notebookId, entry.authorId);

  return NextResponse.redirect(
    new URL(`/notebooks/${entry.notebookId}/entries/${entryId}?success=${encodeURIComponent("评论已发布")}`, request.url),
  );
}
