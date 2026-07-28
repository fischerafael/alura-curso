# AGENTS.md (backend)

Convenções específicas para `src/backend/`. Complementa o [AGENTS.md](../../AGENTS.md) da raiz — leia aquele primeiro para o contexto geral do projeto.

Estas regras valem para qualquer código novo ou alterado dentro de `src/backend/`, mesmo que o código existente ainda não as siga (ver "Débito conhecido" no final).

## 1. Uma pasta por família de use-cases (entidade)

Toda entidade da aplicação (task, user, etc.) tem sua própria pasta em `src/backend/<entidade>/`, com a lógica de negócio separada em três arquivos por responsabilidade:

```
src/backend/
├── data/               # camada de acesso a dados — único lugar que importa o Prisma Client
│   ├── tasks.ts        # ex: findTasksByUser, createTask, deleteTaskByIdAndUser...
│   └── users.ts
├── tasks/              # família de use-cases da entidade "task"
│   ├── use-cases.ts    # funções de regra de negócio (listTasks, createTask, deleteTask...)
│   ├── dto.ts          # tipos de DTO e funções toXxxDTO
│   ├── schema.ts       # schemas Zod de validação de input
│   └── tasks.test.ts   # testes dos use-cases (nome com o da entidade, não "use-cases.test.ts")
└── auth.ts
```

- `use-cases.ts` importa de `./dto` e `./schema` (import relativo dentro da pasta) e de `@backend/data/<entidade>` — nunca do Prisma diretamente.
- Esse padrão se repete para qualquer entidade nova: ao criar a família de use-cases de uma entidade, crie a pasta com os três arquivos, mesmo que `dto.ts` ou `schema.ts` comecem pequenos.
- Fora da pasta, importe sempre o caminho completo do arquivo (ex.: `@backend/tasks/use-cases`, `@backend/tasks/schema`) — não crie um `index.ts` de barrel só para encurtar o import.

## 2. Camada de acesso a dados (data layer)

Use-cases **nunca** importam `@prisma/client` nem `@backend/lib/db` diretamente. Toda query fica concentrada numa camada de dados própria (`src/backend/data/`), e só ela conhece o Prisma.

- Funções da camada de dados são finas: recebem parâmetros já validados, fazem a query e retornam o resultado do Prisma (ou `null`/lista). Não têm regra de negócio.
- Use-cases importam apenas de `@backend/data/*`, nunca de `@prisma/client` ou `@backend/lib/db`.
- Isso vale para leitura e escrita — inclusive `count`, `deleteMany`, `upsert`, etc.

## 3. Validação de input com Zod

Todo use-case que recebe input externo (parâmetros de rota, body de request, query string) valida esse input com um schema **Zod**, de forma padronizada — nunca com `if`s manuais espalhados pelo código.

- Instale/use o pacote `zod` (já deve estar em `dependencies`; se não estiver, rode `npm install zod`).
- O schema Zod de cada entidade fica em `<entidade>/schema.ts` (ver seção 1) — não crie um arquivo gigante de schemas compartilhados entre entidades, a menos que o mesmo schema seja reutilizado por mais de uma.
- Cada use-case valida o input no início da função, antes de tocar a camada de dados.
- Em caso de falha de validação, lance um erro de domínio (padrão já usado no projeto: classes como `InvalidTitleError`, `InvalidStatusError`) — não vaze o `ZodError` cru para quem chamou o use-case.

## 4. DTO no retorno dos use-cases

Use-cases **nunca** retornam diretamente o objeto que vem do Prisma (nem de forma implícita, retornando a Promise da query). Sempre montam e retornam um DTO explícito — um objeto plano com só os campos que a camada acima (rota/UI) precisa.

- O tipo do DTO e a função `toXxxDTO` de cada entidade ficam em `<entidade>/dto.ts` (ver seção 1).
- Isso evita vazar campos internos do modelo (ex: campos sensíveis, colunas técnicas) e desacopla a resposta da API do shape exato da tabela no banco.
- Defina o shape do DTO explicitamente (tipo ou interface), não apenas confie na inferência do retorno do Prisma.

## 5. Testes: happy path não basta

Todo use-case novo ou alterado precisa de testes (Vitest, mockando a camada de dados — ver [feature-flow](../../.claude/skills/feature-flow/SKILL.md)) que cubram, além do caminho feliz:

- **Cada erro de domínio que o use-case pode lançar** (ex.: `InvalidTitleError`, `InvalidStatusError`, `TaskNotFoundError`) — um teste por erro, verificando que ele é lançado na condição certa.
- **Limites de validação**, não só "válido" vs. "inválido": valor vazio, valor só com espaços, exatamente no limite (ex.: título com `MAX_TITLE_LENGTH` caracteres) e um a mais que o limite.
- **Resultado vazio como caso válido**: lista vazia, nenhum resultado encontrado — não deve lançar erro nem ser tratado como "esqueceram de mockar".
- **Efeito colateral não disparado**: quando a validação falha, o teste confirma que a camada de dados (o mock) *não* foi chamada — não só que a função rejeitou.

Um teste que só exercita "dado um input válido, funciona" não cobre a função — trate isso como incompleto, não como suficiente, mesmo que o caminho feliz esteja passando.

## Débito conhecido

O código de `auth.ts` foi escrito antes destas regras e ainda importa o Prisma diretamente, valida input com `if`s manuais, e retorna resultados de query sem DTO. Ao tocar em `auth.ts` para adicionar/alterar funcionalidade, aproveite para migrá-lo para o padrão acima (inclusive extraindo para uma pasta `src/backend/auth/` com `use-cases.ts`/`dto.ts`/`schema.ts`) em vez de só remendar por cima.
