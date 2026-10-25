// Gera os efeitos sonoros básicos com FFmpeg (sintetizados, sem direitos autorais).
// Uso: node motor-local/gerar-sfx.js
// Saída: assets-globais/sfx/{whoosh,pop,click,cash,impacto,subida}.mp3
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pasta = path.join(__dirname, '..', 'assets-globais', 'sfx');
fs.mkdirSync(pasta, { recursive: true });

// Cada efeito: [entrada lavfi, filtros]
const efeitos = {
  whoosh: ['anoisesrc=d=0.6:c=pink:a=0.8', 'bandpass=f=1200:width_type=o:w=2,afade=t=in:d=0.25,afade=t=out:st=0.3:d=0.3,volume=1.6'],
  pop: ['sine=f=900:d=0.09', 'asetrate=44100*1.4,aresample=44100,afade=t=out:st=0.02:d=0.07,volume=0.9'],
  click: ['sine=f=2400:d=0.03', 'afade=t=out:st=0.005:d=0.025,volume=0.7'],
  cash: ['sine=f=1568:d=0.5', 'aecho=0.8:0.6:60|120:0.5|0.3,afade=t=out:st=0.1:d=0.4,volume=0.8'],
  impacto: ['sine=f=55:d=0.7', 'afade=t=out:st=0.05:d=0.65,volume=2.5'],
  subida: ['aevalsrc=sin(2*PI*(200+900*t)*t):d=0.8', 'afade=t=in:d=0.1,afade=t=out:st=0.6:d=0.2,volume=0.6']
};

for (const [nome, [src, filtro]] of Object.entries(efeitos)) {
  const saida = path.join(pasta, `${nome}.mp3`);
  try {
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', src, '-af', filtro, '-ac', '2', saida]);
    console.log(`SFX gerado: assets-globais/sfx/${nome}.mp3`);
  } catch (err) {
    console.error(`Falha em ${nome}: ${err.message.split('\n')[0]}`);
    process.exitCode = 1;
  }
}
