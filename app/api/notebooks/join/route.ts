import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { ensureStatsRow } from "@/lib/stats";
import { inviteSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/login?error=请先登录", request.url));
  }

  const formData = await request.formData();
  const parsed = inviteSchema.safeParse({
    inviteCode: formData.get("inviteCode"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "加入失败";
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent(message)}`, request.url));
  }

  const notebook = await prisma.notebook.findUnique({
    where: {
      inviteCode: parsed.data.inviteCode,
    },
  });

  if (!notebook) {
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent("邀请码不存在")}`, request.url));
  }

  await prisma.notebookMember.upsert({
    where: {
      userId_notebookId: {
        userId,
        notebookId: notebook.id,
      },
    },
    update: {},
    create: {
      userId,
      notebookId: notebook.id,
      role: "member",
    },
  });
  await ensureStatsRow(userId, notebook.id);

  return NextResponse.redirect(
    new URL(`/notebooks/${notebook.id}?success=${encodeURIComponent("已加入日记本")}`, request.url),
  );
}
