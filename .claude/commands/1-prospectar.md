---
description: Diagnostica o site de um lead, cria protótipo de LP e kit de abordagem
argument-hint: <URL-do-site> <slug>
---
# Skill 1: Prospecção com protótipo ("Cavalo de Troia")

Argumentos: `$ARGUMENTS` (URL do site atual + slug do prospect). Se não houver site, o usuário passa nome + cidade + nicho.

## Etapa 1 — Diagnóstico automático
1. `node motor-local/novo-cliente.js <slug>`
2. Se houver URL: `node motor-local/diagnosticar-lead.js <URL> <slug>`
3. Leia `clientes/<slug>/contexto/diagnostico-automatico.json`. Olhe só o print mobile (`site-atual-mobile.png`); o desktop só se precisar.

## Etapa 2 — Contexto e oferta
Preencha `clientes/<slug>/contexto/contexto-empresa.md` e `design-system.md` (cores e fontes do site atual, melhoradas).
Seção obrigatória **"3 vazamentos de dinheiro"**: escolha os 3 itens mais fortes de `oportunidadesPinas` e traduza para impacto no negócio (ex.: "quem clica no seu anúncio e não chama no WhatsApp some pra sempre — sem Pixel não dá pra mostrar o anúncio de novo").

## Etapa 3 — Protótipo da LP (`clientes/<slug>/site/index.html`)
Arquivo único, HTML + CSS inline (sem Tailwind CDN, para ficar leve), ícones em SVG inline, no máximo 2 fontes do Google Fonts.
Obrigatório:
- `<meta name="robots" content="noindex,nofollow">` e faixa discreta no topo: "Protótipo de demonstração criado pela Pinas".
- **Hero:** resultado concreto + quebra da principal objeção + CTA WhatsApp + espaço para prova social (placeholder se não houver dado real).
- **Diferenciais** em grid com hierarquia (um bloco maior, não cards todos iguais).
- **Triagem em 3 passos** antes do WhatsApp (objetivo → prazo → nome/telefone), montando a mensagem do WhatsApp com as respostas. Esse é o gancho para vender o CRM.
- Checkbox de consentimento LGPD no último passo.
- FAQ curto + rodapé com endereço/telefone reais encontrados no diagnóstico.
Verificação: abra no Playwright em 1440x900 e 390x844, salve prints em `clientes/<slug>/site/` e passe no checklist da seção 6 do `CLAUDE.md`.

## Etapa 4 — Demonstração
Não publique sozinho. Diga ao usuário o comando: `cd clientes/<slug>/site && vercel deploy` (link de preview, não `--prod`).
Alternativa sem publicar: gravar um vídeo de 15s rolando a página no mobile (Playwright `recordVideo`).

## Etapa 5 — Kit de abordagem (`clientes/<slug>/contexto/scripts-abordagem.md`)
3 mensagens (WhatsApp, Instagram DM, e-mail), cada uma com até 5 linhas:
- Primeira frase já diz quem é: "Oi, [Nome], aqui é [Seu nome] da Pinas."
- Um dado específico do diagnóstico, dito com respeito (sem "seu site é ruim").
- Oferta: "Montei um protótipo de como poderia ficar. Posso te mandar o link?"
- Sem link na primeira mensagem (melhora a entrega e a resposta).
No final: **roteiro da call** com 4 perguntas que levam de LP → Tráfego → CRM (ex.: "Hoje, quando 50 pessoas chamam no WhatsApp, onde fica registrado quem agendou e quem achou caro?").

## Histórico de aprendizado
- (regras confirmadas pelo usuário entram aqui)
