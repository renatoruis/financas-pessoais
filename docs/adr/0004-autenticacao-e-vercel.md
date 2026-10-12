# 0004 — Autenticação por senha e deploy na Vercel

## Contexto

A app vai estar na internet (Vercel), com o código num repositório público. Só há um utilizador
(o Renato). O Postgres do docker compose não é acessível pela Vercel.

## Decisão

- **Autenticação de utilizador único**: senha em `AUTH_PASSWORD`; ao entrar, um cookie HttpOnly
  `expiração.assinatura` (HMAC-SHA256 com `AUTH_SECRET`, 30 dias). O `src/middleware.ts` exige a
  sessão em todas as rotas (páginas, server actions e `api/v1`), exceto `/login` e estáticos. Sem
  as duas variáveis (ou com segredo com menos de 32 caracteres) tudo fica bloqueado.
- A lógica vive em `src/app/_auth/` (é um adaptador HTTP, não uma regra de negócio) e usa só Web
  Crypto para correr no middleware. Tentativas falhadas esperam 1 s.
- As páginas autenticadas ficam no grupo `src/app/(app)/` (layout com a barra lateral); o `/login`
  fica fora dele e não consulta a base de dados.
- **Produção na Vercel** com Postgres no **Neon** (integração da Vercel, `DATABASE_URL`). O projeto
  Vercel usa `web/` como raiz. As migrações e os dados base correm no build (`vercel-build`); na
  Vercel o `instrumentation.ts` não os repete a cada arranque a frio.
- O docker compose continua a funcionar como antes (migrações no arranque) e recebe as mesmas
  variáveis de autenticação.

## Consequências

- Mudar `AUTH_SECRET` termina todas as sessões; mudar só a senha não.
- Uma migração nova é aplicada no próximo deploy, antes do `next build`.
- Não há contas, papéis nem recuperação de senha: muda-se a variável de ambiente e faz-se redeploy.
