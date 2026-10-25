/*
 * Shiki CSS-variables theme, shared by /docs and /spec.
 *
 * The theme itself carries no colour: each token is emitted as
 * `color: var(--shiki-token-*)`, and css/code.css maps those variables onto
 * the Factorial tokens. One highlighting pass therefore serves light and dark.
 *
 * Use it from fumadocs-mdx (source.config.ts):
 *
 *   import { kitShikiTheme } from './site-kit/shiki/css-variables.mjs';
 *   rehypeCodeOptions: { theme: kitShikiTheme, themes: undefined }
 *
 * or from shiki directly: `codeToHtml(code, { lang, theme: kitShikiTheme })`.
 */
import { createCssVariablesTheme } from 'shiki';

export const kitShikiTheme = createCssVariablesTheme({
  name: 'factorial-report',
  variablePrefix: '--shiki-',
  // Variables are defined in css/code.css; no inline fallbacks, so a site that
  // forgets to import the kit shows plain ink instead of a stale palette.
  variableDefaults: {},
  fontStyle: true,
});
