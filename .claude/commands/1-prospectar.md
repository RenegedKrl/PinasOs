---
description: Diagnostica o site de um lead, cria protótipo de LP e kit de abordagem
argument-hint: <URL-do-site> <slug> (ou: "<nome>, <cidade>, <nicho>" <slug>)
---
# Skill 1: Prospecção com protótipo ("Cavalo de Troia")

Argumentos: `$ARGUMENTS`. Se não houver site, o usuário passa nome + cidade + nicho.

## Etapa 1 — Diagnóstico automático
1. `node motor-local/novo-cliente.js <slug>`
2. Se houver URL: `node motor-local/diagnosticar-lead.js <URL> <slug>` — leia só a saída do terminal e, se precisar, `jq '.tecnico, .pageSpeed' clientes/<slug>/contexto/diagnostico-automatico.json`.
3. Olhe só `site-atual-mobile.png` para captar cores/estilo/marca. Não leia o desktop sem necessidade.

## Etapa 2 — Contexto
1. Leia a seção do nicho em `assets-globais/inspiracoes-lp/nichos.md` (só a seção do nicho, use `grep -A 12`).
2. Preencha `clientes/<slug>/contexto/contexto-empresa.md` e `design-system.md`. Suposições com `[A CONFIRMAR]`.
3. Seção **"3 vazamentos de dinheiro"**: os 3 itens mais fortes de `oportunidadesPinas`, traduzidos para impacto no negócio, em linguagem de dono de empresa.

## Etapa 3 — Protótipo da LP (via gerador, economiza tokens)
1. Copie `clientes/_modelo-padrao/site/lp-conteudo.exemplo.json` para `clientes/<slug>/site/lp-conteudo.json` e reescreva **só o conteúdo** (cores reais da marca, textos, triagem do nicho, FAQ).
   - Dados que você não tem (depoimentos, números, nome do responsável): mantenha `[PLACEHOLDER]` visível. Nunca invente.
   - Serviços: 5 itens (o 1º vira o destaque). Contraste: 3 × 3 itens paralelos.
   - Textos podem usar `**negrito**`.
2. `node motor-local/gerar-lp.js <slug>` (sem `--oficial` → sai com noindex + faixa de protótipo).
3. `node motor-local/verificar-lp.js <slug>` — corrija o JSON e gere de novo até aprovar (máx. 3 rodadas).
4. Só se o usuário pedir ajuste visual fino, edite o `index.html` gerado diretamente.

## Etapa 4 — Demonstração
- Vídeo para mandar ao prospect sem publicar nada: `node motor-local/gravar-demo-lp.js <slug> 15` → `site/demo-mobile.mp4`.
- Link (opcional): diga ao usuário rodar `cd clientes/<slug>/site && vercel deploy` (preview, não `--prod`). Não publique sozinho.

## Etapa 5 — Kit de abordagem (`clientes/<slug>/contexto/scripts-abordagem.md`)
3 mensagens (WhatsApp, Instagram DM, e-mail), até 5 linhas cada:
- Primeira frase já diz quem é: "Oi, [Nome], aqui é [Seu nome], da Pinas."
- Um dado específico do diagnóstico, com respeito (nunca "seu site é ruim").
- Oferta: "Montei uma prévia de como a página de vocês poderia ficar. Posso te mandar o vídeo?"
- Sem link na primeira mensagem.
- Follow-up de 3 e 7 dias (curtos, sem cobrança).
No final, aponte para `comercial/roteiro-call.md`.

## Etapa 6 — Registro
Acrescente uma linha em `comercial/pipeline-prospeccao.csv` (crie a partir do `.modelo.csv` se não existir) com status `protótipo pronto`.

## Histórico de aprendizado
- (regras confirmadas pelo usuário entram aqui)
