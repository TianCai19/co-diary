import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      nickname: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?error=请先登录");
  }

  return user;
}

export async function requireNotebookMember(notebookId: string, userId: string) {
  const membership = await prisma.notebookMember.findUnique({
    where: {
      userId_notebookId: {
        userId,
        notebookId,
      },
    },
  });

  if (!membership) {
    redirect("/notebooks?error=你还不是这个日记本的成员");
  }

  return membership;
}
