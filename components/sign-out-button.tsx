export function SignOutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:border-emerald-400 focus-visible:text-emerald-800"
      >
        退出登录
      </button>
    </form>
  );
}
