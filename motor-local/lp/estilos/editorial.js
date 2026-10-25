// Estilo EDITORIAL — cara de revista impressa.
// Serifa display enorme com itálico de destaque, seções numeradas, serviços como "índice", papel com grão.
// Bom para: odontologia, estética, advocacia, psicologia, arquitetura, gastronomia.
const { esc, rico, cor, fonte, lista, dois, GRAO, head, faixaPrototipo, triagem, botaoFlutuante, script } = require('../comum');

module.exports = function editorial(x) {
  const { c, m, ct, h, whats } = x;
  const fD = fonte(m.fonteTitulo, 'Instrument Serif');
  const fT = fonte(m.fonteTexto, 'Instrument Sans');
  const papel = cor(m.corClara, '#F1EDE4');
  const tinta = cor(m.corEscura, '#1C1B18');
  const acento = cor(m.corPrimaria, '#9A3B26');
  const servicos = lista(c.servicos?.itens);
  const deps = lista(c.depoimentos?.itens);
  const cidade = ct.cidade || (ct.endereco || '').split(/[—,-]/).pop().trim();
  let n = 0;
  const cab = (titulo, rotulo) => `<header class="sec-cab"><span class="sec-n">(${dois(n++)})</span><span class="sec-r">${esc(rotulo || '')}</span><h2>${rico(titulo)}</h2></header>`;

  const css = `
:root{--papel:${papel};--tinta:${tinta};--acento:${acento};--linha:color-mix(in srgb,var(--tinta) 18%,transparent);--suave:color-mix(in srgb,var(--tinta) 62%,var(--papel));--fd:'${fD}',Georgia,serif;--ft:'${fT}',system-ui,sans-serif;--mono:ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace}
body{font-family:var(--ft);background:var(--papel);color:var(--tinta);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
body::before{content:'';position:fixed;inset:0;background-image:${GRAO};opacity:.07;pointer-events:none;z-index:100;mix-blend-mode:multiply}
.w{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,48px)}
em{font-style:italic;color:var(--acento)}
.mono{font-family:var(--mono);font-size:12px;letter-spacing:.04em;text-transform:uppercase}
.topo-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;padding:22px 0;border-bottom:1px solid var(--linha)}
.marca{font-family:var(--fd);font-size:28px;line-height:1;text-decoration:none;letter-spacing:-.01em}
.marca img{height:36px;width:auto}
.topo-nav nav{display:flex;gap:28px}
.topo-nav nav a{font-size:14px;text-decoration:none;color:var(--suave)}
.topo-nav nav a:hover{color:var(--tinta)}
.topo-cta{justify-self:end;font-size:15px;font-weight:600;text-decoration:none;border-bottom:1.5px solid currentColor;padding-bottom:2px}
.hero{padding:clamp(28px,5vw,56px) 0 0}
.hero-meta{display:flex;justify-content:space-between;gap:16px;color:var(--suave);padding-bottom:clamp(20px,3vw,36px)}
.hero h1{font-family:var(--fd);font-weight:400;font-size:clamp(54px,10.4vw,156px);line-height:.9;letter-spacing:-.025em;max-width:13ch}
.hero-pe{display:grid;grid-template-columns:repeat(12,1fr);gap:24px;margin-top:clamp(28px,4vw,52px);align-items:end}
.hero-pe p{grid-column:1/6;font-size:clamp(18px,1.6vw,21px);line-height:1.5;color:var(--suave)}
.hero-pe p strong{color:var(--tinta);font-weight:600}
.hero-acao{grid-column:9/13;display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.btn{display:inline-flex;align-items:center;justify-content:space-between;gap:28px;background:var(--tinta);color:var(--papel);font-weight:600;font-size:16px;padding:19px 22px;text-decoration:none;border:0;cursor:pointer;min-width:260px;transition:background .2s}
.btn::after{content:'→';font-family:var(--fd);font-size:24px;line-height:0;transition:transform .2s}
.btn:hover{background:var(--acento)}.btn:hover::after{transform:translateX(4px)}
.prova{font-size:14px;color:var(--suave)}
.hero-fig{margin-top:clamp(36px,5vw,64px)}
.hero-fig img{width:100%;aspect-ratio:16/7;object-fit:cover}
.hero-fig figcaption{display:flex;justify-content:space-between;padding-top:10px;color:var(--suave)}
.indice-faixa{margin-top:clamp(36px,5vw,64px);border-top:1px solid var(--tinta);border-bottom:1px solid var(--linha);padding:18px 0;font-family:var(--fd);font-style:italic;font-size:clamp(22px,2.6vw,34px);white-space:nowrap;overflow:hidden}
.indice-faixa span{display:inline-block;animation:corre 38s linear infinite}
.indice-faixa b{font-weight:400;color:var(--acento);padding:0 .5em}
@keyframes corre{to{transform:translateX(-50%)}}
section.bloco{padding:clamp(72px,10vw,140px) 0}
.sec-cab{display:grid;grid-template-columns:120px 1fr;gap:8px 24px;border-top:1px solid var(--tinta);padding-top:18px;margin-bottom:clamp(36px,5vw,64px)}
.sec-n{font-family:var(--mono);font-size:13px}
.sec-r{font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--suave);justify-self:end}
.sec-cab h2{grid-column:1/-1;font-family:var(--fd);font-weight:400;font-size:clamp(40px,5.6vw,82px);line-height:.98;letter-spacing:-.02em;max-width:16ch;margin-top:12px}
.contraste{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--linha)}
.contraste .ct-cab{font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.06em;padding:14px 0;border-bottom:1px solid var(--linha);color:var(--suave)}
.contraste .ct-b{padding-left:32px;color:var(--acento)}
.contraste .l{padding:22px 32px 22px 0;border-bottom:1px solid var(--linha);font-size:clamp(17px,1.5vw,20px);color:var(--suave);text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--tinta) 30%,transparent);text-decoration-thickness:1px}
.contraste .r{padding:22px 0 22px 32px;border-bottom:1px solid var(--linha);border-left:1px solid var(--linha);font-family:var(--fd);font-size:clamp(22px,2.2vw,30px);line-height:1.2}
.servicos{list-style:none;border-top:1px solid var(--linha)}
.servicos li{display:grid;grid-template-columns:80px minmax(0,1.1fr) minmax(0,1fr) 40px;gap:24px;align-items:baseline;padding:28px 0;border-bottom:1px solid var(--linha);transition:background .25s,padding .25s}
.servicos li:hover{background:color-mix(in srgb,var(--acento) 7%,transparent);padding-left:12px;padding-right:12px}
.servicos .n{font-family:var(--mono);font-size:13px;color:var(--suave)}
.servicos h3{font-family:var(--fd);font-weight:400;font-size:clamp(28px,3.2vw,44px);line-height:1.05;letter-spacing:-.01em}
.servicos p{color:var(--suave);font-size:16px}
.servicos .seta{font-family:var(--fd);font-size:28px;text-align:right;color:var(--acento)}
.autor{display:grid;grid-template-columns:5fr 7fr;gap:clamp(32px,6vw,96px);align-items:start}
.autor figure img{width:100%;aspect-ratio:4/5;object-fit:cover;filter:grayscale(.15) contrast(1.02)}
.autor figcaption{padding-top:10px;color:var(--suave)}
.autor .sem-foto{aspect-ratio:4/5;border:1px solid var(--linha);display:grid;place-items:center;color:var(--suave)}
.autor .txt{font-size:clamp(19px,1.7vw,23px);line-height:1.55;max-width:34ch}
.numeros{display:grid;grid-template-columns:repeat(3,1fr);margin-top:48px;border-top:1px solid var(--tinta)}
.numeros div{padding:18px 18px 0 0}
.numeros div+div{padding-left:18px;border-left:1px solid var(--linha)}
.numeros strong{display:block;font-family:var(--fd);font-weight:400;font-size:clamp(44px,5vw,72px);line-height:1}
.numeros span{display:block;margin-top:8px;color:var(--suave);font-size:14px}
.citacao{font-family:var(--fd);font-size:clamp(30px,4vw,58px);line-height:1.1;letter-spacing:-.01em;max-width:22ch;position:relative;padding-top:.4em}
.citacao::before{content:'“';position:absolute;top:-.25em;left:-.05em;font-size:2.6em;color:var(--acento);line-height:1}
.cit-autor{margin-top:28px;color:var(--suave)}
.outras{display:grid;grid-template-columns:repeat(2,1fr);gap:0 48px;margin-top:72px;border-top:1px solid var(--linha)}
.outras figure{padding:28px 0;border-bottom:1px solid var(--linha)}
.outras blockquote{font-size:18px;line-height:1.55}
.outras figcaption{margin-top:14px;color:var(--suave)}
.triagem{background:var(--tinta);color:var(--papel);--linha:color-mix(in srgb,var(--papel) 22%,transparent);--suave:color-mix(in srgb,var(--papel) 65%,var(--tinta))}
.triagem .sec-cab{border-color:var(--papel)}
.triagem .sec-cab h2 em{color:color-mix(in srgb,var(--acento) 55%,var(--papel))}
.tri-wrap{display:grid;grid-template-columns:5fr 7fr;gap:clamp(32px,6vw,96px)}
.tri-wrap>p{font-size:19px;color:var(--suave);max-width:30ch}
.barra{height:1px;background:var(--linha);margin-bottom:28px}
.barra i{display:block;height:1px;width:33%;background:var(--papel);transition:width .4s}
.tri-n{font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--suave);margin-bottom:10px}
.tri-box h3{font-family:var(--fd);font-weight:400;font-size:clamp(30px,3.4vw,46px);line-height:1.05;margin-bottom:26px}
.opcoes{border-top:1px solid var(--linha)}
.opcoes button{display:flex;gap:22px;align-items:baseline;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--linha);padding:18px 4px;font-size:clamp(17px,1.6vw,20px);cursor:pointer;transition:padding .2s,color .2s}
.opcoes button:hover,.opcoes button:focus-visible{padding-left:14px;outline:0;color:#fff}
.op-k{font-family:var(--mono);font-size:12px;color:var(--suave)}
.campo{display:block;margin-bottom:22px}
.campo span{display:block;font-family:var(--mono);font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--suave);margin-bottom:6px}
.campo input{width:100%;font:inherit;font-size:20px;color:var(--papel);background:none;border:0;border-bottom:1px solid var(--linha);padding:10px 0}
.campo input:focus{outline:0;border-color:var(--papel)}
.lgpd{display:flex;gap:12px;font-size:14px;color:var(--suave);margin:4px 0 28px;align-items:flex-start}
.lgpd input{margin-top:4px;width:17px;height:17px;accent-color:var(--acento);flex:none}
.btn-enviar{background:var(--papel);color:var(--tinta);width:100%}
.btn-enviar:hover{background:color-mix(in srgb,var(--acento) 30%,var(--papel))}
.voltar{display:block;background:none;border:0;font-size:14px;color:var(--suave);cursor:pointer;margin-top:18px;text-decoration:underline;text-underline-offset:3px}
.faq{display:grid;grid-template-columns:5fr 7fr;gap:clamp(32px,6vw,96px)}
.faq h2{font-family:var(--fd);font-weight:400;font-size:clamp(40px,5vw,72px);line-height:1;position:sticky;top:32px;align-self:start}
details{border-bottom:1px solid var(--linha)}
details:first-child{border-top:1px solid var(--linha)}
summary{display:flex;justify-content:space-between;gap:24px;padding:22px 0;font-size:clamp(18px,1.7vw,22px);cursor:pointer;list-style:none}
summary::-webkit-details-marker{display:none}
summary::after{content:'+';font-family:var(--mono);font-size:18px;color:var(--acento);transition:transform .2s}
details[open] summary::after{transform:rotate(45deg)}
details p{padding:0 0 24px;color:var(--suave);max-width:58ch}
.fim{padding:clamp(80px,12vw,180px) 0;border-top:1px solid var(--tinta)}
.fim h2{font-family:var(--fd);font-weight:400;font-size:clamp(46px,7.4vw,112px);line-height:.95;letter-spacing:-.02em;max-width:15ch}
.fim p{margin:28px 0 36px;font-size:19px;color:var(--suave);max-width:46ch}
.rodape{border-top:1px solid var(--tinta);padding:36px 0 0;overflow:hidden}
.rod-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;font-size:15px;color:var(--suave)}
.rod-grid b{display:block;font-family:var(--mono);font-size:12px;font-weight:400;text-transform:uppercase;letter-spacing:.06em;color:var(--tinta);margin-bottom:8px}
.rod-grid a{text-decoration:none}.rod-grid a:hover{text-decoration:underline}
.wordmark{font-family:var(--fd);font-size:clamp(64px,15.5vw,250px);line-height:.8;letter-spacing:-.04em;white-space:nowrap;margin-top:clamp(40px,6vw,80px);transform:translateY(.12em)}
.flutuante{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;align-items:center;gap:8px;background:var(--tinta);color:var(--papel);padding:12px 16px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.18)}
.revela{opacity:0;transform:translateY(18px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
.visto{opacity:1;transform:none}
@media (max-width:900px){
  .topo-nav{grid-template-columns:1fr auto}.topo-nav nav{display:none}
  .hero-meta span:last-child{display:none}
  .hero-pe,.autor,.tri-wrap,.faq{grid-template-columns:1fr}
  .hero-pe p,.hero-acao{grid-column:1/-1}
  .hero-fig img{aspect-ratio:4/3}
  .btn{width:100%}
  .sec-cab{grid-template-columns:1fr auto}
  .contraste{grid-template-columns:1fr}
  .contraste .ct-b{display:none}
  .contraste .l{padding-right:0;border-bottom:0;padding-bottom:4px}
  .contraste .r{border-left:0;padding-left:0;padding-top:4px}
  .servicos li{grid-template-columns:44px 1fr;gap:6px 14px}
  .servicos p{grid-column:2}.servicos .seta{display:none}
  .numeros{grid-template-columns:1fr}
  .numeros div+div{padding-left:0;border-left:0;border-top:1px solid var(--linha)}
  .numeros div{padding:16px 0}
  .outras{grid-template-columns:1fr}
  .faq h2{position:static}
  .rod-grid{grid-template-columns:1fr 1fr}
  .flutuante span{display:none}
}`;

  const contrasteHtml = c.contraste ? `<section class="bloco" id="diferenca"><div class="w" data-revela>
  ${cab(c.contraste.titulo, 'A diferença')}
  <div class="contraste">
    <div class="ct-cab ct-a">${esc(c.contraste.tituloAntes || 'Em outros lugares')}</div><div class="ct-cab ct-b">${esc(c.contraste.tituloDepois || `Na ${m.nome}`)}</div>
    ${lista(c.contraste.antes).map((a, i) => `<div class="l">${rico(a)}</div><div class="r">${rico(lista(c.contraste.depois)[i] || '')}</div>`).join('')}
  </div>
</div></section>` : '';

  const servicosHtml = servicos.length ? `<section class="bloco" id="servicos" style="padding-top:0"><div class="w" data-revela>
  ${cab(c.servicos.titulo, c.servicos.eyebrow || 'Índice')}
  <ol class="servicos">${servicos.map((s, i) => `<li><span class="n">${dois(i)}</span><h3>${rico(s.titulo)}</h3><p>${rico(s.texto)}</p><span class="seta" aria-hidden="true">↘</span></li>`).join('')}</ol>
</div></section>` : '';

  const autorHtml = c.autoridade ? `<section class="bloco" id="equipe" style="padding-top:0"><div class="w" data-revela>
  ${cab(c.autoridade.titulo, c.autoridade.eyebrow || 'Quem atende')}
  <div class="autor">
    ${c.autoridade.imagem ? `<figure><img src="${esc(c.autoridade.imagem)}" alt="${esc(c.autoridade.imagemAlt || m.nome)}" width="800" height="1000" loading="lazy"><figcaption class="mono">${esc(c.autoridade.legenda || c.autoridade.imagemAlt || '')}</figcaption></figure>` : '<div class="sem-foto mono">[FOTO REAL DA EQUIPE]</div>'}
    <div>
      <p class="txt">${rico(c.autoridade.texto)}</p>
      ${lista(c.autoridade.numeros).length ? `<div class="numeros">${lista(c.autoridade.numeros).map(nu => `<div><strong>${esc(nu.valor)}</strong><span>${esc(nu.rotulo)}</span></div>`).join('')}</div>` : ''}
    </div>
  </div>
</div></section>` : '';

  const depsHtml = deps.length ? `<section class="bloco" id="depoimentos" style="padding-top:0"><div class="w" data-revela>
  ${cab(c.depoimentos.titulo, 'Pacientes e clientes')}
  <blockquote class="citacao">${rico(deps[0].texto)}</blockquote>
  <div class="cit-autor mono">${esc(deps[0].nome)}${deps[0].detalhe ? ` · ${esc(deps[0].detalhe)}` : ''}</div>
  ${deps.length > 1 ? `<div class="outras">${deps.slice(1).map(d => `<figure><blockquote>${rico(d.texto)}</blockquote><figcaption class="mono">${esc(d.nome)}${d.detalhe ? ` · ${esc(d.detalhe)}` : ''}</figcaption></figure>`).join('')}</div>` : ''}
</div></section>` : '';

  const faqHtml = lista(c.faq?.itens).length ? `<section class="bloco" id="duvidas"><div class="w faq" data-revela>
  <h2>${rico(c.faq.titulo || 'Perguntas que sempre aparecem')}</h2>
  <div>${lista(c.faq.itens).map(f => `<details><summary>${esc(f.pergunta)}</summary><p>${rico(f.resposta)}</p></details>`).join('')}</div>
</div></section>` : '';

  const nav = [servicos.length && ['#servicos', 'Serviços'], c.autoridade && ['#equipe', 'Equipe'], lista(c.faq?.itens).length && ['#duvidas', 'Dúvidas']].filter(Boolean);
  const faixa = servicos.map(s => esc(s.titulo.replace(/\*/g, ''))).join('<b>/</b>');

  return `${head(x, { fontes: [`${fD.replace(/ /g, '+')}:ital@0;1`, `${fT.replace(/ /g, '+')}:wght@400;500;600`], css })}
<body>
${faixaPrototipo(x)}
<div class="w">
  <div class="topo-nav">
    <a class="marca" href="./">${m.logo ? `<img src="${esc(m.logo)}" alt="${esc(m.nome)}" width="160" height="36">` : esc(m.nome)}</a>
    <nav>${nav.map(([href, t]) => `<a href="${href}">${t}</a>`).join('')}</nav>
    <a class="topo-cta" href="#triagem" data-cta="header">${esc(h.ctaCurto || 'Agendar')}</a>
  </div>
</div>
<main>
<section class="hero"><div class="w">
  <div class="hero-meta mono"><span>${esc(h.eyebrow || '')}</span><span>${esc(c.topo?.texto || cidade || '')}</span></div>
  <h1>${rico(h.titulo)}</h1>
  <div class="hero-pe">
    <p>${rico(h.subtitulo)}</p>
    <div class="hero-acao">
      <a class="btn" href="#triagem" data-cta="hero">${esc(h.cta || 'Quero agendar')}</a>
      ${h.provaSocial ? `<span class="prova">${rico(h.provaSocial)}</span>` : ''}
    </div>
  </div>
  ${h.imagem
    ? `<figure class="hero-fig"><img src="${esc(h.imagem)}" alt="${esc(h.imagemAlt || m.nome)}" width="1600" height="700" fetchpriority="high"><figcaption class="mono"><span>Fig. 1</span><span>${esc(h.legenda || h.imagemAlt || '')}</span></figcaption></figure>`
    : servicos.length ? `<div class="indice-faixa" aria-hidden="true"><span>${faixa}<b>/</b>${faixa}<b>/</b></span></div>` : ''}
</div></section>
${contrasteHtml}
${servicosHtml}
${autorHtml}
${depsHtml}
<section class="bloco triagem" id="triagem"><div class="w">
  ${cab(x.tri.titulo || 'Vamos *conversar*', 'Agendamento')}
  <div class="tri-wrap">
    <p>${rico(x.tri.subtitulo || 'Três perguntas rápidas. Depois disso você cai direto no nosso WhatsApp, e a gente já sabe do que você precisa.')}</p>
    ${triagem(x)}
  </div>
</div></section>
${faqHtml}
${c.ctaFinal ? `<section class="fim"><div class="w" data-revela>
  <h2>${rico(c.ctaFinal.titulo)}</h2>
  <p>${rico(c.ctaFinal.texto)}</p>
  <a class="btn" href="#triagem" data-cta="final">${esc(c.ctaFinal.cta || h.cta || 'Falar agora')}</a>
</div></section>` : ''}
</main>
<footer class="rodape"><div class="w">
  <div class="rod-grid">
    <div><b>Endereço</b>${esc(ct.endereco || '')}</div>
    <div><b>Horário</b>${esc(ct.horario || '')}</div>
    <div><b>Contato</b>${whats ? `<a href="${x.linkWhats()}" data-cta="rodape">WhatsApp</a><br>` : ''}${ct.telefone ? `<a href="tel:${esc(String(ct.telefone).replace(/\D/g, ''))}">${esc(ct.telefone)}</a><br>` : ''}${ct.instagram ? `<a href="${esc(ct.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}</div>
    <div><b>Legal</b><a href="privacidade.html">Aviso de privacidade</a><br>© ${x.ano}${ct.cnpj ? ` · CNPJ ${esc(ct.cnpj)}` : ''}</div>
  </div>
  <div class="wordmark" aria-hidden="true">${esc(m.nomeCurto || m.nome)}</div>
</div></footer>
${botaoFlutuante(x)}
${script(x)}
</body>
</html>`;
};
