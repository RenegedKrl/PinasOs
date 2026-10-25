// Leitura/escrita de CSV sem dependências (aceita , ou ; e campos entre aspas).
const fs = require('fs');

function lerCsv(texto) {
  const l0 = texto.split('\n')[0];
  const sep = (l0.match(/;/g) || []).length > (l0.match(/,/g) || []).length ? ';' : ',';
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) { if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (ch === '"') aspas = false; else campo += ch; }
    else if (ch === '"') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ''; }
    else if (ch === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
    else if (ch !== '\r') campo += ch;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab = [], ...resto] = linhas.filter(l => l.some(c => c.trim()));
  const chaves = cab.map(c => c.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_'));
  return resto.map(l => Object.fromEntries(chaves.map((c, i) => [c, (l[i] || '').trim()])));
}

const lerArquivo = arq => (fs.existsSync(arq) ? lerCsv(fs.readFileSync(arq, 'utf-8')) : []);
const campo = v => (/[",\n;]/.test(String(v ?? '')) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
const escrever = (arq, colunas, linhas) => fs.writeFileSync(arq, [colunas.join(','), ...linhas.map(l => colunas.map(c => campo(l[c])).join(','))].join('\n') + '\n');

// Datas: aceita AAAA-MM-DD e DD/MM/AAAA
function data(v) {
  if (!v) return null;
  const br = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  const d = br ? new Date(`${br[3]}-${br[2]}-${br[1]}T12:00:00`) : new Date(String(v).slice(0, 10) + 'T12:00:00');
  return isNaN(d) ? null : d;
}
const dias = (a, b = new Date()) => Math.floor((b - a) / 86400000);
const num = v => Number(String(v || '0').replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')) || 0;
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

module.exports = { lerCsv, lerArquivo, escrever, data, dias, num, brl };
