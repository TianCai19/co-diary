import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionCookieName, getSessionCookieOptions, createSessionToken } from "@/lib/session";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = registerSchema.safeParse({
    nickname: formData.get("nickname"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "注册信息有误";
    return NextResponse.redirect(new URL(`/auth/register?error=${encodeURIComponent(message)}`, request.url));
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  if (existingUser) {
    return NextResponse.redirect(
      new URL(`/auth/register?error=${encodeURIComponent("该邮箱已注册")}`, request.url),
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      nickname: parsed.data.nickname,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const response = NextResponse.redirect(new URL("/notebooks?success=欢迎加入 Co-Diary", request.url));
  response.cookies.set(getSessionCookieName(), createSessionToken(user.id), getSessionCookieOptions());
  return response;
}
