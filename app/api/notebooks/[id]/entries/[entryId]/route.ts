import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { rebuildNotebookStats } from "@/lib/stats";
import { entrySchema } from "@/lib/validators";
import { getSessionUserId } from "@/lib/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; entryId: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/login?error=请先登录", request.url));
  }

  const { id, entryId } = await context.params;
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      notebookId: true,
      authorId: true,
    },
  });

  if (!entry || entry.notebookId !== id) {
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent("目标日记不存在")}`, request.url));
  }

  const membership = await prisma.notebookMember.findUnique({
    where: {
      userId_notebookId: {
        userId,
        notebookId: id,
      },
    },
  });

  if (!membership) {
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent("你不是该日记本成员")}`, request.url));
  }

  if (entry.authorId !== userId) {
    return NextResponse.redirect(new URL(`/notebooks/${id}/entries/${entryId}?error=${encodeURIComponent("只能操作自己的日记")}`, request.url));
  }

  const formData = await request.formData();
  const intent = typeof formData.get("intent") === "string" ? formData.get("intent") : "update";

  if (intent === "delete") {
    await prisma.entry.delete({
      where: { id: entryId },
    });
    await rebuildNotebookStats(id);
    return NextResponse.redirect(
      new URL(`/notebooks/${id}?success=${encodeURIComponent("日记已删除")}`, request.url),
    );
  }

  const parsed = entrySchema.safeParse({
    title: formData.get("title") || undefined,
    content: formData.get("content"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "保存失败";
    return NextResponse.redirect(
      new URL(`/notebooks/${id}/entries/${entryId}/edit?error=${encodeURIComponent(message)}`, request.url),
    );
  }

  await prisma.entry.update({
    where: { id: entryId },
    data: {
      title: parsed.data.title || null,
      content: parsed.data.content,
    },
  });

  return NextResponse.redirect(
    new URL(`/notebooks/${id}/entries/${entryId}?success=${encodeURIComponent("日记已更新")}`, request.url),
  );
}
