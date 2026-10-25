// Prospecção em lote: diagnostica vários sites e ranqueia quem está perdendo mais dinheiro (= mais fácil de vender).
// Uso: node motor-local/prospectar-lote.js [arquivo.csv] [--max 20] [--nicho odonto] [--refazer]
// Padrão: comercial/pipeline-prospeccao.csv (importe do Pinas Kit com pinas-kit.js importar)
// Saída: comercial/ranking-AAAA-MM-DD.md e o pipeline atualizado (status "diagnosticado").
// Sem gastar token: o Claude só lê o ranking e escolhe os melhores para /1-prospectar.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { lerCsv, escreverCsv, pontuar, PIPE } = require('./pinas-kit');

const RAIZ = path.join(__dirname, '..');
const args = process.argv.slice(2);
const val = f => { const i = args.indexOf(f); return i > -1 ? args[i + 1] : null; };
const arquivo = args.find((a, i) => !a.startsWith('--') && !['--max', '--nicho'].includes(args[i - 1])) || PIPE;
const max = Number(val('--max')) || 20;
const nicho = (val('--nicho') || '').toLowerCase();
const refazer = args.includes('--refazer');

if (!fs.existsSync(arquivo)) {
  console.log(`Não encontrado: ${arquivo}\nCrie a partir de comercial/pipeline-prospeccao.modelo.csv ou importe do Pinas Kit.`);
  process.exit(1);
}
const linhas = lerCsv(fs.readFileSync(arquivo, 'utf-8'));
const alvo = linhas.filter(l => l.site && (!nicho || (l.nicho || '').toLowerCase().includes(nicho)));
const resultados = [];
let feitos = 0;

for (const l of alvo) {
  const slug = l.slug || l.empresa?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `lead-${feitos}`;
  l.slug = slug;
  const diagArq = path.join(RAIZ, 'clientes', slug, 'contexto', 'diagnostico-automatico.json');
  if (refazer || !fs.existsSync(diagArq)) {
    if (feitos >= max) continue;
    const url = /^https?:/.test(l.site) ? l.site : `https://${l.site}`;
    console.log(`[${feitos + 1}/${Math.min(max, alvo.length)}] ${l.empresa || slug} → ${url}`);
    try {
      execFileSync('node', [path.join(__dirname, 'diagnosticar-lead.js'), url, slug], { stdio: ['ignore', 'ignore', 'inherit'], timeout: 150000 });
    } catch { console.warn(`   falhou: ${slug}`); }
    feitos++;
  }
  if (!fs.existsSync(diagArq)) continue;
  const d = JSON.parse(fs.readFileSync(diagArq, 'utf-8'));
  const pts = pontuar(d);
  resultados.push({ l, d, pts });
  if (!l.status || l.status === 'novo') l.status = 'diagnosticado';
}

// Atualiza o pipeline com slug/status
if (path.resolve(arquivo) === path.resolve(PIPE)) escreverCsv(PIPE, linhas);

resultados.sort((a, b) => b.pts - a.pts);
const hoje = new Date().toISOString().slice(0, 10);
const md = [`# Ranking de prospecção · ${hoje}`, '',
  'Quanto maior a pontuação, mais problemas visíveis o site tem (e mais fácil mostrar valor).',
  'Sugestão: rode `/1-prospectar <site> <slug>` nos 5 primeiros.', '',
  '| # | Empresa | Nicho | Pontos | Mobile | Pixel | WhatsApp | Principais falhas |',
  '|---|---|---|---|---|---|---|---|',
  ...resultados.map((r, i) => `| ${i + 1} | ${r.l.empresa || r.l.slug} (\`${r.l.slug}\`) | ${r.l.nicho || ''} | **${r.pts}** | ${r.d.pageSpeed?.notaPerformanceMobile ?? '–'} | ${r.d.tecnico ? (r.d.tecnico.metaPixel ? 'sim' : '**não**') : '–'} | ${r.d.tecnico ? r.d.tecnico.linksWhatsapp : '–'} | ${(r.d.oportunidadesPinas || []).slice(0, 2).map(o => o.replace(/^\S+ \(([^)]+)\): /, '$1: ').split(' — ')[0]).join('; ').replace(/\|/g, '/')} |`)
].join('\n');
const saida = path.join(RAIZ, 'comercial', `ranking-${hoje}.md`);
fs.writeFileSync(saida, md + '\n');
console.log(`\n${resultados.length} lead(s) ranqueado(s). Ranking: ${saida}`);
resultados.slice(0, 5).forEach((r, i) => console.log(`  ${i + 1}. ${r.l.empresa || r.l.slug} — ${r.pts} pts`));
