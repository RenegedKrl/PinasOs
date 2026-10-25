// Grava um vídeo curto rolando a LP no celular — para mostrar ao prospect sem publicar nada.
// Uso: node motor-local/gravar-demo-lp.js <slug|arquivo|URL> [segundos=15]
// Saída: clientes/<slug>/site/demo-mobile.mp4
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function gravar(alvo, segundos) {
  const raiz = path.join(__dirname, '..');
  let url, pasta;
  if (/^https?:\/\//.test(alvo)) { url = alvo; pasta = process.cwd(); }
  else {
    const arq = fs.existsSync(alvo) ? path.resolve(alvo) : path.join(raiz, 'clientes', alvo, 'site', 'index.html');
    if (!fs.existsSync(arq)) { console.error(`Não encontrado: ${arq}`); process.exit(1); }
    url = pathToFileURL(arq).href; pasta = path.dirname(arq);
  }
  const tmp = fs.mkdtempSync(path.join(pasta, '.gravacao-'));
  const iphone = devices['iPhone 13'];
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ ...iphone, recordVideo: { dir: tmp, size: iphone.viewport } });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1500);
    const altura = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const passos = Math.max(1, Math.round((segundos - 3) * 30));
    for (let i = 1; i <= passos; i++) {
      // easing suave
      const t = i / passos;
      const y = altura * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      await page.evaluate(v => window.scrollTo(0, v), y);
      await page.waitForTimeout(33);
    }
    await page.waitForTimeout(1500);
  } finally {
    await ctx.close();
    await browser.close();
  }
  const webm = fs.readdirSync(tmp).find(f => f.endsWith('.webm'));
  const saida = path.join(pasta, 'demo-mobile.mp4');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(tmp, webm), '-vf', 'scale=780:-2', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', saida]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Vídeo de demonstração: ${saida}`);
}

const [, , alvo, seg] = process.argv;
if (!alvo) { console.log('Uso: node motor-local/gravar-demo-lp.js <slug|arquivo|URL> [segundos]'); process.exit(1); }
gravar(alvo, Number(seg) || 15).catch(err => { console.error('Falha:', err.message.split('\n')[0]); process.exit(1); });
