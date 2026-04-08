import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtocolHandlerInit from '@/components/ProtocolHandlerInit';
import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProtocolHandlerInit />
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 pt-2 pb-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
