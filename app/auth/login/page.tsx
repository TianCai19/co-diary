import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-6">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            邮箱登录 · 共同记录每一天
          </span>
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            和重要的人一起写日记，让打卡、评论和陪伴发生在同一个空间。
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600">
            登录后即可创建日记本、邀请成员加入、发布今日日记，并查看所有成员的日常记录与互动情况。
          </p>
        </section>

        <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold text-zinc-950">欢迎回来</h2>
            <p className="text-sm text-zinc-500">输入邮箱与密码继续你的共同日记。</p>
          </div>

          {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <form action="/api/auth/login" method="post" className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">邮箱</span>
              <input
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                placeholder="name@example.com"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">密码</span>
              <input
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="至少 8 位，包含字母和数字"
                required
              />
            </label>
            <button className="w-full rounded-2xl bg-zinc-950 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 focus-visible:bg-zinc-800" type="submit">
              登录
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/auth/register" className="text-zinc-950 underline-offset-4 hover:underline">
              还没有账号？去注册
            </Link>
            <Link href="/auth/reset-password" className="underline-offset-4 hover:underline">
              忘记密码
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
