---
description: Gera o relatório mensal de resultados do cliente e a análise para a reunião
argument-hint: <slug> <AAAA-MM> <investimento-em-anúncios>
---
# Skill 4: Relatório mensal

Argumentos: `$ARGUMENTS` (slug, mês, investimento total em anúncios no mês).

1. Confirme que existe `clientes/<slug>/crm/leads.csv` (exportado da Planilha Mestre: Arquivo → Fazer download → CSV). Se não existir, peça ao usuário e pare.
2. `node motor-local/relatorio-mensal.js <slug> <AAAA-MM> <investimento>`
3. Leia apenas `clientes/<slug>/relatorios/relatorio-<AAAA-MM>.json` (não o HTML).
4. Escreva `clientes/<slug>/relatorios/analise-<AAAA-MM>.md`, com no máximo 1 página:
   - **Resumo em 3 frases** para o dono da empresa (sem jargão: "cada cliente novo custou R$ X em anúncio").
   - **O que funcionou** (melhor origem/campanha/interesse por taxa de conversão, não por volume).
   - **O que vamos mudar no próximo mês**: 3 ações concretas ligando CRM → tráfego (ex.: "motivo de perda nº 1 foi preço → criar anúncio com parcelamento").
   - **O que precisamos da equipe do cliente** (ex.: preencher motivo de perda, responder mais rápido).
5. Se for o mês 3 do contrato, acrescente a seção **Renovação**: resultado acumulado e proposta de continuidade (ver `comercial/tabela-precos.md`).
6. Diga ao usuário: abrir o HTML no navegador → Imprimir → Salvar como PDF para enviar ao cliente.
