// Gera vídeo (Reels/Stories) SEM TEXTO a partir dos fundos já renderizados + locução + SFX.
// Uso: node motor-local/renderizar-motion.js <slug> [arquivo-config.json]
// Config padrão: clientes/<slug>/criativos/motion.json
// {
//   "saida": "reels-01.mp4",
//   "formato": "stories",              // stories 1080x1920 | feed 1080x1350 | quadrado 1080x1080
//   "cenas": [ { "imagem": "fundos/dor-01-stories.png", "duracao": 4, "movimento": "zoom-in", "sfx": "whoosh" } ],
//   "locucao": "locucao-01.mp3",      // opcional; se existir, o vídeo acompanha a duração dela
//   "musica": null,                    // opcional; mp3 de fundo (volume baixo)
//   "transicao": 0.4
// }
// Movimentos: zoom-in | zoom-out | pan-esquerda | pan-direita | parado
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FORMATOS = { stories: [1080, 1920], feed: [1080, 1350], quadrado: [1080, 1080] };
const FPS = 30;

function duracaoAudio(arquivo) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arquivo]).toString();
  return parseFloat(out);
}

function filtroMovimento(mov, w, h, frames) {
  const base = `scale=${w * 2}:${h * 2}:force_original_aspect_ratio=increase,crop=${w * 2}:${h * 2}`;
  const z = {
    'zoom-in': `zoompan=z='min(1+0.12*on/${frames},1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
    'zoom-out': `zoompan=z='1.12-0.12*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
    'pan-esquerda': `zoompan=z=1.1:x='(iw-iw/zoom)*(1-on/${frames})':y='ih/2-(ih/zoom/2)'`,
    'pan-direita': `zoompan=z=1.1:x='(iw-iw/zoom)*on/${frames}':y='ih/2-(ih/zoom/2)'`,
    'parado': `zoompan=z=1:x=0:y=0`
  }[mov] || `zoompan=z='min(1+0.12*on/${frames},1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`;
  return `${base},${z}:d=${frames}:s=${w}x${h}:fps=${FPS},setsar=1,format=yuv420p`;
}

function renderizar(slug, configArg) {
  const raiz = path.join(__dirname, '..');
  const pasta = path.join(raiz, 'clientes', slug, 'criativos');
  const arqConfig = configArg ? path.resolve(configArg) : path.join(pasta, 'motion.json');
  if (!fs.existsSync(arqConfig)) {
    console.error(`Config não encontrada: ${arqConfig}`);
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(arqConfig, 'utf-8'));
  const [w, h] = FORMATOS[cfg.formato] || FORMATOS.stories;
  const trans = cfg.transicao ?? 0.4;
  const achar = ref => [path.resolve(pasta, ref), path.resolve(raiz, ref)].find(p => fs.existsSync(p));

  const cenas = (cfg.cenas || []).map(c => ({ ...c, arquivo: achar(c.imagem) }));
  const faltando = cenas.filter(c => !c.arquivo);
  if (!cenas.length || faltando.length) {
    console.error(faltando.length ? `Imagens não encontradas: ${faltando.map(c => c.imagem).join(', ')}` : 'Nenhuma cena.');
    process.exit(1);
  }

  const locucao = cfg.locucao ? achar(cfg.locucao) : null;
  if (cfg.locucao && !locucao) console.warn(`Locução não encontrada (${cfg.locucao}) — vídeo sai sem voz.`);

  // Se houver locução, distribui as cenas na duração dela (+0.5s de respiro)
  let duracoes = cenas.map(c => c.duracao || 3);
  if (locucao) {
    const alvo = duracaoAudio(locucao) + 0.5 + trans * (cenas.length - 1);
    const soma = duracoes.reduce((a, b) => a + b, 0);
    duracoes = duracoes.map(d => (d / soma) * alvo);
  }
  const total = duracoes.reduce((a, b) => a + b, 0) - trans * (cenas.length - 1);

  const args = ['-loglevel', 'error', '-y'];
  cenas.forEach((c, i) => args.push('-loop', '1', '-t', duracoes[i].toFixed(2), '-i', c.arquivo));

  const filtros = [];
  cenas.forEach((c, i) => filtros.push(`[${i}:v]${filtroMovimento(c.movimento, w, h, Math.round(duracoes[i] * FPS))}[v${i}]`));
  let ultimo = 'v0';
  let offset = 0;
  for (let i = 1; i < cenas.length; i++) {
    offset += duracoes[i - 1] - trans;
    filtros.push(`[${ultimo}][v${i}]xfade=transition=fade:duration=${trans}:offset=${offset.toFixed(2)}[x${i}]`);
    ultimo = `x${i}`;
  }

  // Áudio: locução + SFX no início de cada cena + música baixa
  const audios = [];
  let idx = cenas.length;
  if (locucao) { args.push('-i', locucao); audios.push(`[${idx}:a]adelay=300|300,volume=1.0[loc]`); idx++; }
  let inicio = 0;
  cenas.forEach((c, i) => {
    const sfx = c.sfx && path.join(raiz, 'assets-globais', 'sfx', `${c.sfx}.mp3`);
    if (sfx && fs.existsSync(sfx)) {
      const ms = Math.max(0, Math.round((inicio - (i ? trans / 2 : 0)) * 1000));
      args.push('-i', sfx);
      audios.push(`[${idx}:a]adelay=${ms}|${ms},volume=0.5[s${i}]`);
      idx++;
    }
    inicio += duracoes[i] - trans;
  });
  const musica = cfg.musica ? achar(cfg.musica) : null;
  if (musica) { args.push('-stream_loop', '-1', '-i', musica); audios.push(`[${idx}:a]volume=0.12[mus]`); idx++; }

  const rotulos = audios.map(a => a.match(/\[(\w+)\]$/)[1]);
  filtros.push(...audios);
  if (rotulos.length) {
    filtros.push(`${rotulos.map(r => `[${r}]`).join('')}amix=inputs=${rotulos.length}:duration=longest:normalize=0,atrim=0:${total.toFixed(2)}[aout]`);
  }

  const saida = path.join(pasta, cfg.saida || 'motion-01.mp4');
  args.push('-filter_complex', filtros.join(';'), '-map', `[${ultimo}]`);
  if (rotulos.length) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '160k');
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-t', total.toFixed(2), '-movflags', '+faststart', saida);

  console.log(`Renderizando ${cenas.length} cena(s), ${total.toFixed(1)}s, ${w}x${h}...`);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  console.log(`Vídeo gerado: ${saida}`);
}

const [, , slug, config] = process.argv;
if (!slug) {
  console.log('Uso: node motor-local/renderizar-motion.js <slug> [config.json]');
  process.exit(1);
}
try { renderizar(slug, config); } catch (err) { console.error('Falha:', err.message.split('\n')[0]); process.exit(1); }
