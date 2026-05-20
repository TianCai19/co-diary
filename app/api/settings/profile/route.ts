import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { profileSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/auth/login?error=请先登录", request.url));
  }

  const formData = await request.formData();
  const parsed = profileSchema.safeParse({
    nickname: formData.get("nickname"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "保存失败";
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(message)}`, request.url));
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      nickname: parsed.data.nickname,
      bio: parsed.data.bio || null,
    },
  });

  return NextResponse.redirect(new URL(`/settings?success=${encodeURIComponent("资料已保存")}`, request.url));
}
