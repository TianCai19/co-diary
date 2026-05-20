import { prisma } from "@/lib/prisma";
import { getStartOfToday } from "@/lib/date";

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

export async function getEntryDetail(entryId: string) {
  return prisma.entry.findUnique({
    where: { id: entryId },
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
