// Relatório mensal de resultados para o cliente (Tráfego × CRM × Vendas).
// Uso: node motor-local/relatorio-mensal.js <slug> <AAAA-MM> <investimento-em-anuncios>
// Lê:  clientes/<slug>/crm/leads.csv (exportado da Planilha Mestre; colunas como em leads-modelo.csv)
// Gera: clientes/<slug>/relatorios/relatorio-<AAAA-MM>.html e .json
const fs = require('fs');
const path = require('path');

function lerCsv(texto) {
  const linhas = [];
  let campo = '', linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) {
      if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') aspas = false;
      else campo += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === ',' || ch === ';') { linha.push(campo); campo = ''; }
    else if (ch === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (ch !== '\r') campo += ch;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas.filter(l => l.some(c => c.trim()));
  return resto.map(l => Object.fromEntries(cab.map((c, i) => [c.trim().toLowerCase(), (l[i] || '').trim()])));
}

// Aceita "25/10/2026, 10:00:00", "25/10/2026" ou ISO
function mesDe(data) {
  const br = data.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}`;
  const iso = data.match(/^(\d{4})-(\d{2})/);
  return iso ? `${iso[1]}-${iso[2]}` : null;
}
const num = v => Number(String(v || '0').replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')) || 0;
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = v => `${(v * 100).toFixed(1).replace('.', ',')}%`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function agrupar(leads, chave) {
  const g = {};
  for (const l of leads) {
    const k = l[chave] || '(sem)';
    g[k] ??= { leads: 0, ganhos: 0, receita: 0 };
    g[k].leads++;
    if (/ganho|fechado|vendido/i.test(l.status)) { g[k].ganhos++; g[k].receita += num(l.valor); }
  }
  return Object.entries(g).sort((a, b) => b[1].leads - a[1].leads);
}

function gerar(slug, mes, investimento) {
  const raiz = path.join(__dirname, '..', 'clientes', slug);
  const csv = path.join(raiz, 'crm', 'leads.csv');
  if (!fs.existsSync(csv)) { console.error(`Não encontrado: ${csv}\nExporte a Planilha Mestre como CSV para esse caminho.`); process.exit(1); }
  const todos = lerCsv(fs.readFileSync(csv, 'utf-8'));
  const leads = todos.filter(l => mesDe(l.data || '') === mes);
  const ganhos = leads.filter(l => /ganho|fechado|vendido/i.test(l.status));
  const perdidos = leads.filter(l => /perdido/i.test(l.status));
  const agendados = leads.filter(l => /agendad|proposta|negocia|ganho|fechado|vendido/i.test(l.status));
  const receita = ganhos.reduce((s, l) => s + num(l.valor), 0);

  const k = {
    mes, investimento, leads: leads.length, agendados: agendados.length, vendas: ganhos.length, receita,
    cpl: leads.length ? investimento / leads.length : 0,
    cac: ganhos.length ? investimento / ganhos.length : 0,
    roas: investimento ? receita / investimento : 0,
    taxaAgendamento: leads.length ? agendados.length / leads.length : 0,
    taxaConversao: leads.length ? ganhos.length / leads.length : 0,
    semStatus: leads.filter(l => !l.status || /novo/i.test(l.status)).length,
    perdidosSemMotivo: perdidos.filter(l => !l.motivo_perda).length
  };
  const porOrigem = agrupar(leads, 'utm_source');
  const porCampanha = agrupar(leads, 'utm_campaign');
  const porInteresse = agrupar(leads, 'resposta1');
  const motivos = agrupar(perdidos, 'motivo_perda');

  const alertas = [
    k.semStatus > leads.length * 0.2 ? `${k.semStatus} leads ainda estão como "Novo lead" — a equipe precisa atualizar o CRM.` : null,
    k.perdidosSemMotivo ? `${k.perdidosSemMotivo} perdidos sem motivo registrado — sem isso não dá para otimizar.` : null,
    k.roas && k.roas < 1 ? 'ROAS abaixo de 1: o faturamento rastreado não pagou o investimento. Rever público/oferta ou atualizar valores de vendas no CRM.' : null,
    porCampanha.find(([, v]) => v.leads >= 10 && v.ganhos === 0) ? `Campanha com 10+ leads e nenhuma venda: "${porCampanha.find(([, v]) => v.leads >= 10 && v.ganhos === 0)[0]}". Avaliar pausa.` : null
  ].filter(Boolean);

  const tabela = (titulo, linhas) => linhas.length ? `<h2>${titulo}</h2><table><tr><th></th><th>Leads</th><th>Vendas</th><th>Conversão</th><th>Receita</th></tr>${linhas.map(([n, v]) => `<tr><td>${esc(n)}</td><td>${v.leads}</td><td>${v.ganhos}</td><td>${pct(v.leads ? v.ganhos / v.leads : 0)}</td><td>${brl(v.receita)}</td></tr>`).join('')}</table>` : '';
  const kpi = (rot, val, sub = '') => `<div class="kpi"><span>${rot}</span><strong>${val}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const [ano, mm] = mes.split('-');
  const nomeMes = new Date(Number(ano), Number(mm) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório ${nomeMes} — ${esc(slug)}</title>
<style>
:root{--p:#0F766E;--e:#1C1917;--s:#E7E5E4}
body{font-family:system-ui,-apple-system,sans-serif;color:var(--e);background:#FAFAF9;margin:0;padding:40px 20px;line-height:1.5}
.w{max-width:900px;margin:0 auto}
header{border-bottom:3px solid var(--p);padding-bottom:16px;margin-bottom:32px}
header small{text-transform:uppercase;letter-spacing:.08em;color:var(--p);font-weight:700}
h1{margin:4px 0 0;font-size:32px}h2{font-size:20px;margin:40px 0 12px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.kpi{background:#fff;border:1px solid var(--s);border-radius:12px;padding:18px}
.kpi span{font-size:13px;color:#57534E;display:block}.kpi strong{font-size:28px;display:block;margin:4px 0}.kpi small{color:#78716C}
.funil{display:flex;gap:6px;align-items:stretch}.funil div{flex:1;background:var(--p);color:#fff;padding:14px;border-radius:8px;text-align:center}
.funil div:nth-child(2){opacity:.8}.funil div:nth-child(3){opacity:.6}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--s);border-radius:12px;overflow:hidden;font-size:15px}
th,td{padding:10px 14px;text-align:right;border-bottom:1px solid var(--s)}th:first-child,td:first-child{text-align:left}
th{background:#F5F5F4;font-size:13px}
.alerta{background:#FEF3C7;border-left:4px solid #D97706;padding:12px 16px;border-radius:6px;margin:8px 0}
footer{margin-top:48px;font-size:13px;color:#78716C}
@media print{body{background:#fff;padding:0}}
</style></head><body><div class="w">
<header><small>Pinas · Relatório mensal</small><h1>${esc(slug)} — ${nomeMes}</h1></header>
<div class="kpis">
${kpi('Investimento em anúncios', brl(investimento))}
${kpi('Leads', k.leads, `CPL ${brl(k.cpl)}`)}
${kpi('Vendas', k.vendas, `CAC ${brl(k.cac)}`)}
${kpi('Faturamento rastreado', brl(receita), `ROAS ${k.roas.toFixed(2).replace('.', ',')}x`)}
</div>
<h2>Funil</h2>
<div class="funil"><div><b>${k.leads}</b><br>leads</div><div><b>${k.agendados}</b><br>agendados (${pct(k.taxaAgendamento)})</div><div><b>${k.vendas}</b><br>vendas (${pct(k.taxaConversao)})</div></div>
${alertas.length ? `<h2>Pontos de atenção</h2>${alertas.map(a => `<div class="alerta">${esc(a)}</div>`).join('')}` : ''}
${tabela('Por origem', porOrigem)}
${tabela('Por campanha', porCampanha)}
${tabela('Por interesse (triagem)', porInteresse)}
${motivos.length ? `<h2>Motivos de perda</h2><table><tr><th>Motivo</th><th>Qtd.</th></tr>${motivos.map(([n, v]) => `<tr><td>${esc(n)}</td><td>${v.leads}</td></tr>`).join('')}</table>` : ''}
<footer>Gerado automaticamente a partir do CRM em ${new Date().toLocaleDateString('pt-BR')}. Faturamento considera apenas vendas registradas no CRM com valor preenchido.</footer>
</div></body></html>`;

  const pasta = path.join(raiz, 'relatorios');
  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(path.join(pasta, `relatorio-${mes}.html`), html);
  fs.writeFileSync(path.join(pasta, `relatorio-${mes}.json`), JSON.stringify({ kpis: k, alertas, porOrigem, porCampanha, porInteresse, motivos }, null, 2));
  console.log(`Relatório: ${path.join(pasta, `relatorio-${mes}.html`)}`);
  console.log(`Leads ${k.leads} · Vendas ${k.vendas} · Receita ${brl(receita)} · CPL ${brl(k.cpl)} · ROAS ${k.roas.toFixed(2)}x`);
  alertas.forEach(a => console.log(` ! ${a}`));
}

const [, , slug, mes, inv] = process.argv;
if (!slug || !/^\d{4}-\d{2}$/.test(mes || '')) {
  console.log('Uso: node motor-local/relatorio-mensal.js <slug> <AAAA-MM> <investimento>\nEx.: node motor-local/relatorio-mensal.js clinica-x 2026-10 1500');
  process.exit(1);
}
gerar(slug, mes, num(inv));
