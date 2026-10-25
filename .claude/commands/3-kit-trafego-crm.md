---
description: Gera plano de tráfego, fundos de criativos, copy de anúncios, vídeo e toda a implantação de CRM
argument-hint: <slug>
---
# Skill 3: Tráfego + CRM + Acompanhamento de 90 dias

Cliente: `$ARGUMENTS`. Leia antes `clientes/$ARGUMENTS/contexto/contexto-empresa.md`, `design-system.md` e a seção do nicho em `assets-globais/inspiracoes-lp/nichos.md`.

## PARTE A — Tráfego

### A1. `criativos/plano-campanha.md`
- Meta: 1 campanha de captação (CBO, objetivo Leads ou Engajamento → WhatsApp/site) + 1 de remarketing (visitantes LP 30d, engajamento IG 30d).
- Google (se houver demanda de busca): pesquisa local com palavras de intenção ("[serviço] + [bairro/cidade]"), correspondência de frase, negativas óbvias (grátis, curso, emprego, vaga).
- Públicos: aberto geolocalizado (raio realista do negócio), interesses do nicho, lookalike de clientes quando houver base.
- Orçamento dos primeiros 14 dias e regras de corte (ex.: pausar anúncio com CPL 2× a média após 1.000 impressões).
- Nomenclatura: `[CLIENTE]_[OBJETIVO]_[PUBLICO]_[ANGULO]_[AAAAMMDD]`.
- URLs com UTMs: `?utm_source=meta&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`.

### A2. `criativos/copy-anuncios.md` (todo texto fica aqui, nunca na imagem)
- 5 textos principais: PAS, Prova Direta, Chamada Qualificada ("Se você mora em X e…"), Quebra de Objeção, Oferta.
- 5 títulos curtos (até 40 caracteres) para o campo Título do anúncio.
- Para cada fundo do lote: headline de até 6 palavras para o usuário colocar na arte + área livre onde colocar (ver `assets-globais/inspiracoes-criativos/padroes-fundos.md`).
- Respeite as restrições do conselho profissional do nicho.

### A3. Fundos de criativos — SEM TEXTO
1. Fotos: `clientes/$ARGUMENTS/criativos/fotos/` ou `assets-globais/fundos/`. Sem fotos → layout `cor-solida` e avise o usuário.
2. Escreva `criativos/lote-criativos.json` (modelo em `clientes/_modelo-padrao/criativos/lote-criativos.exemplo.json`): 3 ângulos (Dor, Desejo, Autoridade) × `["feed","stories"]`, variando `layout`.
3. `node motor-local/renderizar-criativos.js $ARGUMENTS` → `criativos/fundos/`. Não abra os PNGs, a não ser que o usuário peça.

### A4. Vídeo Reels/Stories (sem texto na tela)
1. Roteiro de 20–25s em `criativos/roteiro-reels.txt` (só a fala: gancho 3s → problema → solução → CTA). Escreva números por extenso para a locução soar natural.
2. `python3 motor-local/gerar-locucao.py --arquivo clientes/$ARGUMENTS/criativos/roteiro-reels.txt clientes/$ARGUMENTS/criativos/locucao-01.mp3`
3. `criativos/motion.json` com 3–5 cenas usando os fundos `*-stories.png`, movimentos variados e sfx (`whoosh`, `pop`, `click`, `cash`, `impacto`, `subida`). A duração se ajusta à locução automaticamente.
4. `node motor-local/renderizar-motion.js $ARGUMENTS` → mp4 1080x1920.
O usuário adiciona legendas/texto depois (CapCut/Instagram).

## PARTE B — CRM (`clientes/$ARGUMENTS/crm/`)

### B1. `manual-pipeline-crm.md`
Etapas com critério de entrada, responsável e SLA:
Novo lead (resposta ≤ 5 min no horário comercial) → Qualificação → Agendado/Proposta (lembrete 24h e 2h) → Negociação/Follow-up → Ganho (valor obrigatório) / Perdido (motivo obrigatório: preço, prazo, sumiu, concorrente, sem perfil, outro).
Ferramenta para começar de graça: Planilha Google (colunas de `crm/leads-modelo.csv`) + n8n. Indique quando migrar para um CRM dedicado (ex.: > 150 leads/mês ou > 3 vendedores).

### B2. `cadencia-scripts-whatsapp.md`
Boas-vindas citando o interesse da triagem · qualificação em 3 perguntas abertas · follow-up 24h / 72h / 7d / 30d (cada um com motivo novo para responder, nunca "e aí, pensou?") · confirmação de agendamento · pedido de avaliação no Google e indicação pós-venda.

### B3. Automação n8n
1. Copie `motor-local/modelos/n8n-workflow-leads.json` para `crm/workflow-n8n.json` e troque `SLUG` no path do webhook.
2. Escreva `crm/como-instalar-n8n.md` com o passo a passo: importar o workflow, conectar a credencial do Google Sheets, criar a aba `Leads` com o cabeçalho de `leads-modelo.csv`, escolher a API de WhatsApp do alerta (Evolution API self-hosted grátis ou CallMeBot para teste), ativar e colar a URL de produção do webhook em `rastreamento.webhookUrl` da LP.
3. Copie `clientes/_modelo-padrao/crm/leads-modelo.csv` para a pasta (vira o cabeçalho da planilha).

### B4. `cronograma-90-dias.md`
- **Mês 1 — Setup e tração:** CRM no ar, treinamento, campanhas, auditoria diária do tempo de resposta.
- **Mês 2 — Otimização:** motivos de perda → ajuste de público/copy; nova leva de fundos e vídeo.
- **Mês 3 — Escala:** reativação dos leads dos meses 1–2, relatório de ROI e proposta de renovação.
Inclua horas humanas por mês (ref.: `comercial/tabela-precos.md`) e as datas das reuniões mensais (`/4-relatorio-mensal`).

## Histórico de aprendizado
- Criativos são só fundos. Texto vai em `copy-anuncios.md`.
