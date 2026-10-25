// Formulário de briefing/onboarding para o CLIENTE preencher (substitui a reunião de coleta de materiais).
// Uso: node motor-local/gerar-briefing.js <slug> [--nome "Nome da empresa"] [--webhook URL]
// Saída: clientes/<slug>/briefing/index.html (publique junto com o site ou mande o arquivo).
// Ao enviar: manda para o webhook (n8n) se houver e abre o WhatsApp da Pinas com o resumo.
// Respostas que chegarem: salve em clientes/<slug>/contexto/briefing-respostas.md e peça ao Claude para atualizar o contexto.
require('./lib/env');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const slug = args.find((a, i) => !a.startsWith('--') && !['--webhook', '--nome'].includes(args[i - 1]));
const iN = args.indexOf('--nome');
const iW = args.indexOf('--webhook');
const webhook = iW > -1 ? args[iW + 1] : (process.env.BRIEFING_WEBHOOK || '');
const whatsPinas = String(process.env.PINAS_WHATSAPP || '').replace(/\D/g, '');
if (!slug) { console.log('Uso: node motor-local/gerar-briefing.js <slug> [--webhook URL]'); process.exit(1); }

const base = path.join(__dirname, '..', 'clientes', slug);
const lp = path.join(base, 'site', 'lp-conteudo.json');
const nome = iN > -1 ? args[iN + 1] : fs.existsSync(lp) ? JSON.parse(fs.readFileSync(lp, 'utf-8')).marca?.nome || slug : slug;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// [chave, rótulo, tipo, ajuda]
const BLOCOS = [
  ['O negócio', [
    ['servicos', 'Quais serviços vocês vendem? Do mais lucrativo para o menos.', 'area', 'Ex.: implante (R$ 3.500), lentes (R$ 1.200 por dente)…'],
    ['ticket', 'Quanto custa, em média, uma venda?', 'texto', ''],
    ['publico', 'Quem é o cliente ideal? Idade, bairro, o que ele costuma dizer quando chega.', 'area', ''],
    ['diferenciais', 'Por que as pessoas escolhem vocês e não o concorrente? Fatos, não adjetivos.', 'area', 'Ex.: estacionamento próprio, atende sábado, dentista com 15 anos de implante…'],
    ['objecoes', 'Quais são as 3 dúvidas ou objeções que mais aparecem?', 'area', 'Ex.: "dói?", "parcela?", "quanto tempo leva?"'],
    ['nao_fazemos', 'O que vocês NÃO fazem ou não querem atender?', 'texto', '']
  ]],
  ['Prova e autoridade', [
    ['responsavel', 'Quem atende? Nome, formação, registro profissional e tempo de experiência.', 'area', ''],
    ['numeros', 'Números reais que podemos usar (clientes atendidos, anos, nota no Google…).', 'texto', ''],
    ['depoimentos', 'Cole 3 depoimentos reais (com autorização de uso).', 'area', 'Podem ser prints do Google ou do WhatsApp em um link do Drive.'],
    ['links_materiais', 'Link do Drive/Dropbox com logo, fotos da equipe, do espaço e de trabalhos.', 'texto', 'Fotos de celular servem. Quanto mais real, melhor.']
  ]],
  ['Atendimento', [
    ['whatsapp', 'WhatsApp que vai receber os contatos', 'texto', ''],
    ['quem_responde', 'Quem responde os contatos hoje e em quanto tempo, em média?', 'texto', ''],
    ['horario', 'Horário de atendimento e endereço completo', 'area', ''],
    ['crm_hoje', 'Onde vocês registram os contatos hoje?', 'opcoes', 'Em lugar nenhum|Planilha|Caderno/agenda|Sistema/CRM'],
    ['verba', 'Quanto pretendem investir em anúncios por mês?', 'opcoes', 'Até R$ 1.000|R$ 1.000 a 3.000|R$ 3.000 a 6.000|Mais de R$ 6.000']
  ]],
  ['Acessos (marque o que já fez)', [
    ['acesso_meta', 'Adicionei a Pinas como parceira no Gerenciador de Negócios da Meta', 'check', ''],
    ['acesso_pagamento', 'Cadastrei a forma de pagamento na conta de anúncios', 'check', ''],
    ['acesso_google', 'Dei acesso ao Google Ads / Meu Negócio (se usar)', 'check', ''],
    ['acesso_dominio', 'Sei quem cuida do domínio do site (ou passei o acesso)', 'check', ''],
    ['cnpj', 'CNPJ e e-mail para o aviso de privacidade (LGPD)', 'texto', '']
  ]]
];

const campo = ([k, r, t, a]) => {
  if (t === 'check') return `<label class="ck"><input type="checkbox" name="${k}"> <span>${esc(r)}</span></label>`;
  const ajuda = a && t !== 'opcoes' ? `<small>${esc(a)}</small>` : '';
  if (t === 'opcoes') return `<fieldset><legend>${esc(r)}</legend>${a.split('|').map(o => `<label class="op"><input type="radio" name="${k}" value="${esc(o)}"> ${esc(o)}</label>`).join('')}</fieldset>`;
  return `<label class="c"><span>${esc(r)}</span>${ajuda}${t === 'area' ? `<textarea name="${k}" rows="3"></textarea>` : `<input name="${k}">`}</label>`;
};

const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Briefing · ${esc(nome)}</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;font-family:'Instrument Sans',system-ui,sans-serif;background:#F2EEE6;color:#1C1B18;font-size:17px;line-height:1.55}
.w{max-width:720px;margin:0 auto;padding:48px 20px 96px}
.rot{font:12px ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em;color:#6b675e}
h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(40px,8vw,64px);line-height:.98;margin:12px 0 14px}h1 em{color:#9A3B26}
.intro{color:#5d5950;margin-bottom:40px}
h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:30px;border-top:1px solid #1C1B18;padding-top:12px;margin:48px 0 18px}
.c{display:block;margin-bottom:24px}.c span{display:block;font-weight:600}.c small{display:block;color:#6b675e;font-size:14px;margin-top:2px}
input:not([type=checkbox]):not([type=radio]),textarea{width:100%;font:inherit;background:#fffdf8;border:1px solid #cfc8ba;padding:12px 14px;margin-top:8px;border-radius:0}
input:focus,textarea:focus{outline:2px solid #9A3B26;outline-offset:-1px}
fieldset{border:0;padding:0;margin:0 0 24px}legend{font-weight:600;margin-bottom:8px}
.op{display:block;padding:10px 0;border-bottom:1px solid #ddd6c9}
.ck{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #ddd6c9;align-items:flex-start}.ck input,.op input{accent-color:#9A3B26;width:18px;height:18px;margin-top:3px}
button{margin-top:36px;width:100%;background:#1C1B18;color:#F2EEE6;border:0;font:600 17px 'Instrument Sans',sans-serif;padding:20px;cursor:pointer}
button:hover{background:#9A3B26}
.salvo{font-size:14px;color:#6b675e;margin-top:10px;text-align:center}
</style></head><body><main class="w">
<span class="rot">Pinas · Briefing</span>
<h1>Conta pra gente sobre a <em>${esc(nome)}</em></h1>
<p class="intro">Leva uns 15 minutos. Escreva do seu jeito, sem se preocupar com texto bonito: a gente cuida disso. O que você escrever aqui fica salvo neste navegador até você enviar.</p>
<form id="f">
${BLOCOS.map(([t, cs]) => `<h2>${esc(t)}</h2>${cs.map(campo).join('')}`).join('\n')}
<button type="submit">Enviar briefing</button>
<p class="salvo" id="salvo"></p>
</form></main>
<script>
const WEBHOOK = ${JSON.stringify(webhook)}, WHATS = ${JSON.stringify(whatsPinas)}, CLIENTE = ${JSON.stringify(slug)};
const f = document.getElementById('f'), K = 'briefing-' + CLIENTE;
const dados = () => { const o = {}; new FormData(f).forEach((v, k) => { o[k] = v; }); f.querySelectorAll('input[type=checkbox]').forEach(c => { o[c.name] = c.checked ? 'sim' : 'não'; }); return o; };
try { const s = JSON.parse(localStorage.getItem(K) || '{}'); Object.entries(s).forEach(([k, v]) => { const el = f.elements[k]; if (!el) return; if (el.type === 'checkbox') el.checked = v === 'sim'; else if (el.length && el[0] && el[0].type === 'radio') [...el].forEach(r => r.checked = r.value === v); else el.value = v; }); } catch (e) {}
f.addEventListener('input', () => { try { localStorage.setItem(K, JSON.stringify(dados())); document.getElementById('salvo').textContent = 'Rascunho salvo neste navegador.'; } catch (e) {} });
f.addEventListener('submit', e => {
  e.preventDefault();
  const d = dados(); d.cliente = CLIENTE; d.data = new Date().toISOString();
  if (WEBHOOK) navigator.sendBeacon(WEBHOOK, new Blob([JSON.stringify({ tipo: 'briefing', ...d })], { type: 'text/plain' }));
  const rotulos = {}; f.querySelectorAll('label.c, fieldset, label.ck').forEach(l => { const i = l.querySelector('[name]'); if (i) rotulos[i.name] = (l.querySelector('span,legend') || l).innerText.trim(); });
  const txt = 'Briefing ' + CLIENTE + '\\n\\n' + Object.entries(d).filter(([k, v]) => v && rotulos[k]).map(([k, v]) => '*' + rotulos[k] + '*\\n' + v).join('\\n\\n');
  document.getElementById('salvo').textContent = 'Enviado. Obrigado!';
  if (WHATS) location.href = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(txt.slice(0, 6000));
  else { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); a.download = 'briefing-' + CLIENTE + '.txt'; a.click(); }
});
</script></body></html>`;

const pasta = path.join(base, 'briefing');
fs.mkdirSync(pasta, { recursive: true });
fs.writeFileSync(path.join(pasta, 'index.html'), html);
console.log(`Briefing: ${path.join(pasta, 'index.html')}`);
if (!whatsPinas && !webhook) console.warn('Aviso: defina PINAS_WHATSAPP no .env (ou --webhook) para receber as respostas. Sem isso, o cliente baixa um .txt e manda para você.');
