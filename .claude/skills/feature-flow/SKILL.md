---
name: feature-flow
description: Fluxo padrão para desenvolver uma nova funcionalidade neste projeto — discovery/exploração, plano em markdown com confirmação do usuário, implementação, e verificação (lint/build/testes/self-review). Use sempre que o usuário trouxer uma tarefa, card, ou descrição de funcionalidade nova para implementar, ou pedir explicitamente para seguir o fluxo de feature.
---

# Feature Flow

Receita de 4 fases para implementar uma funcionalidade nova. O input desta skill é o texto/contexto que o usuário colar logo em seguida (descrição da tarefa, card do Jira, ideia solta, etc.) — pode estar incompleto ou ambíguo, isso é esperado e faz parte da fase 1.

Nunca pule fases. Nunca avance de fase sem o checkpoint indicado.

## Fase 1 — Discovery / Exploração

Objetivo: entender o problema antes de propor solução.

- Leia o contexto que o usuário trouxe (descrição, card, texto solto).
- Explore a codebase atual para entender o estado presente relacionado à tarefa (arquivos, padrões, convenções do [AGENTS.md](../../../AGENTS.md)).
- Debata com o usuário: levante ambiguidades do card, hipóteses de abordagem, casos de borda, exceções e situações adjacentes que a feature pode tocar.
- Não escreva código nesta fase. O objetivo é convergir em conjunto com o usuário sobre o que precisa ser feito e como.
- Continue a discussão até sentir que o escopo e a abordagem estão claros o suficiente para virar um plano.

## Fase 2 — Plano

Objetivo: gerar um plano executável e revisável.

- Escreva um plano em markdown (use o mecanismo de plan mode, `ExitPlanMode`, quando disponível) descrevendo passos concretos de implementação, arquivos afetados, e decisões tomadas na fase 1.
- **Checkpoint obrigatório**: apresente o plano ao usuário e peça confirmação explícita antes de implementar. Se o usuário sugerir mudanças, ajuste o plano e peça confirmação de novo.
- Não comece a implementação sem essa confirmação.

## Fase 3 — Implementação

Objetivo: executar o plano confirmado.

- Implemente exatamente o que foi combinado no plano, usando também o contexto da fase 1 como referência.
- Siga as convenções do [AGENTS.md](../../../AGENTS.md) (sem lógica de negócio em `src/app/`, TypeScript strict, etc.).
- Se durante a implementação surgir a necessidade de desviar do plano, avise o usuário antes de seguir.

## Fase 4 — Verificação

Objetivo: garantir que a implementação está correta antes de liberar para PR.

- Rode `npm run lint`.
- Rode `npm run build`.
- Rode a suíte de testes, se existir (hoje o projeto ainda não tem testes automatizados configurados — não invente testes que não existem).
- Faça uma auto-revisão comparando a implementação com o plano da fase 2: confira se algum item do plano ficou pela metade, se algum edge case levantado na fase 1 foi esquecido, e se não há erros óbvios.
- Se encontrar problemas, volte para a fase 3 (ou até a fase 2, se o plano estava errado) e corrija — não finalize com pendências conhecidas.

### Encerramento

- Só quando lint, build e self-review estiverem OK: avise o usuário que a funcionalidade está pronta, resumindo o que foi feito.
- **Não crie o pull request.** O usuário revisa e abre o PR manualmente — isso é intencional, apenas informe que está pronto para revisão.
