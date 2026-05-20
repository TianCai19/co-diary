import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/date";
import { getHomePageData, getPersonProfile } from "@/lib/data";

export default async function PersonPage({ params }: { params: Promise<{ userId: string }> }) {
  const viewer = await requireUser();
  const { userId } = await params;
  const { primaryNotebook } = await getHomePageData(viewer.id);
  const payload = await getPersonProfile(viewer.id, userId);

  if (!payload) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={viewer.nickname} primaryNotebookId={primaryNotebook?.id ?? null} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-emerald-700">成员主页</p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{payload.user.nickname}</h1>
              <p className="max-w-2xl whitespace-pre-wrap text-lg leading-8 text-zinc-600">
                {payload.user.bio || "这个人还没有写个人介绍。你可以先从 Ta 的日记里认识 Ta。"}
              </p>
              <p className="text-sm text-zinc-500">加入共同日记的时间：{formatDate(payload.user.createdAt)}</p>
            </div>

            <div className="grid min-w-[220px] gap-3 sm:w-[260px]">
              <div className="rounded-3xl bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">日记总数</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950">{payload.stats.totalEntries}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500">评论</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-950">{payload.stats.totalComments}</p>
                </div>
                <div className="rounded-3xl border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500">最佳 streak</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-950">{payload.stats.bestStreak}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">Ta 参与的共同日记本</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {payload.user.memberships.map((membership) => (
              <Link
                key={membership.notebookId}
                href={`/notebooks/${membership.notebookId}?author=${payload.user.id}`}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950"
              >
                {membership.notebook.name} · 查看 Ta 在这里的日记
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-950">Ta 的全部日记</h2>
            <span className="text-sm text-zinc-500">按最近时间排序</span>
          </div>

          {payload.entries.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
              你和 Ta 还没有共同可见的日记内容。
            </div>
          ) : (
            payload.entries.map((entry) => (
              <article key={entry.id} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">{entry.notebook.name}</p>
                    <h3 className="mt-1 text-2xl font-semibold text-zinc-950">{entry.title || "无标题日记"}</h3>
                    <p className="mt-2 text-sm text-zinc-500">{formatDateTime(entry.createdAt)} · {entry.comments.length} 条评论</p>
                  </div>
                  <Link href={`/notebooks/${entry.notebook.id}/entries/${entry.id}`} className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                    打开日记详情
                  </Link>
                </div>
                <p className="mt-4 line-clamp-4 whitespace-pre-wrap leading-8 text-zinc-700">{entry.content}</p>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
