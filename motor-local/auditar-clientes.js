// Auditoria das LPs publicadas dos clientes ativos: site no ar, Pixel/GTM ainda instalados, WhatsApp funcionando, velocidade.
// Uso: node motor-local/auditar-clientes.js [slug]
// Lê comercial/financeiro.csv (colunas slug, url_lp, status=ativo). Gera clientes/<slug>/auditorias/<data>/resultado.json
// e comercial/auditoria-<data>.md com os alertas. Rode toda segunda-feira (ou agende).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { lerArquivo } = require('./lib/csv');

const RAIZ = path.join(__dirname, '..');
const so = process.argv[2];
const hoje = new Date().toISOString().slice(0, 10);
const clientes = lerArquivo(path.join(RAIZ, 'comercial', 'financeiro.csv'))
  .filter(c => (c.status || '').toLowerCase() === 'ativo' && c.url_lp && c.slug && (!so || c.slug === so));

if (!clientes.length) {
  console.log('Nenhum cliente ativo com url_lp em comercial/financeiro.csv.');
  process.exit(0);
}

const linhas = [];
for (const c of clientes) {
  const sub = `${c.slug}/auditorias/${hoje}`;
  console.log(`Auditando ${c.cliente || c.slug} → ${c.url_lp}`);
  try {
    execFileSync('node', [path.join(__dirname, 'diagnosticar-lead.js'), c.url_lp, sub], { stdio: 'ignore', timeout: 180000 });
  } catch { /* o JSON registra o erro de acesso */ }
  const dir = path.join(RAIZ, 'clientes', sub, 'contexto');
  const arq = path.join(dir, 'diagnostico-automatico.json');
  const d = fs.existsSync(arq) ? JSON.parse(fs.readFileSync(arq, 'utf-8')) : { erroAcesso: 'diagnóstico não rodou' };
  const t = d.tecnico || {};
  const nota = d.pageSpeed?.notaPerformanceMobile;
  const alertas = [
    d.erroAcesso || (d.statusHttp && d.statusHttp >= 400) ? `SITE FORA DO AR (${d.erroAcesso || `HTTP ${d.statusHttp}`})` : null,
    d.tecnico && !t.metaPixel && c.pixel !== 'nao' ? 'Pixel da Meta sumiu da página' : null,
    d.tecnico && !t.googleTag && c.gtm !== 'nao' ? 'Google Tag sumiu da página' : null,
    d.tecnico && t.linksWhatsapp === 0 ? 'Nenhum link de WhatsApp encontrado' : null,
    d.mobile?.rolagemHorizontal ? 'Rolagem horizontal no celular' : null,
    nota != null && nota < 80 ? `Performance mobile caiu para ${nota}` : null,
    d.tecnico && !d.https ? 'Sem HTTPS' : null
  ].filter(Boolean);
  const resultado = { cliente: c.cliente, url: c.url_lp, data: hoje, notaMobile: nota ?? null, alertas };
  // Move para a pasta da auditoria (sem a subpasta "contexto") e grava o resumo
  const destino = path.join(RAIZ, 'clientes', sub);
  if (fs.existsSync(dir)) { for (const f of fs.readdirSync(dir)) fs.renameSync(path.join(dir, f), path.join(destino, f)); fs.rmdirSync(dir); }
  fs.mkdirSync(destino, { recursive: true });
  fs.writeFileSync(path.join(destino, 'resultado.json'), JSON.stringify(resultado, null, 2));
  linhas.push(`| ${c.cliente || c.slug} | ${c.url_lp} | ${nota ?? '–'} | ${alertas.length ? `**${alertas.join('; ')}**` : 'ok'} |`);
  console.log(alertas.length ? `  ! ${alertas.join('\n  ! ')}` : '  ok');
}

const md = [`# Auditoria dos clientes · ${hoje}`, '', '| Cliente | LP | Mobile | Situação |', '|---|---|---|---|', ...linhas, '',
  'Qualquer alerta: corrigir antes de o cliente perceber. Pixel/GTM sumindo costuma ser alguém mexendo no site ou no domínio.'].join('\n');
fs.writeFileSync(path.join(RAIZ, 'comercial', `auditoria-${hoje}.md`), md + '\n');
console.log(`\nResumo: comercial/auditoria-${hoje}.md`);
