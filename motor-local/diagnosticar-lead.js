// Diagnóstico automático do site de um lead.
// Uso: node motor-local/diagnosticar-lead.js <URL> <slug>
// Opcional: PAGESPEED_API_KEY no ambiente para métricas oficiais do Google (gratuito).
require('./lib/env');
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 30000;

async function pageSpeed(url) {
  const key = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : '';
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${key}`;
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) return { erro: `PageSpeed HTTP ${res.status}` };
    const data = await res.json();
    const a = data.lighthouseResult.audits;
    return {
      notaPerformanceMobile: Math.round(data.lighthouseResult.categories.performance.score * 100),
      lcpSegundos: Number((a['largest-contentful-paint'].numericValue / 1000).toFixed(2)),
      cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
      tbtMs: Math.round(a['total-blocking-time'].numericValue)
    };
  } catch (err) {
    return { erro: `PageSpeed indisponível: ${err.message}` };
  }
}

async function analisarPagina(page) {
  return page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    const links = [...document.querySelectorAll('a[href]')].map(a => a.href);
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByName('first-contentful-paint')[0];
    return {
      metaPixel: /connect\.facebook\.net\/[^"']*fbevents\.js|fbq\(\s*['"]init/i.test(html),
      googleTag: /googletagmanager\.com\/(gtm|gtag)|gtag\(\s*['"]config/i.test(html),
      linksWhatsapp: links.filter(h => /wa\.me\/|api\.whatsapp\.com|web\.whatsapp\.com/i.test(h)).length,
      formularios: document.querySelectorAll('form').length,
      elementor: /wp-content\/plugins\/elementor/i.test(html),
      wordpress: /wp-content\//i.test(html),
      temViewport: !!document.querySelector('meta[name="viewport"]'),
      titulo: document.title,
      metaDescricao: document.querySelector('meta[name="description"]')?.content || '',
      h1: [...document.querySelectorAll('h1')].map(e => e.innerText.trim()).filter(Boolean),
      h2: [...document.querySelectorAll('h2')].map(e => e.innerText.trim()).filter(Boolean).slice(0, 8),
      telefones: [...new Set((document.body?.innerText.match(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/g) || []))].slice(0, 5),
      instagram: links.find(h => /instagram\.com\//i.test(h)) || null,
      fcpSegundos: paint ? Number((paint.startTime / 1000).toFixed(2)) : null,
      loadSegundos: nav && nav.loadEventEnd > 0 ? Number((nav.loadEventEnd / 1000).toFixed(2)) : null,
      pesoTotalKb: Math.round(performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0) / 1024)
    };
  });
}

async function diagnosticarLead(url, slug) {
  const pasta = path.join(__dirname, '..', 'clientes', slug, 'contexto');
  fs.mkdirSync(pasta, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const relatorio = { urlAnalisada: url, dataAnalise: new Date().toISOString() };

  try {
    // Desktop
    const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    let resp;
    try {
      resp = await desk.goto(url, { waitUntil: 'load', timeout: TIMEOUT_MS });
    } catch (err) {
      relatorio.erroAcesso = `Site não carregou: ${err.message.split('\n')[0]}`;
    }
    relatorio.statusHttp = resp ? resp.status() : 0;
    relatorio.urlFinal = desk.url();
    relatorio.https = desk.url().startsWith('https://');

    if (resp) {
      await desk.waitForTimeout(1500);
      relatorio.tecnico = await analisarPagina(desk);
      await desk.screenshot({ path: path.join(pasta, 'site-atual-desktop.png') });
      await desk.screenshot({ path: path.join(pasta, 'site-atual-desktop-completo.png'), fullPage: true });

      // Mobile real (user-agent, touch, DPR)
      const ctx = await browser.newContext({ ...devices['iPhone 13'] });
      const mob = await ctx.newPage();
      await mob.goto(url, { waitUntil: 'load', timeout: TIMEOUT_MS }).catch(() => {});
      await mob.waitForTimeout(1500);
      relatorio.mobile = await mob.evaluate(() => ({
        rolagemHorizontal: document.documentElement.scrollWidth > window.innerWidth + 1,
        larguraConteudo: document.documentElement.scrollWidth
      }));
      await mob.screenshot({ path: path.join(pasta, 'site-atual-mobile.png') });
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  relatorio.pageSpeed = await pageSpeed(url);

  const t = relatorio.tecnico || {};
  const ps = relatorio.pageSpeed || {};
  relatorio.oportunidadesPinas = [
    relatorio.erroAcesso ? `CRÍTICO (Site): ${relatorio.erroAcesso}` : null,
    relatorio.tecnico && !relatorio.https ? 'CRÍTICO (Site): Sem HTTPS — navegador mostra "não seguro".' : null,
    relatorio.tecnico && !t.metaPixel ? 'CRÍTICO (Tráfego): Sem Pixel da Meta — visitantes não entram em remarketing.' : null,
    relatorio.tecnico && !t.googleTag ? 'ALTO (Tráfego): Sem Google Tag/Analytics — não dá para medir de onde vêm os clientes.' : null,
    ps.notaPerformanceMobile != null && ps.notaPerformanceMobile < 50 ? `CRÍTICO (LP): Nota de performance mobile ${ps.notaPerformanceMobile}/100 (LCP ${ps.lcpSegundos}s).` : null,
    ps.notaPerformanceMobile != null && ps.notaPerformanceMobile >= 50 && ps.notaPerformanceMobile < 90 ? `MÉDIO (LP): Performance mobile ${ps.notaPerformanceMobile}/100 — dá para chegar a 90+.` : null,
    relatorio.tecnico && t.linksWhatsapp === 0 ? 'ALTO (CRM): Nenhum link direto de WhatsApp.' : null,
    relatorio.tecnico && t.formularios === 0 && t.linksWhatsapp > 0 ? 'MÉDIO (CRM): WhatsApp sem triagem — leads chegam sem qualificação nem origem registrada.' : null,
    relatorio.mobile?.rolagemHorizontal ? 'ALTO (LP): Rolagem horizontal no celular — layout quebrado.' : null,
    relatorio.tecnico && !t.temViewport ? 'ALTO (LP): Sem meta viewport — site não é responsivo.' : null,
    relatorio.tecnico && t.h1.length === 0 ? 'MÉDIO (Copy/SEO): Sem H1 definindo a proposta de valor.' : null,
    relatorio.tecnico && !t.metaDescricao ? 'BAIXO (SEO): Sem meta description.' : null
  ].filter(Boolean);

  const saida = path.join(pasta, 'diagnostico-automatico.json');
  fs.writeFileSync(saida, JSON.stringify(relatorio, null, 2), 'utf-8');
  console.log(`Diagnóstico salvo em: ${saida}`);
  console.log(`Oportunidades encontradas: ${relatorio.oportunidadesPinas.length}`);
  relatorio.oportunidadesPinas.forEach(o => console.log(` - ${o}`));
}

const [, , urlArg, slugArg] = process.argv;
if (!urlArg || !slugArg) {
  console.log('Uso: node motor-local/diagnosticar-lead.js https://site-do-lead.com.br slug-do-lead');
  process.exit(1);
}
diagnosticarLead(urlArg, slugArg).catch(err => {
  console.error('Falha no diagnóstico:', err.message);
  process.exit(1);
});
