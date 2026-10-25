---
description: Constrói a Landing Page oficial do cliente com UTMs, Pixel e triagem
argument-hint: <slug>
---
# Skill 2: Landing Page oficial (PageSpeed 90+)

Cliente: `$ARGUMENTS`

## Etapa 1 — Contexto
1. Leia `clientes/$ARGUMENTS/contexto/contexto-empresa.md` e `design-system.md`.
2. Se existir protótipo em `clientes/$ARGUMENTS/site/index.html`, parta dele.
3. Consulte `assets-globais/inspiracoes-lp/` (só os `.md` relevantes ao nicho).
4. Liste ao usuário o que falta de dado real (depoimentos, fotos, números, Pixel ID, GTM ID, número de WhatsApp). Use placeholders visíveis `[...]` e siga.

## Etapa 2 — Estrutura (7 dobras)
1. **Hero:** promessa específica + prova social + CTA, tudo visível no mobile sem rolar.
2. **Contraste:** o jeito frustrante de hoje vs. o serviço do cliente.
3. **Serviços/benefícios** em grid com hierarquia.
4. **Autoridade:** quem atende, estrutura, certificações (só reais).
5. **Prova social:** depoimentos que quebram objeção de preço, tempo e confiança.
6. **Triagem:** quiz de 3 passos → POST no webhook (n8n) → abre WhatsApp com a mensagem preenchida.
7. **FAQ (5 objeções) + rodapé** com aviso de privacidade.

## Etapa 3 — Código
- HTML + CSS próprios, JS mínimo e sem dependências. Imagens em WebP com `width`/`height` e `loading="lazy"` (exceto a do hero).
- Bloco de configuração no topo do script: `PIXEL_ID`, `GTM_ID`, `WEBHOOK_URL`, `WHATSAPP` — vazio = desativado sem erro.
- Captura de UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) + `fbclid`/`gclid`, guardadas em `sessionStorage` e enviadas no webhook.
- Eventos: `fbq('track','Lead')` e `dataLayer.push({event:'lead'})` ao concluir a triagem; `Contact` ao clicar no WhatsApp.
- Remover `noindex` e a faixa de protótipo na versão oficial.

## Etapa 4 — Testes (Playwright)
- Sem rolagem horizontal em 390px; prints desktop/mobile em `clientes/$ARGUMENTS/site/`.
- Simule a triagem completa e confira se o link `wa.me` gerado contém as respostas e as UTMs de uma URL de teste `?utm_source=teste`.
- Se houver URL pública: rode `node motor-local/diagnosticar-lead.js <URL> $ARGUMENTS-lp` e confira nota ≥ 90.

## Histórico de aprendizado
- Sempre incluir captura de UTMs nos formulários para alimentar o CRM.
