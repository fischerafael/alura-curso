# Plano — Listar tasks do usuário (com filtro por status)

## 1. Objetivo

Implementar a lógica de negócio por trás de `GET /api/tasks`, que hoje é um endpoint "esqueleto" (retorna `{}` sempre, sem consultar o banco — ver [route.ts](../src/app/api/tasks/route.ts)). O endpoint deve devolver as tasks que pertencem ao usuário autenticado, com suporte opcional a filtro por `status`.

## 2. Contrato da API

**`GET /api/tasks`**

- **Autenticação**: obrigatória. `userId` vem exclusivamente do JWT (`getAuthPayload(request)`), nunca de query param ou body — mesmo padrão já usado no restante do projeto (PRD, seção 9.1).
- **Query param opcional**: `status`
  - Valores aceitos: `TODO`, `IN_PROGRESS`, `DONE` (mesmos valores do enum `TaskStatus` no schema Prisma).
  - Se omitido: retorna tasks de todos os status.
  - Se presente e inválido (valor fora do enum): erro de validação (`400`), mesmo contrato de erro tipado já usado em `InvalidEmailError` (PRD, seção 8).

**Resposta de sucesso (`200`)**

```json
{
  "tasks": [
    { "id": "...", "title": "...", "status": "TODO", "createdAt": "...", "updatedAt": "..." }
  ],
  "count": 1
}
```

**Respostas de erro**

- `401` — sem token ou token inválido (`getAuthPayload` retorna `null`).
- `400` — `status` presente na query mas com valor fora do enum `TaskStatus`.

## 3. Onde cada parte mora (seguindo a arquitetura do projeto)

Conforme PRD seção 4 e 6 — `app/` é só casca, `backend/` decide.

### `src/backend/tasks.ts` (novo arquivo)

- Exporta `listTasks(userId: string, status?: string)`.
- Um caso de uso por função — mesmo padrão de `login()` em `auth.ts`.
- Responsabilidades:
  1. Validar `status`, se informado, contra os valores válidos do enum `TaskStatus`. Se inválido, lançar um erro tipado (ex.: `InvalidStatusError extends Error`), seguindo o modelo de `InvalidEmailError`.
  2. Consultar `prisma.task.findMany` filtrando por `userId` (sempre) e por `status` (somente se informado).
  3. Retornar `{ tasks, count: tasks.length }`.
- **Não** faz parsing de request, não conhece `NextRequest`/`NextResponse` — isso é responsabilidade da route.

### `src/app/api/tasks/route.ts` (editar)

- Extrai `status` da query string (`request.nextUrl.searchParams.get("status")`).
- Chama `listTasks(auth.sub, status ?? undefined)`.
- Traduz o retorno em `NextResponse.json(...)` com `200`.
- Captura `InvalidStatusError` → `400`. Mantém o `401` já existente para `!auth`.
- Continua sem nenhuma regra de negócio ou acesso a Prisma diretamente na route.

## 4. Compatibilidade com o front-end existente

`DashboardView.tsx` já espera `data.tasks` (ver [DashboardView.tsx:37](../src/frontend/components/DashboardView.tsx#L37)) e já tipa `Task` com `id`, `title`, `status`. Nenhuma mudança é necessária no front para o caso sem filtro — o `count` é um campo novo que o front atual simplesmente ignora.

Filtro por status via UI (ex.: abas ou dropdown no dashboard) **não está no escopo deste plano** — é um next step natural, mas não foi pedido agora. Deixar registrado aqui para não implementar "de brinde".

## 5. Passos de execução

1. Criar `src/backend/tasks.ts` com `InvalidStatusError` e `listTasks(userId, status?)`.
2. Editar `src/app/api/tasks/route.ts` para ler o query param, chamar `listTasks`, e mapear erros para status HTTP.
3. Testar manualmente (não há suíte de testes configurada — PRD seção 11):
   - `GET /api/tasks` sem token → `401`.
   - `GET /api/tasks` com token, sem tasks no banco → `{ tasks: [], count: 0 }`.
   - `GET /api/tasks` com token, algumas tasks → lista completa + `count` correto.
   - `GET /api/tasks?status=DONE` → só as tasks concluídas do usuário logado.
   - `GET /api/tasks?status=INVALIDO` → `400`.
   - Confirmar que tasks de outro usuário nunca aparecem (autorização por dono do recurso).
4. Rodar `npm run build` ao final da implementação para garantir que o projeto compila corretamente (TypeScript `strict: true` — PRD seção 3). Corrigir qualquer erro de build antes de considerar a tarefa concluída.

## 6. Fora de escopo (não implementar sem alinhar antes)

- Filtro por múltiplos status simultâneos (ex.: `status=TODO,DONE`).
- Paginação, ordenação customizável, busca por texto no título.
- UI para selecionar o filtro de status no dashboard.
- Criar/editar/deletar task — são os próximos passos já mapeados no PRD (seção 9.2), mas não fazem parte desta tarefa.
