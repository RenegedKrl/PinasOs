// Carrega o arquivo .env da raiz (sem dependências). Variáveis já definidas no sistema têm prioridade.
const fs = require('fs');
const path = require('path');

const arq = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(arq)) {
  for (const linha of fs.readFileSync(arq, 'utf-8').split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
module.exports = process.env;
