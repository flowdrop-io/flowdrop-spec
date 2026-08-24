/**
 * The two-column shell: a sticky citation rail and one document column
 * measured at `--measure`. Both columns are given per-page; a page with
 * nothing for the rail passes nothing and the column simply stands empty,
 * which no page in the site currently does.
 */
export function Shell({
  rail,
  children,
  wide = false,
}: {
  rail?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'shell wide' : 'shell'}>
      <aside className="rail">{rail}</aside>
      <main className="doc">{children}</main>
    </div>
  );
}
