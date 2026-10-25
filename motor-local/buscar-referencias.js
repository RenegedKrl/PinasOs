// Coleta referências visuais (Behance, Biblioteca de Anúncios da Meta, Instagram, sites) e monta painéis
// compactos para o Claude analisar com poucos tokens.
//
// Uso:
//   node motor-local/buscar-referencias.js <slug> <fonte> "<termo ou lista>" [--max 8]
//   node motor-local/buscar-referencias.js --login instagram|behance|facebook   (1x: abre o navegador para você entrar na conta)
//
// Fontes:
//   behance    "dental clinic website"         → projetos do Behance (prints dos projetos)
//   meta-ads   "implante dentário"              → anúncios ativos no Brasil (Biblioteca de Anúncios)
//   instagram  "perfil1,perfil2"                → grade dos perfis (precisa de --login instagram antes)
//   sites      "https://a.com,https://b.com"    → prints de sites (ou caminho de um .txt com 1 URL por linha)
//   galerias   "dentist"                        → buscas em galerias de LP (Land-book, Lapa Ninja, One Page Love)
//
// Saída: clientes/<slug>/referencias/<fonte>/*.jpg, indice.json e painel-<fonte>-N.jpg (grade de até 9 prints).
// O Claude deve ler só os painéis.
require('./lib/env');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PERFIL = path.join(RAIZ, '.perfil-navegador');
const PAUSA = Math.max(2, Number(process.env.REFERENCIAS_PAUSA) || 4) * 1000;
const espera = ms => new Promise(r => setTimeout(r, ms + Math.random() * 1200));
const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

async function abrirContexto({ visivel = false } = {}) {
  fs.mkdirSync(PERFIL, { recursive: true });
  return chromium.launchPersistentContext(PERFIL, {
    headless: !visivel,
    viewport: { width: 1440, height: 900 },
    locale: 'pt-BR',
    deviceScaleFactor: 1
  });
}

async function fecharPopups(page) {
  const textos = ['Permitir todos os cookies', 'Allow all cookies', 'Aceitar', 'Accept', 'Accept all', 'Aceitar tudo', 'Agora não', 'Not now', 'Fechar', 'Close'];
  for (const t of textos) {
    const b = page.getByRole('button', { name: t, exact: true }).first();
    if (await b.isVisible({ timeout: 300 }).catch(() => false)) await b.click({ timeout: 1000 }).catch(() => {});
  }
  await page.keyboard.press('Escape').catch(() => {});
}

async function print(page, destino, { altura = 2400 } = {}) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 900);
  // rola para disparar lazy-load
  for (let y = 0; y < Math.min(total, altura); y += 700) {
    await page.evaluate(v => window.scrollTo(0, v), y).catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await page.waitForTimeout(400);
  const h = Math.min(total, altura);
  await page.setViewportSize({ width: 1440, height: Math.max(900, h) });
  await page.screenshot({ path: destino, type: 'jpeg', quality: 72 });
  await page.setViewportSize({ width: 1440, height: 900 });
}

// ---------- Fontes ----------
const FONTES = {
  async behance(page, termo, max, pasta) {
    const itens = [];
    await page.goto(`https://www.behance.net/search/projects/${encodeURIComponent(termo)}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await espera(PAUSA); await fecharPopups(page);
    await print(page, path.join(pasta, '00-busca.jpg'), { altura: 1800 });
    itens.push({ arquivo: '00-busca.jpg', titulo: `Busca: ${termo}`, url: page.url() });
    const links = await page.$$eval('a[href*="/gallery/"]', as => [...new Set(as.map(a => a.href.split('?')[0]))]);
    for (const [i, url] of links.slice(0, max).entries()) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await espera(PAUSA); await fecharPopups(page);
        const titulo = (await page.title()).replace(/ on Behance$/i, '');
        const nome = `${String(i + 1).padStart(2, '0')}-${slugify(titulo)}.jpg`;
        await print(page, path.join(pasta, nome), { altura: 3200 });
        itens.push({ arquivo: nome, titulo, url });
        console.log(`  behance ${i + 1}/${Math.min(max, links.length)}: ${titulo}`);
      } catch (e) { console.warn(`  pulei ${url}: ${e.message.split('\n')[0]}`); }
    }
    return itens;
  },

  async 'meta-ads'(page, termo, max, pasta) {
    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&media_type=all&search_type=keyword_unordered&q=${encodeURIComponent(termo)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await espera(PAUSA * 1.5); await fecharPopups(page);
    const itens = [];
    // Tenta recortar cada anúncio individualmente; se o layout mudar, cai para prints de tela rolada.
    const cartoes = page.locator('div:has(> div > span:text-matches("ID da biblioteca|Library ID", "i"))');
    const n = Math.min(await cartoes.count().catch(() => 0), max);
    for (let i = 0; i < n; i++) {
      try {
        const c = cartoes.nth(i);
        await c.scrollIntoViewIfNeeded({ timeout: 3000 });
        await page.waitForTimeout(800);
        const nome = `${String(i + 1).padStart(2, '0')}-anuncio.jpg`;
        await c.screenshot({ path: path.join(pasta, nome), type: 'jpeg', quality: 75 });
        const texto = (await c.innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
        itens.push({ arquivo: nome, titulo: texto.slice(0, 80), texto, url });
      } catch { /* segue */ }
    }
    if (!itens.length) {
      for (let i = 0; i < Math.ceil(max / 3); i++) {
        const nome = `tela-${i + 1}.jpg`;
        await page.screenshot({ path: path.join(pasta, nome), type: 'jpeg', quality: 72 });
        itens.push({ arquivo: nome, titulo: `Resultados (tela ${i + 1})`, url });
        await page.mouse.wheel(0, 850); await espera(PAUSA);
      }
    }
    console.log(`  meta-ads: ${itens.length} capturas para "${termo}"`);
    return itens;
  },

  async instagram(page, termos, max, pasta) {
    const perfis = termos.split(',').map(s => s.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '')).filter(Boolean).slice(0, max);
    const itens = [];
    for (const [i, perfil] of perfis.entries()) {
      const url = perfil.startsWith('#') || perfil.startsWith('explore')
        ? `https://www.instagram.com/explore/tags/${encodeURIComponent(perfil.replace(/^#|explore\/tags\//g, ''))}/`
        : `https://www.instagram.com/${perfil}/`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await espera(PAUSA * 1.5); await fecharPopups(page);
        if (/accounts\/login/.test(page.url())) {
          console.warn('  Instagram pediu login. Rode antes: node motor-local/buscar-referencias.js --login instagram');
          break;
        }
        const nome = `${String(i + 1).padStart(2, '0')}-${slugify(perfil)}.jpg`;
        await print(page, path.join(pasta, nome), { altura: 2200 });
        itens.push({ arquivo: nome, titulo: `@${perfil}`, url });
        console.log(`  instagram: @${perfil}`);
      } catch (e) { console.warn(`  pulei @${perfil}: ${e.message.split('\n')[0]}`); }
    }
    return itens;
  },

  async sites(page, termos, max, pasta) {
    const lista = fs.existsSync(termos)
      ? fs.readFileSync(termos, 'utf-8').split(/\r?\n/).map(s => s.trim()).filter(s => /^https?:|^file:/.test(s))
      : termos.split(',').map(s => s.trim()).filter(Boolean);
    const itens = [];
    for (const [i, url] of lista.slice(0, max).entries()) {
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 45000 });
        await espera(Math.min(PAUSA, 2500)); await fecharPopups(page);
        const titulo = await page.title();
        const nome = `${String(i + 1).padStart(2, '0')}-${slugify(new URL(page.url()).hostname || titulo || 'site')}.jpg`;
        await print(page, path.join(pasta, nome), { altura: 3600 });
        // paleta e fontes reais usadas pelo site — economiza o Claude de adivinhar
        const estilo = await page.evaluate(() => {
          const contar = (vals) => Object.entries(vals.reduce((a, v) => (a[v] = (a[v] || 0) + 1, a), {})).sort((x, y) => y[1] - x[1]).map(e => e[0]);
          const els = [...document.querySelectorAll('body *')].slice(0, 1500);
          const cs = els.map(e => getComputedStyle(e));
          const fontes = contar(cs.map(s => s.fontFamily.split(',')[0].replace(/["']/g, '').trim())).slice(0, 4);
          const cores = contar(cs.flatMap(s => [s.color, s.backgroundColor]).filter(c => c && c !== 'rgba(0, 0, 0, 0)')).slice(0, 8);
          const h = document.querySelector('h1');
          return { fontes, cores, h1: h ? { texto: h.innerText.slice(0, 120), tamanho: getComputedStyle(h).fontSize, fonte: getComputedStyle(h).fontFamily.split(',')[0] } : null };
        }).catch(() => null);
        itens.push({ arquivo: nome, titulo, url, estilo });
        console.log(`  site: ${titulo || url}`);
      } catch (e) { console.warn(`  pulei ${url}: ${e.message.split('\n')[0]}`); }
    }
    return itens;
  },

  async galerias(page, termo, max, pasta) {
    const buscas = [
      ['land-book', `https://land-book.com/?search=${encodeURIComponent(termo)}`],
      ['lapa-ninja', `https://www.lapa.ninja/search/?q=${encodeURIComponent(termo)}`],
      ['onepagelove', `https://onepagelove.com/?s=${encodeURIComponent(termo)}`]
    ];
    const itens = [];
    for (const [nome, url] of buscas) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await espera(PAUSA); await fecharPopups(page);
        const arq = `${nome}.jpg`;
        await print(page, path.join(pasta, arq), { altura: 2600 });
        itens.push({ arquivo: arq, titulo: `${nome}: ${termo}`, url });
        console.log(`  galeria: ${nome}`);
      } catch (e) { console.warn(`  pulei ${nome}: ${e.message.split('\n')[0]}`); }
    }
    return itens.slice(0, max);
  }
};

// ---------- Painel (grade compacta para o Claude ler em 1 imagem) ----------
async function montarPaineis(browserOuCtx, pasta, itens, prefixo) {
  const page = await browserOuCtx.newPage();
  const paineis = [];
  for (let p = 0; p * 9 < itens.length; p++) {
    const grupo = itens.slice(p * 9, p * 9 + 9);
    const celulas = grupo.map((it, i) => {
      const b64 = fs.readFileSync(path.join(pasta, it.arquivo)).toString('base64');
      return `<figure><div style="background-image:url(data:image/jpeg;base64,${b64})"></div><figcaption>${p * 9 + i + 1}. ${String(it.titulo || '').replace(/[<&]/g, '').slice(0, 70)}</figcaption></figure>`;
    }).join('');
    await page.setViewportSize({ width: 1500, height: 400 });
    await page.setContent(`<html><body style="margin:0;background:#111;font:14px system-ui;color:#ddd">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px">${celulas}</div>
      <style>figure{margin:0}figure div{height:440px;background-size:cover;background-position:top center;border-radius:4px}figcaption{padding:5px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style></body></html>`, { waitUntil: 'load' });
    const nome = `painel-${prefixo}-${p + 1}.jpg`;
    await page.screenshot({ path: path.join(pasta, '..', nome), type: 'jpeg', quality: 70, fullPage: true });
    paineis.push(nome);
  }
  await page.close();
  return paineis;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--login') {
    const site = { instagram: 'https://www.instagram.com/accounts/login/', behance: 'https://www.behance.net/', facebook: 'https://www.facebook.com/' }[args[1]];
    if (!site) { console.log('Uso: --login instagram|behance|facebook'); process.exit(1); }
    const ctx = await abrirContexto({ visivel: true });
    const page = ctx.pages()[0] || await ctx.newPage();
    await page.goto(site);
    console.log('Entre na sua conta na janela que abriu. Quando terminar, feche a janela.');
    await new Promise(r => ctx.on('close', r));
    console.log('Sessão salva em .perfil-navegador/ (fica só no seu computador).');
    return;
  }

  const iMax = args.indexOf('--max');
  const max = iMax > -1 ? Math.min(20, Number(args[iMax + 1]) || 8) : 8;
  const [slug, fonte, termo] = args.filter((a, i) => !a.startsWith('--') && (iMax < 0 || i !== iMax + 1));
  if (!slug || !FONTES[fonte] || !termo) {
    console.log('Uso: node motor-local/buscar-referencias.js <slug> <behance|meta-ads|instagram|sites|galerias> "<termo>" [--max 8]');
    process.exit(1);
  }

  const raizRef = path.join(RAIZ, 'clientes', slug, 'referencias');
  const prefixo = `${fonte}-${/https?:|\.txt$/.test(termo) ? new Date().toISOString().slice(0, 10) : slugify(termo).slice(0, 30)}`;
  const pasta = path.join(raizRef, prefixo);
  fs.mkdirSync(pasta, { recursive: true });

  const ctx = await abrirContexto();
  const page = ctx.pages()[0] || await ctx.newPage();
  let itens = [];
  try {
    console.log(`Buscando ${fonte}: "${termo}" (máx. ${max})`);
    itens = await FONTES[fonte](page, termo, max, pasta);
    if (itens.length) {
      const paineis = await montarPaineis(ctx, pasta, itens, prefixo);
      fs.writeFileSync(path.join(pasta, 'indice.json'), JSON.stringify({ fonte, termo, data: new Date().toISOString(), itens, paineis }, null, 2));
      console.log(`\n${itens.length} referência(s). Painéis para analisar:`);
      paineis.forEach(p => console.log(`  clientes/${slug}/referencias/${p}`));
    } else {
      console.log('Nenhuma referência capturada. Verifique a conexão ou se o site pediu login (--login).');
      process.exitCode = 2;
    }
  } finally {
    await ctx.close();
  }
}

main().catch(err => { console.error('Falha:', err.message.split('\n')[0]); process.exit(1); });
