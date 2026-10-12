# AGENTS.md

Regras obrigatórias para qualquer pessoa ou agente de IA que mexa neste repositório.
Se uma regra impedir o que precisas de fazer, **pára e pergunta**; não a contornes.

## O projeto

Controlo financeiro pessoal e das empresas do Renato (Empresa BR, Empresa PT, Pessoal BR, Pessoal PT, Imóveis BR).
Origem: a planilha Google "Finanças" e o script `apps-script/Codigo.gs` (referência das regras de negócio).

- `web/`: a app Next.js (front + API) com Postgres.
- `apps-script/`: script da planilha (legado; não alterar sem pedido).
- `docs/adr/`: decisões de arquitetura.

## Comandos (sempre dentro de `web/`)

| Comando              | Para quê                                      |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | servidor de desenvolvimento                   |
| `pnpm check`         | typecheck + lint + prettier + testes          |
| `pnpm db:generate`   | gerar migração depois de mudar `schema.ts`    |
| `pnpm db:migrate`    | aplicar migrações                             |
| `pnpm db:seed`       | dados base (entidades, centros, categorias)   |

Postgres local: `docker compose up -d db` na raiz.
Produção (homeserver): `docker compose up -d --build` na raiz. O servidor aplica migrações e dados base
no arranque (`src/instrumentation.ts` → `src/composition/bootstrap.ts`). Os dados registam-se na app
(não há import da planilha; ver ADR 0003).
Produção (Vercel): projeto com raiz `web/`, Postgres no Neon; migrações e dados base no build
(`vercel-build`). Variáveis: `DATABASE_URL`, `APP_TIMEZONE`, `AUTH_PASSWORD`, `AUTH_SECRET`.

## Autenticação

Utilizador único (ADR 0004): `src/middleware.ts` exige o cookie de sessão em tudo exceto `/login`.
Páginas autenticadas vivem em `src/app/(app)/`; a sessão em `src/app/_auth/`.

## Entidades independentes

Cada entidade (Empresa BR, Empresa PT, Pessoal BR, Pessoal PT, Imóveis BR) é um módulo isolado:

- Rotas em `src/app/(app)/[entidade]/` (Resumo, Lançamentos, Recorrentes, Histórico, Cadastros e módulos
  próprios declarados em `src/app/(app)/_lib/entity-modules.ts`). O Painel (`/`) e a Visão geral
 (`/visao-geral`, Brasil e Portugal lado a lado, sem converter moedas) são as únicas visões conjuntas.
- Categorias e centros pertencem a uma entidade (chave `(entity_id, id)`); validar com
  `requireCategory`/`requireCostCenter` de `application/shared/reference-lookup.ts`.
- Nada liga lançamentos de entidades diferentes; `linkGroup` só dentro da mesma entidade (fatura + IVA).

## Definição de pronto

Uma tarefa só está feita quando `pnpm check` passa **sem avisos**. Nunca desativar regras de lint
(`eslint-disable`), nunca usar `@ts-ignore`/`@ts-expect-error`, nunca apagar testes para passar.

## Arquitetura (Clean Architecture)

```
src/domain          regras puras (sem I/O, sem libs, sem React, sem datas do relógio)
src/application     casos de uso (um por ficheiro) + ports (interfaces dos repositórios)
src/infrastructure  Drizzle, repositórios, migrações e seed
src/composition     container.ts = composition root (liga ports a implementações)
src/ui              design system (componentes visuais sem regras de negócio)
src/app             rotas Next: páginas, server actions, api/v1 (adaptadores finos)
```

Dependências permitidas (impostas por `eslint-plugin-boundaries`):

- `domain` → só `domain`
- `application` → `application`, `domain`
- `infrastructure` → `infrastructure`, `application`, `domain`
- `composition` → `infrastructure`, `application`, `domain`
- `ui` → `ui`, `domain` (apenas `import type`)
- `app` → `app`, `ui`, `application`, `domain`, `composition`

Regras:

1. Regra de negócio vive em `domain` (cálculo) ou `application` (orquestração). Nunca em páginas,
   componentes, server actions, route handlers ou repositórios.
2. Páginas e route handlers obtêm casos de uso por `getContainer()` e não falam com a BD.
3. Server actions e route handlers: validar input com Zod → chamar um caso de uso → devolver
   resultado. Nada mais.
4. Casos de uso recebem dependências pelo construtor (ports) e expõem um único `execute()`.
5. O relógio e ids entram por ports (`Clock`, `IdGenerator`). O domínio nunca chama `new Date()`.
6. Repositórios devolvem objetos do domínio, nunca linhas da BD.
7. Erros de regra: lançar `DomainError(code, mensagem)`; detetar com `isDomainError()`, nunca
   `instanceof` (o Next carrega módulos em mais de uma camada). Server actions usam `runAction`,
   route handlers usam `query`/`command` de `app/api/v1/_lib/respond.ts`.

## Nomes e idioma

- Código, ficheiros, tabelas e colunas em **inglês**; texto visível na UI em **português**,
  com os termos da planilha.
- Ficheiros em `kebab-case` (imposto por lint). Componentes React em `PascalCase` dentro do ficheiro.
- Pastas privadas de rotas: `_components/`. Server actions em `actions.ts` ao lado da página.

Glossário (UI → código):

| UI                | Código              |
| ----------------- | ------------------- |
| Lançamento        | Entry               |
| Liquidar          | Settle              |
| Liquidado         | settled             |
| Pendente          | pending             |
| Cancelado         | cancelled           |
| Receita / Despesa | income / expense    |
| Entidade          | Entity              |
| Centro            | CostCenter          |
| Categoria         | Category            |
| Recorrente        | RecurringTemplate   |
| Previsto          | expected            |
| Vencimento        | dueDate             |
| Aporte            | Contribution        |
| Retirada          | Withdrawal          |
| Cobertura         | Coverage            |
| Caixa (imóveis)   | property cash       |
| IVA               | VAT                 |
| Fatura            | Invoice             |
| Mês (`YYYY-MM`)   | period / YearMonth  |

## Limites de código (impostos por lint)

- Máx. 200 linhas por ficheiro; 40 por função em `.ts`, 120 por componente `.tsx`; máx. 4 parâmetros.
- Sem `any`, sem default exports (exceto `page`/`layout`/`error`/`loading`/`not-found` do Next).
- Sem números mágicos em `domain` e `application`: usar constantes com nome.
- `import type` para tipos. Imports absolutos com `@/`.
- Comentários só para explicar uma restrição que o código não mostra.

## Dinheiro e datas

- Dinheiro é sempre `Money` (`{ cents, currency }`) de `@/domain/shared/money`. Nunca `number`
  solto para valores; nunca somar BRL com EUR (o domínio lança `CurrencyMismatchError`).
- Na BD: `bigint` em cêntimos. Na UI: formatar com `MoneyText`.
- Datas do domínio: strings `YYYY-MM-DD` (`IsoDate`); mês: `YYYY-MM` (`YearMonth`).
  Utilitários em `@/domain/shared/iso-date`. Sem fusos horários no domínio.
- A moeda deriva da entidade (BR → BRL, PT → EUR).

## Testes

- Cada regra do domínio e cada caso de uso tem teste Vitest ao lado (`x.ts` → `x.test.ts`).
- Casos de uso testam-se com os repositórios em memória de `src/application/testing/`.
- Bug corrigido = teste novo que falhava antes.

## UI

- Usar sempre os componentes de `src/ui` (Card, Button, Badge, Modal, Drawer, MoneyText, …).
  Se faltar um, criá-lo em `src/ui` antes de duplicar markup.
- Tailwind apenas; sem CSS solto exceto tokens em `globals.css`. Ícones: Font Awesome Free (`fa-solid`).
- Cantos `rounded-2xl` em cartões, `rounded-xl` em controlos. Cores por grupo (tokens em `globals.css`).
- Modo claro/escuro: usar só os tokens de `globals.css` (`bg-canvas`, `bg-surface`, `bg-surface-muted`,
 `bg-surface-strong`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-line`, `bg-primary`,
 `positive`/`negative`/`warning`/`info` e `-soft`), nunca `slate-*`, `white` ou hex. Texto na cor da
 entidade com `text-accent` (`--accent`). Tema em cookie (`src/ui/theme.ts`).
- Telemóvel: navegação na barra de baixo (`mobile-nav.tsx`); modais sobem de baixo; tabelas largas têm
 alternativa em lista abaixo de `xl` (ou `stickyFirst`). Cada rota lenta tem `loading.tsx` com `src/ui/skeleton`.
- Server components por omissão; `'use client'` só onde há estado ou eventos.

## Como acrescentar uma funcionalidade

1. Regras/cálculos novos em `src/domain/<modulo>/` + teste.
2. Port novo (se preciso) em `src/application/ports/` e implementação em memória para testes.
3. Caso de uso em `src/application/<modulo>/<verbo-nome>.ts` + teste.
4. Implementação Drizzle em `src/infrastructure/repositories/`; schema + `pnpm db:generate`.
5. Registar no `src/composition/container.ts`.
6. Página/ação em `src/app/(app)/[entidade]/...` (ou no Painel, se for visão conjunta) usando `src/ui`.
   Módulo só de uma entidade → declará-lo em `src/app/(app)/_lib/entity-modules.ts`.
7. `pnpm check`.

## Decisões

Mudança de stack, de camadas ou de modelo de dados → novo ADR em `docs/adr/NNNN-titulo.md`
(contexto, decisão, consequências; máx. 1 página).

## Git

Commits e PRs só quando o utilizador pedir. Nunca commitar `.env` nem `backups/`.
