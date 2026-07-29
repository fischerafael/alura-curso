# AGENTS.md

Guia para agentes de IA (Claude Code, Cursor, Copilot, etc.) trabalhando neste repositório.

## O que é o projeto

Gerenciador de tasks simples: login por email, dashboard com tasks e status (`TODO` / `IN_PROGRESS` / `DONE`).

Stack: **Next.js (App Router)** + **TypeScript** + **Prisma (SQLite)** + **JWT**.

## Estrutura de pastas

```
src/
├── app/        # router do Next.js (páginas + api routes) — só "casca": conecta tudo, sem lógica de negócio
├── frontend/   # componentes React (alias de import: @frontend/*)
└── backend/    # regras de negócio, Prisma, autenticação (alias de import: @backend/*)
```

Regra principal: **rotas em `src/app/` não devem conter lógica de negócio.** Elas chamam funções de `src/backend/` e renderizam componentes de `src/frontend/`.

Convenções específicas de `src/frontend/` (containers vs. components, camada de services, etc.) estão em [src/frontend/AGENTS.md](src/frontend/AGENTS.md).

Aliases de import configurados em [tsconfig.json](tsconfig.json): `@/*`, `@frontend/*`, `@backend/*`.

## Comandos

| Comando | Para que serve |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento (sempre com `--webpack`, nunca Turbopack — ver Armadilhas) |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Aplica alterações do `schema.prisma` ao banco |
| `npm run prisma:generate` | Regenera o Prisma Client |
| `npm run prisma:studio` | UI visual do banco |

| `npm run test:backend` | Testes do backend (Vitest, ambiente `node`), arquivos `*.test.ts` em `src/backend/` |
| `npm run test:frontend` | Testes do frontend (Vitest, ambiente `jsdom` + Testing Library), arquivos `*.test.tsx`/`*.test.ts` em `src/frontend/` |

Configuração em [vitest.config.ts](vitest.config.ts) (dois projetos Vitest) e [vitest.setup.ts](vitest.setup.ts) (jest-dom para o projeto frontend).

## Convenções de código

- TypeScript em modo `strict` (ver [tsconfig.json](tsconfig.json)) — não introduza `any` nem desative checks para contornar erros de tipo.
- Sem lógica de negócio dentro de `src/app/`; lógica vai em `src/backend/`.
- Componentes React ficam em `src/frontend/components/`.
- Autenticação: JWT simplificado, sem senha (login só por email) — isso é intencional para fins didáticos, não é um bug a corrigir.
- Banco: SQLite via Prisma, schema em `src/backend/prisma/schema.prisma`. Qualquer mudança de modelo exige `npm run prisma:migrate`.
- MCP: [.mcp.json](.mcp.json) registra um servidor `sqlite` (`mcp-server-sqlite-npx`) apontando para `src/backend/prisma/dev.db`, para agentes consultarem o banco diretamente.

## Armadilhas conhecidas

- **Nunca rode `next dev` diretamente sem `--webpack`** — Turbopack tem um crash conhecido no Windows. Sempre use `npm run dev`.
- `src/backend/prisma/dev.db` é local e não versionado; não assuma que existe até rodar `npm run setup` ou `npm run prisma:migrate`.
- `.env` não é versionado (copiado de `.env.example` no setup).

## Antes de abrir um PR

- Rode `npm run lint`.
- Rode `npm run build` para garantir que o projeto compila.
- Se alterou `schema.prisma`, confirme que a migration foi criada e commitada em `src/backend/prisma/migrations/`.
