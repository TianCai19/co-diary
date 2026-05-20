import { prisma } from "@/lib/prisma";
import { getDayDiff, getStartOfDay, isSameDay } from "@/lib/date";

export async function ensureStatsRow(userId: string, notebookId: string) {
  await prisma.userNotebookStats.upsert({
    where: {
      userId_notebookId: {
        userId,
        notebookId,
      },
    },
    update: {},
    create: {
      userId,
      notebookId,
    },
  });
}

export async function recordEntryCheckin(userId: string, notebookId: string, createdAt: Date) {
  const existing = await prisma.userNotebookStats.findUnique({
    where: {
      userId_notebookId: {
        userId,
        notebookId,
      },
    },
  });

  if (!existing) {
    await prisma.userNotebookStats.create({
      data: {
        userId,
        notebookId,
        totalEntries: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastCheckinDate: getStartOfDay(createdAt),
      },
    });
    return;
  }

  const nextTotalEntries = existing.totalEntries + 1;

  if (existing.lastCheckinDate && isSameDay(existing.lastCheckinDate, createdAt)) {
    await prisma.userNotebookStats.update({
      where: {
        userId_notebookId: {
          userId,
          notebookId,
        },
      },
      data: {
        totalEntries: nextTotalEntries,
      },
    });
    return;
  }

  const dayDiff = existing.lastCheckinDate ? getDayDiff(existing.lastCheckinDate, createdAt) : null;
  const nextStreak = dayDiff === 1 ? existing.currentStreak + 1 : 1;

  await prisma.userNotebookStats.update({
    where: {
      userId_notebookId: {
        userId,
        notebookId,
      },
    },
    data: {
      totalEntries: nextTotalEntries,
      currentStreak: nextStreak,
      longestStreak: Math.max(existing.longestStreak, nextStreak),
      lastCheckinDate: getStartOfDay(createdAt),
    },
  });
}

export async function recordCommentActivity(authorId: string, notebookId: string, entryAuthorId: string) {
  await ensureStatsRow(authorId, notebookId);
  await prisma.userNotebookStats.update({
    where: {
      userId_notebookId: {
        userId: authorId,
        notebookId,
      },
    },
    data: {
      totalComments: {
        increment: 1,
      },
    },
  });

  if (entryAuthorId !== authorId) {
    await ensureStatsRow(entryAuthorId, notebookId);
    await prisma.userNotebookStats.update({
      where: {
        userId_notebookId: {
          userId: entryAuthorId,
          notebookId,
        },
      },
      data: {
        receivedComments: {
          increment: 1,
        },
      },
    });
  }
}
