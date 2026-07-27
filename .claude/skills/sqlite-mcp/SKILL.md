---
name: sqlite-mcp
description: Regra de uso do servidor MCP sqlite para qualquer interação direta com o banco local (src/backend/prisma/dev.db) — consultar dados, inspecionar schema, ou rodar queries ad-hoc. Use sempre que for preciso ler ou escrever no banco fora do código da aplicação (Prisma Client), por exemplo para depurar, checar dados de teste, ou responder perguntas sobre o conteúdo do banco.
---

# SQLite via MCP

Este projeto tem um servidor MCP `sqlite` registrado em [.mcp.json](../../../.mcp.json), apontando para `src/backend/prisma/dev.db` (ver [AGENTS.md](../../../AGENTS.md)). Ele expõe as tools `mcp__sqlite__list_tables`, `mcp__sqlite__describe_table`, `mcp__sqlite__read_query`, `mcp__sqlite__write_query` e `mcp__sqlite__create_table`.

## Regra

Sempre que a tarefa exigir interagir diretamente com o banco SQLite local (fora do código da aplicação, que já usa Prisma Client normalmente), use as tools `mcp__sqlite__*`. Não crie a query "na mão" por outros caminhos, como:

- rodar `sqlite3` via Bash/PowerShell;
- escrever scripts Node/TS avulsos que abrem o `dev.db` diretamente;
- usar `npm run prisma:studio` ou outra ferramenta só para consultar dados quando uma query MCP resolveria.

Use as tools MCP também para investigar o schema (`list_tables` / `describe_table`) antes de montar uma query, em vez de ler `schema.prisma` e assumir a estrutura das tabelas — o schema real do banco (após migrations aplicadas) é a fonte da verdade.

## Quando essa regra NÃO se aplica

- Código da aplicação (`src/backend/`) continua usando Prisma Client normalmente — isso não é "query na mão", é o ORM do projeto.
- Migrations (`npm run prisma:migrate`) continuam sendo o único jeito de alterar o schema — não use `mcp__sqlite__create_table`/`write_query` para mudanças estruturais que deveriam virar migration.

## Fluxo sugerido

1. Se não souber a estrutura da tabela envolvida, rode `mcp__sqlite__list_tables` e/ou `mcp__sqlite__describe_table` primeiro.
2. Para leitura, use `mcp__sqlite__read_query`.
3. Para escrita pontual (dados, não schema), use `mcp__sqlite__write_query`.
4. Se o banco (`dev.db`) ainda não existir, avise o usuário — ele é local, não versionado, e só é criado após `npm run setup` ou `npm run prisma:migrate` (ver Armadilhas no AGENTS.md).
