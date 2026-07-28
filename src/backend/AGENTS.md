# AGENTS.md (backend)

Convenções específicas para `src/backend/`. Complementa o [AGENTS.md](../../AGENTS.md) da raiz — leia aquele primeiro para o contexto geral do projeto.

Estas regras valem para qualquer código novo ou alterado dentro de `src/backend/`, mesmo que o código existente ainda não as siga (ver "Débito conhecido" no final).

## 1. Camada de acesso a dados (data layer)

Use-cases **nunca** importam `@prisma/client` nem `@backend/lib/db` diretamente. Toda query fica concentrada numa camada de dados própria, e só ela conhece o Prisma.

```
src/backend/
├── data/           # camada de acesso a dados — único lugar que importa o Prisma Client
│   ├── tasks.ts    # ex: findTasksByUser, createTask, deleteTaskByIdAndUser...
│   └── users.ts
├── tasks.ts        # use-cases (regra de negócio) — importa @backend/data/tasks, não o Prisma
└── auth.ts
```

- Funções da camada de dados são finas: recebem parâmetros já validados, fazem a query e retornam o resultado do Prisma (ou `null`/lista). Não têm regra de negócio.
- Use-cases importam apenas de `@backend/data/*`, nunca de `@prisma/client` ou `@backend/lib/db`.
- Isso vale para leitura e escrita — inclusive `count`, `deleteMany`, `upsert`, etc.

## 2. Validação de input com Zod

Todo use-case que recebe input externo (parâmetros de rota, body de request, query string) valida esse input com um schema **Zod**, de forma padronizada — nunca com `if`s manuais espalhados pelo código.

- Instale/use o pacote `zod` (já deve estar em `dependencies`; se não estiver, rode `npm install zod`).
- Cada use-case define (ou importa) o schema Zod correspondente ao seu input e valida no início da função, antes de tocar a camada de dados.
- Em caso de falha de validação, lance um erro de domínio (padrão já usado no projeto: classes como `InvalidTitleError`, `InvalidStatusError`) — não vaze o `ZodError` cru para quem chamou o use-case.
- Prefira colocar os schemas perto do use-case que os usa (mesmo arquivo, ou um arquivo `*.schema.ts` ao lado) em vez de um arquivo gigante de schemas compartilhados, a menos que o mesmo schema seja reutilizado por mais de um use-case.

## 3. DTO no retorno dos use-cases

Use-cases **nunca** retornam diretamente o objeto que vem do Prisma (nem de forma implícita, retornando a Promise da query). Sempre montam e retornam um DTO explícito — um objeto plano com só os campos que a camada acima (rota/UI) precisa.

- Isso evita vazar campos internos do modelo (ex: campos sensíveis, colunas técnicas) e desacopla a resposta da API do shape exato da tabela no banco.
- Exemplo do problema a evitar: `createTask` em `tasks.ts` hoje faz `return prisma.task.create(...)` diretamente — isso deve virar algo como montar `{ id, title, status, createdAt }` a partir do resultado antes de retornar.
- Defina o shape do DTO explicitamente (tipo ou interface), não apenas confie na inferência do retorno do Prisma.

## Débito conhecido

O código atual em `tasks.ts` e `auth.ts` foi escrito antes destas regras e ainda importa o Prisma diretamente, valida input com `if`s manuais, e retorna resultados de query sem DTO. Ao tocar em qualquer uma dessas funções para adicionar/alterar funcionalidade, aproveite para migrá-la para o padrão acima em vez de só remendar por cima.
