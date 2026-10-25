// Calculadora de perda para a call de vendas: quanto o lead deixa na mesa por mês, com premissas visíveis.
// Uso: node motor-local/calcular-perda.js <slug> --ticket 3000 [--visitas 600] [--fechamento 0.2] [--conversao 0.03] [--alvo 0.045]
//   --ticket      valor médio de uma venda (obrigatório)
//   --visitas     visitas/mês no site (sem dado, use 600 e diga que é estimativa)
//   --fechamento  % dos contatos que viram venda hoje (padrão 20%)
//   --conversao   % das visitas que viram contato hoje (padrão 3%, ajustado pelos problemas do diagnóstico)
//   --alvo        % de conversão esperada com a LP nova (padrão 4,5%, conservador)
// Lê o diagnóstico (se existir) e gera clientes/<slug>/contexto/perda-estimada.html (1 página, imprimível).
const fs = require('fs');
const path = require('path');
const { brl } = require('./lib/csv');

const args = process.argv.slice(2);
const slug = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const v = (k, p) => { const i = args.indexOf(`--${k}`); return i > -1 ? Number(String(args[i + 1]).replace(',', '.')) : p; };
const ticket = v('ticket', 0);
if (!slug || !ticket) {
  console.log('Uso: node motor-local/calcular-perda.js <slug> --ticket 3000 [--visitas 600] [--fechamento 0.2] [--conversao 0.03] [--alvo 0.045]');
  process.exit(1);
}
const pct = x => `${(x * 100).toFixed(1).replace('.', ',')}%`;
const base = path.join(__dirname, '..', 'clientes', slug);
const diagArq = path.join(base, 'contexto', 'diagnostico-automatico.json');
const d = fs.existsSync(diagArq) ? JSON.parse(fs.readFileSync(diagArq, 'utf-8')) : {};
const t = d.tecnico || {};
const ps = d.pageSpeed || {};

const visitas = v('visitas', 600);
const fechamento = v('fechamento', 0.2);
const alvo = v('alvo', 0.045);
let conversao = v('conversao', 0.03);
const ajustes = [];
// Penalidades conservadoras, só pelo que o diagnóstico comprovou
if (ps.lcpSegundos > 4) { conversao *= 0.75; ajustes.push(`Carregamento lento no celular (${ps.lcpSegundos}s): −25% na conversão`); }
else if (ps.notaPerformanceMobile != null && ps.notaPerformanceMobile < 50) { conversao *= 0.85; ajustes.push(`Performance mobile ${ps.notaPerformanceMobile}/100: −15%`); }
if (d.mobile?.rolagemHorizontal || t.temViewport === false) { conversao *= 0.8; ajustes.push('Layout quebrado no celular: −20%'); }
if (t.linksWhatsapp === 0) { conversao *= 0.85; ajustes.push('Sem botão de WhatsApp: −15%'); }

const leadsHoje = visitas * conversao;
const vendasHoje = leadsHoje * fechamento;
const leadsLP = visitas * Math.max(alvo, conversao);
const remarketing = t.metaPixel === false ? leadsLP * 0.12 : 0; // visitantes que voltam por anúncio de remarketing
const fechamentoCRM = Math.min(fechamento * 1.3, 0.6);        // follow-up organizado recupera parte dos "sumiu"
const vendasNovas = (leadsLP + remarketing) * fechamentoCRM;
const perdaMes = Math.max(0, (vendasNovas - vendasHoje) * ticket);

const linhas = [
  ['Visitas por mês no site', Math.round(visitas), Math.round(visitas)],
  ['Taxa de contato', pct(conversao), pct(Math.max(alvo, conversao))],
  ['Contatos por mês', leadsHoje.toFixed(0), leadsLP.toFixed(0)],
  ['Contatos extras por remarketing (Pixel)', '0', remarketing.toFixed(0)],
  ['Taxa de fechamento', pct(fechamento), pct(fechamentoCRM)],
  ['Vendas por mês', vendasHoje.toFixed(1).replace('.', ','), vendasNovas.toFixed(1).replace('.', ',')],
  ['Faturamento por mês', brl(vendasHoje * ticket), brl(vendasNovas * ticket)]
];
const nome = (fs.existsSync(path.join(base, 'site', 'lp-conteudo.json')) && JSON.parse(fs.readFileSync(path.join(base, 'site', 'lp-conteudo.json'), 'utf-8')).marca?.nome) || slug;

const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Quanto ${nome} deixa na mesa</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
body{font-family:'Instrument Sans',system-ui,sans-serif;background:#F2EEE6;color:#1C1B18;margin:0;padding:48px 24px;line-height:1.55}
.w{max-width:820px;margin:0 auto}
small{font:12px ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em;color:#6b675e}
h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:clamp(40px,7vw,72px);line-height:.95;margin:14px 0 8px}
h1 em{color:#9A3B26}
.big{font-family:'Instrument Serif',serif;font-size:clamp(56px,11vw,120px);line-height:1;margin:28px 0 4px}
.big+p{color:#6b675e;margin:0 0 40px}
table{width:100%;border-collapse:collapse;margin:24px 0;font-size:16px}
th,td{padding:12px 8px;border-bottom:1px solid #d8d2c5;text-align:right}
th:first-child,td:first-child{text-align:left}
th{font:12px ui-monospace,Menlo,monospace;text-transform:uppercase;color:#6b675e;border-bottom:1px solid #1C1B18}
tr:last-child td{font-weight:600}
h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:28px;margin:40px 0 8px}
ul{padding-left:18px}li{margin:4px 0}
.nota{font-size:13px;color:#6b675e;border-top:1px solid #d8d2c5;padding-top:16px;margin-top:40px}
@media print{body{padding:0}}
</style></head><body><div class="w">
<small>Pinas · Estimativa para ${nome}</small>
<h1>Quanto o site atual <em>deixa na mesa</em> todo mês</h1>
<div class="big">${brl(perdaMes)}</div>
<p>por mês, ou cerca de <b>${brl(perdaMes * 12)}</b> em um ano, com as premissas abaixo.</p>
<table><tr><th></th><th>Hoje</th><th>Com LP + Pixel + CRM</th></tr>
${linhas.map(l => `<tr><td>${l[0]}</td><td>${l[1]}</td><td>${l[2]}</td></tr>`).join('')}
</table>
${ajustes.length ? `<h2>O que o diagnóstico encontrou</h2><ul>${ajustes.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
<h2>Premissas</h2>
<ul>
<li>Ticket médio: ${brl(ticket)} (informado).</li>
<li>Visitas: ${Math.round(visitas)}/mês${args.includes('--visitas') ? ' (informado)' : ' (estimativa; troque pelo número real do Analytics ou do Instagram)'}.</li>
<li>Remarketing: ${t.metaPixel === false ? '12% a mais de contatos vindos de quem visitou e voltou por anúncio' : t.metaPixel ? 'já existe Pixel, não contado' : 'sem diagnóstico do site, não contado'}.</li>
<li>CRM e follow-up: fechamento sobe 30% (de ${pct(fechamento)} para ${pct(fechamentoCRM)}) por responder rápido e não esquecer quem sumiu.</li>
</ul>
<p class="nota">Estimativa, não promessa. Os números reais dependem de preço, atendimento e mercado. Na reunião, troque cada premissa pelo dado real do cliente.</p>
</div></body></html>`;

fs.mkdirSync(path.join(base, 'contexto'), { recursive: true });
const saida = path.join(base, 'contexto', 'perda-estimada.html');
fs.writeFileSync(saida, html);
console.log(`Perda estimada: ${brl(perdaMes)}/mês (${brl(perdaMes * 12)}/ano)`);
console.log(`Arquivo: ${saida}`);
