# Pinas OS

Agência autônoma usando **Claude Code** como cérebro e **scripts locais gratuitos** como músculo.
Serviços: Landing Pages → Tráfego Pago → CRM com 3 meses de acompanhamento.

## Custo real
| Item | Custo |
|---|---|
| Claude Code | Plano Claude Pro ou Max (pago) |
| Playwright, FFmpeg, Node, Python, n8n self-hosted | Grátis |
| edge-tts (locução) | Grátis, mas não oficial — pode parar. Plano B: [Piper TTS](https://github.com/rhasspy/piper) |
| Vercel (demos) | Grátis no plano Hobby (uso não comercial; para clientes pagantes use Netlify/Cloudflare Pages free) |
| PageSpeed API | Grátis com chave |

## Instalação (uma vez)
```bash
git clone <este-repositório> pinas-os && cd pinas-os

npm install
npx playwright install chromium
pip install -r requirements.txt

# FFmpeg — Windows:
winget install Gyan.FFmpeg
# Linux: sudo apt install ffmpeg -y

# Opcional
npm install -g vercel
claude mcp add playwright npx @playwright/mcp@latest

# Conferir tudo
npm run testar
```

### Chave gratuita do PageSpeed (recomendado)
Sem chave, o Google bloqueia depois de poucas consultas.
1. Acesse https://developers.google.com/speed/docs/insights/v5/get-started → "Get a Key".
2. Defina a variável de ambiente `PAGESPEED_API_KEY` (Windows: `setx PAGESPEED_API_KEY "sua-chave"`; Linux/Mac: no `~/.bashrc`).

## Como usar
Abra o terminal na pasta e rode `claude`. Depois:

| Comando | O que faz |
|---|---|
| `/1-prospectar https://site.com.br clinica-x` | Diagnostica o site, cria protótipo de LP e mensagens de abordagem |
| `/2-entregar-lp clinica-x` | LP oficial com UTMs, Pixel, GTM e triagem para o CRM |
| `/3-kit-trafego-crm clinica-x` | Plano de campanha, fundos de criativos, copy, pipeline, n8n e cronograma 90 dias |

### Scripts diretos (sem gastar tokens)
```bash
node motor-local/novo-cliente.js clinica-x
node motor-local/diagnosticar-lead.js https://site.com.br clinica-x
node motor-local/renderizar-criativos.js clinica-x
python3 motor-local/gerar-locucao.py "Texto" clientes/clinica-x/criativos/voz.mp3
python3 motor-local/gerar-locucao.py --vozes
```

## Criativos = só fundos
O renderizador gera **imagens sem texto** (foto + cores da marca + logo opcional) em feed 1080x1350, stories 1080x1920, quadrado 1080x1080 e paisagem 1200x628.
Layouts: `foto-escurecida`, `foto-faixa-marca`, `foto-dividida`, `cor-solida`, `moldura`.
A copy fica em `clientes/<slug>/criativos/copy-anuncios.md` e você coloca o texto depois no Canva ou no Gerenciador de Anúncios.
Modelo do JSON: `clientes/_modelo-padrao/criativos/lote-criativos.exemplo.json`. Fotos do cliente vão em `clientes/<slug>/criativos/fotos/`.

## Estrutura
```
CLAUDE.md                 regras que o Claude segue sempre
APRENDIZADOS.md           correções anotadas (revisar semanalmente)
.claude/commands/         as 3 skills
motor-local/              scripts gratuitos
assets-globais/           sfx, fundos e padrões de LP/criativos aprovados
clientes/_modelo-padrao/  modelo copiado para cada cliente novo
clientes/<slug>/          dados reais (fora do Git por causa da LGPD)
```

## Boas práticas
- Abordagem sempre se identifica como Pinas. Protótipos com marca de terceiros ficam com `noindex` e faixa de "protótipo".
- Quando corrigir o Claude, ele anota em `APRENDIZADOS.md`. Diga "move isso para a skill" quando a regra for definitiva.
- Faça backup da pasta `clientes/` (ela não vai para o GitHub).
