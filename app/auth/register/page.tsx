import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
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
          <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
            创建专属共同日记本
          </span>
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            用一个邮箱就能开始：邀请伙伴、一起写、一起评论、一起养成连续打卡。
          </h1>
          <ul className="space-y-3 text-zinc-600">
            <li>• 创建自己的日记本并生成邀请码</li>
            <li>• 日记本内所有成员的日记对成员全员可见</li>
            <li>• 支持一级评论和二级回复</li>
            <li>• 自动统计今日打卡人数与连续打卡 streak</li>
          </ul>
        </section>

        <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold text-zinc-950">创建账号</h2>
            <p className="text-sm text-zinc-500">注册后会自动登录并跳转到你的日记本列表。</p>
          </div>

          {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <form action="/api/auth/register" method="post" className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">昵称</span>
              <input className="w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900" name="nickname" autoComplete="nickname" placeholder="例如：Cody" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">邮箱</span>
              <input className="w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900" name="email" type="email" autoComplete="email" inputMode="email" spellCheck={false} placeholder="name@example.com" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">密码</span>
              <input className="w-full rounded-2xl border border-zinc-200 px-4 py-3 transition focus:border-zinc-900" name="password" type="password" autoComplete="new-password" placeholder="至少 8 位，包含字母和数字" required />
            </label>
            <button className="w-full rounded-2xl bg-zinc-950 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 focus-visible:bg-zinc-800" type="submit">
              注册并进入应用
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500">
            已有账号？
            <Link href="/auth/login" className="ml-1 text-zinc-950 underline-offset-4 hover:underline">
              立即登录
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
