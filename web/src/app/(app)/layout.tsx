import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { getContainer } from '@/composition/container';
import { parseTheme, THEME_COOKIE } from '@/ui/theme';
import { MobileNav } from './_components/mobile-nav';
import { Sidebar } from './_components/sidebar';

/** Todas as páginas leem a base de dados a cada pedido. */
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const c = getContainer();
  const [reference, cookieStore] = await Promise.all([c.getReferenceData.execute(), cookies()]);
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  return (
    <div className="md:flex">
      <Sidebar entities={reference.entities} theme={theme} />
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 pt-6 pb-28 md:px-10 md:py-10">
        {children}
      </main>
      <MobileNav reference={reference} today={c.clock.today()} theme={theme} />
    </div>
  );
}
