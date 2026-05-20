import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notebookSchema } from "@/lib/validators";
import { ensureStatsRow } from "@/lib/stats";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/login?error=请先登录", request.url));
  }

  const formData = await request.formData();
  const parsed = notebookSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "创建失败";
    return NextResponse.redirect(new URL(`/notebooks?error=${encodeURIComponent(message)}`, request.url));
  }

  const notebook = await prisma.notebook.create({
    data: {
      name: parsed.data.name,
      members: {
        create: {
          userId,
          role: "owner",
        },
      },
    },
  });

  await ensureStatsRow(userId, notebook.id);

  return NextResponse.redirect(
    new URL(`/?success=${encodeURIComponent("日记本创建成功，现在可以直接写了")}`, request.url),
  );
}
