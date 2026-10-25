// Converte um .md (proposta, contrato, análise, relatório) em HTML bonito e imprimível (Imprimir → Salvar como PDF).
// Uso: node motor-local/gerar-documento.js <arquivo.md> [--cor #9A3B26] [--marca "Pinas"]
// Saída: mesmo nome com .html, ao lado do .md.
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const arq = args.find(a => a.endsWith('.md'));
if (!arq || !fs.existsSync(arq)) { console.log('Uso: node motor-local/gerar-documento.js <arquivo.md> [--cor #hex] [--marca "Nome"]'); process.exit(1); }
const opt = k => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : null; };
const cor = /^#[0-9a-f]{3,8}$/i.test(opt('cor') || '') ? opt('cor') : '#9A3B26';
const marca = opt('marca') || 'Pinas';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\{\{([A-Z0-9_]+)\}\}/g, '<mark>{{$1}}</mark>');

// Markdown suficiente para documentos comerciais: títulos, listas, tabelas, citações, regras, checkboxes
function md2html(md) {
  const out = []; const L = md.replace(/\r/g, '').split('\n');
  let i = 0;
  while (i < L.length) {
    const l = L[i];
    if (/^\s*$/.test(l)) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
    if (/^(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\|/.test(l) && /^\|?\s*:?-{2,}/.test(L[i + 1] || '')) {
      const cel = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const cab = cel(l); i += 2; const rows = [];
      while (i < L.length && /^\|/.test(L[i])) rows.push(cel(L[i++]));
      out.push(`<table><thead><tr>${cab.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (/^>\s?/.test(l)) { const b = []; while (i < L.length && /^>\s?/.test(L[i])) b.push(L[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${inline(b.join(' '))}</blockquote>`); continue; }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ord = /^\s*\d+\./.test(l); const it = [];
      while (i < L.length && /^\s*([-*]|\d+\.)\s+/.test(L[i])) {
        let t = L[i++].replace(/^\s*([-*]|\d+\.)\s+/, '');
        const ck = t.match(/^\[( |x)\]\s+(.*)/i);
        it.push(ck ? `<li class="ck">${ck[1].trim() ? '☑' : '☐'} ${inline(ck[2])}</li>` : `<li>${inline(t)}</li>`);
      }
      out.push(`<${ord ? 'ol' : 'ul'}>${it.join('')}</${ord ? 'ol' : 'ul'}>`); continue;
    }
    const p = []; while (i < L.length && L[i].trim() && !/^(#|\||>|\s*[-*]\s|\s*\d+\.\s|-{3,})/.test(L[i])) p.push(L[i++]);
    out.push(`<p>${p.map(inline).join('<br>')}</p>`);
  }
  return out.join('\n');
}

const corpo = md2html(fs.readFileSync(arq, 'utf-8'));
const titulo = (fs.readFileSync(arq, 'utf-8').match(/^#\s+(.*)/m) || [, path.basename(arq, '.md')])[1].replace(/[*`]/g, '');
const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:18mm 16mm}
body{font-family:'Instrument Sans',system-ui,sans-serif;color:#1C1B18;background:#F4F1EA;margin:0;padding:48px 24px;line-height:1.6;font-size:15.5px}
.doc{max-width:760px;margin:0 auto;background:#fffdf8;padding:56px clamp(24px,6vw,72px);box-shadow:0 1px 0 #d8d2c5}
.topo{display:flex;justify-content:space-between;font:12px ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em;color:#6b675e;border-bottom:1px solid #1C1B18;padding-bottom:10px;margin-bottom:36px}
h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:46px;line-height:1;margin:0 0 20px}
h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:28px;margin:40px 0 10px;padding-top:14px;border-top:1px solid #d8d2c5}
h3{font-size:16px;margin:24px 0 6px}h4{font-size:14px;margin:18px 0 4px;text-transform:uppercase;letter-spacing:.04em}
em{color:${cor}}a{color:${cor}}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:14.5px}
th{text-align:left;font:12px ui-monospace,Menlo,monospace;text-transform:uppercase;color:#6b675e;border-bottom:1px solid #1C1B18;padding:8px 6px}
td{padding:9px 6px;border-bottom:1px solid #e6e0d4;vertical-align:top}
blockquote{margin:16px 0;padding:4px 0 4px 18px;border-left:2px solid ${cor};color:#4a463f}
ul,ol{padding-left:22px}li{margin:4px 0}li.ck{list-style:none;margin-left:-22px}
hr{border:0;border-top:1px solid #d8d2c5;margin:28px 0}
code{font-size:13px;background:#f1ece2;padding:1px 5px}
mark{background:#F4D35E}
@media print{body{background:#fff;padding:0}.doc{box-shadow:none;padding:0;max-width:none}}
</style></head><body><article class="doc"><div class="topo"><span>${esc(marca)}</span><span>${new Date().toLocaleDateString('pt-BR')}</span></div>
${corpo}
</article></body></html>`;
const saida = arq.replace(/\.md$/, '.html');
fs.writeFileSync(saida, html);
const pend = (html.match(/<mark>/g) || []).length;
console.log(`Documento: ${saida}${pend ? ` (${pend} campo(s) {{...}} ainda sem preencher, destacados em amarelo)` : ''}`);
