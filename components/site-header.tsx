import Link from "next/link";

type SiteHeaderProps = {
  nickname?: string;
  primaryNotebookId?: string | null;
};

export function SiteHeader({ nickname, primaryNotebookId }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-950">
            Co-Diary
          </Link>
          <p className="text-sm text-zinc-500">多人共同写日记、互相评论、持续打卡</p>
        </div>
        <nav className="flex w-full flex-wrap items-center gap-2 text-sm sm:w-auto sm:justify-end">
          {nickname ? (
            <>
              <Link className="rounded-full px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100" href="/">
                首页
              </Link>
              {primaryNotebookId ? (
                <Link
                  className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 focus-visible:bg-emerald-700 sm:hidden"
                  href={`/notebooks/${primaryNotebookId}/entries/new`}
                >
                  直接写
                </Link>
              ) : null}
              <Link className="hidden rounded-full px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100 sm:inline-flex" href="/notebooks">
                我的日记本
              </Link>
              <Link className="rounded-full px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100" href="/settings">
                设置
              </Link>
              <span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 sm:inline-block">
                {nickname}
              </span>
            </>
          ) : (
            <>
              <Link className="rounded-full px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:bg-zinc-100" href="/auth/login">
                登录
              </Link>
              <Link
                className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 focus-visible:bg-emerald-700"
                href="/auth/register"
              >
                免费开始
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
