# Pinas OS

Agência autônoma usando **Claude Code** como cérebro e **scripts locais gratuitos** como músculo.
Serviços: Landing Pages → Tráfego Pago → CRM com 3 meses de acompanhamento.

Veja em `exemplos/` as LPs nos 3 estilos (com prints de desktop e celular), um fundo de criativo e um relatório.

**Princípio do projeto:** nada pode parecer feito por IA. Toda entrega passa pelo `assets-globais/anti-ia.md` e parte de referências reais (Behance, Biblioteca de Anúncios, Instagram, galerias).

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
cp .env.exemplo .env   # (Windows: copy .env.exemplo .env) e preencha
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
| `/0-piloto-automatico https://site.com.br clinica-x` | Faz a prospecção inteira sozinho, sem pedir aprovação entre etapas |
| `/0-piloto-automatico --lote 5` | Pega os 5 melhores do ranking e prospecta todos |
| `/7-referencias clinica-x` | Busca referências e define a direção de arte |
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
node motor-local/buscar-referencias.js clinica-x behance "dental clinic website"
node motor-local/buscar-referencias.js clinica-x meta-ads "implante dentário campinas"
node motor-local/buscar-referencias.js clinica-x instagram "perfil1,perfil2"
node motor-local/buscar-referencias.js clinica-x galerias "dentist"
node motor-local/buscar-referencias.js --login instagram        # 1x, para o Instagram
node motor-local/pinas-kit.js importar export-do-kit.csv
node motor-local/prospectar-lote.js --max 20                     # diagnostica e ranqueia
node motor-local/pinas-kit.js enviar-prospect clinica-x
node motor-local/gerar-lp.js clinica-x --todos                   # 3 estilos para comparar
node motor-local/gerar-lp.js clinica-x [--oficial] [--estilo atelier]
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

## 5. Estilos de LP
| Estilo | Visual | Nichos |
|---|---|---|
| `editorial` | Revista: serifa enorme com itálico, seções numeradas, serviços como índice, papel com grão | odonto, estética, advocacia, psicologia, gastronomia |
| `suico` | Grid suíço: sans pesada, serviços em tabela, faixa sólida da marca, números gigantes | energia solar, imobiliária, engenharia, academia, B2B |
| `atelier` | Luxo silencioso: foto em tela cheia, serifa clássica, fundo escuro com grão, galeria horizontal | estética premium, alto padrão, arquitetura, spa |

Os três têm a mesma triagem, UTMs, Pixel, GTM, webhook e LGPD. O verificador também barra texto com cara de IA (travessões demais, "jornada", "transforme", emojis).

## 6. Referências (Behance, Meta Ads, Instagram)
O `buscar-referencias.js` abre os sites num navegador invisível, tira prints e monta **painéis** (grade de 9 imagens) para o Claude analisar gastando pouco token. Resultado: `clientes/<slug>/referencias/direcao-de-arte.md`.
- **Instagram** exige login: rode `--login instagram` uma vez (abre uma janela, você entra, fecha). A sessão fica em `.perfil-navegador/`, só no seu computador.
- Use poucas buscas por dia. Automação em massa pode fazer o Instagram/Facebook bloquear a conta. O script já faz pausas.
- Os sites mudam o layout de vez em quando; se uma fonte parar de funcionar, me avise que eu ajusto.
- Referência é direção, nunca cópia.

## 7. Pinas Kit
Integrado pela API pública de captação do Pinas Kit (a mesma do widget), sem senha. Veja `integracoes/pinas-kit.md`.
- **LPs dos clientes:** `rastreamento.pinasKitChave` no JSON → cada lead da triagem cai em Contatos com a origem (Meta Ads, Google Ads…).
- **Seus prospects:** `PINAS_KIT_CHAVE` no `.env` → `node motor-local/pinas-kit.js enviar-lote`.
- **Importar lista:** exporte Contatos em CSV → `pinas-kit.js importar`.

## 8. Gestão da agência
| Ferramenta | Para quê |
|---|---|
| `/8-rotina` ou `npm run agenda` | Agenda do dia: follow-ups atrasados, cobranças, renovações, relatórios pendentes |
| `npm run painel` | `painel.html`: receita recorrente, funil, renovações, saúde dos clientes |
| `npm run auditar` | Toda segunda: confere se as LPs dos clientes estão no ar, com Pixel, GTM e WhatsApp |
| `node motor-local/calcular-perda.js <slug> --ticket 3000` | Página com quanto o lead perde por mês, para mostrar na call |
| `node motor-local/gerar-briefing.js <slug>` | Formulário para o cliente mandar materiais e informações sem reunião |
| `node motor-local/gerar-documento.js <arquivo.md>` | Proposta, contrato e análises viram documento bonito para PDF |
| `npm run backup` | Backup de `clientes/`, `comercial/` e `.env` (fora do Git) |

Clientes fechados entram em `comercial/financeiro.csv` (copie de `financeiro.modelo.csv`). O pipeline de prospecção fica em `comercial/pipeline-prospeccao.csv`, com status: novo → diagnosticado → protótipo pronto → mensagem enviada → follow-up 1 → follow-up 2 → respondeu → call marcada → proposta enviada → negociando → fechado/perdido.

## 9. Rotina
**Prospecção (manhã)** — importe a lista do Pinas Kit (`pinas-kit.js importar`), rode `/0-piloto-automatico --lote 5` e vá tomar café. Mande a mensagem de `scripts-abordagem.md` e, quando responderem, o vídeo `demo-mobile.mp4`.

**Call** — siga `comercial/roteiro-call.md`. Fechou? `/5-proposta`.

**Onboarding** — checklist em `comercial/onboarding-checklist.md`. Depois `/2-entregar-lp` e `/3-kit-trafego-crm`.

**Todo dia** — `/8-rotina`: o Claude monta a agenda e deixa as mensagens prontas.

**Todo mês** — exporte a planilha de leads para `clientes/<slug>/crm/leads.csv` e rode `/4-relatorio-mensal`.

**Toda semana** — revise `APRENDIZADOS.md` e mova as regras boas para as skills.

## 10. Montando o CRM gratuito (n8n + Google Sheets)
1. Crie uma Planilha Google com uma aba `Leads` e o cabeçalho de `clientes/_modelo-padrao/crm/leads-modelo.csv`.
2. n8n: rode local com `npx n8n` (ou Docker) — para receber leads de verdade ele precisa de URL pública (n8n Cloud, VPS barata ou túnel Cloudflare gratuito).
3. Importe `motor-local/modelos/n8n-workflow-leads.json`, conecte o Google Sheets e escolha a API de WhatsApp do alerta.
4. Ative o workflow e cole a URL do webhook em `rastreamento.webhookUrl` do `lp-conteudo.json`. Gere a LP de novo.

## 11. Estrutura
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
integracoes/                  Pinas Kit
assets-globais/anti-ia.md     regras para nada parecer IA
assets-globais/referencias/   onde e o que buscar por nicho
motor-local/lp/estilos/       os 3 estilos de LP
comercial/                    preços, proposta, contrato, roteiro de call, onboarding
clientes/_modelo-padrao/      modelo copiado para cada cliente
clientes/<slug>/              dados reais (fora do Git por causa da LGPD — faça backup!)
exemplos/                     saídas de demonstração
```

## 12. Regras que o sistema segue
- Abordagem sempre se identifica como Pinas. Protótipos com a marca de terceiros ficam com `noindex` e faixa de "protótipo".
- Nunca inventa depoimento, nota ou número — usa `[PLACEHOLDER]` até você fornecer o real.
- Respeita restrições dos conselhos (CFO, CFM, OAB etc.) — ver `assets-globais/inspiracoes-lp/nichos.md`.
- O contrato é um modelo: revise com um advogado.
