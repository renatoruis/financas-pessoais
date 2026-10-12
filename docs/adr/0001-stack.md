# 0001 — Stack da app web

Data: 2026-10-12 · Estado: aceite

## Contexto

A planilha Google chegou ao limite (fórmulas longas, script frágil). Queremos uma app web simples,
privada (homeserver, sem autenticação), bonita e fácil de manter por diferentes agentes de IA.

## Decisão

- **Next.js 15 (App Router) + TypeScript strict**: front e API no mesmo projeto e contentor.
- **Postgres 17** em `docker compose`; **Drizzle ORM** + `drizzle-kit` para migrações SQL versionadas.
- **Zod** nas fronteiras (forms, API, importação).
- **Tailwind v4 compilado** (não CDN: o CDN é só para protótipos e o Next já tem build).
- **Font Awesome Free** para ícones, **Recharts** para gráficos.
- **Vitest**, **ESLint** (com `eslint-plugin-boundaries`, `unicorn/filename-case`) e **Prettier**.
- **pnpm** (versão fixada em `packageManager`).

## Consequências

- Um só `docker compose up` sobe tudo no homeserver.
- Sem autenticação: a porta deve ficar ligada a `127.0.0.1` ou a uma rede privada.
- Mudar de framework de UI implica reescrever só `src/app` e `src/ui`; domínio e casos de uso ficam.
