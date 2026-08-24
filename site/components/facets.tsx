'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type FacetRule = {
  id: string;
  title: string;
  url: string;
  family: string;
  part: string;
  level: string;
  posture: string;
  profiles: string[];
};

type Key = 'family' | 'profile' | 'level' | 'posture';

function Group({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: [string, number][];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="spec-facet">
      <legend>{label}</legend>
      <div className="spec-facet-options">
        {options.map(([value, count]) => (
          <button
            key={value}
            type="button"
            aria-pressed={selected.has(value)}
            className={selected.has(value) ? 'spec-chip spec-chip-on' : 'spec-chip'}
            onClick={() => onToggle(value)}
          >
            {value} <span className="spec-chip-count">{count}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Facets({ rules }: { rules: FacetRule[] }) {
  const [text, setText] = useState('');
  const [sel, setSel] = useState<Record<Key, Set<string>>>({
    family: new Set(),
    profile: new Set(),
    level: new Set(),
    posture: new Set(),
  });

  const toggle = (key: Key) => (value: string) =>
    setSel((prev) => {
      const next = new Set(prev[key]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [key]: next };
    });

  const counts = useMemo(() => {
    const tally = (pick: (r: FacetRule) => string[]) => {
      const m = new Map<string, number>();
      for (const r of rules) for (const v of pick(r)) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m.entries()];
    };
    return {
      family: tally((r) => [r.family]),
      profile: tally((r) => r.profiles),
      level: tally((r) => [r.level]),
      posture: tally((r) => [r.posture]),
    };
  }, [rules]);

  const shown = useMemo(() => {
    const q = text.trim().toLowerCase();
    return rules.filter((r) => {
      if (sel.family.size && !sel.family.has(r.family)) return false;
      if (sel.level.size && !sel.level.has(r.level)) return false;
      if (sel.posture.size && !sel.posture.has(r.posture)) return false;
      if (sel.profile.size && !r.profiles.some((p) => sel.profile.has(p))) return false;
      if (q && !`${r.id} ${r.title}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rules, sel, text]);

  const any = text || Object.values(sel).some((s) => s.size);

  return (
    <div className="not-prose spec-facets">
      <input
        type="search"
        className="spec-search"
        placeholder="Filter by identifier or title…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Group label="Family" options={counts.family} selected={sel.family} onToggle={toggle('family')} />
      <Group label="Profile" options={counts.profile} selected={sel.profile} onToggle={toggle('profile')} />
      <Group label="Level" options={counts.level} selected={sel.level} onToggle={toggle('level')} />
      <Group label="Posture" options={counts.posture} selected={sel.posture} onToggle={toggle('posture')} />

      <p className="spec-count">
        {shown.length} of {rules.length} rules
        {any && (
          <button
            type="button"
            className="spec-clear"
            onClick={() => {
              setText('');
              setSel({ family: new Set(), profile: new Set(), level: new Set(), posture: new Set() });
            }}
          >
            clear
          </button>
        )}
      </p>

      <ul className="spec-list">
        {shown.map((r) => (
          <li key={r.id}>
            <Link href={r.url}>
              <span className="spec-list-id">{r.id}</span>
              <span className="spec-list-title">{r.title}</span>
              <span className="spec-list-meta">
                {r.family} · {r.level}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
