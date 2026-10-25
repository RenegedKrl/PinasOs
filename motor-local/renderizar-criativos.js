// Renderiza FUNDOS de criativos (sem texto) a partir de um JSON.
// Uso: node motor-local/renderizar-criativos.js <slug>
// Lê:  clientes/<slug>/criativos/lote-criativos.json
// Gera: clientes/<slug>/criativos/fundos/<id>-<formato>.png
//
// Formato do JSON (veja clientes/_modelo-padrao/criativos/lote-criativos.exemplo.json):
// {
//   "marca": { "corPrimaria": "#0F766E", "corSecundaria": "#F5F5F4", "corEscura": "#0C0A09", "logo": "caminho/logo.png" },
//   "criativos": [
//     { "id": "dor-01", "formato": "feed", "layout": "foto-escurecida", "imagem": "caminho/ou/url.jpg", "posicaoImagem": "center", "logo": true }
//   ]
// }
// Formatos: feed (1080x1350), stories (1080x1920), quadrado (1080x1080), paisagem (1200x628)
// Layouts:  foto-escurecida | foto-faixa-marca | foto-dividida | cor-solida | moldura
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FORMATOS = {
  feed: [1080, 1350],
  stories: [1080, 1920],
  quadrado: [1080, 1080],
  paisagem: [1200, 628]
};

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

// Imagens locais viram data URI (setContent não carrega file://).
function resolverImagem(ref, baseDir) {
  if (!ref) return null;
  if (/^(https?:|data:)/i.test(ref)) return ref;
  const raiz = path.join(__dirname, '..');
  const candidatos = [path.resolve(baseDir, ref), path.resolve(raiz, ref)];
  const arquivo = candidatos.find(p => fs.existsSync(p));
  if (!arquivo) throw new Error(`Imagem não encontrada: ${ref}`);
  const mime = MIME[path.extname(arquivo).toLowerCase()] || 'application/octet-stream';
  return `data:${mime};base64,${fs.readFileSync(arquivo).toString('base64')}`;
}

// Só aceita cores hex/rgb para não injetar CSS arbitrário.
function cor(valor, padrao) {
  return typeof valor === 'string' && /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i.test(valor.trim()) ? valor.trim() : padrao;
}

function montarHtml(item, marca, w, h, imagem, logo) {
  const p = cor(marca.corPrimaria, '#0F766E');
  const s = cor(marca.corSecundaria, '#F5F5F4');
  const e = cor(marca.corEscura, '#0C0A09');
  const pos = /^[a-z0-9%\s]+$/i.test(item.posicaoImagem || '') ? item.posicaoImagem : 'center';
  const img = imagem ? `url("${imagem}")` : 'none';
  const pad = Math.round(w * 0.06);

  const layouts = {
    'foto-escurecida': `
      .bg{background:${img} ${pos}/cover no-repeat ${e}}
      .ov{background:linear-gradient(180deg, ${e}33 0%, ${e}00 35%, ${e}CC 100%)}`,
    'foto-faixa-marca': `
      .bg{background:${img} ${pos}/cover no-repeat ${e}}
      .ov{background:linear-gradient(180deg, transparent 58%, ${p} 58%)}`,
    'foto-dividida': `
      .bg{background:${img} ${pos}/cover no-repeat ${e}; clip-path:inset(0 0 45% 0)}
      .ov{background:${s}; clip-path:inset(55% 0 0 0)}
      .ac{position:absolute;left:${pad}px;top:55%;width:${Math.round(w * 0.18)}px;height:${Math.round(h * 0.008)}px;background:${p};transform:translateY(-50%)}`,
    'cor-solida': `
      .bg{background:${p}}
      .ov{background:radial-gradient(circle at 85% 15%, ${s}22 0 18%, transparent 18.2%), radial-gradient(circle at 10% 95%, ${e}33 0 28%, transparent 28.2%)}`,
    'moldura': `
      .bg{background:${s}}
      .ov{inset:${pad}px;border-radius:${Math.round(w * 0.03)}px;background:${img} ${pos}/cover no-repeat ${e};box-shadow:0 30px 80px ${e}40}
      .ac{position:absolute;left:0;bottom:0;width:100%;height:${Math.round(pad * 0.5)}px;background:${p}}`
  };
  const layout = layouts[item.layout] ? item.layout : 'foto-escurecida';
  const logoTam = Math.round(w * 0.14);
  const logoHtml = logo && item.logo !== false
    ? `<img class="logo" src="${logo}" style="position:absolute;right:${pad}px;top:${pad}px;max-width:${logoTam}px;max-height:${logoTam}px;object-fit:contain">`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${w}px;height:${h}px;overflow:hidden}
    .bg,.ov{position:absolute;inset:0}
    ${layouts[layout]}
  </style></head><body><div class="bg"></div><div class="ov"></div><div class="ac"></div>${logoHtml}</body></html>`;
}

async function renderizarLote(slug) {
  const pasta = path.join(__dirname, '..', 'clientes', slug, 'criativos');
  const arquivoJson = path.join(pasta, 'lote-criativos.json');
  if (!fs.existsSync(arquivoJson)) {
    console.error(`Arquivo não encontrado: ${arquivoJson}`);
    process.exit(1);
  }
  const dados = JSON.parse(fs.readFileSync(arquivoJson, 'utf-8'));
  const marca = dados.marca || {};
  const saida = path.join(pasta, 'fundos');
  fs.mkdirSync(saida, { recursive: true });

  const logo = marca.logo ? resolverImagem(marca.logo, pasta) : null;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let ok = 0;

  try {
    for (const item of dados.criativos || []) {
      const formatos = Array.isArray(item.formato) ? item.formato : [item.formato || 'feed'];
      for (const f of formatos) {
        const dim = FORMATOS[f];
        if (!dim) { console.warn(`Formato desconhecido "${f}" em ${item.id} — pulando`); continue; }
        const [w, h] = dim;
        try {
          const imagem = resolverImagem(item.imagem, pasta);
          await page.setViewportSize({ width: w, height: h });
          await page.setContent(montarHtml(item, marca, w, h, imagem, logo), { waitUntil: 'load' });
          const nome = `${String(item.id).replace(/[^a-z0-9_-]/gi, '_')}-${f}.png`;
          await page.screenshot({ path: path.join(saida, nome) });
          console.log(`Fundo exportado: fundos/${nome} (${w}x${h})`);
          ok++;
        } catch (err) {
          console.error(`Erro em ${item.id} (${f}): ${err.message}`);
        }
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`${ok} fundo(s) gerado(s) em ${saida}`);
}

const [, , slugArg] = process.argv;
if (!slugArg) {
  console.log('Uso: node motor-local/renderizar-criativos.js <slug-do-cliente>');
  process.exit(1);
}
renderizarLote(slugArg).catch(err => { console.error(err.message); process.exit(1); });
