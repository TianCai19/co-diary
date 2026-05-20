import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { getUserNotebooks } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NotebooksPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const notebooks = await getUserNotebooks(user.id);
  const params = await searchParams;
  const message = typeof params.success === "string" ? params.success : "";
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              我的日记本
            </span>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">创建一个共享空间，邀请大家一起写。</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
              每个日记本都有独立的邀请码、成员列表、日记时间线与打卡统计。你可以新建一个，也可以通过邀请码加入已有日记本。
            </p>
          </div>

          <div className="grid gap-4">
            <form action="/api/notebooks/create" method="post" className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-950">新建日记本</h2>
              <p className="mt-2 text-sm text-zinc-500">创建后你将成为 owner，并自动获得邀请码。</p>
              <input className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900" name="name" autoComplete="off" placeholder="比如：我们的每日生活…" required />
              <button className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700" type="submit">
                创建日记本
              </button>
            </form>

            <form action="/api/notebooks/join" method="post" className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-950">通过邀请码加入</h2>
              <p className="mt-2 text-sm text-zinc-500">输入现有日记本的邀请码，立即加入共同写作。</p>
              <input className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900" name="inviteCode" autoComplete="off" spellCheck={false} placeholder="粘贴邀请码…" required />
              <button className="mt-4 w-full rounded-2xl border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950" type="submit">
                加入日记本
              </button>
            </form>
          </div>
        </section>

        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {notebooks.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600 md:col-span-2 xl:col-span-3">
              你还没有任何日记本。先新建一个，或使用邀请码加入吧。
            </div>
          ) : (
            notebooks.map((notebook, index) => {
              const latestUpdatedAt = notebook.entries[0]?.updatedAt;
              return (
                <article key={notebook.id} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                  <div
                    className="h-28 rounded-[1.5rem]"
                    style={{
                      background:
                        [
                          "linear-gradient(135deg, #bbf7d0 0%, #f4f4f5 100%)",
                          "linear-gradient(135deg, #ddd6fe 0%, #f4f4f5 100%)",
                          "linear-gradient(135deg, #fde68a 0%, #f4f4f5 100%)",
                        ][index % 3],
                    }}
                  />
                  <h2 className="mt-5 break-words text-2xl font-semibold text-zinc-950">{notebook.name}</h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {notebook.members.length} 位成员 · 最近更新：{latestUpdatedAt ? formatDateTime(latestUpdatedAt) : "还没有日记"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {notebook.members.map((member) => (
                      <span key={member.userId} className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                        {member.user.nickname}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link href={`/notebooks/${notebook.id}`} className="inline-flex justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:bg-emerald-700">
                      进入日记本
                    </Link>
                    <Link href={`/notebooks/${notebook.id}/entries/new`} className="inline-flex justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950 focus-visible:border-zinc-900 focus-visible:text-zinc-950">
                      写今日日记
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
