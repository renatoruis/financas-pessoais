# 0003 — Entidades isoladas

## Contexto

A primeira versão espelhava a planilha: um "tabelão" de lançamentos com filtro por entidade,
categorias partilhadas, um centro "Geral" comum e lançamentos ligados entre entidades (aporte do
Pessoal BR para os Imóveis). Os dados vinham de um import da planilha. Na prática, isto mistura
contextos que o utilizador pensa em separado (cada empresa, cada pessoa, os imóveis).

## Decisão

- Cada entidade (Empresa BR, Empresa PT, Pessoal BR, Pessoal PT, Imóveis BR) é um módulo com rotas
  próprias em `src/app/(app)/[entidade]/` (Resumo, Lançamentos, Recorrentes, Histórico, Cadastros e
  módulos específicos como IVA e faturas ou Cobertura e caixa). O Painel (`/`) é a única visão conjunta.
- Categorias e centros pertencem a uma entidade: chave `(entity_id, id)` e FKs compostas em
  `entries` e `recurring_templates`. O `id` continua a ser o slug, por isso as regras que usam
  categorias/centros de sistema (`iva`, `aporte`, `caixa`…) não mudam.
- Não há ligações entre entidades. O aporte/retirada só regista o lado dos Imóveis; o outro lado
  regista-se à mão na entidade respetiva. `linkGroup` fica só para fatura + IVA (mesma entidade).
- As definições continuam numa linha, mas cada entidade edita só os seus campos.
- O import da planilha foi removido: os dados registam-se na app. Ficam o backup SQL e o
  `apps-script/` como referência.

## Consequências

- Uma categoria nova ou um centro novo só aparecem na entidade onde foram criados.
- Recorrentes listam-se e geram-se por entidade (`entityId` obrigatório na API).
- A migração `0001` copia as categorias e os centros usados para cada entidade; o seed repõe as
  listas base de cada uma no arranque.
