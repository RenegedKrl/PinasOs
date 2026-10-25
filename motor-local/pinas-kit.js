// Ponte entre o Pinas OS e o Pinas Kit (sistema de leads/prospecção do usuário).
// Configure no .env: PINAS_KIT_URL (endpoint que recebe POST JSON), PINAS_KIT_TOKEN e PINAS_KIT_AUTH.
// Contrato dos dados: integracoes/pinas-kit.md
//
// Uso:
//   node motor-local/pinas-kit.js testar
//   node motor-local/pinas-kit.js enviar-prospect <slug> [status]
//   node motor-local/pinas-kit.js importar <arquivo.csv>      (CSV exportado do Pinas Kit → comercial/pipeline-prospeccao.csv)
//   node motor-local/pinas-kit.js exportar                    (pipeline → comercial/exportar-pinas-kit.csv)
require('./lib/env');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PIPE = path.join(RAIZ, 'comercial', 'pipeline-prospeccao.csv');
const COLUNAS = ['data', 'empresa', 'nicho', 'cidade', 'site', 'instagram', 'whatsapp', 'slug', 'status', 'proximo_passo', 'data_proximo_passo', 'observacoes'];

function lerCsv(texto) {
  const sep = (texto.split('\n')[0].match(/;/g) || []).length > (texto.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) { if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (ch === '"') aspas = false; else campo += ch; }
    else if (ch === '"') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ''; }
    else if (ch === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (ch !== '\r') campo += ch;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas.filter(l => l.some(c => c.trim()));
  const chaves = cab.map(c => c.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_'));
  return resto.map(l => Object.fromEntries(chaves.map((c, i) => [c, (l[i] || '').trim()])));
}
const csvCampo = v => (/[",\n;]/.test(String(v ?? '')) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
const escreverCsv = (arq, linhas) => fs.writeFileSync(arq, [COLUNAS.join(','), ...linhas.map(l => COLUNAS.map(c => csvCampo(l[c])).join(','))].join('\n') + '\n');
const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const primeiro = (o, ...ks) => ks.map(k => o[k]).find(v => v) || '';

async function enviar(payload) {
  const url = process.env.PINAS_KIT_URL;
  if (!url) throw new Error('PINAS_KIT_URL não configurado no .env');
  const token = process.env.PINAS_KIT_TOKEN || '';
  const modo = (process.env.PINAS_KIT_AUTH || 'bearer').toLowerCase();
  const headers = { 'Content-Type': 'application/json' };
  let destino = url;
  if (token && modo === 'bearer') headers.Authorization = `Bearer ${token}`;
  if (token && modo === 'header') headers['X-Api-Key'] = token;
  if (token && modo === 'query') destino += (url.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);
  const res = await fetch(destino, { method: 'POST', headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
  const corpo = await res.text();
  if (!res.ok) throw new Error(`Pinas Kit respondeu ${res.status}: ${corpo.slice(0, 200)}`);
  return corpo;
}

function montarProspect(slug, status) {
  const base = path.join(RAIZ, 'clientes', slug);
  if (!fs.existsSync(base)) throw new Error(`Cliente não encontrado: ${base}`);
  const ler = rel => (fs.existsSync(path.join(base, rel)) ? fs.readFileSync(path.join(base, rel), 'utf-8') : null);
  const diag = JSON.parse(ler('contexto/diagnostico-automatico.json') || '{}');
  const ctx = ler('contexto/contexto-empresa.md') || '';
  const campo = rotulo => (ctx.match(new RegExp(`\\*\\*${rotulo}:\\*\\*\\s*(.+)`, 'i')) || [])[1]?.trim() || '';
  const lp = ler('site/lp-conteudo.json');
  return {
    tipo: 'prospect',
    origem: 'pinas-os',
    slug,
    empresa: campo('Nome') || (lp && JSON.parse(lp).marca?.nome) || slug,
    nicho: campo('Nicho'),
    cidade: campo('Cidade / região de atendimento'),
    site: diag.urlAnalisada || campo('Site atual / Instagram'),
    whatsapp: campo('WhatsApp comercial'),
    status: status || 'protótipo pronto',
    pontuacao: pontuar(diag),
    oportunidades: diag.oportunidadesPinas || [],
    performanceMobile: diag.pageSpeed?.notaPerformanceMobile ?? null,
    temPixel: diag.tecnico?.metaPixel ?? null,
    prototipo: fs.existsSync(path.join(base, 'site', 'index.html')),
    videoDemo: fs.existsSync(path.join(base, 'site', 'demo-mobile.mp4')),
    abordagem: ler('contexto/scripts-abordagem.md')?.slice(0, 2000) || null,
    atualizadoEm: new Date().toISOString()
  };
}

// Mesma régua do prospectar-lote.js: quanto maior, mais dinheiro o lead está perdendo (e mais fácil vender)
function pontuar(diag) {
  const pesos = { CRÍTICO: 3, ALTO: 2, MÉDIO: 1, BAIXO: 0.5 };
  return (diag.oportunidadesPinas || []).reduce((s, o) => s + (pesos[o.split(' ')[0]] || 0), 0);
}

async function main() {
  const [cmd, a1, a2] = process.argv.slice(2);
  if (cmd === 'testar') {
    console.log(await enviar({ tipo: 'teste', origem: 'pinas-os', data: new Date().toISOString() }) || 'OK');
    console.log('Conexão com o Pinas Kit funcionando.');
  } else if (cmd === 'enviar-prospect' && a1) {
    const p = montarProspect(a1, a2);
    await enviar(p);
    console.log(`Prospect "${p.empresa}" enviado ao Pinas Kit (pontuação ${p.pontuacao}, status "${p.status}").`);
  } else if (cmd === 'importar' && a1) {
    const novos = lerCsv(fs.readFileSync(a1, 'utf-8'));
    const atuais = fs.existsSync(PIPE) ? lerCsv(fs.readFileSync(PIPE, 'utf-8')) : [];
    const chave = l => (l.site || l.instagram || l.empresa || '').toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const vistos = new Set(atuais.map(chave));
    let add = 0;
    for (const n of novos) {
      const l = {
        data: new Date().toISOString().slice(0, 10),
        empresa: primeiro(n, 'empresa', 'nome', 'name', 'razao_social', 'title'),
        nicho: primeiro(n, 'nicho', 'categoria', 'category', 'segmento'),
        cidade: primeiro(n, 'cidade', 'city', 'municipio', 'endereco', 'address'),
        site: primeiro(n, 'site', 'website', 'url', 'site_url'),
        instagram: primeiro(n, 'instagram', 'ig'),
        whatsapp: primeiro(n, 'whatsapp', 'telefone', 'phone', 'celular'),
        status: primeiro(n, 'status') || 'novo',
        observacoes: primeiro(n, 'observacoes', 'notas', 'notes')
      };
      if (!l.empresa && !l.site) continue;
      l.slug = slugify(l.empresa || l.site.replace(/^https?:\/\/(www\.)?/, ''));
      if (vistos.has(chave(l))) continue;
      vistos.add(chave(l)); atuais.push(l); add++;
    }
    fs.mkdirSync(path.dirname(PIPE), { recursive: true });
    escreverCsv(PIPE, atuais);
    console.log(`${add} prospect(s) novo(s) importado(s). Total no pipeline: ${atuais.length}.`);
    console.log('Próximo passo: node motor-local/prospectar-lote.js');
  } else if (cmd === 'exportar') {
    const atuais = fs.existsSync(PIPE) ? lerCsv(fs.readFileSync(PIPE, 'utf-8')) : [];
    const saida = path.join(RAIZ, 'comercial', 'exportar-pinas-kit.csv');
    escreverCsv(saida, atuais);
    console.log(`Exportado: ${saida} (${atuais.length} linhas)`);
  } else {
    console.log('Uso: node motor-local/pinas-kit.js testar | enviar-prospect <slug> [status] | importar <csv> | exportar');
    process.exit(1);
  }
}

module.exports = { lerCsv, escreverCsv, pontuar, COLUNAS, PIPE };
if (require.main === module) main().catch(e => { console.error('Falha:', e.message); process.exit(1); });
