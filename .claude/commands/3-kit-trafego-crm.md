---
description: Gera plano de tráfego, fundos de criativos, copy de anúncios e toda a implantação de CRM
argument-hint: <slug>
---
# Skill 3: Tráfego + CRM + Acompanhamento de 90 dias

Cliente: `$ARGUMENTS`. Leia antes `clientes/$ARGUMENTS/contexto/contexto-empresa.md` e `design-system.md`.

## PARTE A — Tráfego

### A1. `clientes/$ARGUMENTS/criativos/plano-campanha.md`
- Estrutura de campanhas (Meta: captação com CBO + remarketing 7/30 dias; Google: pesquisa local se houver demanda).
- Públicos: aberto geolocalizado, interesses do nicho, remarketing de visitantes da LP e engajamento do Instagram.
- Orçamento sugerido para os primeiros 14 dias e critérios de pausa (ex.: CPL acima de X após Y impressões).
- Nomenclatura Pinas: `[CLIENTE]_[OBJETIVO]_[PUBLICO]_[ANGULO]_[DATA]`.

### A2. `clientes/$ARGUMENTS/criativos/copy-anuncios.md`
Todo o texto dos anúncios fica AQUI, nunca na imagem:
- 5 textos principais (PAS, Prova Direta, Chamada Qualificada, Objeção, Oferta).
- Para cada fundo do lote: sugestão de headline curta (até 6 palavras) para o usuário colocar na arte depois, e onde posicioná-la (área livre do layout).

### A3. Fundos de criativos — SEM TEXTO
1. Escreva `clientes/$ARGUMENTS/criativos/lote-criativos.json` (modelo em `clientes/_modelo-padrao/criativos/lote-criativos.exemplo.json`) com 6 fundos: 3 ângulos (Dor, Desejo, Autoridade) × formatos `feed` e `stories`. Varie os `layout`s.
2. Use fotos reais do cliente (`clientes/$ARGUMENTS/criativos/fotos/`) ou de `assets-globais/fundos/`. Se não houver nenhuma, use `cor-solida` e avise o usuário.
3. Rode `node motor-local/renderizar-criativos.js $ARGUMENTS`. Não abra os PNGs para conferir, a não ser que o usuário peça.

### A4. Roteiro de vídeo (opcional)
Roteiro de 20–25s em `criativos/roteiro-reels.md` (gancho em 3s, problema, solução, CTA). Locução:
`python3 motor-local/gerar-locucao.py --arquivo clientes/$ARGUMENTS/criativos/roteiro-reels.txt clientes/$ARGUMENTS/criativos/locucao-01.mp3`

## PARTE B — CRM (`clientes/$ARGUMENTS/crm/`)

### B1. `manual-pipeline-crm.md`
Colunas adaptadas ao nicho, cada uma com critério de entrada, responsável e SLA:
Novo lead (resposta ≤ 5 min) → Qualificação → Agendado/Proposta (lembrete anti-no-show 24h e 2h) → Negociação/Follow-up → Ganho / Perdido (motivo obrigatório: preço, prazo, sumiu, concorrente, sem perfil).
Indique uma ferramenta gratuita para começar (ex.: planilha Google + n8n, ou o plano free de um CRM) e quando migrar.

### B2. `cadencia-scripts-whatsapp.md`
Boas-vindas com a origem do anúncio · qualificação em 3 perguntas abertas · follow-up 24h / 72h / 7d / 30d · pedido de avaliação no Google e de indicação pós-venda.

### B3. `workflow-integracao-n8n.json`
JSON **importável** no n8n: Webhook (POST) → Set (normaliza nome, telefone com DDI 55, respostas, UTMs, data) → Google Sheets (append) → mensagem para o vendedor com link `wa.me` do lead.
Use apenas nós nativos (`n8n-nodes-base.webhook`, `set`, `googleSheets`, `httpRequest`). Credenciais e IDs como placeholders. Valide com `node -e "JSON.parse(require('fs').readFileSync('<arquivo>'))"`.

### B4. `cronograma-90-dias.md`
- **Mês 1 — Setup e tração:** CRM no ar, treinamento da equipe, campanhas rodando, auditoria diária do tempo de resposta.
- **Mês 2 — Otimização:** motivos de perda no CRM → ajuste de público e copy; nova leva de fundos.
- **Mês 3 — Escala:** reativação de leads dos meses 1–2, relatório de ROI (investimento × leads × vendas) e proposta de renovação.
Inclua as horas de trabalho humano estimadas por mês (reuniões, treinamento) para o usuário precificar.

## Histórico de aprendizado
- Criativos são só fundos. Texto vai em `copy-anuncios.md`.
