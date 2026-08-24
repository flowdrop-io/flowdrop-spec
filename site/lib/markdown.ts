import { allFamilies, allRules, FAMILY_LABEL, type LoadedRule } from './rules';
import { SPEC_ORIGIN, SPEC_VERSION } from '@/app/layout.config';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The corpus as markdown, for readers that are not browsers.
 *
 * A rule page is generated from YAML, so its markdown is generated from the same
 * YAML rather than scraped back out of the HTML: one source, two renderings, and
 * no risk of the machine-readable copy drifting from the page.
 *
 * Every document carries its own source URL and licence, because these files are
 * fetched away from the site and quoted somewhere else. A quotation that cannot be
 * traced back to the rule it came from is how a specification gets misreported.
 */

const REPO = path.join(process.cwd(), '..');

export const absolute = (url: string) => `${SPEC_ORIGIN}${url}`;

/** The `.md` URL a page is published at (nginx aliases it onto /llms). */
export const markdownUrl = (rule: LoadedRule) => `${rule.url}.md`;

function facets(rule: LoadedRule): string {
  const bits = [
    `${rule.family} (Part ${rule.part})`,
    `level: ${rule.level}`,
    `profiles: ${rule.profiles.join(', ')}`,
    `added in ${rule.added}`,
    rule.changed !== rule.added ? `last changed in ${rule.changed}` : undefined,
    rule.posture !== 'normative-target' ? `posture: ${rule.posture}` : undefined,
  ].filter(Boolean);
  return bits.join(' · ');
}

/** One rule, as a standalone document. */
export function ruleToMarkdown(rule: LoadedRule, { standalone = true } = {}): string {
  const out: string[] = [];
  const h = standalone ? '#' : '##';

  if (standalone) {
    out.push(
      '---',
      `id: ${rule.id}`,
      `family: ${rule.family}`,
      `level: ${rule.level}`,
      `profiles: [${rule.profiles.join(', ')}]`,
      `posture: ${rule.posture}`,
      `added: "${rule.added}"`,
      `changed: "${rule.changed}"`,
      `source: ${absolute(rule.url)}`,
      `specification: FlowDrop Workflow Specification ${SPEC_VERSION}`,
      'licence: CC BY 4.0',
      '---',
      '',
    );
  }

  out.push(`${h} ${rule.id} — ${rule.title}`, '');
  out.push(`*${facets(rule)}*`, '');
  if (rule.summary?.trim()) out.push(rule.summary.trim(), '');

  // The one part that binds, marked as such. A reader quoting this file should be
  // able to tell the rule from everything written around it.
  out.push(`${h}# The rule`, '', '> **Normative.** This is the rule.', '>');
  out.push(
    rule.normative
      .trim()
      .split('\n')
      .map((l) => `> ${l.trim()}`)
      .join('\n'),
    '',
  );

  if (rule.posture !== 'normative-target') {
    out.push(
      rule.posture === 'descriptive'
        ? '*This rule records what implementations do rather than requiring it.*'
        : `*This rule is ${rule.posture}. It is kept so it stays citable.*`,
      '',
    );
    if (rule.supersededBy) out.push(`Superseded by ${rule.supersededBy}.`, '');
  }

  if (rule.narrative?.trim()) {
    out.push(
      rule.narrativeStale
        ? '*This prose may be out of date: the rule’s normative text has changed since it was written.*\n'
        : '',
      rule.narrative.trim(),
      '',
    );
  }

  if (rule.rulings?.length) {
    out.push(`${h}# Why`, '', `Recorded under ${rule.rulings.join(', ')}.`, '');
  }

  const norm = rule.references?.normative ?? [];
  const info = rule.references?.informative ?? [];
  if (norm.length || info.length) {
    out.push(`${h}# References`, '');
    if (norm.length) {
      out.push('**Normative** — incorporated into this rule:', '');
      for (const r of norm) out.push(`- ${r.source}, ${r.title}${r.url ? ` (${r.url})` : ''} — ${r.note}`);
      out.push('');
    }
    if (info.length) {
      out.push('**Further reading:**', '');
      for (const r of info) out.push(`- ${r.source}, ${r.title}${r.url ? ` (${r.url})` : ''} — ${r.note}`);
      out.push('');
    }
  }

  if (rule.related?.length || rule.backlinks.length) {
    out.push(`${h}# Related rules`, '');
    if (rule.related?.length) out.push(`- Names: ${rule.related.join(', ')}`);
    if (rule.backlinks.length) out.push(`- Referenced by: ${rule.backlinks.join(', ')}`);
    out.push('');
  }

  if (standalone) {
    out.push(
      '---',
      '',
      'Rule identifiers are permanent and are never renumbered. This specification carries',
      'no implementation status: each implementation publishes its own standing against',
      'these rules. Licensed CC BY 4.0.',
      '',
    );
  }

  return out.join('\n');
}

const INTRO = `The rules a FlowDrop workflow obeys — how a workflow is written, stored, validated
and executed — stated independently of any one implementation. It is a target: where
an implementation disagrees with a rule, the rule is what is intended. It carries no
implementation status, and confers no certification.`;

/** https://llmstxt.org — an index, not the content. */
export function llmsTxt(): string {
  const out: string[] = [
    `# FlowDrop Workflow Specification ${SPEC_VERSION}`,
    '',
    `> ${INTRO.replace(/\n/g, '\n> ')}`,
    '',
    `Every rule is published as markdown at its own URL with \`.md\` appended, e.g.`,
    `${absolute('/rules/gr-store/store-2')}.md. The whole corpus in one file is at`,
    `${absolute('/llms-full.txt')}, and as structured data — every field, plus backlinks`,
    `and the identifiers this specification has declined — at ${absolute('/rules.json')}.`,
    `Identifiers (\`STORE-2\`, \`R6.a\`) are permanent and are the correct way to cite a rule.`,
    '',
    `## Reference`,
    '',
    `- [Conventions](${absolute('/conventions')}.md): vocabulary, requirement levels and`,
    `  the references every rule would otherwise repeat. Read this before quoting a rule.`,
    `- [Glossary](${absolute('/glossary')}.md): the terms rules are written in.`,
    '',
  ];

  for (const family of allFamilies()) {
    out.push(`## ${family.name} — ${FAMILY_LABEL(family.name)} (Part ${family.part})`, '');
    for (const rule of family.rules) {
      const gist = (rule.summary?.trim() || rule.normative.trim()).replace(/\s+/g, ' ');
      out.push(
        `- [${rule.id}: ${rule.title}](${absolute(rule.url)}.md): ${gist.slice(0, 200)}${gist.length > 200 ? '…' : ''}`,
      );
    }
    out.push('');
  }

  return out.join('\n');
}

/** The entire specification as one document. */
export function llmsFullTxt(): string {
  const conventions = fs.readFileSync(path.join(REPO, 'conventions.md'), 'utf8');
  const rules = allRules();
  const out: string[] = [
    `# FlowDrop Workflow Specification ${SPEC_VERSION}`,
    '',
    INTRO,
    '',
    `Source: ${SPEC_ORIGIN}. Licensed CC BY 4.0. This file is generated: ${rules.length} rules,`,
    `in the order they were issued. Identifiers are permanent and are the correct way to`,
    `cite a rule.`,
    '',
    '---',
    '',
    conventions.trim(),
    '',
  ];

  for (const family of allFamilies()) {
    out.push('---', '', `# ${family.name} — ${FAMILY_LABEL(family.name)} (Part ${family.part})`, '');
    for (const rule of family.rules) out.push(ruleToMarkdown(rule, { standalone: false }), '');
  }

  return out.join('\n');
}

/** A source file published verbatim (`conventions.md`, the glossary). */
export function pageMarkdown(title: string, url: string, body: string): string {
  return [
    '---',
    `title: ${title}`,
    `source: ${absolute(url)}`,
    `specification: FlowDrop Workflow Specification ${SPEC_VERSION}`,
    'licence: CC BY 4.0',
    '---',
    '',
    body.trim(),
    '',
  ].join('\n');
}
