/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  /**
   * The site is published as a subfolder of the brand origin, not on a host of its
   * own: `spec.flowdrop.io` has no DNS record and is not going to get one.
   *
   * With `output: 'export'` the exported tree is still written to `out/` with no
   * `spec/` directory in it — basePath is baked into the emitted markup and asset
   * URLs, not into the file layout. The Dockerfile therefore copies `out/` to
   * `<root>/spec`, so that a request for `/spec/_next/…` resolves to a real file and
   * every nginx `try_files $uri` keeps its ordinary meaning.
   *
   * `trailingSlash: true` is unaffected: it still emits `<route>/index.html`, now
   * under the base path.
   *
   * Next prepends this to its own `<Link>`s, assets and router URLs. It does NOT
   * prepend it to a hand-written string — a plain `<a href>`, a `fetch()` path, or
   * anything concatenated onto SPEC_ORIGIN. Those carry SPEC_BASE_PATH themselves;
   * see app/layout.config.tsx.
   */
  basePath: '/spec',
  // Static export has no image optimiser; the site ships no raster assets anyway.
  images: { unoptimized: true },
  // The nginx static-site chart serves directory indexes, so emit `<route>/index.html`.
  trailingSlash: true,
  outputFileTracingRoot: process.cwd(),
  // `next dev` otherwise drops a generated AGENTS.md/CLAUDE.md into this folder.
  agentRules: false,
};

export default config;
