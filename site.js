(function () {
  'use strict';

  /* ================================================================
     CONFIGURAÇÃO — edite só aqui.
     whatsapp:  só números, com 55 + DDD (ex: '5515999998888').
                Atualiza todos os botões, links e textos do site.
     ga4:       ID do Google Analytics 4 (ex: 'G-ABC123XYZ'). Vazio = desligado.
     metaPixel: ID do Meta Pixel (ex: '1234567890123456'). Vazio = desligado.
     susep / cnpj: aparecem no rodapé quando preenchidos.
     ================================================================ */
  var CONFIG = {
    whatsapp:  '551532320077',
    ga4:       '',  /* ID reservado: G-SHJ9MBK0TJ. Coloque aqui junto com o Meta Pixel, que o aviso de cookies liga sozinho. */
    metaPixel: '',
    susep:     '202073554',
    cnpj:      '21.636.796/0001-43',
    razao:     'Apolice Seg Sorocaba Corretora de Seguros LTDA',
    endereco:  'Avenida Itavuvu, 126, Sala 11, Vila Olimpia, Sorocaba/SP, CEP 18075-042',
    /* Número de cada corretor (opcional). Vazio = usa o número principal.
       Quando preenchido, o botão "Falar com ..." da equipe abre a conversa
       direto com o corretor. Formato: '5515999998888'. */
    corretores: { luciana: '', pedro: '' },
    /* Recursos visuais da página Sobre. Troque true por false pra desligar
       qualquer um deles, sem apagar nada. */
    recursos: {
      frases:      true,  /* balão com a frase de quem achou que não ia precisar */
      antesDepois: true   /* comparador "sem seguro" x "com seguro" */
    },
    /* Histórias da página Sobre que já têm a foto par (sem seguro x com seguro).
       Quando mandar a foto, suba o arquivo em img/sobre/ e acrescente o nome aqui.
       Nomes: 'batida', 'roubo', 'alagamento', 'saude', 'residencial', 'vida', 'empresarial', 'equipamentos', 'viagem'.
       Cada foto precisa ter as versões .jpg e .webp (-800 e -1600). */
    pares: ['batida', 'residencial', 'saude', 'empresarial', 'equipamentos', 'viagem']
  };

  /* Liga cada recurso com uma classe no <html>; o CSS faz o resto. */
  (function () {
    var r = CONFIG.recursos || {};
    var el = document.documentElement;
    if (r.frases)      el.classList.add('fx-frases');
    if (r.antesDepois) el.classList.add('fx-antes-depois');
    /* Lembretes só pra você: abra o site com ?lembretes=1 no final do endereço. */
    if (/[?&]lembretes=1\b/.test(location.search)) el.classList.add('mostrar-lembretes');
  })();

  var WA_NUMERO = CONFIG.whatsapp;

  /* ---------- Número de WhatsApp único em todo o site ---------- */
  var foneLocal = WA_NUMERO.replace(/^55/, '');
  var foneTexto = '(' + foneLocal.slice(0, 2) + ') ' +
                  foneLocal.slice(2, -4) + '-' + foneLocal.slice(-4);

  document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
    a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + WA_NUMERO);
  });
  document.querySelectorAll('a[data-corretor]').forEach(function (a) {
    var num = (CONFIG.corretores || {})[a.getAttribute('data-corretor')];
    if (num) a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + num.replace(/\D/g, ''));
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.href = 'tel:+' + WA_NUMERO;
  });
  document.querySelectorAll('a[href*="wa.me/"], a[href^="tel:"]').forEach(function (a) {
    var alvo = a.querySelector('strong') || a;
    if (/\(\d{2}\)\s?\d{4,5}-\d{4}/.test(alvo.textContent) && !alvo.children.length) {
      alvo.textContent = alvo.textContent.replace(/\(\d{2}\)\s?\d{4,5}-\d{4}/, foneTexto);
    }
  });

  /* ---------- SUSEP / CNPJ no rodapé ---------- */
  var legal = [];
  if (CONFIG.razao) legal.push(CONFIG.razao);
  if (CONFIG.susep) legal.push('Registro SUSEP nº ' + CONFIG.susep);
  if (CONFIG.cnpj)  legal.push('CNPJ ' + CONFIG.cnpj);
  if (CONFIG.endereco) legal.push(CONFIG.endereco);
  if (CONFIG.susep) {
    var faqSusep = document.getElementById('faqSusep'), faqNum = document.getElementById('faqSusepNum');
    if (faqSusep && faqNum) { faqNum.textContent = CONFIG.susep; faqSusep.hidden = false; }
  }
  if (legal.length) {
    var legalEl = document.getElementById('legalInfo');
    if (legalEl) {
      legalEl.textContent = legal.join(' · ');
      legalEl.hidden = false;
    }
  }

  /* ---------- Origem do anúncio (UTM) ----------
     Links de anúncio devem ter ?utm_source=instagram&utm_campaign=nome.
     A origem fica guardada na visita e vai junto na mensagem do WhatsApp,
     pra você saber de qual anúncio veio cada cliente. */
  var params = new URLSearchParams(location.search);
  var origem = '';
  try {
    if (params.get('utm_source')) {
      origem = params.get('utm_source') +
               (params.get('utm_campaign') ? ' / ' + params.get('utm_campaign') : '');
      sessionStorage.setItem('origem', origem);
    } else {
      origem = sessionStorage.getItem('origem') || '';
    }
  } catch (e) {}

  function comOrigem(texto) {
    return origem ? texto + '\n\n(origem: ' + origem + ')' : texto;
  }

  if (origem) {
    document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
      var url = new URL(a.href);
      url.searchParams.set('text', comOrigem(url.searchParams.get('text') || 'Olá! Vim pelo site da Apólice Seg.'));
      a.href = url.toString();
    });
  }

  /* ---------- Google Analytics 4 + Meta Pixel ---------- */
  function carregarScript(src) {
    var sc = document.createElement('script');
    sc.async = true; sc.src = src;
    document.head.appendChild(sc);
  }

  /* O rastreamento só liga depois que o visitante aceita o aviso de cookies (LGPD).
     A escolha fica salva neste navegador. */
  var CHAVE_COOKIES = 'apoliceseg-cookies';
  function lerEscolha() { try { return localStorage.getItem(CHAVE_COOKIES); } catch (e) { return null; } }
  function salvarEscolha(v) { try { localStorage.setItem(CHAVE_COOKIES, v); } catch (e) {} }

  /* Versão do aviso: muda quando entra um rastreamento novo (ex.: o Meta Pixel).
     Assim, quem aceitou antes é perguntado de novo, porque o aceite vale só
     para o que estava escrito no aviso daquele momento. */
  var VERSAO_AVISO = (CONFIG.ga4 ? 'ga4' : '') + (CONFIG.metaPixel ? '+meta' : '');

  var rastreamentoLigado = false;
  function iniciarRastreamento() {
    if (rastreamentoLigado) return;
    rastreamentoLigado = true;

    if (CONFIG.ga4) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', CONFIG.ga4);
      carregarScript('https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4);
    }

    if (CONFIG.metaPixel) {
      var f = window.fbq = function () {
        f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = f;
      f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
      fbq('init', CONFIG.metaPixel);
      fbq('track', 'PageView');
      carregarScript('https://connect.facebook.net/en_US/fbevents.js');
    }
  }

  /* Aviso de cookies: só aparece se houver algum rastreamento configurado. */
  function mostrarAvisoCookies() {
    if (document.getElementById('avisoCookies')) return;
    var barra = document.createElement('div');
    barra.id = 'avisoCookies';
    barra.className = 'cookie-bar';
    barra.setAttribute('role', 'dialog');
    barra.setAttribute('aria-label', 'Aviso de cookies');
    barra.innerHTML =
      '<p>Usamos cookies do Google Analytics' + (CONFIG.metaPixel ? ' e do Meta' : '') +
      ' para entender como o site é usado e melhorar nosso atendimento e nossos anúncios. ' +
      'Você pode aceitar ou recusar, e muda de ideia quando quiser pelo rodapé.</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-secondary" data-cookies="nao">Recusar</button>' +
      '<button type="button" class="btn btn-primary" data-cookies="sim">Aceitar</button>' +
      '</div>';
    document.body.appendChild(barra);
    barra.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-cookies');
      if (!v) return;
      salvarEscolha(v + ':' + VERSAO_AVISO);
      barra.remove();
      if (v === 'sim') iniciarRastreamento();
    });
  }

  if (CONFIG.ga4 || CONFIG.metaPixel) {
    var escolha = lerEscolha();
    if (escolha === 'sim:' + VERSAO_AVISO) iniciarRastreamento();
    else if (escolha !== 'nao:' + VERSAO_AVISO) mostrarAvisoCookies();

    /* Link no rodapé para rever a escolha */
    var copia = document.querySelector('.footer-copy');
    if (copia) {
      var pref = document.createElement('button');
      pref.type = 'button';
      pref.className = 'cookie-pref';
      pref.textContent = 'Preferências de cookies';
      pref.addEventListener('click', function () {
        try { localStorage.removeItem(CHAVE_COOKIES); } catch (e) {}
        mostrarAvisoCookies();
      });
      copia.appendChild(document.createTextNode(' · '));
      copia.appendChild(pref);
    }
  }

  function registrar(evento, dados) {
    if (window.gtag) gtag('event', evento, dados || {});
  }

  /* Cliques em telefone = lead (intenção de contato).
     Os cliques de WhatsApp são medidos no fluxo de cotação, mais abaixo. */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      registrar('clique_telefone');
      if (window.fbq) fbq('track', 'Contact', { content_name: 'telefone' });
    });
  });

  /* ---------- Header com sombra ao rolar ---------- */
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var aberto = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Abrir menu');
      });
    });
  }

  /* ---------- Cotação em 3 passos → WhatsApp ----------
     Todo botão de WhatsApp do site (e os "Fazer cotação") abre este fluxo:
       1. quais seguros cotar (um ou mais);
       2. nome, e-mail e, só quando a cotação precisa, data de nascimento;
       3. informações de cada seguro escolhido + observações.
     No fim, abre o WhatsApp da corretora com a mensagem organizada;
     o cliente só toca em enviar. O telefone não é pedido: chega junto
     com a mensagem. Nada é guardado no site.
     Links com data-direto continuam abrindo o WhatsApp sem o fluxo. */
  var SEGUROS = {
    automovel: { nome: 'Automóvel', nasc: true, campos: [
      { id: 'veiculo', rotulo: 'Modelo e ano do carro', ex: 'Ex.: Onix 2021' },
      { id: 'cep', rotulo: 'CEP onde o carro dorme', ex: 'Ex.: 18035-000', num: true },
      { id: 'seguro', rotulo: 'Já tem seguro hoje?', opcoes: ['Sim, quero renovar ou trocar', 'Não, seria o primeiro'] }
    ] },
    saude: { nome: 'Plano de Saúde', nasc: true, campos: [
      { id: 'para', rotulo: 'Para quem é o plano?', opcoes: ['Só para mim', 'Para mim e minha família', 'Para minha empresa (CNPJ)'] },
      { id: 'vidas', rotulo: 'Quantas pessoas e as idades', ex: 'Ex.: 3 pessoas: 38, 35 e 6 anos' },
      { id: 'cidade', rotulo: 'Cidade', ex: 'Ex.: Sorocaba' }
    ] },
    vida: { nome: 'Vida', nasc: true, campos: [
      { id: 'profissao', rotulo: 'Profissão', ex: 'Ex.: Engenheira' },
      { id: 'valor', rotulo: 'Valor de cobertura que imagina (se tiver ideia)', ex: 'Ex.: R$ 300 mil' }
    ] },
    residencial: { nome: 'Residencial', campos: [
      { id: 'cep', rotulo: 'CEP do imóvel', ex: 'Ex.: 18035-000', num: true },
      { id: 'tipo', rotulo: 'Tipo de imóvel', opcoes: ['Casa', 'Casa em condomínio', 'Apartamento'] },
      { id: 'posse', rotulo: 'O imóvel é', opcoes: ['Próprio', 'Alugado'] }
    ] },
    empresarial: { nome: 'Empresarial', campos: [
      { id: 'ramo', rotulo: 'Ramo da empresa', ex: 'Ex.: Padaria, escritório, indústria' },
      { id: 'cep', rotulo: 'CEP da empresa', ex: 'Ex.: 18035-000', num: true }
    ] },
    odontologico: { nome: 'Plano Odontológico', campos: [
      { id: 'para', rotulo: 'Para quem é o plano?', opcoes: ['Só para mim', 'Para mim e minha família', 'Para minha empresa (CNPJ)'] },
      { id: 'vidas', rotulo: 'Quantas pessoas', ex: 'Ex.: 3 pessoas' },
      { id: 'cidade', rotulo: 'Cidade', ex: 'Ex.: Sorocaba' }
    ] },
    viagem: { nome: 'Viagem', nasc: true, campos: [
      { id: 'destino', rotulo: 'Destino', ex: 'Ex.: Portugal e Espanha' },
      { id: 'datas', rotulo: 'Datas de ida e volta', ex: 'Ex.: 10/01 a 25/01' },
      { id: 'pessoas', rotulo: 'Quantas pessoas e as idades', ex: 'Ex.: 2 pessoas: 40 e 38 anos' }
    ] },
    consorcio: { nome: 'Consórcio', campos: [
      { id: 'bem', rotulo: 'O que quer conquistar?', opcoes: ['Carro ou moto', 'Imóvel', 'Serviços (reforma, viagem, estudo)', 'Outro'] },
      { id: 'credito', rotulo: 'Valor do bem que imagina', ex: 'Ex.: R$ 80 mil' },
      { id: 'parcela', rotulo: 'Parcela que cabe no seu bolso (se tiver ideia)', ex: 'Ex.: até R$ 900 por mês' }
    ] },
    equipamentos: { nome: 'Equipamentos', campos: [
      { id: 'quais', rotulo: 'Quais equipamentos', ex: 'Ex.: notebook e câmera' },
      { id: 'valor', rotulo: 'Valor aproximado', ex: 'Ex.: R$ 12 mil' },
      { id: 'uso', rotulo: 'Uso', opcoes: ['Pessoal', 'Trabalho', 'Os dois'] }
    ] },
    'responsabilidade-civil': { nome: 'Responsabilidade Civil', campos: [
      { id: 'atividade', rotulo: 'Profissão ou ramo da empresa', ex: 'Ex.: Engenheiro, clínica, construtora' },
      { id: 'tipo', rotulo: 'É para', opcoes: ['Profissional (CPF)', 'Empresa (CNPJ)'] },
      { id: 'cidade', rotulo: 'Cidade', ex: 'Ex.: Sorocaba' }
    ] },
    frotas: { nome: 'Frotas', campos: [
      { id: 'qtd', rotulo: 'Quantos veículos e de que tipo', ex: 'Ex.: 6 carros e 2 caminhões' },
      { id: 'cidade', rotulo: 'Cidade onde ficam', ex: 'Ex.: Sorocaba' }
    ] },
    outro: { nome: 'Outro / ainda não sei', campos: [] }
  };
  /* Botões "saiba mais" da página Sobre → seguro já marcado no passo 1 */
  var PRODUTO_PARA_SEGURO = {
    automovel: 'automovel', assistencia: 'automovel', 'automovel-roubo': 'automovel',
    'automovel-alagamento': 'automovel', saude: 'saude', vida: 'vida',
    residencial: 'residencial', empresarial: 'empresarial',
    odontologico: 'odontologico', viagem: 'viagem', consorcio: 'consorcio',
    equipamentos: 'equipamentos', 'responsabilidade-civil': 'responsabilidade-civil'
  };
  var NOME_CORRETOR = { luciana: 'Luciana', pedro: 'Pedro' };

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function montarCotacao() {
    var dlg = document.createElement('dialog');
    dlg.className = 'cot';
    dlg.setAttribute('aria-labelledby', 'cotTitulo');
    var chips = Object.keys(SEGUROS).map(function (k) {
      return '<label class="cot-chip"><input type="checkbox" name="seguro" value="' + k + '"><span>' + esc(SEGUROS[k].nome) + '</span></label>';
    }).join('');
    dlg.innerHTML =
      '<form class="cot-box" novalidate>' +
        '<div class="cot-top">' +
          '<p class="cot-passo" id="cotPasso">Passo 1 de 3</p>' +
          '<button type="button" class="cot-x" data-cot="fechar" aria-label="Fechar">×</button>' +
        '</div>' +
        '<div class="cot-barra" aria-hidden="true"><i id="cotBarra"></i></div>' +

        '<section class="cot-tela" data-tela="1">' +
          '<h2 id="cotTitulo">O que você quer cotar?</h2>' +
          '<p class="cot-sub">Pode marcar mais de um.</p>' +
          '<div class="cot-chips">' + chips + '</div>' +
          '<p class="cot-erro" data-erro="1" hidden>Marque pelo menos uma opção.</p>' +
          '<p class="cot-direto">Já é cliente ou precisa de ajuda agora (batida, roubo, guincho)? ' +
            '<a href="https://wa.me/' + WA_NUMERO + '" target="_blank" rel="noopener" data-direto>Fale direto no WhatsApp</a></p>' +
        '</section>' +

        '<section class="cot-tela" data-tela="2" hidden>' +
          '<h2>Seus dados</h2>' +
          '<p class="cot-sub">Seu telefone já chega junto com a mensagem do WhatsApp.</p>' +
          '<div class="form-field"><label for="cotNome">Nome completo</label>' +
            '<input id="cotNome" class="input" autocomplete="name" required placeholder="Ex.: Maria Silva"></div>' +
          '<div class="form-field" id="cotNascBox"><label for="cotNasc">Data de nascimento</label>' +
            '<input id="cotNasc" class="input" inputmode="numeric" autocomplete="bday" placeholder="dd/mm/aaaa" maxlength="10">' +
            '<small class="cot-dica">A idade muda o preço, por isso a seguradora ou a operadora pede.</small></div>' +
          '<div class="form-field"><label for="cotEmail">E-mail <span class="cot-opc">(opcional)</span></label>' +
            '<input id="cotEmail" class="input" type="email" autocomplete="email" placeholder="Para receber a proposta em PDF"></div>' +
          '<p class="cot-erro" data-erro="2" hidden></p>' +
        '</section>' +

        '<section class="cot-tela" data-tela="3" hidden>' +
          '<h2>Complementos para cotação</h2>' +
          '<p class="cot-sub">Tudo opcional. O que não souber, o corretor pergunta depois.</p>' +
          '<div id="cotCampos"></div>' +
          '<div class="form-field"><label for="cotObs">Observações</label>' +
            '<textarea id="cotObs" class="input" rows="3" placeholder="Algo que o corretor deva saber? Ex.: melhor horário para falar"></textarea></div>' +
        '</section>' +

        '<section class="cot-tela cot-fim" data-tela="4" hidden>' +
          '<h2>Sua mensagem está pronta no WhatsApp</h2>' +
          '<p class="cot-sub">Confira e toque em <strong>enviar</strong>. Um corretor responde em seguida.</p>' +
          '<a class="btn btn-secondary" id="cotDeNovo" href="#" target="_blank" rel="noopener" data-direto>O WhatsApp não abriu? Toque aqui</a>' +
        '</section>' +

        '<div class="cot-acoes">' +
          '<button type="button" class="btn btn-secondary" data-cot="voltar">Voltar</button>' +
          '<button type="submit" class="btn btn-primary" id="cotAvancar">Continuar</button>' +
        '</div>' +
      '</form>';
    document.body.appendChild(dlg);
    return dlg;
  }

  var cot = null, cotPasso = 1, cotLocal = 'cta', cotCorretor = '';

  function marcados() {
    return Array.prototype.map.call(cot.querySelectorAll('input[name="seguro"]:checked'), function (i) { return i.value; });
  }
  function precisaNasc() {
    return marcados().some(function (k) { return SEGUROS[k].nasc; });
  }

  function camposPasso3() {
    var html = '';
    marcados().forEach(function (k) {
      var s = SEGUROS[k];
      if (!s.campos.length) return;
      html += '<fieldset class="cot-grupo"><legend>' + esc(s.nome) + '</legend>';
      s.campos.forEach(function (c) {
        var id = 'cot_' + k + '_' + c.id;
        var antigo = document.getElementById(id);
        var valor = antigo ? antigo.value : '';
        html += '<div class="form-field"><label for="' + id + '">' + esc(c.rotulo) + '</label>';
        if (c.opcoes) {
          html += '<select id="' + id + '" class="input" data-rotulo="' + esc(c.rotulo) + '"><option value="">Selecione...</option>' +
            c.opcoes.map(function (o) { return '<option' + (o === valor ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
        } else {
          html += '<input id="' + id + '" class="input" data-rotulo="' + esc(c.rotulo) + '" placeholder="' + esc(c.ex || '') + '"' +
            (c.num ? ' inputmode="numeric"' : '') + ' value="' + esc(valor) + '">';
        }
        html += '</div>';
      });
      html += '</fieldset>';
    });
    document.getElementById('cotCampos').innerHTML = html;
  }

  function irPara(n) {
    cotPasso = n;
    cot.querySelectorAll('.cot-tela').forEach(function (t) { t.hidden = +t.getAttribute('data-tela') !== n; });
    cot.querySelectorAll('.cot-erro').forEach(function (e) { e.hidden = true; });
    document.getElementById('cotPasso').textContent = n < 4 ? 'Passo ' + n + ' de 3' : 'Pronto';
    document.getElementById('cotBarra').style.width = (Math.min(n, 3) / 3 * 100) + '%';
    cot.querySelector('[data-cot="voltar"]').hidden = n === 1 || n === 4;
    cot.querySelector('.cot-acoes').hidden = n === 4;
    var avancar = document.getElementById('cotAvancar');
    avancar.innerHTML = n === 3
      ? '<svg class="icon icon-sm"><use href="#i-whatsapp"/></svg>Enviar pelo WhatsApp'
      : 'Continuar';
    avancar.classList.toggle('btn-wa', n === 3);
    if (n === 2) document.getElementById('cotNascBox').hidden = !precisaNasc();
    if (n === 3) camposPasso3();
    var tela = cot.querySelector('[data-tela="' + n + '"]');
    var foco = tela.querySelector('input:not([type=checkbox]), select, textarea') || tela.querySelector('h2');
    if (n > 1 && foco) { if (foco.tagName === 'H2') foco.tabIndex = -1; foco.focus(); }
    cot.querySelector('.cot-box').scrollTop = 0;
    registrar('cotacao_passo', { passo: n, local: cotLocal });
  }

  function erro(n, texto) {
    var e = cot.querySelector('[data-erro="' + n + '"]');
    if (texto) e.textContent = texto;
    e.hidden = false;
  }

  function nascValida(v) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (!m) return false;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    var idade = (Date.now() - d) / 31557600000;
    return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 && idade >= 16 && idade < 110;
  }

  function mensagem() {
    var linhas = ['Olá! Quero uma cotação pelo site da Apólice Seg.'];
    if (cotCorretor) linhas.push('Gostaria de ser atendido(a) por ' + cotCorretor + '.');
    linhas.push('', '*Quero cotar:* ' + marcados().map(function (k) { return SEGUROS[k].nome; }).join(', '));
    linhas.push('*Nome:* ' + document.getElementById('cotNome').value.trim());
    if (precisaNasc()) linhas.push('*Nascimento:* ' + document.getElementById('cotNasc').value.trim());
    var email = document.getElementById('cotEmail').value.trim();
    if (email) linhas.push('*E-mail:* ' + email);
    marcados().forEach(function (k) {
      var itens = [];
      SEGUROS[k].campos.forEach(function (c) {
        var el = document.getElementById('cot_' + k + '_' + c.id);
        if (el && el.value.trim()) itens.push('• ' + c.rotulo.replace(/ \(.*\)$|\?$/, '') + ': ' + el.value.trim());
      });
      if (itens.length) {
        linhas.push('', '*' + SEGUROS[k].nome + '*');
        Array.prototype.push.apply(linhas, itens);
      }
    });
    var obs = document.getElementById('cotObs').value.trim();
    if (obs) linhas.push('', '*Observações:* ' + obs);
    return comOrigem(linhas.join('\n'));
  }

  function abrirLink(url) {
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('data-direto', '');
    document.body.appendChild(a); a.click(); a.remove();
  }

  function enviar() {
    var numero = WA_NUMERO;
    var alvo = cotCorretor && (CONFIG.corretores || {})[cotCorretor.toLowerCase()];
    if (alvo) numero = alvo.replace(/\D/g, '');
    var url = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem());
    var produtos = marcados().join(',');
    registrar('generate_lead', { produto: produtos, local: cotLocal });
    if (window.fbq) fbq('track', 'Lead', { content_name: produtos });
    document.getElementById('cotDeNovo').href = url;
    abrirLink(url);
    irPara(4);
  }

  function avancar() {
    if (cotPasso === 1) {
      if (!marcados().length) return erro(1);
      return irPara(2);
    }
    if (cotPasso === 2) {
      var nome = document.getElementById('cotNome');
      if (nome.value.trim().length < 2) { nome.focus(); return erro(2, 'Escreva seu nome.'); }
      var nasc = document.getElementById('cotNasc');
      if (precisaNasc() && !nascValida(nasc.value.trim())) { nasc.focus(); return erro(2, 'Confira a data de nascimento (dd/mm/aaaa).'); }
      var email = document.getElementById('cotEmail');
      if (email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())) { email.focus(); return erro(2, 'Confira o e-mail ou deixe em branco.'); }
      return irPara(3);
    }
    if (cotPasso === 3) enviar();
  }

  function abrirCotacao(seguro, local, corretor) {
    if (!cot) {
      cot = montarCotacao();
      var form = cot.querySelector('form');
      form.addEventListener('submit', function (e) { e.preventDefault(); avancar(); });
      cot.addEventListener('click', function (e) {
        var acao = e.target.closest && e.target.closest('[data-cot]');
        if (e.target === cot || (acao && acao.getAttribute('data-cot') === 'fechar')) cot.close();
        else if (acao && acao.getAttribute('data-cot') === 'voltar') irPara(cotPasso - 1);
      });
      cot.addEventListener('change', function (e) {
        if (e.target.name === 'seguro') cot.querySelector('[data-erro="1"]').hidden = true;
      });
      /* Data com barras automáticas: 12031985 → 12/03/1985 */
      document.getElementById('cotNasc').addEventListener('input', function (e) {
        var d = e.target.value.replace(/\D/g, '').slice(0, 8);
        e.target.value = d.length > 4 ? d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4)
                       : d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
      });
      cot.addEventListener('close', function () {
        document.documentElement.classList.remove('cot-aberta');
        if (cotPasso === 4) { form.reset(); }
      });
    }
    cotLocal = local || 'cta';
    cotCorretor = corretor || '';
    if (cotPasso === 4) cotPasso = 1;
    String(seguro || '').split(',').forEach(function (s) {
      var box = s && cot.querySelector('input[name="seguro"][value="' + s + '"]');
      if (box) box.checked = true;
    });
    if (typeof cot.showModal === 'function') cot.showModal(); else cot.setAttribute('open', '');
    document.documentElement.classList.add('cot-aberta');
    irPara(cotPasso);
    registrar('cotacao_aberta', { local: cotLocal });
    if (window.fbq) fbq('track', 'Contact', { content_name: cotLocal });
  }

  function localDoClique(el) {
    return el.classList.contains('wa-float') ? 'botao_flutuante'
         : el.closest('.hero') ? 'hero'
         : el.classList.contains('team-wa') ? 'equipe'
         : el.hasAttribute('data-produto') ? 'saiba_mais_' + el.getAttribute('data-produto')
         : el.hasAttribute('data-cotar') ? 'cartao_' + el.getAttribute('data-cotar')
         : el.closest('header') ? 'topo'
         : el.closest('.hero') ? 'hero'
         : el.closest('footer') ? 'rodape' : 'cta';
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a[href*="wa.me/"], a[href$="#simulador"], [data-cotar]');
    if (!el) return;
    /* Links diretos (data-direto) abrem o WhatsApp sem o fluxo; só são medidos. */
    if (el.hasAttribute('data-direto')) {
      if (!el.closest('.cot-fim')) {
        registrar('clique_whatsapp', { local: 'direto' });
        if (window.fbq) fbq('track', 'Contact', { content_name: 'direto' });
      }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    var seguro = el.getAttribute('data-cotar') || PRODUTO_PARA_SEGURO[el.getAttribute('data-produto')] || '';
    abrirCotacao(seguro, localDoClique(el), NOME_CORRETOR[el.getAttribute('data-corretor')] || '');
  });

  /* ---------- Hero: chips de proteção → botão de cotação ---------- */
  var heroBtn = document.getElementById('heroCotar');
  var heroChips = document.querySelectorAll('.hero-chip');
  if (heroBtn && heroChips.length) {
    var atualizarHero = function () {
      var on = Array.prototype.filter.call(heroChips, function (c) { return c.getAttribute('aria-pressed') === 'true'; });
      var segs = [];
      on.forEach(function (c) { var s = c.getAttribute('data-seguro'); if (segs.indexOf(s) === -1) segs.push(s); });
      heroBtn.setAttribute('data-cotar', segs.join(','));
      document.getElementById('heroCotarTxt').textContent = !on.length ? 'Cotar no WhatsApp'
        : on.length <= 2 ? 'Cotar ' + on.map(function (c) { return c.textContent; }).join(' + ') + ' no WhatsApp'
        : 'Cotar ' + on.length + ' proteções no WhatsApp';
    };
    heroChips.forEach(function (c) {
      c.addEventListener('click', function () {
        c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        atualizarHero();
      });
    });
  }

  /* ---------- Um botão de cotação por vez na tela ----------
     Cada parte da página tem seu botão (marcado com data-cta). Quando nenhum
     deles está à vista, aparece o botão fixo no canto. Se dois aparecerem ao
     mesmo tempo, fica só o primeiro. */
  var ctas = Array.prototype.slice.call(document.querySelectorAll('[data-cta]'));
  var flutuante = document.querySelector('.wa-float');
  if ('IntersectionObserver' in window && (ctas.length || flutuante)) {
    var aVista = [];
    if (flutuante && ctas.length) flutuante.classList.add('wa-float--oculto');
    var atualizarBotoes = function () {
      var primeiro = null;
      ctas.forEach(function (b) {
        var ver = aVista.indexOf(b) !== -1 && !primeiro;
        if (ver) primeiro = b;
        b.classList.toggle('cta-oculto', aVista.indexOf(b) !== -1 && !ver);
      });
      if (flutuante) flutuante.classList.toggle('wa-float--oculto', !!primeiro);
    };
    var ioCta = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = aVista.indexOf(e.target);
        if (e.isIntersecting && i === -1) aVista.push(e.target);
        if (!e.isIntersecting && i !== -1) aVista.splice(i, 1);
      });
      atualizarBotoes();
    }, { threshold: 0 });
    ctas.forEach(function (b) { ioCta.observe(b); });
  }

  /* Quem chega com #cotacao no endereço (ex.: link na bio do Instagram) já vê o fluxo aberto. */
  if (location.hash === '#cotacao') abrirCotacao('', 'link_direto');

  /* ---------- Carro percorrendo a linha do rodapé ---------- */
  var road = document.getElementById('footerRoad');
  if (road) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { road.classList.add('is-driving'); io.disconnect(); }
      }, { threshold: 0.6 });
      io.observe(road);
    } else {
      road.classList.add('is-driving');
    }
  }

  /* ---------- Comparador "sem seguro" x "com seguro" ---------- */
  function iniciarComparador(box) {
    var range = box.querySelector('.compare-range');
    if (!range) return;
    var tocou = false;
    function pos(v) { box.style.setProperty('--pos', v + '%'); }
    range.addEventListener('input', function () { tocou = true; pos(range.value); });

    /* Uma varredura curta, só uma vez, pra mostrar que dá pra arrastar. */
    var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzir || !('IntersectionObserver' in window)) return;
    var ioc = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      ioc.disconnect();
      var t0 = null;
      (function passo(t) {
        if (tocou) return;
        if (t0 === null) t0 = t;
        var p = (t - t0) / 1800;
        if (p >= 1) { range.value = 50; pos(50); return; }
        var v = 50 + 28 * Math.sin(p * Math.PI * 2);
        range.value = v; pos(v);
        requestAnimationFrame(passo);
      })(performance.now());
    }, { threshold: 0.6 });
    ioc.observe(box);
  }
  document.querySelectorAll('[data-compare]').forEach(iniciarComparador);

  /* Se existir a foto par (data-depois ou data-antes), a foto única vira comparador.
     Sem a foto par, a história continua como está. Só roda com o recurso ligado. */
  function criarComparador(story) {
    var media = story.querySelector('.story-media');
    var foto = media && (media.querySelector('picture') || media.querySelector('img'));
    var fotoImg = foto && (foto.tagName === 'IMG' ? foto : foto.querySelector('img'));
    var parSrc = story.getAttribute('data-depois') || story.getAttribute('data-antes');
    if (!foto || !parSrc || story.querySelector('[data-compare]')) return;
    var fotoEhAntes = story.hasAttribute('data-depois');
    var par = new Image();
    par.onload = function () {
      var box = document.createElement('div');
      box.className = 'compare';
      box.setAttribute('data-compare', '');
      par.alt = story.getAttribute('data-par-alt') || '';
      par.className = fotoEhAntes ? 'compare-after' : 'compare-before';
      fotoImg.className = fotoEhAntes ? 'compare-before' : 'compare-after';
      fotoImg.removeAttribute('loading');
      box.appendChild(par);
      box.appendChild(foto);
      box.insertAdjacentHTML('beforeend',
        '<span class="compare-tag compare-tag--before">' + (story.getAttribute('data-rotulo-antes') || 'Sem seguro') + '</span>' +
        '<span class="compare-tag compare-tag--after">' + (story.getAttribute('data-rotulo-depois') || 'Com seguro') + '</span>' +
        '<span class="compare-handle" aria-hidden="true"><i></i></span>' +
        '<input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Arraste para comparar a situação sem seguro e com seguro">');
      media.insertBefore(box, media.firstChild);
      story.classList.add('story--compare');
      iniciarComparador(box);
    };
    par.src = parSrc;
  }
  if (document.documentElement.classList.contains('fx-antes-depois') && 'IntersectionObserver' in window) {
    var iop = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        iop.unobserve(e.target);
        criarComparador(e.target);
      });
    }, { rootMargin: '600px 0px' });
    document.querySelectorAll('.story[data-par]').forEach(function (st) {
      if ((CONFIG.pares || []).indexOf(st.getAttribute('data-par')) !== -1) iop.observe(st);
    });
  }

  /* ---------- FAQ acordeão ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var resposta = item.querySelector('.faq-a');
      var estavaAberto = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-a').style.maxHeight = '0';
      });

      if (!estavaAberto) {
        item.classList.add('open');
        resposta.style.maxHeight = resposta.scrollHeight + 'px';
      }
    });
  });
})();
