import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { requireNotebookMember, requireUser } from "@/lib/auth";
import { getNotebookStats } from "@/lib/data";

export default async function NotebookStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await requireNotebookMember(id, user.id);

  const payload = await getNotebookStats(id);
  if (!payload) {
    notFound();
  }

  const maxTrend = Math.max(...payload.trend.map((item) => item.count), 1);

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} primaryNotebookId={id} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">数据统计</p>
              <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{payload.notebook.name}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600">查看本月最勤奋成员、最受欢迎日记、最活跃评论者，以及最近 30 天的提交趋势。</p>
            </div>
            <Link href={`/notebooks/${id}`} className="rounded-full border border-zinc-300 px-5 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
              返回日记本
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">本月最勤奋成员</p>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
              {payload.highlights.mostDiligent?.user.nickname ?? "暂无"}
            </h2>
            <p className="mt-2 text-zinc-600">
              {payload.highlights.mostDiligent
                ? `${payload.highlights.mostDiligent.totalEntries} 篇日记 · 当前连续 ${payload.highlights.mostDiligent.currentStreak} 天`
                : "等待第一篇日记发布"}
            </p>
          </article>

          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">最受欢迎日记</p>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
              {payload.highlights.mostPopularEntry?.title || payload.highlights.mostPopularEntry?.content.slice(0, 12) || "暂无"}
            </h2>
            <p className="mt-2 text-zinc-600">
              {payload.highlights.mostPopularEntry
                ? `${payload.highlights.mostPopularEntry.comments.length} 条评论 · ${payload.highlights.mostPopularEntry.author.nickname}`
                : "等待互动产生"}
            </p>
          </article>

          <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">最活跃评论者</p>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
              {payload.highlights.mostActiveCommenter?.user.nickname ?? "暂无"}
            </h2>
            <p className="mt-2 text-zinc-600">
              {payload.highlights.mostActiveCommenter
                ? `${payload.highlights.mostActiveCommenter.totalComments} 条评论`
                : "等待评论产生"}
            </p>
          </article>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-950">近 30 天提交趋势</h2>
            <span className="text-sm text-zinc-500">按自然日统计</span>
          </div>
          <div className="mt-8 overflow-x-auto pb-2">
            <div className="grid min-w-[720px] grid-cols-30 gap-3">
              {payload.trend.map((point) => (
                <div key={point.key} className="flex flex-col items-center gap-2">
                  <div className="flex h-40 items-end">
                    <div
                      className="w-3 rounded-full bg-emerald-500/80"
                      style={{ height: `${Math.max((point.count / maxTrend) * 100, point.count > 0 ? 10 : 4)}%` }}
                      title={`${point.label}: ${point.count} 篇`}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500">{point.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">成员排行榜</h2>
          <div className="mt-6 grid gap-4 md:hidden">
            {payload.notebook.stats.map((stat) => (
              <article key={stat.userId} className="rounded-3xl bg-zinc-50 p-5 text-zinc-700">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="break-words text-lg font-semibold text-zinc-950">{stat.user.nickname}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-sm text-zinc-600">{stat.currentStreak} 天</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-zinc-500">日记</dt><dd className="mt-1 font-medium text-zinc-950 tabular-nums">{stat.totalEntries}</dd></div>
                  <div><dt className="text-zinc-500">评论</dt><dd className="mt-1 font-medium text-zinc-950 tabular-nums">{stat.totalComments}</dd></div>
                  <div><dt className="text-zinc-500">被评论</dt><dd className="mt-1 font-medium text-zinc-950 tabular-nums">{stat.receivedComments}</dd></div>
                  <div><dt className="text-zinc-500">最长 streak</dt><dd className="mt-1 font-medium text-zinc-950 tabular-nums">{stat.longestStreak}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="hidden min-w-full border-separate border-spacing-y-3 md:table">
              <thead>
                <tr className="text-left text-sm text-zinc-500">
                  <th className="px-4">成员</th>
                  <th className="px-4">日记篇数</th>
                  <th className="px-4">评论次数</th>
                  <th className="px-4">被评论数</th>
                  <th className="px-4">当前 streak</th>
                  <th className="px-4">最长 streak</th>
                </tr>
              </thead>
              <tbody>
                {payload.notebook.stats.map((stat) => (
                  <tr key={stat.userId} className="rounded-2xl bg-zinc-50 text-zinc-700">
                    <td className="rounded-l-2xl px-4 py-4 font-medium text-zinc-950">{stat.user.nickname}</td>
                    <td className="px-4 py-4 tabular-nums">{stat.totalEntries}</td>
                    <td className="px-4 py-4 tabular-nums">{stat.totalComments}</td>
                    <td className="px-4 py-4 tabular-nums">{stat.receivedComments}</td>
                    <td className="px-4 py-4 tabular-nums">{stat.currentStreak}</td>
                    <td className="rounded-r-2xl px-4 py-4 tabular-nums">{stat.longestStreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
