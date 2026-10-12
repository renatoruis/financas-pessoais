import type { ReactNode } from 'react';
import { getContainer } from '@/composition/container';
import { Sidebar } from './_components/sidebar';

/** Todas as páginas leem a base de dados a cada pedido. */
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { entities } = await getContainer().getReferenceData.execute();
  return (
    <div className="md:flex">
      <Sidebar entities={entities} />
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 md:px-10 md:py-10">
        {children}
      </main>
    </div>
  );
}
