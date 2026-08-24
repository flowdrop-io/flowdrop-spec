import type { LoadedRule } from '@/lib/rules';

const PROFILE_TITLE: Record<string, string> = {
  runtime: 'Binds implementations that execute workflows.',
  'storage-api': 'Binds implementations that store workflows and serve them over the API.',
  'editor-client': 'Binds implementations that author workflows against the API.',
};

const LEVEL_TITLE: Record<string, string> = {
  core: 'Expected before an implementation calls itself a FlowDrop implementation.',
  extended: 'Beyond core: commonly expected, not assumed.',
  optional: 'A genuinely optional capability.',
};

const POSTURE_TITLE: Record<string, string> = {
  'normative-target': 'What a conforming implementation is required to do.',
  descriptive: 'Records what is, rather than requiring it.',
  deprecated: 'Kept so it stays citable; not to be relied on.',
  withdrawn: 'No longer part of the specification; kept so it stays citable.',
};

export function Chip({
  children,
  tone,
  title,
}: {
  children: React.ReactNode;
  tone?: 'core' | 'warn';
  title?: string;
}) {
  return (
    <span className={tone ? `chip ${tone}` : 'chip'} title={title}>
      {children}
    </span>
  );
}

function Facet({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="facet">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * The rail's citation facets: the same five axes the faceted index filters on,
 * stated once per rule as a definition list rather than a badge row.
 */
export function RuleFacets({ rule }: { rule: LoadedRule }) {
  const posture = rule.posture !== 'normative-target';
  return (
    <dl className="facets">
      <Facet label="Posture">
        <Chip tone={posture ? 'warn' : undefined} title={POSTURE_TITLE[rule.posture]}>
          {rule.posture}
        </Chip>
      </Facet>
      <Facet label="Level">
        <Chip tone={rule.level === 'core' ? 'core' : undefined} title={LEVEL_TITLE[rule.level]}>
          {rule.level}
        </Chip>
      </Facet>
      <Facet label="Profile">
        {rule.profiles.map((p) => (
          <Chip key={p} title={PROFILE_TITLE[p]}>
            {p}
          </Chip>
        ))}
      </Facet>
      <Facet label="Added">
        <Chip title="The specification version this rule was introduced in.">spec {rule.added}</Chip>
      </Facet>
      {rule.changed !== rule.added && (
        <Facet label="Changed">
          <Chip title="The specification version this rule last changed in.">spec {rule.changed}</Chip>
        </Facet>
      )}
    </dl>
  );
}
