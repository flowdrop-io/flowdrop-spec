import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <Footer />
    </>
  );
}
