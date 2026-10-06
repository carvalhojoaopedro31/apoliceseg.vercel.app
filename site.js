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
    ga4:       '',
    metaPixel: '',
    susep:     '',
    cnpj:      '21.636.796/0001-43',
    /* Número de cada corretor (opcional). Vazio = usa o número principal.
       Quando preenchido, o botão "Falar com ..." da equipe abre a conversa
       direto com o corretor. Formato: '5515999998888'. */
    corretores: { luciana: '', pedro: '' }
  };

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
