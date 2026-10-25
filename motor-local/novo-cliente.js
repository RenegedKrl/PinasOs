// Cria a pasta de um novo cliente/prospect a partir do modelo.
// Uso: node motor-local/novo-cliente.js <slug>
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.log('Uso: node motor-local/novo-cliente.js <slug>  (só letras minúsculas, números e hífen)');
  process.exit(1);
}
const raiz = path.join(__dirname, '..', 'clientes');
const destino = path.join(raiz, slug);
fs.mkdirSync(destino, { recursive: true });
// force:false mantém arquivos já preenchidos
fs.cpSync(path.join(raiz, '_modelo-padrao'), destino, {
  recursive: true,
  force: false,
  filter: src => path.basename(src) !== '.gitkeep'
});
for (const sub of ['contexto', 'site', 'criativos', 'crm', 'relatorios']) fs.mkdirSync(path.join(destino, sub), { recursive: true });
console.log(`Cliente pronto em: ${destino}`);
