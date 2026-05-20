import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { rebuildNotebookStats } from "@/lib/stats";

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
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent("你不在这个日记本里")}`, request.url));
  }

  const memberCount = await prisma.notebookMember.count({
    where: { notebookId: id },
  });

  if (membership.role === "owner" && memberCount > 1) {
    return NextResponse.redirect(
      new URL(`/notebooks/${id}?error=${encodeURIComponent("当前你是创建者，暂不支持在仍有其他成员时直接退出")}`, request.url),
    );
  }

  if (membership.role === "owner" && memberCount === 1) {
    await prisma.notebook.delete({
      where: { id },
    });

    return NextResponse.redirect(
      new URL(`/notebooks?success=${encodeURIComponent("已退出并关闭该日记本")}`, request.url),
    );
  }

  await prisma.notebookMember.delete({
    where: {
      userId_notebookId: {
        userId,
        notebookId: id,
      },
    },
  });

  await rebuildNotebookStats(id);

  return NextResponse.redirect(
    new URL(`/notebooks?success=${encodeURIComponent("你已退出该日记本")}`, request.url),
  );
}
