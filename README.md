# Finanças pessoais integradas

Controlo financeiro pessoal e das empresas, num só sítio, com cinco entidades independentes:
Empresa BR, Empresa PT, Pessoal BR, Pessoal PT e Imóveis BR. Substitui a planilha Google "Finanças"
(o script original fica em `apps-script/` como referência das regras de negócio).

## Funcionalidades

- **Painel** (`/`): como o mês vai fechar em cada entidade, mais os pendentes.
- **Visão geral** (`/visao-geral`): Brasil (R$) e Portugal (€) lado a lado, sem converter moedas.
  Mostra os números do mês face ao mês anterior, os últimos 12 meses por entidade, para onde vai o
  dinheiro e a agenda dos próximos 30 dias.
- **Por entidade**: Resumo, Lançamentos (filtros, liquidar com data, duplicar), Recorrentes,
  Histórico e Cadastros. A Empresa PT tem IVA e faturas; Imóveis BR tem Cobertura e caixa.
- **API** JSON em `/api/v1` (mesma sessão da app).

## Stack

Next.js 15 (App Router) + TypeScript, Postgres com Drizzle, Zod, Tailwind CSS 4, Recharts e Vitest.
A arquitetura é Clean Architecture (`domain` → `application` → `infrastructure`/`composition`,
`ui`, `app`), com os limites impostos por lint. As regras completas estão em [AGENTS.md](AGENTS.md)
e as decisões em [docs/adr](docs/adr).

## Começar (local)

Requisitos: Node 22, pnpm 10 e Docker.

```bash
cp .env.example .env            # preencher POSTGRES_PASSWORD, AUTH_PASSWORD e AUTH_SECRET
cp web/.env.example web/.env    # mesma senha do Postgres e mesma autenticação
docker compose up -d db

cd web
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev                        # http://localhost:3000
```

Gerar segredos: `openssl rand -hex 32` (AUTH_SECRET) e `openssl rand -hex 24` (POSTGRES_PASSWORD).

## Comandos (dentro de `web/`)

| Comando            | Para quê                                     |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | servidor de desenvolvimento                  |
| `pnpm check`       | typecheck, lint, prettier e testes           |
| `pnpm db:generate` | gerar migração depois de mudar o `schema.ts` |
| `pnpm db:migrate`  | aplicar migrações                            |
| `pnpm db:seed`     | dados base (entidades, centros e categorias) |

## Variáveis de ambiente

Nenhum segredo vive no código: tudo vem do ambiente e os ficheiros `.env*` estão no `.gitignore`
(exceto os `.env.example`, que não têm valores).

| Variável            | Onde                    | Descrição                                              |
| ------------------- | ----------------------- | ------------------------------------------------------ |
| `DATABASE_URL`      | `web/.env`, Vercel      | ligação ao Postgres                                    |
| `AUTH_PASSWORD`     | todos                   | a senha de acesso (utilizador único)                   |
| `AUTH_SECRET`       | todos                   | chave das sessões, com 32 ou mais caracteres           |
| `APP_TIMEZONE`      | todos (opcional)        | fuso para o "hoje" da app; por omissão `Europe/Lisbon` |
| `POSTGRES_PASSWORD` | `.env` (docker compose) | senha do Postgres do compose; obrigatória              |

Sem `AUTH_PASSWORD` e `AUTH_SECRET` válidos ninguém entra (a app falha fechada).

## Produção

- **Homeserver**: `docker compose up -d --build` na raiz, com o `.env` preenchido. O servidor aplica
  as migrações e os dados base no arranque. `WEB_BIND=0.0.0.0` expõe a app na rede local.
- **Vercel**: projeto com raiz `web/` e Postgres no Neon. As migrações e os dados base correm no build
  (`vercel-build`); cada push para `main` faz deploy. Configurar as variáveis acima no projeto.

## Segurança

- Utilizador único com senha; a sessão é um cookie `HttpOnly`, `SameSite=Lax` e `Secure` em HTTPS,
  assinado com HMAC-SHA256 e válido 30 dias. Mudar `AUTH_SECRET` termina todas as sessões.
- O middleware exige sessão em todas as páginas e na API (401 em JSON). As server actions voltam
  a verificar a sessão, porque podem ser invocadas a partir da página de login.
- Tentativas de login falhadas esperam 1 s; a senha compara-se em tempo constante e o `next` do login
  só aceita caminhos internos.
- Cabeçalhos de segurança em todas as respostas (sem iframes, `nosniff`, HSTS, `Referrer-Policy`).
- Postgres só em `127.0.0.1` no compose; imagem Docker corre com utilizador sem privilégios.
- Todas as entradas validadas com Zod; acesso à BD só pelo Drizzle (consultas parametrizadas).
