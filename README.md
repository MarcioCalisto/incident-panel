# Painel de Incidentes

Aplicação para registro e acompanhamento de incidentes de TI.

## Stack

- **React 19** + **Vite 8** — SPA com build otimizada
- **json-server** — API REST mockada via `db.json` (desenvolvimento local)
- **oxlint** — linting rápido
- **Husky + Commitlint + lint-staged** — quality gates de commit
- **GitHub Actions** — CI: lint + build

## Funcionalidades

- Cadastro de incidentes (título, descrição, prioridade)
- Listagem de incidentes com filtro por status (pendentes/resolvidos)
- Marcar como resolvido / não resolvido
- Remoção de incidentes
- Validação de formulário no cliente (UX)
- AbortController para cancelamento de requests

## Rodar localmente

```bash
npm install
cp .env.template .env.local
npm run dev
```

O comando `npm run dev` sobe dois processos em paralelo via `concurrently`:
- **json-server** na porta 8000 (API REST)
- **Vite** na porta 5173 (interface)

Para rodar separadamente:
```bash
npm run dev:api   # apenas a API
npm run dev:ui    # apenas a interface
```

## Testes

> Em construção. Veja o `CONTRIBUTING.md` para o plano de testes (vitest + RTL).

## Decisões técnicas

- Validação no cliente (UX): `src/utils/validateIncident.js`
- Normalização de resposta da API: `fromApi` em `src/services/incidentsApi.js`
- Estado e lifecycle de dados: hook customizado `useIncidents`
- Cancelamento de requests: `AbortController` no hook (cleanup no unmount + reload)

## Estrutura

```
src/
├── main.jsx                   → bootstrap (createRoot)
├── App.jsx                    → tela principal + composição
├── index.css                  → estilos globais
├── components/
│   ├── IncidentForm.jsx       → formulário controlado + validação
│   ├── IncidentList.jsx       → lista + estado vazio
│   └── IncidentItem.jsx       → linha: checkbox, título, prioridade, remover
├── services/
│   ├── http.js                → fetch genérico + ApiError
│   ├── incidentsApi.js        → endpoints + normalização (fromApi)
│   └── useIncidents.js        → hook: estado + loading + erro + ações
└── utils/
    ├── constants.js           → fonte única de PRIORIDADES / PRIORIDADE_PADRAO
    └── validateIncident.js    → regras de validação
```

## Versionamento

- SemVer (`MAJOR.MINOR.PATCH`)
- Conventional Commits (validado por commitlint)
- Commits agrupados por categoria (`feat`, `fix`, `chore`, `refactor`, `docs`, `ci`...)

Veja [`CONTRIBUTING.md`](./CONTRIBUTING.md) para detalhes completos.

## Roadmap

- [ ] **Fase 1:** migrar para TypeScript + validação de schema (zod) + testes (vitest + RTL)
- [ ] **Fase 2:** Zustand + TanStack Query (cache/dedup), paginação, router
- [ ] **Fase 3:** auth (e-mail/senha), isolamento de dados por usuário, deploy no Vercel
