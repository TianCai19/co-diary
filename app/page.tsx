import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { getFeedForUser, getHomePageData } from "@/lib/data";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16">
          <section className="grid gap-10 rounded-[2rem] bg-gradient-to-br from-emerald-100 via-white to-violet-100 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-12">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-emerald-700">
                P0 MVP 已就绪：注册 / 创建日记本 / 写日记 / 评论 / 打卡
              </span>
              <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                一个给亲友、情侣、搭子和小团队使用的多人共同日记 Web App。
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-600">
                Co-Diary 让所有成员在一个共享日记本里记录今天发生的事，彼此查看、评论、回复，
                还能看到每日打卡人数和每个人的连续记录情况。
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/auth/register" className="inline-flex justify-center rounded-full bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 focus-visible:bg-emerald-700">
                  立即创建账号
                </Link>
                <Link href="/auth/login" className="inline-flex justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950 focus-visible:border-zinc-900 focus-visible:text-zinc-950">
                  我已有账号
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-sm">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-sm">
                <p className="text-sm text-emerald-50/80">今日打卡</p>
                <p className="mt-3 text-4xl font-semibold">3 / 4</p>
                <p className="mt-2 text-sm text-emerald-50/80">实时看到谁已经写下今日日记</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                  <p className="text-sm text-zinc-500">连续打卡</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-950">12 天</p>
                </div>
                <div className="rounded-3xl border border-zinc-200 bg-white p-5">
                  <p className="text-sm text-zinc-500">评论互动</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-950">28 条</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            {[
              ["创建日记本", "一键生成邀请码，快速拉朋友、伴侣或团队成员加入。"],
              ["全员可见日记", "成员之间可以阅读彼此的内容，形成真实、有温度的动态流。"],
              ["评论与二级回复", "不仅能写，还能聊，沉淀每天的互动与陪伴。"],
            ].map(([title, description]) => (
              <article key={title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
                <p className="mt-3 leading-7 text-zinc-600">{description}</p>
              </article>
            ))}
          </section>
        </main>
      </div>
    );
  }

  const entries = await getFeedForUser(user.id);
  const { primaryNotebook, notebooks } = await getHomePageData(user.id);

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} primaryNotebookId={primaryNotebook?.id ?? null} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        {primaryNotebook ? (
          <section className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                你好，{user.nickname}
              </span>
              <div>
                <p className="text-sm text-zinc-500">默认快速开始</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">先从你最重要的日记本开始。</h1>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600">
                  你现在最常用的入口应该是“直接写”。所以首页会默认把你最近活跃的日记本放在最前面，而不是先让你去找“我的日记本”。
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">当前默认日记本</p>
                    <h2 className="mt-2 break-words text-2xl font-semibold text-zinc-950">{primaryNotebook.name}</h2>
                    <p className="mt-2 text-sm text-zinc-600">
                      {primaryNotebook.members.length} 位成员 · 最近更新：{primaryNotebook.latestEntry ? formatDateTime(primaryNotebook.latestEntry.createdAt) : "还没有日记"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:w-[220px]">
                    <Link href={`/notebooks/${primaryNotebook.id}/entries/new`} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">
                      直接写今日日记
                    </Link>
                    <Link href={`/notebooks/${primaryNotebook.id}`} className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                      再看日记本详情
                    </Link>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {primaryNotebook.members.map((member) => (
                    <Link
                      key={member.userId}
                      href={`/people/${member.userId}`}
                      className="rounded-full bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                    >
                      {member.user.nickname}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <aside className="grid gap-4">
              <div className="rounded-[1.75rem] border border-zinc-200 p-5">
                <p className="text-sm font-medium text-zinc-500">其他入口</p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/settings" className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                    去设置 / 写个人介绍
                  </Link>
                  <Link href="/notebooks" className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                    管理 / 切换日记本
                  </Link>
                </div>
              </div>

              {notebooks.length > 1 ? (
                <div className="rounded-[1.75rem] border border-zinc-200 p-5">
                  <p className="text-sm font-medium text-zinc-500">你还有 {notebooks.length - 1} 个其他日记本</p>
                  <div className="mt-4 space-y-3">
                    {notebooks.slice(1, 4).map((notebook) => (
                      <div key={notebook.id} className="rounded-2xl bg-zinc-50 p-4">
                        <p className="font-medium text-zinc-900">{notebook.name}</p>
                        <div className="mt-3 flex gap-2">
                          <Link href={`/notebooks/${notebook.id}/entries/new`} className="rounded-full bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100">
                            直接写
                          </Link>
                          <Link href={`/notebooks/${notebook.id}`} className="rounded-full bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100">
                            查看
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">先开始你的第一个共同空间</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">你还没有日记本，首页直接给你开始按钮。</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
                不再要求你先去找“我的日记本”。你可以直接在首页创建，或者用邀请码加入一个已有空间。
              </p>
            </div>
            <div className="grid gap-4">
              <form action="/api/notebooks/create" method="post" className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-zinc-950">创建第一个日记本</h2>
                <input className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900" name="name" placeholder="比如：我们的每日生活…" required />
                <button className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700" type="submit">
                  直接开始
                </button>
              </form>
              <form action="/api/notebooks/join" method="post" className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-zinc-950">输入邀请码加入</h2>
                <input className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900" name="inviteCode" placeholder="粘贴邀请码…" required />
                <button className="mt-4 w-full rounded-2xl border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950" type="submit">
                  加入共同日记
                </button>
              </form>
            </div>
          </section>
        )}

        <section className="grid gap-4">
          {entries.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center">
              <h2 className="text-2xl font-semibold text-zinc-950">还没有动态</h2>
              <p className="mt-3 text-zinc-600">先创建一个日记本，或通过邀请码加入一个现有日记本，然后写下第一篇日记。</p>
              {primaryNotebook ? null : <Link href="/notebooks" className="mt-6 inline-flex justify-center rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700 focus-visible:bg-emerald-700">查看更多日记本入口</Link>}
            </div>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">{entry.notebook.name}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-zinc-950">{entry.title || "无标题日记"}</h2>
                    <p className="mt-2 text-sm text-zinc-500">
                      <Link href={`/people/${entry.author.id}`} className="font-medium text-zinc-700 underline-offset-4 hover:underline">
                        {entry.author.nickname}
                      </Link>{" "}· {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">
                    {entry.comments.length} 条评论
                  </span>
                </div>
                <p className="mt-4 line-clamp-3 whitespace-pre-wrap leading-8 text-zinc-700">{entry.content}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/people/${entry.author.id}`} className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                    看 Ta 的全部日记
                  </Link>
                  <Link href={`/notebooks/${entry.notebook.id}`} className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                    查看日记本
                  </Link>
                  <Link href={`/notebooks/${entry.notebook.id}/entries/${entry.id}`} className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                    查看详情与评论
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
