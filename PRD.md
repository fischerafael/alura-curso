# PRD.md — Gerenciador de Tasks

Documento de produto e decisões técnicas. Serve como fonte de verdade para o que este projeto é, por que foi construído do jeito que foi, e quais regras não podem ser quebradas sem antes conversar com o usuário. [CLAUDE.md](CLAUDE.md) é o complemento operacional (comandos, checklist rápido para agentes) — este arquivo é onde o "porquê" vive.

---

## 1. Contexto e objetivo do projeto

Este é um projeto **didático**, construído em um curso de desenvolvimento full stack (Next.js). O objetivo primário não é "ter o produto mais robusto possível", é **ensinar** conceitos de arquitetura full stack de forma clara e progressiva: separação front/back, REST, ORM, autenticação, autorização por dono do recurso.

Isso tem uma consequência direta para qualquer agente trabalhando aqui: **simplicidade e clareza pedagógica pesam mais do que robustez de produção**. Preferir a solução mais direta e explícita à mais "correta" em termos de escala, quando as duas divergirem. Não introduzir complexidade (camadas extras, abstrações, bibliotecas) que não sirva ao objetivo de ensinar.

## 2. O produto

Um To Do List / gerenciador de tarefas pessoal:

- Cada usuário faz login (só com email, ver seção 12) e vê **somente as suas próprias tasks**.
- Uma task tem um título e um status: `TODO` (a fazer), `IN_PROGRESS` (em andamento) ou `DONE` (concluída).
- Fluxo esperado ao final do curso: criar task, listar tasks, mudar o status de uma task, editar o título, apagar uma task.
- Não há colaboração entre usuários, não há categorias/tags, não há prazos/lembretes, não há anexos. Esse escopo é proposital (ver seção 12 para o equivalente do lado de auth, e não expandir por conta própria).

Estado atual (o que já existe, não é hipotético):

- Landing page (`/`) com CTA para login.
- Login por email (`/login` → `POST /api/auth/login`), sem senha.
- Dashboard (`/dashboard`) que lista as tasks do usuário logado (`GET /api/tasks`).
- Logout (`POST /api/auth/logout`).
- Criação e edição de task **ainda não existem** — são os próximos passos (seção 9.2).

## 3. Stack

| Camada | Escolha | Observação |
|---|---|---|
| Framework | Next.js (App Router) | Usado só como "cola" de roteamento — ver seção 4 |
| Runtime de dev | Webpack (`next dev --webpack`) | Turbopack tem um crash conhecido em algumas máquinas Windows; não trocar de volta sem confirmar que o bug foi resolvido upstream |
| UI | React (client components apenas) | Ver seção 5 — nada de Server Components |
| Estilo | Tailwind CSS v4 | Classes utilitárias direto no JSX dos componentes |
| ORM | Prisma | Client gerado a partir de `src/backend/prisma/schema.prisma` |
| Banco | SQLite | Arquivo local (`dev.db`), zero setup de infra — adequado a projeto didático, não é uma escolha para produção |
| Auth | JWT (`jsonwebtoken`) | Assinado com `JWT_SECRET`, 7 dias, guardado em `localStorage` |
| Linguagem | TypeScript, `strict: true` | Não desativar strict mode |

Não adicionar dependências novas (state managers, UI kits, ORMs alternativos, bancos alternativos) sem perguntar antes — o valor didático de manter a stack enxuta é intencional.

## 4. Arquitetura: `src/app/` é só casca de roteamento

Esta é a decisão arquitetural mais importante do projeto e a mais fácil de violar sem perceber.

### Por quê

O objetivo pedagógico é deixar nítido, para quem está aprendendo, onde termina "código que só existe por causa do Next.js" e onde começa "lógica da aplicação". Se regras de negócio, chamadas ao Prisma ou JSX com estado vazarem para dentro de `src/app/`, essa fronteira desaparece e o aluno perde a referência de onde as coisas deveriam morar.

### Como se aplica

```
src/
├── app/        # router do Next.js — só conecta, nunca decide
├── frontend/   # componentes React (o que renderiza)
└── backend/    # regras de negócio, Prisma, autenticação (o que decide)
```

- **`src/app/**/page.tsx`**: importa um componente de `@frontend/components` e retorna ele. Ponto final. Sem `useState`, `useEffect`, `fetch`, condicionais, ou qualquer JSX além do componente importado.
- **`src/app/api/**/route.ts`**: importa função(ões) de `@backend/*`, chama, e traduz o retorno ou a exceção lançada em um `NextResponse` com o status HTTP correto. Nenhuma validação de payload ou regra de negócio aqui — isso é responsabilidade do backend.
- Toda lógica de UI (estado, efeitos, fetch) mora em `src/frontend/`. Toda lógica de negócio, acesso a dados e auth mora em `src/backend/`.

Aliases (`tsconfig.json`): `@/*` → `src/*`, `@frontend/*` → `src/frontend/*`, `@backend/*` → `src/backend/*`.

Se uma tarefa parecer exigir escrever lógica dentro de `src/app/`, isso é sinal de que a lógica pertence a outro lugar — pare e mova.

## 5. Front-end: só client components, organizado por página (Container/Presenter)

### Decisão: sem Server Components

O Next.js App Router oferece Server Components por padrão, mas este projeto **não os utiliza** — todo componente em `src/frontend/` é um client component (`"use client"`). A razão é pedagógica: manter uma fronteira nítida entre "o que roda no servidor" e "o que roda no cliente" ajuda no ensino de conceitos de React puro, sem misturar com o modelo mental de RSC (que é mais avançado e específico do Next.js). Não introduzir Server Components, Server Actions, ou streaming SSR sem alinhar antes com o usuário — isso muda a arquitetura de forma significativa.

### Decisão: organização por página, padrão Container/Presenter

- Cada rota (página) tem um componente "container" que concentra **todo** o estado, chamadas de API, redirecionamentos e lógica de sessão necessários para aquela tela funcionar. Hoje esse papel é cumprido por `LoginForm` e `DashboardView` — ambos ainda misturam estado + fetch diretamente no próprio componente (ver nota abaixo).
- Componentes de apresentação ("presenter") devem ser **dumb**: recebem dados via props, não fazem fetch, não tomam decisão de negócio. O estado que eventualmente tiverem é só de UI (ex.: um dropdown aberto/fechado), nunca dado de domínio.
- Preferir composição de componentes (children/slots) a passar a mesma prop por várias camadas (prop drilling). Se notar que uma prop está atravessando 3+ níveis só para chegar a um componente-folha, é sinal de repensar a composição.

### Estado atual vs. estado alvo (não confundir)

`LoginForm.tsx` e `DashboardView.tsx` ainda concentram `useState` + `fetch` direto dentro do próprio componente, sem separação container/presenter explícita. **Isso é uma decisão aceita para o estágio atual do curso, não um bug a corrigir de surpresa** em uma tarefa não relacionada. Ao adicionar uma tela nova (criar/editar task), é o momento de já introduzir a separação container/presenter com mais rigor, em vez de replicar o padrão atual.

## 6. Back-end: route handlers finos + casos de uso em `src/backend/`

- Next.js Route Handlers (`src/app/api/**/route.ts`) são usados apenas como o transporte HTTP: recebem a requisição, chamam a função de caso de uso correspondente, devolvem a resposta.
- Cada operação de negócio (fazer login, listar tasks, criar task, atualizar task, deletar task) é uma **função dedicada** em `src/backend/` — um caso de uso por função, não um service genérico com vários métodos. Ver `login()` em `auth.ts` e `listTasks()` em `tasks.ts` como modelo.
- Padrão REST para definir recursos e verbos: `/api/tasks` (coleção), `POST` para criar, `GET` para listar. Update de uma task específica deve seguir o padrão REST (`PATCH /api/tasks/:id` ou equivalente) quando implementado — ver seção 9.2.

## 7. Camada de dados: acesso direto ao Prisma hoje, DAL é decisão futura (não implementada)

Atualmente `src/backend/tasks.ts` e `src/backend/auth.ts` chamam `prisma.*` diretamente dentro da função de caso de uso — não há uma camada de acesso a dados (DAL/repository) separada.

**Decisão tomada, mas não executada**: em algum ponto futuro pode fazer sentido extrair uma DAL dedicada (funções tipo `taskRepository.findByUser()`) para isolar ainda mais Prisma do resto do backend. Isso **não é bloqueante** para as features atuais (criar/editar task) e não deve ser feito "de brinde" durante outra tarefa. Se uma tarefa exigir tocar bastante em acesso a dados de qualquer forma, é um bom momento para perguntar ao usuário se vale a pena extrair a DAL naquele momento — mas a iniciativa não deve partir do agente sem essa conversa.

## 8. Validação — sempre nas duas pontas, mas o back-end é quem manda

- Toda função em `src/backend/*` que recebe input vindo de fora (body de requisição, parâmetros) valida esse input **antes** de agir, e lança um erro tipado quando a validação falha. Modelo: `InvalidEmailError` em `auth.ts`.
- A API route (`route.ts`) captura esse erro tipado e traduz para o status HTTP correspondente: `400` para erro de validação, `401` para não autenticado. Novos erros tipados devem seguir esse mesmo contrato (uma classe de erro → um status HTTP fixo).
- No front-end, validar o que der de forma barata antes do fetch (`type="email"`, `required`, etc.) — isso melhora a experiência, mas **nunca substitui** a validação do backend. Nunca confiar apenas na validação client-side para decidir se um dado é válido.

## 9. Autenticação e autorização

### 9.1 Como funciona hoje (não mexer sem necessidade)

- Login é só por email, sem senha. Se o email não existe na base, o usuário é criado ali mesmo via `upsert` (`login()` em `auth.ts`) — não existe uma tela de "cadastro" separada, e não deve existir.
- Sessão é um JWT assinado com `JWT_SECRET`, validade de 7 dias, devolvido no corpo da resposta de login e guardado no `localStorage` do navegador (`src/frontend/lib/session.ts`), enviado em requisições subsequentes como header `Authorization: Bearer <token>`.
- Autorização por dono do recurso: toda query de dados de domínio (hoje, tasks) é filtrada pelo `userId` extraído do token (`getAuthPayload(request)`), nunca por um `userId` vindo do corpo da requisição. `listTasks(userId)` em `tasks.ts` é o modelo a replicar em qualquer novo caso de uso (criar, atualizar, deletar task) — o `userId` do payload autenticado é sempre a fonte da verdade, o body da requisição nunca deve ser usado para decidir de quem é o recurso.
- Proteção de rota privada é **só client-side** hoje: `DashboardView` verifica se existe sessão no `localStorage` e redireciona para `/login` se não houver. **Não existe middleware server-side** de autenticação ainda — não assumir que uma rota é protegida no servidor só porque parece uma área logada.

### 9.2 Próximas features esperadas

Ordem natural de implementação, seguindo os padrões já estabelecidos (validação no backend, filtro por `userId`, route fina, considerar container/presenter em telas novas):

1. **`POST /api/tasks`** — criar task. Hoje `src/app/api/tasks/route.ts` só tem `GET`, com o comentário `// POST (criar task) chega na A3`. Precisa de: validação de `title` não vazio no backend, `userId` extraído do token (nunca do body), status default `TODO`.
2. **Update de task** (título e/ou status) — endpoint ainda não existe. Provável `PATCH /api/tasks/:id`. Precisa validar que a task pertence ao usuário autenticado antes de atualizar (não apenas filtrar na leitura — checar posse antes de escrever).
3. Implícito no fluxo de produto (seção 2), ainda sem endpoint: deletar task.

Ao implementar qualquer uma dessas, o agente deve seguir os padrões já existentes no código, não inventar um padrão novo em paralelo.

## 10. Padrões de código e nomenclatura

- Nomes de variáveis, funções, tipos: **inglês**.
- Comentários, mensagens de erro voltadas ao usuário, textos de UI: **português (pt-BR)** — seguindo o padrão já presente (`InvalidEmailError("Email inválido")`, textos como "Entrar", "Nenhuma task ainda").
- Erros de domínio são classes que estendem `Error` (`InvalidEmailError`), não strings soltas ou objetos genéricos — isso é o que permite a route fazer `instanceof` e mapear para o status HTTP certo.
- TypeScript em modo `strict`. Não usar `any` para contornar erro de tipo; resolver o tipo de verdade.

## 11. Ambiente e execução

Variáveis de ambiente obrigatórias (`.env`, nunca commitado — usar `.env.example` como referência):

| Variável | Exemplo | Uso |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Connection string do SQLite para o Prisma |
| `JWT_SECRET` | (string aleatória) | Chave usada para assinar/verificar o JWT de sessão |

Comandos principais (ver [CLAUDE.md](CLAUDE.md) para a lista completa e atualizada):

```bash
npm run setup             # instala deps, cria .env, roda migration inicial (primeira vez)
npm run dev               # servidor de dev — sempre com --webpack, nunca turbopack (ver seção 3)
npm run prisma:generate   # regenerar Prisma Client após mudar schema.prisma
npm run prisma:migrate    # criar/aplicar migration após mudar schema.prisma
```

Não existe suíte de testes configurada. Não assumir `npm test` nem escrever testes automatizados sem confirmar com o usuário que isso entrou em escopo do curso.

## 12. Fora de escopo por decisão explícita

Os itens abaixo foram deliberadamente deixados de fora do projeto. Não implementar nenhum destes "de brinde" durante outra tarefa — se parecer necessário a algum ponto, **perguntar ao usuário antes**, não assumir que é um gap a preencher:

- Senha / hashing de senha.
- OAuth ou qualquer login social.
- MFA (autenticação multifator).
- Refresh tokens / rotação de sessão.
- Verificação de email.
- Compartilhamento de tasks entre usuários (colaboração).
- Qualquer banco de dados além do SQLite.
- Categorias, tags, prazos, lembretes, anexos em tasks.

## 13. Como este documento deve ser usado por agentes

- Antes de qualquer mudança que toque em arquitetura (mover lógica entre `app/`/`frontend`/`backend`, introduzir Server Components, adicionar uma dependência nova, mexer em auth), reler a seção relevante aqui.
- Se uma instrução do usuário parecer conflitar com uma decisão registrada aqui, é preferível apontar o conflito explicitamente e perguntar, em vez de silenciosamente escolher um lado.
- Este documento deve ser atualizado quando uma decisão registrada aqui for **conscientemente revista** pelo usuário — não deve divergir silenciosamente do estado real do código por muito tempo.
