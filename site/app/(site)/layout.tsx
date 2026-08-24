import { Masthead } from '@/components/masthead';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Masthead />
      {children}
    </>
  );
}
