import fs from 'node:fs';
import path from 'node:path';

/**
 * The rule schema, at the URL it calls itself.
 *
 * `rules/schema.json` carries an `$id` of https://flowdrop.io/spec/schema/1/rule.json.
 * A `$id` is an identifier and is not obliged to resolve, but one that is spelled as
 * an https URL and does not resolve is a broken promise a reader has no way to tell
 * from a typo. So the file is published, byte for byte, at its own identifier.
 *
 * Byte for byte matters: this is served as the definition of the schema, so anything
 * that reformatted it here would make the published document and the one CI validates
 * rule files against two different documents. scripts/check-schema-published.mjs
 * compares the emitted bytes with the source and fails if they differ.
 *
 * The `1` is a schema-version segment, not the specification's version. It changes
 * only when a change to this schema would reject a rule file the previous version
 * accepted. The unversioned /spec/schema/rule.json redirects here; that redirect is
 * nginx's, because a static export cannot emit one.
 */

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const body = fs.readFileSync(path.join(process.cwd(), '..', 'rules', 'schema.json'));

  return new Response(body, {
    headers: { 'Content-Type': 'application/schema+json; charset=utf-8' },
  });
}
