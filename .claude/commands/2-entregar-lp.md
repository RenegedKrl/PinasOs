---
description: Constrói a Landing Page oficial do cliente com UTMs, Pixel e triagem
argument-hint: <slug>
---
# Skill 2: Landing Page oficial

Cliente: `$ARGUMENTS`

## Etapa 1 — Contexto e pendências
1. Leia `clientes/$ARGUMENTS/contexto/contexto-empresa.md` e `design-system.md`.
2. Se existir `clientes/$ARGUMENTS/site/lp-conteudo.json` (do protótipo), parta dele.
3. Liste para o usuário, em uma mensagem, o que ainda falta de dado real: depoimentos, fotos, números, nome/formação do responsável, Pixel ID, GTM ID, URL do webhook n8n, WhatsApp, CNPJ, e-mail LGPD. Siga com placeholders enquanto isso.

## Etapa 2 — Conteúdo (`lp-conteudo.json`)
Se ainda não existir `clientes/$ARGUMENTS/referencias/direcao-de-arte.md`, rode `/7-referencias $ARGUMENTS` antes.
Defina `estilo` conforme a direção de arte. No `atelier`, preencha `galeria` (fotos reais do espaço) e `manifesto`.
Estrutura que o gerador monta (7 dobras): hero → contraste → serviços (índice ou tabela, conforme o estilo) → autoridade → depoimentos → triagem → FAQ + CTA final + rodapé.
- **Hero:** cena desejada no H1 (não o nome do serviço) + garantia/objeção no subtítulo + prova social real.
- **Triagem:** pergunta 1 = interesse (segmenta o CRM), pergunta 2 = urgência (prioriza atendimento). Use as do nicho em `assets-globais/inspiracoes-lp/nichos.md`.
- **FAQ:** as 5 maiores objeções.
- **Imagens:** salve em `clientes/$ARGUMENTS/site/img/` em WebP (converta com `ffmpeg -i foto.jpg -q:v 80 -vf scale=1200:-1 img/hero.webp`) e referencie como `img/hero.webp`.
- **Rastreamento:** preencha `rastreamento.pixelId`, `gtmId`, `webhookUrl` quando o usuário fornecer.

## Etapa 3 — Gerar e verificar
1. `node motor-local/gerar-lp.js $ARGUMENTS --oficial`
2. `node motor-local/verificar-lp.js $ARGUMENTS --oficial` — precisa sair **APROVADA** (sem placeholders, sem noindex).
3. Se a página já estiver publicada: `node motor-local/diagnosticar-lead.js <URL> $ARGUMENTS-lp` e confirme performance mobile ≥ 90.

## Etapa 4 — Publicação (o usuário executa)
Explique as opções:
- **Cloudflare Pages / Netlify** (grátis e permite uso comercial): arrastar a pasta `site/`.
- **Vercel**: `cd clientes/$ARGUMENTS/site && vercel --prod` (plano Hobby é só para uso não comercial).
- Apontar o domínio do cliente (registro CNAME) e conferir HTTPS.
Depois de publicar: teste a triagem com `?utm_source=teste&utm_campaign=teste` e confirme que o lead chegou na planilha do n8n e o evento `Lead` no Gerenciador de Eventos da Meta.

## Histórico de aprendizado
- Sempre incluir captura de UTMs nos formulários para alimentar o CRM.
