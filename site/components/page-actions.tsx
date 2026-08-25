'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The rail's machine-readable block.
 *
 * A specification is quoted into places that are not browsers — an issue, a review,
 * a model's context. Copying from the rendered page loses the identifier, the
 * facets and the source URL, which is exactly what a quotation needs to keep. These
 * hand over the markdown twin instead, which carries all three.
 *
 * `mdPath` is the generated file; `citeUrl` is where a reader should be sent. They
 * differ because a Next dynamic segment cannot carry an extension, so nginx serves
 * `<page>.md` from `/llms/…`. In development only the generated path resolves, so
 * the fetch uses it and the link offers the canonical one.
 *
 * Shaped as one split control rather than a stack of links: four rail-width menu
 * items cost more vertical space in the rail than the actions are worth, and only
 * the copy is reached often. The rest live behind the disclosure.
 */
export function PageActions({
  mdPath,
  citeUrl,
  askAbout,
}: {
  mdPath: string;
  citeUrl: string;
  askAbout: string;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  /* A disclosure that outlives a click elsewhere on the page is a stuck menu. */
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function copy() {
    try {
      const res = await fetch(mdPath);
      if (!res.ok) throw new Error(String(res.status));
      await navigator.clipboard.writeText(await res.text());
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 2400);
  }

  const prompt = `Read ${citeUrl} — ${askAbout}`;

  return (
    <div className="machine" ref={box}>
      <button type="button" className="machine-copy" onClick={copy} aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy as markdown'}
      </button>
      <button
        type="button"
        className="machine-more"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Other machine-readable formats"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden focusable="false">
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="square"
          />
        </svg>
      </button>
      {open && (
        <div className="machine-menu" role="menu">
          <a role="menuitem" href={mdPath} onClick={() => setOpen(false)}>
            View markdown
          </a>
          <a
            role="menuitem"
            href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => setOpen(false)}
          >
            Open in Claude
          </a>
          <a
            role="menuitem"
            href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => setOpen(false)}
          >
            Open in ChatGPT
          </a>
        </div>
      )}
    </div>
  );
}
