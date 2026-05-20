import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { requireNotebookMember, requireUser } from "@/lib/auth";
import { getNotebookPageData } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewEntryPage({
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
    return null;
  }

  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">写今日日记</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950">{payload.notebook.name}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600">
                你今天的记录会立刻出现在该日记本的时间线中，并更新今日打卡与连续记录统计。
              </p>
            </div>
            <Link href={`/notebooks/${id}`} className="rounded-full border border-zinc-300 px-5 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
              返回日记本
            </Link>
          </div>
        </section>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <form action={`/api/notebooks/${id}/entries`} method="post" className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">标题（可选）</span>
            <input className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-zinc-900" name="title" placeholder="给今天起一个标题" />
          </label>
          <label className="mt-6 block space-y-2">
            <span className="text-sm font-medium text-zinc-700">正文</span>
            <textarea
              className="min-h-[320px] w-full rounded-2xl border border-zinc-200 px-4 py-4 leading-8 outline-none transition focus:border-zinc-900"
              name="content"
              placeholder="写下今天发生的事、你的情绪、你的见闻……"
              required
            />
          </label>
          <div className="mt-6 flex justify-end">
            <button className="rounded-full bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-800" type="submit">
              发布日记
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
