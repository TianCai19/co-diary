import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { requireNotebookMember, requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { getEntryDetail } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function splitComments(
  comments: Array<{
    id: string;
    content: string;
    parentId: string | null;
    createdAt: Date;
    author: { id: string; nickname: string };
  }>,
) {
  return comments
    .filter((comment) => !comment.parentId)
    .map((comment) => ({
      ...comment,
      replies: comments.filter((reply) => reply.parentId === comment.id),
    }));
}

export default async function EntryDetailPage({
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

  const query = await searchParams;
  const success = typeof query.success === "string" ? query.success : "";
  const error = typeof query.error === "string" ? query.error : "";
  const comments = splitComments(entry.comments);

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader nickname={user.nickname} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <Link href="/notebooks" className="hover:text-zinc-950">我的日记本</Link>
            <span>/</span>
            <Link href={`/notebooks/${id}`} className="hover:text-zinc-950">{entry.notebook.name}</Link>
            <span>/</span>
            <span>日记详情</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">{entry.title || "无标题日记"}</h1>
          <p className="mt-3 text-sm text-zinc-500">
            {entry.author.nickname} · {formatDateTime(entry.createdAt)}
          </p>
          <p className="mt-6 whitespace-pre-wrap text-lg leading-9 text-zinc-700">{entry.content}</p>
        </section>

        {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-950">评论区</h2>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">{entry.comments.length} 条评论</span>
          </div>

          <form action={`/api/entries/${entry.id}/comments`} method="post" className="mt-6 space-y-3">
            <textarea
              className="min-h-28 w-full rounded-2xl border border-zinc-200 px-4 py-4 outline-none transition focus:border-zinc-900"
              name="content"
              placeholder="写下你的评论..."
              required
            />
            <div className="flex justify-end">
              <button className="rounded-full bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-800" type="submit">
                发布评论
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-5">
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-500">还没有评论，来留下第一条吧。</p>
            ) : (
              comments.map((comment) => (
                <article key={comment.id} className="rounded-3xl bg-zinc-50 p-5">
                  <p className="text-sm text-zinc-500">
                    {comment.author.nickname} · {formatDateTime(comment.createdAt)}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap leading-8 text-zinc-700">{comment.content}</p>
                  <form action={`/api/entries/${entry.id}/comments`} method="post" className="mt-4 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
                    <input type="hidden" name="parentId" value={comment.id} />
                    <textarea
                      className="min-h-20 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-zinc-900"
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
                        <div key={reply.id} className="rounded-2xl bg-white p-4">
                          <p className="text-sm text-zinc-500">
                            {reply.author.nickname} · {formatDateTime(reply.createdAt)}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap leading-7 text-zinc-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
