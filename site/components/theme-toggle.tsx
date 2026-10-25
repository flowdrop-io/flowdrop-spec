'use client';

import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';

/** The theme switch fumadocs ships, for the top bar's slot. Light, dark or system. */
export function ThemeToggle() {
  return <ThemeSwitch mode="light-dark-system" className="kit-theme" />;
}
