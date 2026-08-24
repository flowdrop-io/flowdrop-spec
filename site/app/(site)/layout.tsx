import { Masthead } from '@/components/masthead';
import { Footer } from '@/components/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Masthead />
      {children}
      <Footer />
    </>
  );
}
