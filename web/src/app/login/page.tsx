import { Icon } from '@/ui/icon';
import { LoginForm } from './_components/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="bg-surface ring-fg/5 w-full max-w-sm rounded-2xl p-6 shadow-sm ring-1">
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-primary text-on-primary grid size-9 place-items-center rounded-xl">
            <Icon name="wallet" />
          </span>
          <div>
            <h1 className="text-fg text-sm font-semibold">Finanças</h1>
            <p className="text-fg-muted text-xs">Entrar para continuar</p>
          </div>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
