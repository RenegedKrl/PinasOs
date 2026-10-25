// Backup das pastas que NÃO vão para o Git (dados de clientes, comercial, .env).
// Uso: node motor-local/backup.js [pasta-destino]   (padrão: ../pinas-backups)
// Mantém os 10 backups mais recentes. Guarde uma cópia fora do computador (HD externo, Drive pessoal).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const destino = path.resolve(process.argv[2] || path.join(RAIZ, '..', 'pinas-backups'));
fs.mkdirSync(destino, { recursive: true });
const carimbo = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const arquivo = path.join(destino, `pinas-${carimbo}.tar.gz`);
const itens = ['clientes', 'comercial', '.env', 'APRENDIZADOS.md', 'assets-globais'].filter(i => fs.existsSync(path.join(RAIZ, i)));

// tar existe no Linux, Mac e Windows 10+
execFileSync('tar', ['-czf', arquivo, '--exclude=*.mp4', '--exclude=.gravacao-*', '-C', RAIZ, ...itens], { stdio: 'inherit' });
const mb = (fs.statSync(arquivo).size / 1048576).toFixed(1);
console.log(`Backup: ${arquivo} (${mb} MB)`);

const antigos = fs.readdirSync(destino).filter(f => /^pinas-.*\.tar\.gz$/.test(f)).sort().reverse().slice(10);
antigos.forEach(f => fs.rmSync(path.join(destino, f)));
if (antigos.length) console.log(`${antigos.length} backup(s) antigo(s) removido(s).`);
console.log('Restaurar: tar -xzf <arquivo> -C <pasta-do-pinas-os>');
