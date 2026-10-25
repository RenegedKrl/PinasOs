# Pinas OS

Agência autônoma usando **Claude Code** como cérebro e **scripts locais gratuitos** como músculo.
Serviços: Landing Pages → Tráfego Pago → CRM com 3 meses de acompanhamento.

Veja em `exemplos/` uma LP, fundos de criativos e um relatório gerados pelo sistema.

---

## 1. Custo real
| Item | Custo |
|---|---|
| Claude Code | Plano Claude Pro ou Max (pago) |
| Node, Python, Playwright, FFmpeg | Grátis |
| edge-tts (locução) | Grátis, não oficial — pode parar. Plano B: [Piper TTS](https://github.com/rhasspy/piper) |
| n8n | Grátis self-hosted (ou trial na nuvem) |
| Hospedagem das LPs | Grátis: Cloudflare Pages ou Netlify (Vercel Hobby só para uso não comercial) |
| PageSpeed API | Grátis com chave |

## 2. Instalação (uma vez)
Precisa de: [Node.js 18+](https://nodejs.org), [Python 3.10+](https://python.org), [Git](https://git-scm.com) e o [Claude Code](https://code.claude.com/docs).

```bash
git clone https://github.com/RenegedKrl/PinasOs.git pinas-os
cd pinas-os
git checkout ccr-72f7fcc8-ppif74

npm install
npx playwright install chromium
pip install -r requirements.txt

# FFmpeg — Windows:
winget install Gyan.FFmpeg
# Linux: sudo apt install ffmpeg -y   ·   Mac: brew install ffmpeg

npm run sfx      # gera os efeitos sonoros (já vêm prontos, só se apagar)
npm run testar   # confere se está tudo certo
```

### Chave gratuita do PageSpeed (recomendado)
Sem chave o Google bloqueia rápido.
1. https://developers.google.com/speed/docs/insights/v5/get-started → **Get a Key**.
2. Windows: `setx PAGESPEED_API_KEY "sua-chave"` (feche e abra o terminal). Linux/Mac: `export PAGESPEED_API_KEY=...` no `~/.bashrc`.

### No Windows
Use `python` no lugar de `python3` nos comandos.

## 3. Comandos do Claude Code
Na pasta do projeto, rode `claude` e use:

| Comando | O que faz |
|---|---|
| `/1-prospectar https://site.com.br clinica-x` | Diagnóstico + protótipo de LP + vídeo demo + mensagens de abordagem |
| `/5-proposta clinica-x maquina` | Proposta e contrato preenchidos |
| `/2-entregar-lp clinica-x` | LP oficial com UTMs, Pixel, GTM e triagem ligada ao CRM |
| `/3-kit-trafego-crm clinica-x` | Plano de campanha, copy, fundos, vídeo, pipeline, n8n, cronograma |
| `/4-relatorio-mensal clinica-x 2026-11 1500` | Relatório do mês + análise para a reunião |
| `/6-salvar-padrao "hero da clinica-x"` | Guarda o que funcionou para reutilizar |

## 4. Scripts (rodam sem gastar tokens)
```bash
node motor-local/novo-cliente.js clinica-x
node motor-local/diagnosticar-lead.js https://site.com.br clinica-x
node motor-local/gerar-lp.js clinica-x [--oficial]
node motor-local/verificar-lp.js clinica-x [--oficial]
node motor-local/gravar-demo-lp.js clinica-x 15
node motor-local/renderizar-criativos.js clinica-x
python3 motor-local/gerar-locucao.py --arquivo roteiro.txt saida.mp3
python3 motor-local/gerar-locucao.py --vozes
node motor-local/renderizar-motion.js clinica-x
node motor-local/relatorio-mensal.js clinica-x 2026-11 1500
```

### Como cada um economiza tokens
- **LP:** o Claude escreve só um JSON com os textos (`lp-conteudo.json`) e o `gerar-lp.js` monta a página inteira (HTML, CSS, triagem, UTMs, Pixel, GTM, webhook, LGPD). ~10× menos tokens que escrever o HTML.
- **Verificação:** `verificar-lp.js` testa rolagem no celular, CTAs, links, LGPD, frases proibidas e tira os prints — o Claude não precisa abrir imagens.
- **Criativos:** só fundos, sem texto. O texto vai em `copy-anuncios.md` e você coloca no Canva/Gerenciador.
- **Relatório:** o script calcula CPL, CAC, ROAS e funil; o Claude só escreve a análise.

## 5. Rotina
**Prospecção (manhã)** — escolha 5 empresas no Google Maps e rode `/1-prospectar` em cada uma. Mande a mensagem de `scripts-abordagem.md` e, quando responderem, o vídeo `demo-mobile.mp4`.

**Call** — siga `comercial/roteiro-call.md`. Fechou? `/5-proposta`.

**Onboarding** — checklist em `comercial/onboarding-checklist.md`. Depois `/2-entregar-lp` e `/3-kit-trafego-crm`.

**Todo mês** — exporte a planilha de leads para `clientes/<slug>/crm/leads.csv` e rode `/4-relatorio-mensal`.

**Toda semana** — revise `APRENDIZADOS.md` e mova as regras boas para as skills.

## 6. Montando o CRM gratuito (n8n + Google Sheets)
1. Crie uma Planilha Google com uma aba `Leads` e o cabeçalho de `clientes/_modelo-padrao/crm/leads-modelo.csv`.
2. n8n: rode local com `npx n8n` (ou Docker) — para receber leads de verdade ele precisa de URL pública (n8n Cloud, VPS barata ou túnel Cloudflare gratuito).
3. Importe `motor-local/modelos/n8n-workflow-leads.json`, conecte o Google Sheets e escolha a API de WhatsApp do alerta.
4. Ative o workflow e cole a URL do webhook em `rastreamento.webhookUrl` do `lp-conteudo.json`. Gere a LP de novo.

## 7. Estrutura
```
CLAUDE.md                     regras que o Claude segue sempre
APRENDIZADOS.md               correções anotadas (revisar semanalmente)
.claude/commands/             as 6 skills
.claude/settings.json         permissões para os scripts rodarem sem pedir confirmação
motor-local/                  scripts gratuitos
motor-local/modelos/          workflow n8n
assets-globais/sfx/           efeitos sonoros (gerados por FFmpeg, sem direitos autorais)
assets-globais/fundos/        fotos genéricas para criativos
assets-globais/inspiracoes-*  biblioteca de nichos e padrões aprovados
comercial/                    preços, proposta, contrato, roteiro de call, onboarding
clientes/_modelo-padrao/      modelo copiado para cada cliente
clientes/<slug>/              dados reais (fora do Git por causa da LGPD — faça backup!)
exemplos/                     saídas de demonstração
```

## 8. Regras que o sistema segue
- Abordagem sempre se identifica como Pinas. Protótipos com a marca de terceiros ficam com `noindex` e faixa de "protótipo".
- Nunca inventa depoimento, nota ou número — usa `[PLACEHOLDER]` até você fornecer o real.
- Respeita restrições dos conselhos (CFO, CFM, OAB etc.) — ver `assets-globais/inspiracoes-lp/nichos.md`.
- O contrato é um modelo: revise com um advogado.
