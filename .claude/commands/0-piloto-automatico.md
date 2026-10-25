---
description: Roda a prospecção inteira sozinho, do site do lead até a mensagem pronta, sem pedir aprovação entre etapas
argument-hint: <URL-do-site> <slug> | --lote [N]
---
# Skill 0: Piloto automático

Argumentos: `$ARGUMENTS`

Modo autônomo: **não pare para pedir aprovação entre etapas.** Tome decisões razoáveis, registre as suposições com `[A CONFIRMAR]` e siga. Só pare se um script falhar 2 vezes seguidas.

## Modo lote (`--lote N`, padrão 5)
1. Se existir `comercial/pipeline-prospeccao.csv` sem diagnóstico recente: `node motor-local/prospectar-lote.js --max 30`
2. Leia o `comercial/ranking-<hoje>.md` mais recente e escolha os N primeiros que ainda não têm `clientes/<slug>/site/index.html`.
3. Para cada um, execute o modo individual abaixo.
4. No fim, um resumo em tabela: empresa · pontuação · estilo escolhido · status · arquivo da mensagem.

## Modo individual (`<URL> <slug>`)
1. **Diagnóstico:** `/1-prospectar` etapa 1 (scripts).
2. **Contexto:** `/1-prospectar` etapa 2.
3. **Referências:** `/7-referencias <slug>` (versão enxuta: 1 busca no Behance, 1 na Biblioteca de Anúncios, 1 em galerias).
4. **Protótipo:** `/1-prospectar` etapa 3, usando a direção de arte. Gere os 3 estilos com `node motor-local/gerar-lp.js <slug> --todos`, verifique cada um com `verificar-lp.js clientes/<slug>/site/index-<estilo>.html`, escolha o melhor para o nicho e gere o `index.html` final com `--estilo <escolhido>`.
5. **Vídeo:** `node motor-local/gravar-demo-lp.js <slug> 15`
6. **Fundos de anúncio de amostra:** 3 fundos (`feed`) com as cores do prospect, para mostrar na call.
7. **Abordagem:** `/1-prospectar` etapa 5 (passando o texto pelo `assets-globais/anti-ia.md`).
8. **Pinas Kit:** se `PINAS_KIT_CHAVE` (ou `PINAS_KIT_URL`) estiver no `.env`, `node motor-local/pinas-kit.js enviar-prospect <slug> "protótipo pronto"`. Atualize também `comercial/pipeline-prospeccao.csv`.

## Entrega
Resumo final (curto): o que foi feito, link dos arquivos principais, as suposições `[A CONFIRMAR]` e o que o usuário precisa fazer (enviar a mensagem).
**Nunca envie mensagens ao lead nem publique nada sozinho.** O envio é sempre do usuário.
