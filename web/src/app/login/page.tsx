import { Icon } from '@/ui/icon';
import { LoginForm } from './_components/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white">
            <Icon name="wallet" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Finanças</h1>
            <p className="text-xs text-slate-500">Entrar para continuar</p>
          </div>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
