export function SignOutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button
        type="submit"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 focus-visible:border-zinc-900 focus-visible:text-zinc-900"
      >
        退出登录
      </button>
    </form>
  );
}
