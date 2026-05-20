import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : "";
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">设置</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">你的主页与偏好</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600">
            在这里维护昵称、个人介绍。其他成员可以通过你的主页查看这些信息和你的日记记录。
          </p>
        </section>

        {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form action="/api/settings/profile" method="post" className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-zinc-950">公开主页</h2>
            <p className="mt-2 text-sm text-zinc-500">这部分会展示给和你在同一日记本中的成员。</p>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-medium text-zinc-700">昵称</span>
              <input
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900"
                name="nickname"
                defaultValue={user.nickname}
                required
              />
            </label>

            <label className="mt-6 block space-y-2">
              <span className="text-sm font-medium text-zinc-700">个人介绍</span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-zinc-200 px-4 py-3 leading-7 transition focus:border-zinc-900"
                name="bio"
                defaultValue={user.bio ?? ""}
                placeholder="写一句你想让大家认识你的话，比如你最近在关注什么、想把共同日记写成什么样……"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Link href={`/people/${user.id}`} className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                查看我的主页
              </Link>
              <button className="rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700" type="submit">
                保存资料
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-950">常用操作</h2>
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/notebooks" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700">
                  去日记本列表
                </Link>
                <Link href="/notebooks" className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
                  创建或加入日记本
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-950">账号</h2>
              <p className="mt-2 text-sm text-zinc-500">退出登录被移到了这里，避免在手机顶部占据主要操作位置。</p>
              <div className="mt-4">
                <SignOutButton />
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
