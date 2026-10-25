// Estilo SUÍÇO — grid tipográfico internacional.
// Sans pesada e apertada, tudo alinhado a colunas, serviços em tabela, bloco sólido da cor da marca, números gigantes.
// Bom para: energia solar, imobiliária, engenharia, academia, serviços técnicos, B2B, contabilidade.
const { esc, rico, cor, fonte, lista, dois, head, faixaPrototipo, triagem, botaoFlutuante, script } = require('../comum');

module.exports = function suico(x) {
  const { c, m, ct, h, whats } = x;
  const fD = fonte(m.fonteTitulo, 'Archivo');
  const fT = fonte(m.fonteTexto, 'IBM Plex Sans');
  const branco = cor(m.corClara, '#F6F6F3');
  const preto = cor(m.corEscura, '#0B0B0B');
  const acento = cor(m.corPrimaria, '#FF4F1F');
  const tAcento = cor(m.corPrimariaTexto, '#0B0B0B');
  const servicos = lista(c.servicos?.itens);
  const deps = lista(c.depoimentos?.itens);
  const nums = lista(c.autoridade?.numeros);

  const css = `
:root{--b:${branco};--p:${preto};--a:${acento};--at:${tAcento};--l:color-mix(in srgb,var(--p) 14%,transparent);--s:color-mix(in srgb,var(--p) 58%,var(--b));--fd:'${fD}',Helvetica,Arial,sans-serif;--ft:'${fT}',Helvetica,Arial,sans-serif;--mono:'IBM Plex Mono',ui-monospace,Menlo,monospace}
body{font-family:var(--ft);background:var(--b);color:var(--p);font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased}
.w{max-width:1360px;margin:0 auto;padding:0 clamp(16px,3vw,40px)}
.g{display:grid;grid-template-columns:repeat(12,1fr);column-gap:clamp(12px,2vw,24px)}
.rot{font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.02em;color:var(--s)}
em{font-style:normal;color:var(--a)}
.barra-topo{border-bottom:2px solid var(--p)}
.barra-topo .g{align-items:center;min-height:64px}
.marca{grid-column:1/5;font-family:var(--fd);font-weight:800;font-size:20px;letter-spacing:-.02em;text-decoration:none;text-transform:uppercase}
.marca img{height:32px;width:auto}
.barra-topo .rot{grid-column:5/9}
.barra-topo .btn{grid-column:10/13;justify-self:end}
.btn{display:inline-flex;align-items:center;gap:40px;justify-content:space-between;background:var(--a);color:var(--at);font-family:var(--fd);font-weight:700;font-size:16px;padding:16px 18px;text-decoration:none;border:2px solid var(--a);cursor:pointer;text-transform:uppercase;letter-spacing:.01em;transition:background .15s,color .15s}
.btn::after{content:'↗';font-size:20px;line-height:1}
.btn:hover{background:var(--p);border-color:var(--p);color:var(--b)}
.hero{padding:clamp(40px,6vw,88px) 0 0}
.hero h1{grid-column:1/12;font-family:var(--fd);font-weight:800;font-size:clamp(50px,9.4vw,148px);line-height:.88;letter-spacing:-.045em;text-transform:none}
.hero-linha{border-top:2px solid var(--p);margin-top:clamp(32px,5vw,64px);padding-top:16px;row-gap:20px}
.hero-linha .rot{grid-column:1/3}
.hero-linha p{grid-column:3/8;font-size:clamp(18px,1.5vw,21px);line-height:1.45}
.hero-linha .acao{grid-column:9/13;display:flex;flex-direction:column;gap:12px;align-items:stretch}
.hero-linha .acao .btn{width:100%}
.hero-img{margin-top:clamp(32px,5vw,56px)}
.hero-img img{width:100%;aspect-ratio:21/9;object-fit:cover}
.fita{background:var(--a);color:var(--at);overflow:hidden;white-space:nowrap;border-top:2px solid var(--p);border-bottom:2px solid var(--p);margin-top:clamp(32px,5vw,56px)}
.fita span{display:inline-block;padding:14px 0;font-family:var(--fd);font-weight:800;font-size:clamp(20px,2.4vw,32px);text-transform:uppercase;letter-spacing:-.01em;animation:fita 30s linear infinite}
.fita b{padding:0 .6em;font-weight:400}
@keyframes fita{to{transform:translateX(-50%)}}
section.s{padding:clamp(64px,9vw,128px) 0}
.s-cab{border-top:2px solid var(--p);padding-top:14px;margin-bottom:clamp(32px,5vw,64px);row-gap:12px}
.s-cab .rot{grid-column:1/3}
.s-cab h2{grid-column:3/12;font-family:var(--fd);font-weight:800;font-size:clamp(36px,5.2vw,80px);line-height:.92;letter-spacing:-.04em}
.vs .col{grid-column:span 6}
.vs .col+.col{border-left:2px solid var(--p);padding-left:clamp(12px,2vw,24px)}
.vs .sinal{font-family:var(--fd);font-weight:800;font-size:clamp(64px,8vw,120px);line-height:.8;display:block;margin-bottom:12px}
.vs .col:last-child .sinal{color:var(--a)}
.vs h3{font-family:var(--mono);font-size:13px;font-weight:400;text-transform:uppercase;padding-bottom:10px;border-bottom:1px solid var(--l)}
.vs ul{list-style:none}
.vs li{padding:16px 0;border-bottom:1px solid var(--l);font-size:clamp(17px,1.5vw,20px)}
.vs .col:first-child li{color:var(--s)}
.vs .col:last-child li{font-weight:500}
.tab{width:100%;border-collapse:collapse}
.tab th{font-family:var(--mono);font-size:12px;font-weight:400;text-transform:uppercase;text-align:left;color:var(--s);padding:0 12px 10px 0;border-bottom:2px solid var(--p)}
.tab td{padding:22px 12px 22px 0;border-bottom:1px solid var(--l);vertical-align:top}
.tab tr:hover td{background:color-mix(in srgb,var(--a) 10%,transparent)}
.tab .n{font-family:var(--mono);font-size:14px;width:9%;color:var(--s)}
.tab .t{font-family:var(--fd);font-weight:700;font-size:clamp(22px,2.4vw,34px);letter-spacing:-.02em;line-height:1.05;width:42%}
.tab .d{color:var(--s)}
.nums{border-top:2px solid var(--p)}
.nums div{grid-column:span 4;padding:18px 0 0;border-right:1px solid var(--l)}
.nums div:last-child{border-right:0}
.nums strong{display:block;font-family:var(--fd);font-weight:800;font-size:clamp(64px,10vw,160px);line-height:.85;letter-spacing:-.05em}
.nums div:first-child strong{color:var(--a)}
.nums span{display:block;margin-top:10px;font-family:var(--mono);font-size:13px;text-transform:uppercase}
.autor{margin-top:clamp(40px,6vw,80px);align-items:start}
.autor .foto{grid-column:1/5}
.autor .foto img{width:100%;aspect-ratio:1;object-fit:cover;filter:grayscale(1) contrast(1.1)}
.autor .sem{aspect-ratio:1;background:repeating-linear-gradient(45deg,var(--l) 0 1px,transparent 1px 12px);display:grid;place-items:center}
.autor .txt{grid-column:6/12;font-size:clamp(19px,1.8vw,24px);line-height:1.45}
.deps{border-top:2px solid var(--p)}
.deps figure{grid-column:span 4;padding:20px clamp(12px,2vw,24px) 0 0;display:flex;flex-direction:column;gap:20px}
.deps figure+figure{border-left:1px solid var(--l);padding-left:clamp(12px,2vw,24px)}
.deps blockquote{font-size:clamp(18px,1.6vw,21px);line-height:1.45}
.deps blockquote::before{content:'“';display:block;font-family:var(--fd);font-weight:800;font-size:64px;line-height:.6;color:var(--a);margin-bottom:8px}
.deps figcaption{margin-top:auto}
.tri{background:var(--a);color:var(--at);--l:color-mix(in srgb,var(--at) 25%,transparent);--s:color-mix(in srgb,var(--at) 70%,var(--a))}
.tri .s-cab{border-color:var(--at)}
.tri .s-cab .rot{color:var(--at)}
.tri-g{align-items:start}
.tri-g>p{grid-column:1/5;font-size:20px;line-height:1.45}
.tri-box{grid-column:6/13;background:var(--b);color:var(--p);padding:clamp(20px,3vw,36px);border:2px solid var(--p);--l:color-mix(in srgb,var(--p) 14%,transparent);--s:color-mix(in srgb,var(--p) 58%,var(--b))}
.barra{height:6px;background:var(--l);margin-bottom:24px}
.barra i{display:block;height:100%;width:33%;background:var(--p);transition:width .3s}
.tri-n{font-family:var(--mono);font-size:12px;text-transform:uppercase;color:var(--s);margin-bottom:8px}
.tri-box h3{font-family:var(--fd);font-weight:800;font-size:clamp(26px,2.8vw,38px);letter-spacing:-.03em;line-height:1;margin-bottom:22px}
.opcoes{display:grid;gap:8px}
.opcoes button{display:flex;align-items:center;gap:16px;text-align:left;width:100%;background:var(--b);border:2px solid var(--p);padding:14px 16px;font-size:17px;font-weight:500;cursor:pointer;transition:background .12s,color .12s}
.opcoes button:hover,.opcoes button:focus-visible{background:var(--p);color:var(--b);outline:0}
.op-k{font-family:var(--mono);font-size:13px;width:22px;height:22px;display:grid;place-items:center;border:1px solid currentColor}
.campo{display:block;margin-bottom:14px}
.campo span{display:block;font-family:var(--mono);font-size:12px;text-transform:uppercase;margin-bottom:6px}
.campo input{width:100%;font:inherit;font-size:18px;padding:14px;border:2px solid var(--p);background:var(--b);border-radius:0}
.campo input:focus{outline:3px solid var(--a);outline-offset:0}
.lgpd{display:flex;gap:10px;font-size:14px;margin:6px 0 20px;align-items:flex-start}
.lgpd input{margin-top:3px;width:18px;height:18px;accent-color:var(--p);flex:none}
.btn-enviar{width:100%;background:var(--p);color:var(--b);border-color:var(--p)}
.btn-enviar:hover{background:var(--a);color:var(--at);border-color:var(--p)}
.voltar{background:none;border:0;font-family:var(--mono);font-size:13px;text-transform:uppercase;cursor:pointer;margin-top:14px;text-decoration:underline}
.faq-g details{grid-column:span 6;border-top:2px solid var(--p);padding:18px 0 26px}
summary{font-family:var(--fd);font-weight:700;font-size:clamp(19px,1.8vw,24px);letter-spacing:-.02em;line-height:1.15;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:20px}
summary::-webkit-details-marker{display:none}
summary::after{content:'+';font-family:var(--mono);font-weight:400}
details[open] summary::after{content:'−'}
details p{margin-top:12px;color:var(--s);max-width:52ch}
.fim{background:var(--p);color:var(--b);padding:clamp(72px,10vw,140px) 0}
.fim h2{grid-column:1/11;font-family:var(--fd);font-weight:800;font-size:clamp(46px,8vw,124px);line-height:.88;letter-spacing:-.045em}
.fim p{grid-column:1/6;margin-top:28px;font-size:19px;color:color-mix(in srgb,var(--b) 70%,var(--p))}
.fim .btn{grid-column:9/13;align-self:end;margin-top:28px}
.rodape{background:var(--p);color:var(--b);border-top:1px solid color-mix(in srgb,var(--b) 20%,transparent);padding:28px 0 36px;font-size:15px}
.rodape .rot{color:color-mix(in srgb,var(--b) 55%,var(--p));display:block;margin-bottom:6px}
.rodape .g>div{grid-column:span 3}
.rodape a{text-decoration:none}.rodape a:hover{color:var(--a)}
.flutuante{position:fixed;right:0;bottom:24px;z-index:60;display:flex;align-items:center;gap:8px;background:var(--a);color:var(--at);border:2px solid var(--p);border-right:0;padding:12px 16px;text-decoration:none;font-family:var(--fd);font-weight:700;text-transform:uppercase;font-size:14px}
.revela{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1)}
.visto{opacity:1;transform:none}
@media (max-width:900px){
  .g{grid-template-columns:repeat(4,1fr)}
  .marca{grid-column:1/4}.barra-topo .rot{display:none}.barra-topo .btn{display:none}
  .hero h1,.s-cab h2,.fim h2{grid-column:1/-1}
  .hero-linha .rot,.s-cab .rot{grid-column:1/-1}
  .hero-linha p,.hero-linha .acao{grid-column:1/-1}
  .hero-img img{aspect-ratio:4/3}
  .vs .col{grid-column:1/-1}
  .vs .col+.col{border-left:0;padding-left:0;margin-top:40px}
  .tab thead{display:none}
  .tab tr{display:grid;grid-template-columns:40px 1fr;border-bottom:1px solid var(--l);padding:16px 0}
  .tab td{border:0;padding:0}
  .tab .t{width:auto}.tab .n{width:auto;padding-top:6px}
  .tab .d{grid-column:2;padding-top:6px}
  .nums div{grid-column:1/-1;border-right:0;border-bottom:1px solid var(--l);padding:16px 0}
  .autor .foto,.autor .txt{grid-column:1/-1}
  .autor .txt{margin-top:24px}
  .deps figure{grid-column:1/-1;padding:20px 0}
  .deps figure+figure{border-left:0;padding-left:0;border-top:1px solid var(--l)}
  .tri-g>p,.tri-box{grid-column:1/-1}
  .tri-g>p{margin-bottom:24px}
  .faq-g details{grid-column:1/-1}
  .fim p,.fim .btn{grid-column:1/-1}
  .rodape .g>div{grid-column:span 2;margin-bottom:16px}
  .flutuante span{display:none}
}`;

  const fita = servicos.map(s => esc(s.titulo.replace(/\*/g, ''))).join('<b>●</b>');
  const cab = (rot, titulo) => `<div class="g s-cab"><span class="rot">${esc(rot)}</span><h2>${rico(titulo)}</h2></div>`;

  return `${head(x, { fontes: [`${fD.replace(/ /g, '+')}:wght@500;700;800`, `${fT.replace(/ /g, '+')}:wght@400;500`, 'IBM+Plex+Mono'], css })}
<body>
${faixaPrototipo(x)}
<div class="barra-topo"><div class="w g">
  <a class="marca" href="./">${m.logo ? `<img src="${esc(m.logo)}" alt="${esc(m.nome)}" width="140" height="32">` : esc(m.nome)}</a>
  <span class="rot">${esc(c.topo?.texto || '')}</span>
  <a class="btn" href="#triagem" data-cta="header">${esc(h.ctaCurto || 'Orçamento')}</a>
</div></div>
<main>
<section class="hero"><div class="w">
  <div class="g"><h1>${rico(h.titulo)}</h1></div>
  <div class="g hero-linha">
    <span class="rot">${esc(h.eyebrow || '')}</span>
    <p>${rico(h.subtitulo)}</p>
    <div class="acao"><a class="btn" href="#triagem" data-cta="hero">${esc(h.cta || 'Pedir orçamento')}</a>${h.provaSocial ? `<span class="rot">${rico(h.provaSocial)}</span>` : ''}</div>
  </div>
  ${h.imagem ? `<div class="hero-img"><img src="${esc(h.imagem)}" alt="${esc(h.imagemAlt || m.nome)}" width="1600" height="686" fetchpriority="high"></div>` : ''}
</div>
${servicos.length ? `<div class="fita" aria-hidden="true"><span>${fita}<b>●</b>${fita}<b>●</b></span></div>` : ''}
</section>

${c.contraste ? `<section class="s"><div class="w" data-revela>
  ${cab('A diferença', c.contraste.titulo)}
  <div class="g vs">
    <div class="col"><span class="sinal" aria-hidden="true">−</span><h3>${esc(c.contraste.tituloAntes || 'Como costuma ser')}</h3><ul>${lista(c.contraste.antes).map(i => `<li>${rico(i)}</li>`).join('')}</ul></div>
    <div class="col"><span class="sinal" aria-hidden="true">+</span><h3>${esc(c.contraste.tituloDepois || `Com a ${m.nome}`)}</h3><ul>${lista(c.contraste.depois).map(i => `<li>${rico(i)}</li>`).join('')}</ul></div>
  </div>
</div></section>` : ''}

${servicos.length ? `<section class="s" style="padding-top:0"><div class="w" data-revela>
  ${cab(c.servicos.eyebrow || 'Serviços', c.servicos.titulo)}
  <table class="tab"><thead><tr><th>Nº</th><th>Serviço</th><th>O que inclui</th></tr></thead><tbody>
  ${servicos.map((s, i) => `<tr><td class="n">${dois(i)}</td><td class="t">${rico(s.titulo)}</td><td class="d">${rico(s.texto)}</td></tr>`).join('')}
  </tbody></table>
</div></section>` : ''}

${c.autoridade ? `<section class="s" style="padding-top:0"><div class="w" data-revela>
  ${cab(c.autoridade.eyebrow || 'Números', c.autoridade.titulo)}
  ${nums.length ? `<div class="g nums">${nums.map(nu => `<div><strong>${esc(nu.valor)}</strong><span>${esc(nu.rotulo)}</span></div>`).join('')}</div>` : ''}
  <div class="g autor">
    <div class="foto">${c.autoridade.imagem ? `<img src="${esc(c.autoridade.imagem)}" alt="${esc(c.autoridade.imagemAlt || m.nome)}" width="700" height="700" loading="lazy">` : '<div class="sem rot">[FOTO REAL]</div>'}</div>
    <p class="txt">${rico(c.autoridade.texto)}</p>
  </div>
</div></section>` : ''}

${deps.length ? `<section class="s" style="padding-top:0"><div class="w" data-revela>
  ${cab('Clientes', c.depoimentos.titulo)}
  <div class="g deps">${deps.slice(0, 3).map(d => `<figure><blockquote>${rico(d.texto)}</blockquote><figcaption class="rot">${esc(d.nome)}${d.detalhe ? ` / ${esc(d.detalhe)}` : ''}</figcaption></figure>`).join('')}</div>
</div></section>` : ''}

<section class="s tri" id="triagem"><div class="w">
  ${cab('Orçamento', x.tri.titulo || 'Três perguntas e a gente te chama')}
  <div class="g tri-g">
    <p>${rico(x.tri.subtitulo || 'Responda rápido e siga para o WhatsApp. Nossa equipe recebe suas respostas antes de falar com você.')}</p>
    ${triagem(x, { marcador: j => String(j + 1) })}
  </div>
</div></section>

${lista(c.faq?.itens).length ? `<section class="s"><div class="w" data-revela>
  ${cab('Dúvidas', c.faq.titulo || 'Perguntas frequentes')}
  <div class="g faq-g">${lista(c.faq.itens).map(f => `<details><summary>${esc(f.pergunta)}</summary><p>${rico(f.resposta)}</p></details>`).join('')}</div>
</div></section>` : ''}

${c.ctaFinal ? `<section class="fim"><div class="w g">
  <h2>${rico(c.ctaFinal.titulo)}</h2>
  <p>${rico(c.ctaFinal.texto)}</p>
  <a class="btn" href="#triagem" data-cta="final">${esc(c.ctaFinal.cta || h.cta || 'Falar agora')}</a>
</div></section>` : ''}
</main>
<footer class="rodape"><div class="w g">
  <div><span class="rot">${esc(m.nome)}</span>${esc(ct.endereco || '')}</div>
  <div><span class="rot">Horário</span>${esc(ct.horario || '')}</div>
  <div><span class="rot">Contato</span>${whats ? `<a href="${x.linkWhats()}" data-cta="rodape">WhatsApp</a><br>` : ''}${ct.telefone ? `<a href="tel:${esc(String(ct.telefone).replace(/\D/g, ''))}">${esc(ct.telefone)}</a><br>` : ''}${ct.instagram ? `<a href="${esc(ct.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}</div>
  <div><span class="rot">Legal</span><a href="privacidade.html">Aviso de privacidade</a><br>© ${x.ano}${ct.cnpj ? ` · CNPJ ${esc(ct.cnpj)}` : ''}</div>
</div></footer>
${botaoFlutuante(x)}
${script(x)}
</body>
</html>`;
};
