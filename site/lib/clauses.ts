/**
 * Splits a normative sentence into its clauses: one per sentence, numbered in
 * the order written. The page renders each on its own line with a marginal
 * number, so a three-obligation rule reads as three obligations rather than one
 * block, and a clause can be cited ("API-1 ¶2").
 *
 * This is presentation only. The YAML is untouched and `rule_hash` collapses
 * whitespace, so splitting changes nothing a citation or a hash depends on.
 *
 * A sentence ends at `.`, `?` or `!` outside a code span, when what follows is
 * whitespace and then something that starts a sentence: a capital, a digit, a
 * code span or an opening quote or bracket. Dots inside backticks (`1.0`,
 * `metadata.owner`) never split. The corpus has no abbreviations, lists or
 * newlines in normative text (checked 2026-08-25); if one appears, extend the
 * guard rather than relaxing the rule.
 */
export function clauses(normative: string): string[] {
  const text = normative.trim().replace(/\s+/g, ' ');
  const out: string[] = [];
  let start = 0;
  let inCode = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '`') {
      inCode = !inCode;
      continue;
    }
    if (inCode || (ch !== '.' && ch !== '?' && ch !== '!')) continue;

    // Followed by a space and a sentence opener?
    const rest = text.slice(i + 1);
    if (!/^\s+[A-Z0-9`"“(]/.test(rest)) continue;

    out.push(text.slice(start, i + 1).trim());
    start = i + 1;
  }
  const tail = text.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}
