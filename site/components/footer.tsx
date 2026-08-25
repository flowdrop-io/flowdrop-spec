import Link from 'next/link';
import { SPEC_VERSION, withBase } from '@/app/layout.config';

/**
 * Two footers stacked, and the order is the point.
 *
 * The spec strip comes first: licence, citation rule, and the machine-readable
 * corpus. That is this site's own business and it stays at the top of the block,
 * closest to the rule the reader just finished.
 *
 * The shared strip comes second. It is a port of
 * `src/lib/components/Footer.svelte` in the flowdrop-website repo — same markup
 * order, same classes, same link set — so flowdrop.io, /docs and /spec end on the
 * same block, and so this site stops being a dead end: until it existed, a reader
 * who landed on a rule from a search result had no route to the product it
 * specifies, and no legal or imprint links at all.
 *
 * It is a port, not a fork. A link added to the master has to be added here and
 * in the docs site's copy.
 */

const PRODUCT_LINKS = [
  { href: 'https://flowdrop.io', label: 'FlowDrop' },
  { href: 'https://flowdrop.io/docs', label: 'Docs' },
  { href: 'https://flowdrop.io/showcase', label: 'Showcase' },
  { href: 'https://flowdrop.io/pricing', label: 'Pricing' },
  { href: 'https://flowdrop.io/blog', label: 'Blog' },
];

/**
 * Per-surface source links rather than one generic "GitHub": this specification
 * is implementation-independent, and pointing every reader at the JavaScript
 * editor would undercut that.
 */
const SOURCE_LINKS = [
  { href: 'https://github.com/flowdrop-io/flowdrop-spec', label: 'This specification' },
  { href: 'https://github.com/flowdrop-io/flowdrop', label: 'Editor (npm)' },
  { href: 'https://github.com/flowdrop-io/flowdrop-rs', label: 'Rust backend' },
  { href: 'https://www.drupal.org/project/flowdrop', label: 'Drupal module' },
];

const INFO_LINKS = [
  { href: 'https://flowdrop.io/privacy', label: 'Privacy' },
  { href: 'https://www.factorial.io/impressum', label: 'Impressum' },
  { href: 'https://www.factorial.io/datenschutz', label: 'Datenschutz' },
  { href: 'https://www.factorial.io/agb', label: 'AGB' },
];

function ExternalIcon() {
  return (
    <svg className="fdftr-ext" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The machine-readable corpus, as links rather than only as `<link rel=alternate>`
 * in the head: a crawler follows anchors reliably and head links inconsistently,
 * and a person looking for the data should not have to read the source to find it.
 *
 * These are plain anchors because they leave the Next app: a route handler's output
 * and an nginx-served file are not router destinations. That also means Next does
 * not add the base path for them, so `withBase` does.
 */
function SpecStrip() {
  return (
    <div className="siteftr">
      <div className="siteftr-inner">
        <p>
          <span className="mono">spec {SPEC_VERSION}</span> · The specification text is licensed{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            rel="license noreferrer"
            target="_blank"
          >
            CC BY 4.0
          </a>
          . Cite a rule by its identifier; identifiers are permanent.
        </p>
        <nav aria-label="Machine-readable">
          <span>For a machine:</span>
          <a href={withBase('/llms.txt')}>llms.txt</a>
          <a href={withBase('/llms-full.txt')}>llms-full.txt</a>
          <a href={withBase('/rules.json')}>rules.json</a>
          <Link href="/conventions.md">markdown</Link>
        </nav>
      </div>
    </div>
  );
}

function SharedStrip() {
  return (
    <div className="fdftr">
      <div className="fdftr-wrapper">
        <a href="https://flowdrop.io">
          <span className="fdftr-hidden">Go to homepage</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="fdftr-logo"
            src={withBase('/brand/logo-light.svg')}
            width={150}
            height={30}
            alt=""
            aria-hidden="true"
          />
        </a>
        <p className="fdftr-credit">
          An open source project by{' '}
          <a
            className="fdftr-creditLink"
            href="https://www.factorial.io"
            rel="noopener"
            target="_blank"
          >
            Factorial.io
            <ExternalIcon />
          </a>
        </p>
      </div>

      <div className="fdftr-wrapper fdftr-wrapper--links">
        <h2 className="fdftr-hidden">Additional information</h2>

        <div className="fdftr-list">
          <nav aria-label="FlowDrop">
            <ul className="fdftr-ul">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <a className="fdftr-link" href={l.href}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="fdftr-list">
          <nav aria-label="Source code">
            <ul className="fdftr-ul">
              {SOURCE_LINKS.map((l) => (
                <li key={l.href}>
                  <a className="fdftr-link" href={l.href} rel="noopener noreferrer" target="_blank">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="fdftr-list">
          <nav aria-label="Legal">
            <ul className="fdftr-ul">
              {INFO_LINKS.map((l) => (
                <li key={l.href}>
                  <a className="fdftr-link" href={l.href} rel="noopener noreferrer" target="_blank">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  className="fdftr-link"
                  href="https://flowdrop.io/docs/legal/trademark"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  FlowDrop&trade;
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="fdftr-list">
          <nav aria-label="Follow us">
            <ul className="fdftr-ul">
              <li>
                <a
                  className="fdftr-link fdftr-link--social"
                  href="https://github.com/flowdrop-io/flowdrop-spec"
                  rel="noopener"
                  target="_blank"
                >
                  <span className="fdftr-hidden">GitHub</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 0C5.37 0 0 5.506 0 12.303c0 5.445 3.435 10.043 8.205 11.674.6.107.825-.262.825-.585 0-.292-.015-1.261-.015-2.291C6 21.67 5.22 20.346 4.98 19.654c-.135-.354-.72-1.446-1.23-1.738-.42-.23-1.02-.8-.015-.815.945-.015 1.62.892 1.845 1.261 1.08 1.86 2.805 1.338 3.495 1.015.105-.8.42-1.338.765-1.645-2.67-.308-5.46-1.37-5.46-6.075 0-1.338.465-2.446 1.23-3.307-.12-.308-.54-1.569.12-3.26 0 0 1.005-.323 3.3 1.26.96-.276 1.98-.415 3-.415s2.04.139 3 .416c2.295-1.6 3.3-1.261 3.3-1.261.66 1.691.24 2.952.12 3.26.765.861 1.23 1.953 1.23 3.307 0 4.721-2.805 5.767-5.475 6.075.435.384.81 1.122.81 2.276 0 1.645-.015 2.968-.015 3.383 0 .323.225.707.825.585a12.046 12.046 0 0 0 5.919-4.489A12.534 12.534 0 0 0 24 12.304C24 5.505 18.63 0 12 0Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="fdftr-link fdftr-link--social"
                  href="https://www.youtube.com/@flowdrop-io"
                  rel="noopener"
                  target="_blank"
                >
                  <span className="fdftr-hidden">YouTube</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="fdftr-link fdftr-link--social"
                  href="https://www.npmjs.com/package/@flowdrop/flowdrop"
                  rel="noopener"
                  target="_blank"
                >
                  <span className="fdftr-hidden">npm</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="fdftr-link fdftr-link--social"
                  href="https://flowdrop.io/rss.xml"
                  rel="noopener"
                  target="_blank"
                >
                  <span className="fdftr-hidden">RSS feed</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <SpecStrip />
      <SharedStrip />
    </footer>
  );
}
