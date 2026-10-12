# 0002 — Camadas (Clean Architecture)

Data: 2026-10-12 · Estado: aceite

## Contexto

O código vai ser escrito por vários agentes de IA ao longo do tempo. Sem limites claros, a lógica
de negócio espalha-se por páginas e queries e fica impossível de testar.

## Decisão

Quatro camadas + UI, com dependências só para dentro, impostas por lint:

- `domain`: tipos e cálculos puros (Money, lançamentos, recorrência, cobertura dos imóveis, IVA).
- `application`: casos de uso (um por ficheiro, `execute()`), ports (interfaces).
- `infrastructure`: Drizzle, repositórios, importação.
- `composition`: `container.ts` liga ports a implementações (composition root).
- `app` (rotas Next) e `ui` (design system) como adaptadores de entrada.

Dados pequenos (uso pessoal): os relatórios carregam os lançamentos do período e calculam no
domínio, em vez de agregações SQL. Mantém as regras num só sítio e testáveis.

Identificadores das entidades, centros e categorias são *slugs* estáveis (`empresa-pt`, `caixa`,
`iva`), referenciados pelo domínio em `SYSTEM_*`; o nome visível pode mudar livremente.

## Consequências

- Testes rápidos do domínio e dos casos de uso sem BD (repositórios em memória).
- Se o volume crescer muito, otimiza-se dentro dos repositórios sem tocar nas regras.
