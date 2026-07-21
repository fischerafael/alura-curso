import { existsSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

run("npm install");

if (existsSync(".env")) {
  console.log("\n.env já existe, mantendo o que está aí.");
} else {
  copyFileSync(".env.example", ".env");
  console.log("\n.env criado a partir de .env.example.");
}

run("npm run prisma:migrate -- --name init");

console.log("\nSetup concluído. Rode `npm run dev` para subir o servidor.");
