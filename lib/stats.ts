import { prisma } from "@/lib/prisma";
import { getDayDiff, getStartOfDay, isSameDay } from "@/lib/date";

function calculateEntryStreaks(dates: Date[]) {
  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckinDate: null as Date | null,
    };
  }

  const normalized = Array.from(
    new Set(dates.map((date) => getStartOfDay(date).getTime())),
  )
    .sort((left, right) => left - right)
    .map((timestamp) => new Date(timestamp));

  let longestStreak = 1;
  let currentRun = 1;

  for (let index = 1; index < normalized.length; index += 1) {
    const diff = getDayDiff(normalized[index - 1], normalized[index]);
    if (diff === 1) {
      currentRun += 1;
    } else {
      currentRun = 1;
    }
    longestStreak = Math.max(longestStreak, currentRun);
  }

  let endingRun = 1;
  for (let index = normalized.length - 1; index > 0; index -= 1) {
    const diff = getDayDiff(normalized[index - 1], normalized[index]);
    if (diff === 1) {
      endingRun += 1;
    } else {
      break;
    }
  }

  return {
    currentStreak: endingRun,
    longestStreak,
    lastCheckinDate: normalized[normalized.length - 1],
  };
}

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

export async function rebuildNotebookStats(notebookId: string) {
  const [memberships, entries, comments] = await Promise.all([
    prisma.notebookMember.findMany({
      where: { notebookId },
      select: { userId: true },
    }),
    prisma.entry.findMany({
      where: { notebookId },
      select: {
        id: true,
        authorId: true,
        createdAt: true,
      },
    }),
    prisma.comment.findMany({
      where: {
        entry: {
          notebookId,
        },
      },
      select: {
        authorId: true,
        entry: {
          select: {
            authorId: true,
          },
        },
      },
    }),
  ]);

  const memberIds = memberships.map((membership) => membership.userId);
  const memberIdSet = new Set(memberIds);

  await prisma.userNotebookStats.deleteMany({
    where: {
      notebookId,
      userId: {
        notIn: memberIds.length > 0 ? memberIds : ["__none__"],
      },
    },
  });

  for (const userId of memberIds) {
    const userEntries = entries.filter((entry) => entry.authorId === userId);
    const userComments = comments.filter((comment) => comment.authorId === userId).length;
    const receivedComments = comments.filter(
      (comment) => comment.entry.authorId === userId && comment.authorId !== userId,
    ).length;
    const streaks = calculateEntryStreaks(userEntries.map((entry) => entry.createdAt));

    await prisma.userNotebookStats.upsert({
      where: {
        userId_notebookId: {
          userId,
          notebookId,
        },
      },
      update: {
        totalEntries: userEntries.length,
        totalComments: userComments,
        receivedComments,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        lastCheckinDate: streaks.lastCheckinDate,
      },
      create: {
        userId,
        notebookId,
        totalEntries: userEntries.length,
        totalComments: userComments,
        receivedComments,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        lastCheckinDate: streaks.lastCheckinDate,
      },
    });
  }

  return {
    memberCount: memberIds.length,
    hasFormerAuthors: entries.some((entry) => !memberIdSet.has(entry.authorId)),
  };
}
