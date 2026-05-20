import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { requireNotebookMember, requireUser } from "@/lib/auth";
import { getEntryDetail } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EditEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; entryId: string }>;
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const { id, entryId } = await params;
  await requireNotebookMember(id, user.id);

  const entry = await getEntryDetail(entryId);
  if (!entry || entry.notebook.id !== id) {
    notFound();
  }

  if (entry.author.id !== user.id) {
    redirect(`/notebooks/${id}/entries/${entryId}?error=${encodeURIComponent("只能编辑自己的日记")}`);
  }

  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">编辑我的日记</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950">{entry.notebook.name}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-600">
                修改标题或正文后，会回到这篇日记的详情页。
              </p>
            </div>
            <Link href={`/notebooks/${id}/entries/${entry.id}`} className="rounded-full border border-zinc-300 px-5 py-3 font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950">
              返回详情
            </Link>
          </div>
        </section>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <form action={`/api/notebooks/${id}/entries/${entry.id}`} method="post">
            <input type="hidden" name="intent" value="update" />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">标题（可选）</span>
              <input
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-zinc-900"
                name="title"
                defaultValue={entry.title ?? ""}
                placeholder="给今天起一个标题"
              />
            </label>
            <label className="mt-6 block space-y-2">
              <span className="text-sm font-medium text-zinc-700">正文</span>
              <textarea
                className="min-h-[320px] w-full rounded-2xl border border-zinc-200 px-4 py-4 leading-8 outline-none transition focus:border-zinc-900"
                name="content"
                defaultValue={entry.content}
                required
              />
            </label>
            <div className="mt-6 flex justify-end">
              <button className="rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700" type="submit">
                保存修改
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-zinc-200 pt-6">
            <form action={`/api/notebooks/${id}/entries/${entry.id}`} method="post">
              <input type="hidden" name="intent" value="delete" />
              <button className="rounded-full border border-rose-200 px-5 py-3 font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50" type="submit">
                删除这篇日记
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
