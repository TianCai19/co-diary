import { prisma } from "@/lib/prisma";
import { getDayDiff, getStartOfDay, getStartOfToday } from "@/lib/date";

function getLongestEntryStreak(dates: Date[]) {
  if (dates.length === 0) return 0;

  const normalized = Array.from(
    new Set(dates.map((date) => getStartOfDay(date).getTime())),
  ).sort((left, right) => left - right);

  let longest = 1;
  let current = 1;

  for (let index = 1; index < normalized.length; index += 1) {
    const diff = getDayDiff(new Date(normalized[index - 1]), new Date(normalized[index]));
    if (diff === 1) {
      current += 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
  }

  return longest;
}

export async function getFeedForUser(userId: string) {
  return prisma.entry.findMany({
    where: {
      notebook: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
      notebook: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });
}

export async function getUserNotebooks(userId: string) {
  return prisma.notebook.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      entries: {
        take: 1,
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          updatedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getHomePageData(userId: string) {
  const notebooks = await prisma.notebook.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              bio: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      entries: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
          comments: {
            select: { id: true },
          },
        },
      },
      stats: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });

  const normalized = notebooks
    .map((notebook) => {
      const latestEntry = notebook.entries[0] ?? null;
      return {
        ...notebook,
        latestEntry,
      };
    })
    .sort((left, right) => {
      const leftTime = left.latestEntry?.createdAt?.getTime() ?? left.createdAt.getTime();
      const rightTime = right.latestEntry?.createdAt?.getTime() ?? right.createdAt.getTime();
      return rightTime - leftTime;
    });

  return {
    notebooks: normalized,
  };
}

export async function getNotebookPageData(notebookId: string) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      entries: {
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      stats: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
        orderBy: [
          { totalEntries: "desc" },
          { currentStreak: "desc" },
        ],
      },
    },
  });

  if (!notebook) return null;

  const startOfToday = getStartOfToday();
  const checkedInUserIds = new Set(
    notebook.entries
      .filter((entry) => entry.createdAt >= startOfToday)
      .map((entry) => entry.authorId),
  );

  return {
    notebook,
    checkedInCount: checkedInUserIds.size,
    totalMembers: notebook.members.length,
  };
}

export async function getNotebookEntriesByAuthor(notebookId: string, authorId: string) {
  return prisma.entry.findMany({
    where: {
      notebookId,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          bio: true,
        },
      },
      comments: {
        select: { id: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getEntryDetail(entryId: string) {
  return prisma.entry.findUnique({
    where: { id: entryId },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          bio: true,
        },
      },
      notebook: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function getPersonProfile(viewerId: string, profileUserId: string) {
  const sharedNotebookMemberships = await prisma.notebookMember.findMany({
    where: {
      userId: viewerId,
    },
    select: {
      notebookId: true,
    },
  });

  const sharedNotebookIds = sharedNotebookMemberships.map((item) => item.notebookId);

  const user = await prisma.user.findFirst({
    where: {
      id: profileUserId,
      OR: [
        {
          memberships: {
            some: {
              notebookId: {
                in: sharedNotebookIds,
              },
            },
          },
        },
        {
          entries: {
            some: {
              notebookId: {
                in: sharedNotebookIds,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      nickname: true,
      bio: true,
      createdAt: true,
      memberships: {
        where: {
          notebookId: {
            in: sharedNotebookIds,
          },
        },
        include: {
          notebook: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const entries = await prisma.entry.findMany({
    where: {
      authorId: profileUserId,
      notebookId: {
        in: sharedNotebookIds,
      },
    },
    include: {
      notebook: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const stats = await prisma.userNotebookStats.findMany({
    where: {
      userId: profileUserId,
      notebookId: {
        in: sharedNotebookIds,
      },
    },
  });

  const [authoredCommentsCount, receivedCommentsCount] = await Promise.all([
    prisma.comment.count({
      where: {
        authorId: profileUserId,
        entry: {
          notebookId: {
            in: sharedNotebookIds,
          },
        },
      },
    }),
    prisma.comment.count({
      where: {
        authorId: {
          not: profileUserId,
        },
        entry: {
          authorId: profileUserId,
          notebookId: {
            in: sharedNotebookIds,
          },
        },
      },
    }),
  ]);

  return {
    user,
    entries,
    stats: {
      totalEntries: entries.length,
      totalComments: authoredCommentsCount || stats.reduce((sum, item) => sum + item.totalComments, 0),
      receivedComments: receivedCommentsCount || stats.reduce((sum, item) => sum + item.receivedComments, 0),
      bestStreak: stats.length > 0 ? Math.max(0, ...stats.map((item) => item.longestStreak)) : getLongestEntryStreak(entries.map((entry) => entry.createdAt)),
    },
  };
}

export async function getNotebookStats(notebookId: string) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    include: {
      stats: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
        orderBy: [
          { totalEntries: "desc" },
          { totalComments: "desc" },
        ],
      },
      entries: {
        include: {
          comments: {
            select: {
              id: true,
            },
          },
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });

  if (!notebook) return null;

  const last30Days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);

    return {
      key,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      count: 0,
    };
  });

  for (const entry of notebook.entries) {
    const key = entry.createdAt.toISOString().slice(0, 10);
    const day = last30Days.find((item) => item.key === key);
    if (day) {
      day.count += 1;
    }
  }

  const mostPopularEntry = [...notebook.entries].sort(
    (left, right) => right.comments.length - left.comments.length,
  )[0];

  const mostDiligent = [...notebook.stats].sort(
    (left, right) => right.totalEntries - left.totalEntries || right.currentStreak - left.currentStreak,
  )[0];

  const mostActiveCommenter = [...notebook.stats].sort(
    (left, right) => right.totalComments - left.totalComments,
  )[0];

  return {
    notebook,
    trend: last30Days,
    highlights: {
      mostPopularEntry,
      mostDiligent,
      mostActiveCommenter,
    },
  };
}
