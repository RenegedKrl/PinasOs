---
description: Busca referências visuais (Behance, Meta Ads, Instagram, galerias) e define a direção de arte do cliente
argument-hint: <slug> [perfis do instagram separados por vírgula]
---
# Skill 7: Referências e direção de arte

Cliente: `$ARGUMENTS`. Objetivo: o design e a copy do cliente saírem com cara de estúdio humano, baseados em referência real do nicho, nunca no "padrão IA".

## Etapa 1 — Planejar a busca
1. Leia `clientes/<slug>/contexto/contexto-empresa.md` (nicho, cidade, posicionamento: popular, intermediário ou premium).
2. Pegue os termos do nicho em `assets-globais/referencias/fontes.md` (`grep -A1` na linha do nicho). Ajuste ao posicionamento (premium → "luxury", "editorial"; popular → "bold", "friendly").

## Etapa 2 — Coletar (scripts, sem gastar tokens)
Rode em sequência (cada um leva 1–3 min):
```
node motor-local/buscar-referencias.js <slug> behance "<termo EN 1>" --max 8
node motor-local/buscar-referencias.js <slug> behance "<termo EN 2>" --max 6
node motor-local/buscar-referencias.js <slug> meta-ads "<termo PT> <cidade>" --max 9
node motor-local/buscar-referencias.js <slug> galerias "<termo EN curto>"
```
Se o usuário passou perfis: `node motor-local/buscar-referencias.js <slug> instagram "perfil1,perfil2" --max 4`
(se pedir login, avise o usuário para rodar uma vez `node motor-local/buscar-referencias.js --login instagram`).
Se alguma fonte falhar (bloqueio, layout mudou), siga com as outras e registre no fim.

## Etapa 3 — Analisar (só os painéis)
Leia apenas `clientes/<slug>/referencias/painel-*.jpg` (cada um é uma grade de até 9 referências). Não abra as capturas individuais, a não ser para tirar uma dúvida específica.
Para `sites`, use `jq '.itens[] | {titulo, estilo}'` no `indice.json` para ver fontes e cores reais.

## Etapa 4 — Escrever `clientes/<slug>/referencias/direcao-de-arte.md`
1. **O que o mercado faz** (3–5 bullets): padrões repetidos nos anúncios e sites do nicho. Isso é o que vamos EVITAR copiar, ou fazer melhor.
2. **O que as melhores referências fazem diferente** (3–5 bullets, citando o nº da referência no painel): proporção tipográfica, uso de foto, cor, ritmo, tom de voz.
3. **Direção escolhida:**
   - Estilo de LP: `editorial`, `suico` ou `atelier` (com o motivo em 1 linha).
   - Par tipográfico (Google Fonts) + 3–4 cores em hex (primária, escura, clara, acento).
   - Tipo de foto a pedir ao cliente (ex.: "mãos trabalhando, luz natural, sem pose").
   - Layouts de criativo (`recorte-editorial`, `duotone`, `foto-escurecida`…).
   - 3 ângulos de anúncio que os concorrentes NÃO estão usando.
4. **Anúncios que parecem estar funcionando** (ativos há muito tempo): o gancho de cada um em 1 linha.

## Etapa 5 — Aplicar
- Atualize `clientes/<slug>/contexto/design-system.md` com cores, fontes e tom.
- Se já existir `site/lp-conteudo.json`: ajuste `estilo`, `marca.fonteTitulo`, `marca.fonteTexto` e cores, e rode `node motor-local/gerar-lp.js <slug>`.
- Confira tudo contra `assets-globais/anti-ia.md`.

## Regras
- Referência é direção, não cópia: nunca reproduza layout, texto ou imagem de terceiros.
- Nenhuma imagem coletada vai para material do cliente.
- A pasta `referencias/` fica só na máquina (não vai para o Git).
