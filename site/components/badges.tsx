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

export function Badge({
  children,
  tone = 'neutral',
  title,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'core' | 'profile' | 'warn';
  title?: string;
}) {
  return (
    <span className={`spec-badge spec-badge-${tone}`} title={title}>
      {children}
    </span>
  );
}

export function RuleBadges({ rule }: { rule: LoadedRule }) {
  return (
    <div className="spec-badges not-prose">
      <Badge tone="core" title={LEVEL_TITLE[rule.level]}>
        {rule.level}
      </Badge>
      {rule.profiles.map((p) => (
        <Badge key={p} tone="profile" title={PROFILE_TITLE[p]}>
          {p}
        </Badge>
      ))}
      {rule.posture !== 'normative-target' && <Badge tone="warn">{rule.posture}</Badge>}
      <Badge title="The specification version this rule was introduced in.">Added {rule.added}</Badge>
      {rule.changed !== rule.added && (
        <Badge title="The specification version this rule last changed in.">Changed {rule.changed}</Badge>
      )}
    </div>
  );
}
