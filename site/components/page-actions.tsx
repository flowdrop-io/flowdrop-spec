'use client';

import { useState } from 'react';

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
    <div className="machine">
      <h3>For a machine</h3>
      <button type="button" onClick={copy} aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy as markdown'}
      </button>
      <a href={mdPath}>View markdown</a>
      <a
        href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        Open in Claude
      </a>
      <a
        href={`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        Open in ChatGPT
      </a>
    </div>
  );
}
