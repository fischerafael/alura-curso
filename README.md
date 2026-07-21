Projeto Next.js (App Router) com backend/frontend separados em `src/backend` e `src/frontend`, Prisma + SQLite e autenticação simplificada por email (JWT).

## Setup

Clonou o repositório? Um comando só resolve instalação, `.env` e banco de dados:

```bash
npm run setup
```

Isso faz: `npm install` → cria `.env` a partir de `.env.example` (se ainda não existir) → roda as migrations do Prisma e cria o `dev.db`.

## Rodando o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para o frontend e teste a API em `http://localhost:3000/api/hello` ou `POST http://localhost:3000/api/auth/login` com `{ "email": "voce@exemplo.com" }`.

> `dev` já roda com `--webpack` (não Turbopack) por causa de um crash do Turbopack em Windows.

## Estrutura

```
src/
├── app/        # router do Next.js (páginas + api routes) — só "casca fina"
├── frontend/   # componentes React (client-side), alias @frontend/*
└── backend/    # lógica de negócio, Prisma, auth, alias @backend/*
```

## Comandos úteis do Prisma

```bash
npm run prisma:migrate   # cria/atualiza o schema e o banco (SQLite)
npm run prisma:generate  # regenera o Prisma Client
npm run prisma:studio    # abre uma UI para ver os dados do banco
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
