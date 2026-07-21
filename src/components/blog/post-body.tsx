"use client";

import * as React from "react";

const COPY_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

/**
 * Renders sanitized article HTML and progressively enhances every <pre> code
 * block with a copy-to-clipboard button. The HTML must be sanitized and have
 * heading ids injected on the server before being passed here.
 */
export function PostBody({ html }: { html: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector("[data-copy-btn]")) return;
      pre.classList.add("group/code");
      pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-copy-btn", "");
      btn.setAttribute("aria-label", "Copy code");
      btn.className =
        "absolute right-2.5 top-2.5 inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 p-1.5 text-white/80 opacity-0 transition hover:bg-white/20 focus:opacity-100 group-hover/code:opacity-100";
      btn.innerHTML = COPY_SVG;

      const onClick = async () => {
        const code = pre.querySelector("code");
        const text = code?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(text);
          btn.innerHTML = CHECK_SVG;
          setTimeout(() => {
            btn.innerHTML = COPY_SVG;
          }, 1500);
        } catch {
          /* clipboard unavailable */
        }
      };

      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      cleanups.push(() => btn.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [html]);

  return (
    <div
      ref={ref}
      className="prose prose-neutral max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
