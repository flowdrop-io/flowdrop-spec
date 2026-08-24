/**
 * The ID matcher. One implementation, two call sites:
 *
 *  - `remarkSpecAutolink` (lib/remark-autolink.ts) for narrative MDX, which goes
 *    through the MDX compiler;
 *  - `<Prose>` (components/prose.tsx) for the YAML normative/summary strings,
 *    which never see remark at all.
 *
 * Only identifiers that resolve to a real rule page become links. A ruling
 * (`OPEN-19`, `DF-7`) has no page, so it renders as a marker, never a dead link.
 */

/** Candidate identifier shapes, per rules/schema.json's `id` pattern. */
const TOKEN = /\b[A-Z][A-Z0-9]*(?:[-.][A-Za-z0-9]+)*(?:\/[a-z])?/g;

const RULING = /^(?:OPEN|DF)-[0-9]+$/;

export type Segment =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; url: string }
  | { type: 'marker'; value: string };

export type Resolver = (id: string) => string | undefined;

/**
 * Trim one trailing `.seg` / `-seg` group at a time, so `SCH-10.b` still links
 * `SCH-10` when no `SCH-10.b` page exists.
 */
function* candidates(token: string): Generator<string> {
  let t = token;
  yield t;
  if (t.includes('/')) {
    t = t.slice(0, t.lastIndexOf('/'));
    yield t;
  }
  while (true) {
    const cut = Math.max(t.lastIndexOf('-'), t.lastIndexOf('.'));
    if (cut <= 0) return;
    t = t.slice(0, cut);
    yield t;
  }
}

/** Split a plain-text string into linked / marked / literal segments. */
export function segment(text: string, resolve: Resolver): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN.exec(text))) {
    const token = m[0];
    let hit: { value: string; url?: string } | undefined;

    for (const c of candidates(token)) {
      const url = resolve(c);
      if (url) {
        hit = { value: c, url };
        break;
      }
      if (RULING.test(c)) {
        hit = { value: c };
        break;
      }
    }
    if (!hit) continue;

    const start = m.index;
    if (start > last) out.push({ type: 'text', value: text.slice(last, start) });
    out.push(hit.url ? { type: 'link', value: hit.value, url: hit.url } : { type: 'marker', value: hit.value });
    last = start + hit.value.length;
    TOKEN.lastIndex = last;
  }

  if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}

/** True when the string contains at least one linkable identifier. */
export function hasIds(text: string, resolve: Resolver): boolean {
  return segment(text, resolve).some((s) => s.type !== 'text');
}

/**
 * Split YAML prose into inline-code spans and plain runs. The YAML prose uses
 * exactly one Markdown construct (backtick code spans), verified across the
 * whole corpus, so this is the entire inline grammar it needs.
 */
export function inlineChunks(text: string): { code: boolean; value: string }[] {
  const out: { code: boolean; value: string }[] = [];
  const re = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ code: false, value: text.slice(last, m.index) });
    out.push({ code: true, value: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ code: false, value: text.slice(last) });
  return out;
}
