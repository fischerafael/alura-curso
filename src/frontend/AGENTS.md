# AGENTS.md — Frontend

Convenções específicas de `src/frontend/`. Ver [AGENTS.md](../../AGENTS.md) na raiz para as regras gerais do projeto.

## Estrutura de pastas

```
src/frontend/
├── containers/   # componentes "smart": estado, efeitos, chamadas a services
├── components/   # componentes "dumb"/presentacionais: só recebem props e renderizam
├── services/      # camada de acesso ao backend (fetch), uma função por operação de API
└── lib/           # utilitários puros (ex: sessão em localStorage)
```

### containers/ (smart components)

- Ficam aqui componentes que têm `useState`/`useEffect`, chamam `services/`, ou orquestram outros componentes.
- Podem importar de `components/`, `services/` e `lib/`.
- São o único lugar que decide *o que* fazer com os dados (ex: `DashboardView` decide quando recarregar a lista de tasks).
- Ex.: `DashboardView`, `LoginForm`, `AddTaskModal`, `DeleteTaskModal` — os dois modais fazem chamada à API para criar/remover, então são containers, não componentes puros.

### components/ (dumb/presentational components)

- Recebem tudo via props (dados + callbacks). Não usam `fetch`, não importam de `services/`, e idealmente não têm `useState` além de estado puramente visual (ex: um toggle local).
- Podem ser reutilizados sem saber nada sobre a API ou sobre sessão/autenticação.
- Ex.: `LandingHero`, `Modal` (wrapper genérico de overlay/esc), `TaskList`, `TaskStatusSelect`.

Antes de criar um componente novo, pergunte: "ele faz uma chamada de rede ou decide regra de negócio?" Se sim, é `containers/`. Se ele só recebe props e desenha UI, é `components/`.

### services/

- Toda chamada `fetch` ao backend deve passar por aqui — nunca chame `fetch` diretamente de dentro de um container ou componente.
- Um arquivo por domínio (`tasks.service.ts`, `auth.service.ts`), cada função representando uma operação (`listTasks`, `createTask`, `updateTaskStatus`, `deleteTask`, `login`, `logout`).
- `http.ts` é o cliente HTTP compartilhado: monta headers (`Authorization`, `Content-Type`), serializa/deserializa JSON, trata respostas `204 No Content` e lança `ApiError` com a mensagem vinda da API em caso de erro. Containers capturam esse erro e decidem a mensagem exibida ao usuário.
- Tipos de domínio (ex: `Task`, `TaskStatus`) são exportados a partir do service correspondente e importados por containers/components — não duplique o shape em vários arquivos.

### lib/

- Utilitários sem estado de UI e sem chamada de rede (ex: `session.ts` lê/grava `localStorage`).

## Convenções de UI

- Estados de carregamento assíncrono (criar, atualizar, remover) precisam de indicação visual (`disabled`, spinner, texto "Carregando...") — nunca deixe uma ação de API sem feedback de loading.
- `<select>` nativo: o menu popup do navegador não segue `prefers-color-scheme`/dark mode do app de forma confiável. Force `style={{ colorScheme: "light" }}` no `<select>` e defina cores explícitas (`bg-white text-zinc-900`) nas `<option>` para garantir contraste, em vez de depender de `text-foreground`/variáveis de tema que mudam com o dark mode.
- Componentes de modal reutilizam `components/Modal.tsx` (overlay + fechamento por Esc/clique fora) — não duplique esse comportamento em cada modal novo.
