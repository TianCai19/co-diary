import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/copy-button";
import { SiteHeader } from "@/components/site-header";
import { requireNotebookMember, requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { getNotebookPageData } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function groupCommentsByParent(
  comments: Array<{
    id: string;
    content: string;
    parentId: string | null;
    createdAt: Date;
    author: { id: string; nickname: string };
  }>,
) {
  const rootComments = comments.filter((comment) => !comment.parentId);
  return rootComments.map((comment) => ({
    ...comment,
    replies: comments.filter((reply) => reply.parentId === comment.id),
  }));
}

export default async function NotebookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const { id } = await params;
  await requireNotebookMember(id, user.id);

  const payload = await getNotebookPageData(id);
  if (!payload) {
    notFound();
  }

  const query = await searchParams;
  const success = typeof query.success === "string" ? query.success : "";
  const error = typeof query.error === "string" ? query.error : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-emerald-700">日记本详情</p>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">{payload.notebook.name}</h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-600">
                所有成员的日记对成员全员可见。你可以在这里查看大家的时间线、评论互动以及今日打卡状态。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/notebooks/${id}/entries/new`} className="rounded-full bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-800">
                写今日日记
              </Link>
              <Link href={`/notebooks/${id}/stats`} className="rounded-full border border-zinc-300 px-5 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                查看统计
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-zinc-950 p-5 text-white">
              <p className="text-sm text-zinc-300">今日打卡</p>
              <p className="mt-2 text-3xl font-semibold">
                {payload.checkedInCount}/{payload.totalMembers}
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 p-5">
              <p className="text-sm text-zinc-500">成员人数</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{payload.totalMembers}</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 p-5">
              <p className="text-sm text-zinc-500">日记总数</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{payload.notebook.entries.length}</p>
            </div>
            <div className="rounded-3xl border border-zinc-200 p-5">
              <p className="text-sm text-zinc-500">邀请码</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <code className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">{payload.notebook.inviteCode}</code>
                <CopyButton value={payload.notebook.inviteCode} />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-sm font-medium text-zinc-700">今日成员打卡状态</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {payload.notebook.members.map((member) => {
                const checkedIn = payload.notebook.entries.some(
                  (entry) => entry.authorId === member.userId && entry.createdAt.toDateString() === new Date().toDateString(),
                );

                return (
                  <span
                    key={member.userId}
                    className={`rounded-full px-3 py-2 text-sm ${
                      checkedIn ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {checkedIn ? "✓" : "✗"} {member.user.nickname}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <section className="grid gap-8 lg:grid-cols-[1.5fr_0.5fr]">
          <div className="space-y-5">
            {payload.notebook.entries.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
                还没有人写下第一篇日记。点击右上角“写今日日记”开始记录吧。
              </div>
            ) : (
              payload.notebook.entries.map((entry) => {
                const comments = groupCommentsByParent(entry.comments);
                return (
                  <article key={entry.id} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-zinc-500">{entry.author.nickname} · {formatDateTime(entry.createdAt)}</p>
                        <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{entry.title || "无标题日记"}</h2>
                      </div>
                      <Link href={`/notebooks/${id}/entries/${entry.id}`} className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                        打开详情页
                      </Link>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-700">{entry.content}</p>

                    <div className="mt-6 rounded-3xl bg-zinc-50 p-5">
                      <h3 className="text-lg font-semibold text-zinc-950">评论区</h3>
                      <form action={`/api/entries/${entry.id}/comments`} method="post" className="mt-4 flex flex-col gap-3">
                        <textarea
                          className="min-h-24 rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-zinc-900"
                          name="content"
                          placeholder="写下你的评论..."
                          required
                        />
                        <div className="flex justify-end">
                          <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800" type="submit">
                            发布评论
                          </button>
                        </div>
                      </form>

                      <div className="mt-6 space-y-4">
                        {comments.length === 0 ? (
                          <p className="text-sm text-zinc-500">还没有评论，来留下第一条吧。</p>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                              <p className="text-sm text-zinc-500">
                                {comment.author.nickname} · {formatDateTime(comment.createdAt)}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-700">{comment.content}</p>
                              <form action={`/api/entries/${entry.id}/comments`} method="post" className="mt-4 space-y-3 rounded-2xl bg-zinc-50 p-4">
                                <input type="hidden" name="parentId" value={comment.id} />
                                <textarea
                                  className="min-h-20 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-zinc-900"
                                  name="content"
                                  placeholder={`回复 ${comment.author.nickname}...`}
                                  required
                                />
                                <div className="flex justify-end">
                                  <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950" type="submit">
                                    回复
                                  </button>
                                </div>
                              </form>

                              {comment.replies.length > 0 ? (
                                <div className="mt-4 space-y-3 border-l border-zinc-200 pl-4">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="rounded-2xl bg-zinc-50 p-4">
                                      <p className="text-sm text-zinc-500">
                                        {reply.author.nickname} · {formatDateTime(reply.createdAt)}
                                      </p>
                                      <p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-700">{reply.content}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-950">成员列表</h2>
              <div className="mt-4 space-y-3">
                {payload.notebook.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                    <span className="font-medium text-zinc-800">{member.user.nickname}</span>
                    <span className={`rounded-full px-3 py-1 text-xs ${member.role === "owner" ? "bg-violet-100 text-violet-700" : "bg-zinc-200 text-zinc-600"}`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-950">活跃排行</h2>
              <div className="mt-4 space-y-3">
                {payload.notebook.stats.length === 0 ? (
                  <p className="text-sm text-zinc-500">还没有统计数据。</p>
                ) : (
                  payload.notebook.stats.slice(0, 5).map((stat) => (
                    <div key={stat.userId} className="rounded-2xl bg-zinc-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-800">{stat.user.nickname}</span>
                        <span className="text-sm text-zinc-500">{stat.currentStreak} 天连更</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">
                        {stat.totalEntries} 篇日记 · {stat.totalComments} 条评论 · 被评论 {stat.receivedComments} 次
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
