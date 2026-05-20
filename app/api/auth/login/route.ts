import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createSessionToken, getSessionCookieName, getSessionCookieOptions } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "登录信息有误";
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(message)}`, request.url));
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  if (!user) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent("邮箱或密码错误")}`, request.url),
    );
  }

  const passwordMatched = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordMatched) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent("邮箱或密码错误")}`, request.url),
    );
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(getSessionCookieName(), createSessionToken(user.id), getSessionCookieOptions());
  return response;
}
