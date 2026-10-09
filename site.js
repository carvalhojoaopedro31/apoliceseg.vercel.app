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
    susep:     '',
    cnpj:      '21.636.796/0001-43',
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
       Nomes: 'batida', 'roubo', 'alagamento', 'saude', 'residencial', 'vida', 'empresarial'.
       Cada foto precisa ter as versões .jpg e .webp (-800 e -1600). */
    pares: ['batida', 'residencial', 'saude', 'empresarial']
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
  if (CONFIG.susep) legal.push('SUSEP nº ' + CONFIG.susep);
  if (CONFIG.cnpj)  legal.push('CNPJ ' + CONFIG.cnpj);
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

  /* Cliques em WhatsApp e telefone = lead (intenção de contato) */
  document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var local = a.classList.contains('wa-float') ? 'botao_flutuante'
                : a.classList.contains('team-wa') ? 'equipe'
                : a.hasAttribute('data-produto') ? 'saiba_mais_' + a.getAttribute('data-produto')
                : a.closest('footer') ? 'rodape' : 'cta';
      registrar('clique_whatsapp', { local: local });
      if (window.fbq) fbq('track', 'Contact', { content_name: local });
    });
  });
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

  /* ---------- Simulador → WhatsApp ---------- */
  var simForm = document.getElementById('simForm');
  if (simForm) simForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var produto = document.getElementById('simProduto').value;
    var nome    = document.getElementById('simNome').value.trim();
    var cidade  = document.getElementById('simCidade').value.trim();
    if (!produto || !nome || !cidade) return;

    var msg = encodeURIComponent(comOrigem(
      'Olá! Vim pelo site da Apólice Seg.\n\n' +
      'Interesse: ' + produto + '\n' +
      'Nome: ' + nome + '\n' +
      'Cidade: ' + cidade + '\n\n' +
      'Gostaria de receber uma cotação.'
    ));

    registrar('generate_lead', { produto: produto, local: 'simulador' });
    if (window.fbq) fbq('track', 'Lead', { content_name: produto });

    window.open('https://wa.me/' + WA_NUMERO + '?text=' + msg, '_blank', 'noopener');
  });

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
