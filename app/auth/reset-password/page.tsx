import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            MVP 提示
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-950">密码重置入口已预留</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            当前版本优先完成注册、登录、日记本协作、日记发布、评论回复与打卡统计。
            如需上线生产，可继续接入邮件服务实现重置密码流程。
          </p>
          <Link href="/auth/login" className="mt-8 inline-flex rounded-full bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-800">
            返回登录
          </Link>
        </div>
      </main>
    </div>
  );
}
