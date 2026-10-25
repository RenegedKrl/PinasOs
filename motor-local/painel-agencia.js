// Painel da agência em uma página: funil de prospecção, receita recorrente, renovações e saúde dos clientes.
// Uso: node motor-local/painel-agencia.js   →  painel.html na raiz (abra no navegador; fica fora do Git)
const fs = require('fs');
const path = require('path');
const { lerArquivo, data, dias, num, brl } = require('./lib/csv');

const RAIZ = path.join(__dirname, '..');
const esc = s => String(s ?? '').replace(/[&<]/g, c => (c === '&' ? '&amp;' : '&lt;'));
const pipe = lerArquivo(path.join(RAIZ, 'comercial', 'pipeline-prospeccao.csv'));
const fin = lerArquivo(path.join(RAIZ, 'comercial', 'financeiro.csv'));
const hoje = new Date();

const ETAPAS = ['novo', 'diagnosticado', 'protótipo pronto', 'mensagem enviada', 'follow-up 1', 'follow-up 2', 'respondeu', 'call marcada', 'proposta enviada', 'negociando', 'fechado', 'perdido'];
const funil = ETAPAS.map(e => [e, pipe.filter(l => (l.status || 'novo').toLowerCase() === e).length]);
const outros = pipe.length - funil.reduce((s, [, n]) => s + n, 0);
const maxF = Math.max(1, ...funil.map(([, n]) => n));

const ativos = fin.filter(c => (c.status || '').toLowerCase() === 'ativo');
const mrr = ativos.reduce((s, c) => s + num(c.mensal), 0);
const mesAtual = hoje.toISOString().slice(0, 7);
const setupMes = fin.filter(c => (c.inicio || '').startsWith(mesAtual) || (data(c.inicio) && data(c.inicio).toISOString().slice(0, 7) === mesAtual)).reduce((s, c) => s + num(c.setup), 0);
const vencendo = ativos.filter(c => data(c.fim) && dias(hoje, data(c.fim)) <= 45 && dias(hoje, data(c.fim)) >= 0);
const enviados = pipe.filter(l => !/novo|diagnosticado|protótipo pronto/.test((l.status || 'novo').toLowerCase())).length;
const fechados = pipe.filter(l => /fechado/.test((l.status || '').toLowerCase())).length;

// Saúde de cada cliente ativo: última auditoria e último relatório
const saude = ativos.map(c => {
  const dir = path.join(RAIZ, 'clientes', c.slug || '');
  const rels = fs.existsSync(path.join(dir, 'relatorios')) ? fs.readdirSync(path.join(dir, 'relatorios')).filter(f => /^relatorio-.*\.html$/.test(f)).sort() : [];
  const auds = fs.existsSync(path.join(dir, 'auditorias')) ? fs.readdirSync(path.join(dir, 'auditorias')).sort() : [];
  let alerta = '';
  if (auds.length) {
    const j = path.join(dir, 'auditorias', auds.at(-1), 'resultado.json');
    if (fs.existsSync(j)) alerta = JSON.parse(fs.readFileSync(j, 'utf-8')).alertas?.join('; ') || 'ok';
  }
  return { c, ultimoRel: rels.at(-1)?.replace(/relatorio-|\.html/g, '') || '—', ultimaAud: auds.at(-1) || '—', alerta: alerta || (auds.length ? 'ok' : 'nunca auditado') };
});

const kpi = (r, v, s = '') => `<div class="k"><span>${r}</span><b>${v}</b>${s ? `<small>${s}</small>` : ''}</div>`;
const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Painel Pinas</title>
<style>
:root{--t:#1C1B18;--p:#F2EEE6;--l:#d8d2c5;--a:#9A3B26;--s:#6b675e}
body{font-family:system-ui,-apple-system,sans-serif;background:var(--p);color:var(--t);margin:0;padding:32px 20px;line-height:1.5}
.w{max-width:1100px;margin:0 auto}
h1{font-family:Georgia,serif;font-weight:400;font-size:44px;margin:0}
h1+p{color:var(--s);margin:4px 0 28px}
h2{font:600 12px ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em;border-top:1px solid var(--t);padding-top:10px;margin:40px 0 14px}
.ks{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));border-top:1px solid var(--l);border-left:1px solid var(--l)}
.k{padding:16px;border-right:1px solid var(--l);border-bottom:1px solid var(--l)}.k span{display:block;font-size:13px;color:var(--s)}.k b{display:block;font-family:Georgia,serif;font-weight:400;font-size:34px;line-height:1.1;margin-top:4px}.k small{color:var(--s)}
.f{display:grid;grid-template-columns:150px 1fr 40px;gap:10px;align-items:center;font-size:14px;padding:3px 0}
.f i{display:block;height:14px;background:var(--t)}.f.fim i{background:var(--a)}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:9px 6px;border-bottom:1px solid var(--l)}th{font-size:12px;color:var(--s);font-weight:500}
.al{color:var(--a)}
</style></head><body><div class="w">
<h1>Pinas</h1><p>Atualizado em ${hoje.toLocaleString('pt-BR')}</p>
<div class="ks">
${kpi('Receita recorrente (MRR)', brl(mrr), `${ativos.length} cliente(s) ativo(s)`)}
${kpi('Setup no mês', brl(setupMes))}
${kpi('Prospects no funil', pipe.length, `${enviados} já abordados`)}
${kpi('Fechados', fechados, enviados ? `${((fechados / enviados) * 100).toFixed(0)}% dos abordados` : '')}
${kpi('Renovações em 45 dias', vencendo.length, vencendo.length ? brl(vencendo.reduce((s, c) => s + num(c.mensal), 0)) + '/mês em jogo' : '')}
</div>
<h2>Funil de prospecção</h2>
${funil.map(([e, n]) => `<div class="f${/fechado|perdido/.test(e) ? ' fim' : ''}"><span>${e}</span><i style="width:${(n / maxF) * 100}%"></i><b>${n}</b></div>`).join('')}
${outros ? `<p style="color:var(--s);font-size:13px">${outros} com status fora do padrão.</p>` : ''}
<h2>Clientes ativos</h2>
${saude.length ? `<table><tr><th>Cliente</th><th>Plano</th><th>Mensal</th><th>Fim</th><th>Último relatório</th><th>Última auditoria</th><th>Situação</th></tr>
${saude.map(s => `<tr><td>${esc(s.c.cliente)}</td><td>${esc(s.c.plano)}</td><td>${esc(s.c.mensal)}</td><td>${esc(s.c.fim)}</td><td>${s.ultimoRel}</td><td>${s.ultimaAud}</td><td class="${s.alerta === 'ok' ? '' : 'al'}">${esc(s.alerta)}</td></tr>`).join('')}</table>` : '<p>Nenhum cliente ativo em comercial/financeiro.csv.</p>'}
</div></body></html>`;
fs.writeFileSync(path.join(RAIZ, 'painel.html'), html);
console.log(`Painel: ${path.join(RAIZ, 'painel.html')}`);
console.log(`MRR ${brl(mrr)} · ${ativos.length} ativos · ${pipe.length} prospects · ${vencendo.length} renovações próximas`);
