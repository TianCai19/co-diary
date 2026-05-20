"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800"
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
