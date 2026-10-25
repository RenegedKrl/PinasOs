// Confere se tudo está instalado e roda um teste rápido dos scripts.
// Uso: npm run testar
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
let falhas = 0;

function checar(nome, fn, dica) {
  try {
    const info = fn();
    console.log(`✔ ${nome}${info ? ` — ${info}` : ''}`);
  } catch (err) {
    const opcional = nome.includes('(opcional)');
    if (!opcional) falhas++;
    console.log(`${opcional ? '–' : '✘'} ${nome}\n    ${dica}`);
  }
}
const sh = cmd => execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split('\n')[0];
const py = process.platform === 'win32' ? 'python' : 'python3';

checar('Node.js', () => process.version, 'Instale o Node 18+ em https://nodejs.org');
checar('Playwright (pacote)', () => require('playwright') && 'ok', 'Rode: npm install');
checar('FFmpeg', () => sh('ffmpeg -version'), 'Windows: winget install Gyan.FFmpeg · Linux: sudo apt install ffmpeg');
checar('Python', () => sh(`${py} --version`), 'Instale o Python 3.10+');
checar('edge-tts', () => sh(`${py} -c "import edge_tts; print('ok')"`), 'Rode: pip install -r requirements.txt');
checar('Claude Code', () => sh('claude --version'), 'Veja https://code.claude.com/docs');
checar('Vercel CLI (opcional)', () => sh('vercel --version'), 'Opcional: npm install -g vercel');

(async () => {
  // Teste real do renderizador com um cliente temporário
  const slug = '_teste-sistema';
  const dir = path.join(raiz, 'clientes', slug, 'criativos');
  try {
    const { chromium } = require('playwright');
    const b = await chromium.launch({ headless: true });
    await b.close();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'lote-criativos.json'), JSON.stringify({
      marca: { corPrimaria: '#0F766E', corSecundaria: '#F5F5F4', corEscura: '#0C0A09' },
      criativos: [{ id: 'teste', formato: ['feed', 'stories'], layout: 'cor-solida' }]
    }));
    execSync(`node "${path.join(__dirname, 'renderizar-criativos.js')}" ${slug}`, { stdio: 'ignore' });
    const ok = ['teste-feed.png', 'teste-stories.png'].every(f => fs.existsSync(path.join(dir, 'fundos', f)));
    if (!ok) throw new Error();
    console.log('✔ Renderizador de fundos — 2 PNGs gerados');
    const site = path.join(raiz, 'clientes', slug, 'site');
    fs.mkdirSync(site, { recursive: true });
    fs.copyFileSync(path.join(raiz, 'clientes', '_modelo-padrao', 'site', 'lp-conteudo.exemplo.json'), path.join(site, 'lp-conteudo.json'));
    execSync(`node "${path.join(__dirname, 'gerar-lp.js')}" ${slug}`, { stdio: 'ignore' });
    execSync(`node "${path.join(__dirname, 'verificar-lp.js')}" ${slug}`, { stdio: 'ignore' });
    console.log('✔ Gerador e verificador de LP — página de exemplo aprovada');
  } catch {
    falhas++;
    console.log('✘ Teste do motor (Playwright)\n    Rode: npx playwright install chromium');
  } finally {
    fs.rmSync(path.join(raiz, 'clientes', slug), { recursive: true, force: true });
  }
  console.log(falhas ? `\n${falhas} item(ns) para resolver.` : '\nTudo pronto. Abra o Claude Code com: claude');
  process.exit(falhas ? 1 : 0);
})();
