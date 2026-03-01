import { Suspense } from 'react';
import TopNav from '@/components/layout/TopNav';
import DomainBar from '@/components/layout/DomainBar';

export default function HumansLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-[#12122a] grid-bg">
      <Suspense>
        <TopNav />
      </Suspense>
      <main className="mt-[50px] h-[calc(100vh-50px)] overflow-y-scroll thin-scrollbar">
        <Suspense>
          <DomainBar />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
