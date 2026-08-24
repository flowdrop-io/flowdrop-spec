/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  // Static export has no image optimiser; the site ships no raster assets anyway.
  images: { unoptimized: true },
  // The nginx static-site chart serves directory indexes, so emit `<route>/index.html`.
  trailingSlash: true,
  outputFileTracingRoot: process.cwd(),
  // `next dev` otherwise drops a generated AGENTS.md/CLAUDE.md into this folder.
  agentRules: false,
};

export default config;
