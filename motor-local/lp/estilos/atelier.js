// Estilo ATELIER — luxo silencioso.
// Foto em tela cheia, serifa clássica com itálico, versaletes espaçados, fundo escuro com grão, galeria horizontal.
// Bom para: estética premium, harmonização, imobiliária alto padrão, arquitetura, joalheria, spa, gastronomia.
const { esc, rico, cor, fonte, lista, romano, GRAO, head, faixaPrototipo, triagem, botaoFlutuante, script } = require('../comum');

module.exports = function atelier(x) {
  const { c, m, ct, h, whats } = x;
  const fD = fonte(m.fonteTitulo, 'Cormorant Garamond');
  const fT = fonte(m.fonteTexto, 'Manrope');
  const noite = cor(m.corEscura, '#14110E');
  const creme = cor(m.corClara, '#EDE5D8');
  const acento = cor(m.corPrimaria, '#B8875A');
  const servicos = lista(c.servicos?.itens);
  const deps = lista(c.depoimentos?.itens);
  const galeria = lista(c.galeria).filter(g => g && (g.imagem || typeof g === 'string'));

  const css = `
:root{--n:${noite};--c:${creme};--a:${acento};--l:color-mix(in srgb,var(--c) 16%,transparent);--s:color-mix(in srgb,var(--c) 62%,var(--n));--fd:'${fD}',Garamond,Georgia,serif;--ft:'${fT}',system-ui,sans-serif}
body{font-family:var(--ft);background:var(--n);color:var(--c);font-size:16px;line-height:1.7;font-weight:400;-webkit-font-smoothing:antialiased;letter-spacing:.005em}
body::before{content:'';position:fixed;inset:0;background-image:${GRAO};opacity:.09;pointer-events:none;z-index:100}
.w{max-width:1320px;margin:0 auto;padding:0 clamp(20px,4vw,56px)}
.vs{font-size:12px;text-transform:uppercase;letter-spacing:.28em;font-weight:500}
em{font-style:italic;color:var(--a)}
.cab{position:absolute;top:0;left:0;right:0;z-index:20;padding:26px 0}
.proto+.cab{top:32px}
.cab .w{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
.cab nav{display:flex;gap:28px}
.cab nav a{text-decoration:none;font-size:14px;opacity:.85}
.marca{font-family:var(--fd);font-size:24px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;font-weight:500;text-align:center}
.marca img{height:34px;width:auto;margin:0 auto}
.cab .link{justify-self:end;font-size:14px;text-decoration:none;border-bottom:1px solid var(--a);padding-bottom:3px}
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden;background:radial-gradient(120% 90% at 70% 20%,color-mix(in srgb,var(--a) 22%,var(--n)) 0%,var(--n) 60%)}
.hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.04);animation:respira 18s ease-out forwards}
@keyframes respira{to{transform:scale(1)}}
.hero::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--n) 55%,transparent) 0%,transparent 30%,color-mix(in srgb,var(--n) 85%,transparent) 100%)}
.hero .w{position:relative;z-index:2;width:100%;padding-bottom:clamp(40px,7vw,96px);display:grid;grid-template-columns:7fr 4fr;gap:48px;align-items:end}
.hero .vs{color:var(--a);margin-bottom:22px;display:block}
.hero h1{font-family:var(--fd);font-weight:400;font-size:clamp(46px,7.6vw,118px);line-height:.95;letter-spacing:-.01em}
.hero-lado p{color:var(--s);font-size:16px;margin-bottom:26px;max-width:36ch}
.hero-lado p strong{color:var(--c);font-weight:500}
.btn{display:inline-flex;align-items:center;gap:16px;border:1px solid var(--c);color:var(--c);background:transparent;font-size:14px;text-transform:uppercase;letter-spacing:.2em;padding:18px 28px;text-decoration:none;cursor:pointer;transition:background .3s,color .3s}
.btn:hover{background:var(--c);color:var(--n)}
.prova{display:block;margin-top:18px;font-size:13px;color:var(--s)}
.manifesto{padding:clamp(96px,14vw,200px) 0;text-align:center}
.manifesto p{font-family:var(--fd);font-size:clamp(28px,3.6vw,52px);line-height:1.2;max-width:24ch;margin:22px auto 0;font-weight:400}
.manifesto .vs{color:var(--a)}
.sec{padding:clamp(80px,11vw,160px) 0;border-top:1px solid var(--l)}
.sec-t{display:flex;justify-content:space-between;align-items:baseline;gap:24px;margin-bottom:clamp(40px,6vw,88px)}
.sec-t h2{font-family:var(--fd);font-weight:400;font-size:clamp(38px,5vw,76px);line-height:1;max-width:16ch}
.sec-t .vs{color:var(--s);white-space:nowrap}
.duas{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,6vw,96px)}
.duas h3{font-family:var(--fd);font-style:italic;font-weight:400;font-size:28px;margin-bottom:18px}
.duas ol{list-style:none;counter-reset:r}
.duas li{display:grid;grid-template-columns:48px 1fr;padding:18px 0;border-top:1px solid var(--l);font-size:17px}
.duas li span{font-family:var(--fd);font-style:italic;color:var(--s)}
.duas .comum li{color:var(--s)}
.duas .nosso h3{color:var(--a)}
.trat{list-style:none}
.trat li{display:grid;grid-template-columns:90px minmax(0,1fr) minmax(0,.9fr);gap:32px;padding:clamp(28px,3.5vw,48px) 0;border-top:1px solid var(--l);align-items:baseline}
.trat li:last-child{border-bottom:1px solid var(--l)}
.trat .r{font-family:var(--fd);font-style:italic;color:var(--a);font-size:22px}
.trat h3{font-family:var(--fd);font-weight:400;font-size:clamp(32px,4vw,58px);line-height:1;transition:letter-spacing .4s}
.trat li:hover h3{letter-spacing:.01em;font-style:italic}
.trat p{color:var(--s)}
.galeria{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 clamp(20px,4vw,56px) 12px;scrollbar-width:thin;scrollbar-color:var(--a) transparent}
.galeria figure{flex:0 0 clamp(260px,32vw,440px);scroll-snap-align:start}
.galeria img{width:100%;aspect-ratio:3/4;object-fit:cover}
.galeria figcaption{font-size:13px;color:var(--s);padding-top:10px;font-style:italic;font-family:var(--fd)}
.autor{display:grid;grid-template-columns:5fr 6fr;gap:clamp(40px,7vw,120px);align-items:center}
.autor img{width:100%;aspect-ratio:4/5;object-fit:cover}
.autor .sem{aspect-ratio:4/5;border:1px solid var(--l);display:grid;place-items:center;color:var(--s)}
.autor h2{font-family:var(--fd);font-weight:400;font-size:clamp(36px,4.4vw,64px);line-height:1;margin:18px 0 24px}
.autor .vs{color:var(--a)}
.autor p{color:var(--s);font-size:17px;max-width:44ch}
.autor dl{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px;padding-top:28px;border-top:1px solid var(--l)}
.autor dt{font-family:var(--fd);font-size:clamp(40px,4vw,60px);line-height:1;font-style:italic}
.autor dd{font-size:13px;color:var(--s);margin-top:6px}
.deps{display:flex;gap:clamp(20px,3vw,40px);overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px;scrollbar-width:thin;scrollbar-color:var(--a) transparent}
.deps figure{flex:0 0 min(560px,85vw);scroll-snap-align:start;border-top:1px solid var(--a);padding-top:28px}
.deps blockquote{font-family:var(--fd);font-size:clamp(24px,2.4vw,34px);line-height:1.25;font-style:italic}
.deps figcaption{margin-top:22px;font-size:13px;color:var(--s);letter-spacing:.2em;text-transform:uppercase}
.tri{background:var(--c);color:var(--n);--l:color-mix(in srgb,var(--n) 16%,transparent);--s:color-mix(in srgb,var(--n) 60%,var(--c))}
.tri .duas{align-items:start}
.tri h2{font-family:var(--fd);font-weight:400;font-size:clamp(40px,5vw,76px);line-height:1;margin:18px 0 22px}
.tri .vs{color:color-mix(in srgb,var(--a) 70%,var(--n))}
.tri-intro p{color:var(--s);max-width:34ch}
.barra{height:1px;background:var(--l);margin-bottom:30px}
.barra i{display:block;height:1px;width:33%;background:var(--n);transition:width .5s}
.tri-n{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--s);margin-bottom:10px}
.tri-box h3{font-family:var(--fd);font-weight:400;font-size:clamp(28px,3vw,40px);line-height:1.1;margin-bottom:24px}
.opcoes button{display:flex;gap:20px;align-items:baseline;width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--l);padding:17px 0;font-size:17px;cursor:pointer;transition:padding .3s,color .3s}
.opcoes button:last-child{border-bottom:1px solid var(--l)}
.opcoes button:hover,.opcoes button:focus-visible{padding-left:12px;color:color-mix(in srgb,var(--a) 75%,var(--n));outline:0}
.op-k{font-family:var(--fd);font-style:italic;color:var(--s);min-width:24px}
.campo{display:block;margin-bottom:22px}
.campo span{display:block;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--s);margin-bottom:4px}
.campo input{width:100%;font:inherit;font-size:19px;background:none;border:0;border-bottom:1px solid var(--n);padding:10px 0;color:var(--n);border-radius:0}
.campo input:focus{outline:0;border-bottom-width:2px}
.lgpd{display:flex;gap:12px;font-size:14px;color:var(--s);margin:6px 0 28px;align-items:flex-start}
.lgpd input{margin-top:4px;width:17px;height:17px;accent-color:var(--n);flex:none}
.btn-enviar{width:100%;justify-content:center;background:var(--n);color:var(--c);border-color:var(--n)}
.btn-enviar:hover{background:transparent;color:var(--n)}
.voltar{display:block;background:none;border:0;font-size:14px;color:var(--s);cursor:pointer;margin-top:18px;font-family:var(--fd);font-style:italic;font-size:18px}
.faq{display:grid;grid-template-columns:4fr 7fr;gap:clamp(32px,6vw,96px)}
.faq h2{font-family:var(--fd);font-weight:400;font-size:clamp(38px,4.4vw,64px);line-height:1}
details{border-top:1px solid var(--l)}
details:last-child{border-bottom:1px solid var(--l)}
summary{display:flex;justify-content:space-between;gap:24px;padding:22px 0;cursor:pointer;list-style:none;font-family:var(--fd);font-size:clamp(21px,2vw,26px)}
summary::-webkit-details-marker{display:none}
summary::after{content:'+';color:var(--a);font-family:var(--ft);font-weight:300;transition:transform .3s}
details[open] summary::after{transform:rotate(45deg)}
details p{padding-bottom:24px;color:var(--s);max-width:56ch}
.fim{text-align:center;padding:clamp(100px,14vw,200px) 0}
.fim h2{font-family:var(--fd);font-weight:400;font-size:clamp(42px,6.4vw,100px);line-height:1;max-width:16ch;margin:0 auto}
.fim p{color:var(--s);max-width:44ch;margin:26px auto 40px}
.rodape{border-top:1px solid var(--l);padding:56px 0 40px;font-size:14px;color:var(--s)}
.rodape .w{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px}
.rodape .marca{text-align:left;color:var(--c);display:block;margin-bottom:12px}
.rodape b{display:block;color:var(--c);font-weight:500;font-size:12px;letter-spacing:.24em;text-transform:uppercase;margin-bottom:10px}
.rodape a{text-decoration:none}.rodape a:hover{color:var(--a)}
.flutuante{position:fixed;right:20px;bottom:20px;z-index:60;display:flex;align-items:center;gap:10px;background:var(--c);color:var(--n);padding:13px 18px;text-decoration:none;font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:500}
.revela{opacity:0;transform:translateY(24px);transition:opacity 1.2s ease,transform 1.2s cubic-bezier(.16,.8,.24,1)}
.visto{opacity:1;transform:none}
@media (max-width:900px){
  .cab nav{display:none}.cab .w{grid-template-columns:1fr auto}.marca{text-align:left;font-size:18px}
  .hero .w{grid-template-columns:1fr;gap:20px}
  .hero h1{font-size:clamp(42px,11vw,64px)}
  .btn{width:100%;justify-content:center}
  .sec-t{flex-direction:column;gap:12px}
  .duas,.autor,.faq{grid-template-columns:1fr}
  .trat li{grid-template-columns:40px 1fr;gap:8px 12px}
  .trat p{grid-column:2}
  .autor dl{grid-template-columns:1fr 1fr 1fr;gap:12px}
  .rodape .w{grid-template-columns:1fr 1fr}
  .flutuante span{display:none}
}`;

  const nav = [servicos.length && ['#tratamentos', 'Tratamentos'], c.autoridade && ['#quem', 'Quem somos'], lista(c.faq?.itens).length && ['#duvidas', 'Dúvidas']].filter(Boolean);

  return `${head(x, { fontes: [`${fD.replace(/ /g, '+')}:ital,wght@0,400;0,500;1,400`, `${fT.replace(/ /g, '+')}:wght@400;500`], css })}
<body>
${faixaPrototipo(x)}
<header class="cab"><div class="w">
  <nav>${nav.map(([href, t]) => `<a href="${href}">${t}</a>`).join('')}</nav>
  <a class="marca" href="./">${m.logo ? `<img src="${esc(m.logo)}" alt="${esc(m.nome)}" width="160" height="34">` : esc(m.nomeCurto || m.nome)}</a>
  <a class="link" href="#triagem" data-cta="header">${esc(h.ctaCurto || 'Agendar')}</a>
</div></header>
<main>
<section class="hero">
  ${h.imagem ? `<img src="${esc(h.imagem)}" alt="${esc(h.imagemAlt || m.nome)}" width="1800" height="1200" fetchpriority="high">` : ''}
  <div class="w">
    <div><span class="vs">${esc(h.eyebrow || c.topo?.texto || '')}</span><h1>${rico(h.titulo)}</h1></div>
    <div class="hero-lado">
      <p>${rico(h.subtitulo)}</p>
      <a class="btn" href="#triagem" data-cta="hero">${esc(h.cta || 'Agendar uma conversa')}</a>
      ${h.provaSocial ? `<span class="prova">${rico(h.provaSocial)}</span>` : ''}
    </div>
  </div>
</section>

${c.manifesto ? `<section class="manifesto"><div class="w" data-revela><span class="vs">${esc(c.manifesto.rotulo || 'Nossa forma de trabalhar')}</span><p>${rico(c.manifesto.texto)}</p></div></section>` : ''}

${c.contraste ? `<section class="sec"><div class="w" data-revela>
  <div class="sec-t"><h2>${rico(c.contraste.titulo)}</h2><span class="vs">A diferença</span></div>
  <div class="duas">
    <div class="comum"><h3>${esc(c.contraste.tituloAntes || 'O comum')}</h3><ol>${lista(c.contraste.antes).map((i, k) => `<li><span>${romano(k).toLowerCase()}.</span>${rico(i)}</li>`).join('')}</ol></div>
    <div class="nosso"><h3>${esc(c.contraste.tituloDepois || 'O nosso')}</h3><ol>${lista(c.contraste.depois).map((i, k) => `<li><span>${romano(k).toLowerCase()}.</span>${rico(i)}</li>`).join('')}</ol></div>
  </div>
</div></section>` : ''}

${servicos.length ? `<section class="sec" id="tratamentos"><div class="w" data-revela>
  <div class="sec-t"><h2>${rico(c.servicos.titulo)}</h2><span class="vs">${esc(c.servicos.eyebrow || 'Tratamentos')}</span></div>
  <ol class="trat">${servicos.map((s, i) => `<li><span class="r">${romano(i)}</span><h3>${rico(s.titulo)}</h3><p>${rico(s.texto)}</p></li>`).join('')}</ol>
</div></section>` : ''}

${galeria.length ? `<section class="sec" style="padding-left:0;padding-right:0"><div class="w"><div class="sec-t"><h2>${rico(c.galeriaTitulo || 'O espaço')}</h2><span class="vs">Arraste →</span></div></div>
  <div class="galeria">${galeria.map((g, i) => { const it = typeof g === 'string' ? { imagem: g } : g; return `<figure><img src="${esc(it.imagem)}" alt="${esc(it.legenda || m.nome)}" width="600" height="800" loading="lazy"><figcaption>${esc(it.legenda || '')}</figcaption></figure>`; }).join('')}</div>
</section>` : ''}

${c.autoridade ? `<section class="sec" id="quem"><div class="w autor" data-revela>
  ${c.autoridade.imagem ? `<img src="${esc(c.autoridade.imagem)}" alt="${esc(c.autoridade.imagemAlt || m.nome)}" width="800" height="1000" loading="lazy">` : '<div class="sem vs">[Foto real]</div>'}
  <div>
    <span class="vs">${esc(c.autoridade.eyebrow || 'Quem cuida de você')}</span>
    <h2>${rico(c.autoridade.titulo)}</h2>
    <p>${rico(c.autoridade.texto)}</p>
    ${lista(c.autoridade.numeros).length ? `<dl>${lista(c.autoridade.numeros).map(nu => `<div><dt>${esc(nu.valor)}</dt><dd>${esc(nu.rotulo)}</dd></div>`).join('')}</dl>` : ''}
  </div>
</div></section>` : ''}

${deps.length ? `<section class="sec"><div class="w" data-revela>
  <div class="sec-t"><h2>${rico(c.depoimentos.titulo)}</h2><span class="vs">Relatos</span></div>
  <div class="deps">${deps.map(d => `<figure><blockquote>${rico(d.texto)}</blockquote><figcaption>${esc(d.nome)}${d.detalhe ? ` · ${esc(d.detalhe)}` : ''}</figcaption></figure>`).join('')}</div>
</div></section>` : ''}

<section class="sec tri" id="triagem"><div class="w duas">
  <div class="tri-intro"><span class="vs">Agendamento</span><h2>${rico(x.tri.titulo || 'Vamos *conversar*')}</h2><p>${rico(x.tri.subtitulo || 'Três perguntas, menos de um minuto. Depois disso você fala direto com a nossa equipe pelo WhatsApp.')}</p></div>
  ${triagem(x, { marcador: j => romano(j).toLowerCase() + '.' })}
</div></section>

${lista(c.faq?.itens).length ? `<section class="sec" id="duvidas"><div class="w faq" data-revela>
  <h2>${rico(c.faq.titulo || 'Antes de agendar')}</h2>
  <div>${lista(c.faq.itens).map(f => `<details><summary>${esc(f.pergunta)}</summary><p>${rico(f.resposta)}</p></details>`).join('')}</div>
</div></section>` : ''}

${c.ctaFinal ? `<section class="fim sec"><div class="w" data-revela>
  <h2>${rico(c.ctaFinal.titulo)}</h2>
  <p>${rico(c.ctaFinal.texto)}</p>
  <a class="btn" href="#triagem" data-cta="final">${esc(c.ctaFinal.cta || h.cta || 'Agendar')}</a>
</div></section>` : ''}
</main>
<footer class="rodape"><div class="w">
  <div><span class="marca">${esc(m.nomeCurto || m.nome)}</span>${esc(ct.endereco || '')}</div>
  <div><b>Horário</b>${esc(ct.horario || '')}</div>
  <div><b>Contato</b>${whats ? `<a href="${x.linkWhats()}" data-cta="rodape">WhatsApp</a><br>` : ''}${ct.telefone ? `<a href="tel:${esc(String(ct.telefone).replace(/\D/g, ''))}">${esc(ct.telefone)}</a><br>` : ''}${ct.instagram ? `<a href="${esc(ct.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}</div>
  <div><b>Legal</b><a href="privacidade.html">Privacidade</a><br>© ${x.ano}${ct.cnpj ? ` · ${esc(ct.cnpj)}` : ''}</div>
</div></footer>
${botaoFlutuante(x)}
${script(x)}
</body>
</html>`;
};
