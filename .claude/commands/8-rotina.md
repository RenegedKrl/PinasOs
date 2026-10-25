---
description: Rotina da agência — agenda do dia, painel, auditoria semanal dos clientes e backup
argument-hint: [dia|semana]
---
# Skill 8: Rotina da agência

Argumento: `$ARGUMENTS` (padrão: `dia`).

## Todo dia
1. `node motor-local/follow-ups.js` → leia `comercial/follow-ups-<hoje>.md`.
2. Para cada prospect na agenda, deixe a mensagem pronta em `clientes/<slug>/contexto/follow-up-<data>.md` (curta, com um motivo novo para responder; siga `assets-globais/anti-ia.md`). Para "Follow-up 2", use o número de `calcular-perda.js` se existir.
3. `node motor-local/painel-agencia.js`
4. Responda ao usuário em até 10 linhas: o que fazer hoje, em ordem de prioridade (cobrança e renovação primeiro, depois respostas de leads, depois follow-ups, depois prospecção nova). Lembre de atualizar os status no pipeline.

## Toda semana (`semana`, ou se hoje for segunda-feira)
5. `node motor-local/auditar-clientes.js` → qualquer alerta vira a 1ª prioridade do dia (site fora do ar, Pixel sumiu).
6. `node motor-local/backup.js`
7. Revise `APRENDIZADOS.md`: proponha ao usuário quais regras mover para as skills.
8. Se o pipeline tiver menos de 10 prospects ativos, sugira importar do Pinas Kit e rodar `/0-piloto-automatico --lote 5`.

Nunca envie mensagens nem cobre clientes sozinho: prepare tudo e o usuário envia.
