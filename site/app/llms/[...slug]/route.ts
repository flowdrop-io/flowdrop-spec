import fs from 'node:fs';
import path from 'node:path';
import { allRules, slugify } from '@/lib/rules';
import { pageMarkdown, ruleToMarkdown } from '@/lib/markdown';

/**
 * Every page's markdown twin.
 *
 * These are emitted here rather than beside the pages themselves because a Next
 * dynamic segment cannot carry an extension — `[rule].md` is a literal folder name,
 * not a parameter — so `/rules/gr-store/store-6.md` cannot be generated directly.
 * nginx aliases that URL onto this route, which is the address readers are given;
 * this path is the storage, not the interface.
 */

export const dynamic = 'force-static';
export const revalidate = false;

const REPO = path.join(process.cwd(), '..');

type Doc = { slug: string[]; body: () => string };

function docs(): Doc[] {
  const out: Doc[] = allRules().map((rule) => ({
    slug: [slugify(rule.family), `${rule.slug}.md`],
    body: () => ruleToMarkdown(rule),
  }));

  out.push({
    slug: ['conventions.md'],
    body: () =>
      pageMarkdown('Conventions', '/conventions', fs.readFileSync(path.join(REPO, 'conventions.md'), 'utf8')),
  });

  out.push({
    slug: ['glossary.md'],
    body: () => {
      const raw = fs.readFileSync(path.join(process.cwd(), 'content/glossary.mdx'), 'utf8');
      // Drop the MDX frontmatter; the markdown carries its own.
      const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
      return pageMarkdown('Glossary', '/glossary', body);
    },
  });

  return out;
}

export function generateStaticParams() {
  return docs().map((d) => ({ slug: d.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug.join('/');
  const doc = docs().find((d) => d.slug.join('/') === key);
  if (!doc) return new Response('Not found', { status: 404 });

  return new Response(doc.body(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
