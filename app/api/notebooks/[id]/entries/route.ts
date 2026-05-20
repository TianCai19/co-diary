import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { recordEntryCheckin } from "@/lib/stats";
import { entrySchema } from "@/lib/validators";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/login?error=请先登录", request.url));
  }

  const { id } = await context.params;
  const membership = await prisma.notebookMember.findUnique({
    where: {
      userId_notebookId: {
        userId,
        notebookId: id,
      },
    },
  });

  if (!membership) {
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent("无权限写入该日记本")}`, request.url));
  }

  const formData = await request.formData();
  const parsed = entrySchema.safeParse({
    title: formData.get("title") || undefined,
    content: formData.get("content"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "发布失败";
    return NextResponse.redirect(
      new URL(`/notebooks/${id}/entries/new?error=${encodeURIComponent(message)}`, request.url),
    );
  }

  const createdAt = new Date();
  await prisma.entry.create({
    data: {
      title: parsed.data.title || null,
      content: parsed.data.content,
      authorId: userId,
      notebookId: id,
      createdAt,
    },
  });

  await recordEntryCheckin(userId, id, createdAt);

  return NextResponse.redirect(
    new URL(`/notebooks/${id}?success=${encodeURIComponent("今日日记已发布")}`, request.url),
  );
}
