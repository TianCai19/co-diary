"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
    >
      {copied ? "已复制" : "复制邀请码"}
    </button>
  );
}
