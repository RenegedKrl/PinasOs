// Checklist automático de uma Landing Page (seção 6 do CLAUDE.md).
// Uso: node motor-local/verificar-lp.js <slug> [--oficial]
//      node motor-local/verificar-lp.js <caminho/index.html|URL> [--oficial]
// --oficial: exige que NÃO haja noindex nem faixa de protótipo.
// Salva prints em clientes/<slug>/site/ e o resultado em verificacao.json.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function verificar(alvo, oficial) {
  const raiz = path.join(__dirname, '..');
  let url, pastaSaida;
  if (/^https?:\/\//.test(alvo)) {
    url = alvo;
    pastaSaida = process.cwd();
  } else {
    const arquivo = fs.existsSync(alvo) ? path.resolve(alvo) : path.join(raiz, 'clientes', alvo, 'site', 'index.html');
    if (!fs.existsSync(arquivo)) { console.error(`Não encontrado: ${arquivo}`); process.exit(1); }
    url = pathToFileURL(arquivo).href;
    pastaSaida = path.dirname(arquivo);
  }

  const browser = await chromium.launch({ headless: true });
  const resultado = { alvo: url, data: new Date().toISOString(), checks: [] };
  const check = (nome, ok, detalhe = '') => resultado.checks.push({ nome, ok, detalhe });
  const errosConsole = [];

  try {
    const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    desk.on('pageerror', e => errosConsole.push(e.message));
    await desk.goto(url, { waitUntil: 'load', timeout: 30000 });
    await desk.waitForTimeout(800);
    await desk.screenshot({ path: path.join(pastaSaida, 'print-desktop.png'), fullPage: true });

    const info = await desk.evaluate(() => {
      const links = [...document.querySelectorAll('a[href]')];
      const texto = document.body.innerText;
      return {
        titulo: document.title,
        descricao: document.querySelector('meta[name="description"]')?.content || '',
        noindex: /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || ''),
        faixaPrototipo: /prot[óo]tipo de demonstra/i.test(texto),
        h1: document.querySelectorAll('h1').length,
        viewport: !!document.querySelector('meta[name="viewport"]'),
        linksVazios: links.filter(a => ['#', '', 'javascript:void(0)'].includes(a.getAttribute('href').trim())).map(a => a.innerText.trim().slice(0, 40)),
        whatsapp: links.filter(a => /wa\.me\/|api\.whatsapp/.test(a.href)).map(a => a.href),
        imgsSemAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
        imgsSemDimensao: [...document.querySelectorAll('img')].filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length,
        consentimento: !!document.querySelector('form input[type="checkbox"][required], [data-consentimento]'),
        temForm: !!document.querySelector('form'),
        placeholders: (texto.match(/\[[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^\]]{2,60}\]/g) || []).slice(0, 15),
        proibidas: ['No mundo digital de hoje', 'Desbloqueie', 'Eleve seu patamar', 'Soluções inovadoras', 'sob medida para você'].filter(p => texto.toLowerCase().includes(p.toLowerCase())),
        tamanhoHtmlKb: Math.round(document.documentElement.outerHTML.length / 1024)
      };
    });

    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const mob = await ctx.newPage();
    await mob.goto(url, { waitUntil: 'load', timeout: 30000 });
    await mob.waitForTimeout(800);
    const m = await mob.evaluate(() => {
      const ctas = [...document.querySelectorAll('a.btn, a[href*="wa.me"], button.btn, [data-cta]')].filter(e => e.offsetParent && !e.closest('.flutuante'));
      const visivel = ctas.some(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.top >= 0 && b.bottom <= window.innerHeight; });
      return {
        rolagem: document.documentElement.scrollWidth > window.innerWidth + 1,
        largura: document.documentElement.scrollWidth,
        ctaAcimaDaDobra: visivel,
        fonteMinima: Math.min(...[...document.querySelectorAll('p, li, a, button, label')].filter(e => e.offsetParent).map(e => parseFloat(getComputedStyle(e).fontSize)))
      };
    });
    await mob.screenshot({ path: path.join(pastaSaida, 'print-mobile.png') });
    await mob.screenshot({ path: path.join(pastaSaida, 'print-mobile-completo.png'), fullPage: true });
    await ctx.close();

    check('Sem rolagem horizontal no celular', !m.rolagem, m.rolagem ? `largura ${m.largura}px` : '');
    check('CTA visível sem rolar no celular', m.ctaAcimaDaDobra);
    check('Fonte mínima ≥ 14px no celular', m.fonteMinima >= 14, `${m.fonteMinima}px`);
    check('Meta viewport', info.viewport);
    check('Um H1', info.h1 === 1, `${info.h1} encontrado(s)`);
    check('Title e meta description', !!info.titulo && !!info.descricao);
    check('Links de WhatsApp presentes', info.whatsapp.length > 0, `${info.whatsapp.length}`);
    check('Nenhum link vazio (#)', info.linksVazios.length === 0, info.linksVazios.join(' | '));
    check('Imagens com alt', info.imgsSemAlt === 0, `${info.imgsSemAlt} sem alt`);
    check('Imagens com width/height', info.imgsSemDimensao === 0, `${info.imgsSemDimensao} sem dimensão`);
    check('Consentimento LGPD no formulário', !info.temForm || info.consentimento);
    check('Sem frases proibidas (AI slop)', info.proibidas.length === 0, info.proibidas.join(', '));
    check('Sem erros de JavaScript', errosConsole.length === 0, errosConsole.slice(0, 3).join(' | '));
    if (oficial) {
      check('Sem noindex (versão oficial)', !info.noindex);
      check('Sem faixa de protótipo (versão oficial)', !info.faixaPrototipo);
      check('Sem placeholders [ ... ] pendentes', info.placeholders.length === 0, info.placeholders.join(' '));
    } else {
      check('Protótipo com noindex', info.noindex);
      check('Protótipo com faixa de aviso', info.faixaPrototipo);
    }
    resultado.placeholdersPendentes = info.placeholders;
    resultado.tamanhoHtmlKb = info.tamanhoHtmlKb;
  } finally {
    await browser.close();
  }

  const falhas = resultado.checks.filter(c => !c.ok);
  resultado.aprovado = falhas.length === 0;
  fs.writeFileSync(path.join(pastaSaida, 'verificacao.json'), JSON.stringify(resultado, null, 2));
  resultado.checks.forEach(c => console.log(`${c.ok ? '✔' : '✘'} ${c.nome}${c.detalhe ? ` — ${c.detalhe}` : ''}`));
  console.log(resultado.aprovado ? '\nAPROVADA' : `\n${falhas.length} item(ns) para corrigir. Prints em ${pastaSaida}`);
  process.exitCode = resultado.aprovado ? 0 : 2;
}

const args = process.argv.slice(2);
const oficial = args.includes('--oficial');
const alvo = args.find(a => a !== '--oficial');
if (!alvo) { console.log('Uso: node motor-local/verificar-lp.js <slug|arquivo|URL> [--oficial]'); process.exit(1); }
verificar(alvo, oficial).catch(err => { console.error('Falha:', err.message.split('\n')[0]); process.exit(1); });
