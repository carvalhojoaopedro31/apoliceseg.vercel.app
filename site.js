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
    endereco:  'Avenida Itavuvu, 126, Sala 11, Vila Olímpia, Sorocaba/SP, CEP 18075-042',
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
      legalEl.textContent = legal.join(' · ') + '.';
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

  /* ---------- Pré-cotação → WhatsApp ----------
     Todo botão de cotação do site abre este fluxo, em 4 telas curtas:
       1. "Como podemos te ajudar?" (novo, renovar, já é cliente ou dúvida);
       2. qual proteção (pode marcar várias);
       3. dados básicos, os que toda seguradora pede (nome, nascimento ou
          empresa, CPF/CNPJ opcional, CEP e e-mail opcional);
       4. como prefere ser atendido, observação e ciência da privacidade.
     Quem já é cliente ou só tem uma dúvida pula a tela 2.
     No fim, abre o WhatsApp da corretora com a ficha pronta; o cliente só
     toca em enviar. O telefone não é pedido: chega junto com a mensagem.
     As perguntas de cada seguro (veículo, imóvel, idades...) o corretor faz
     no WhatsApp, com as respostas rápidas do WhatsApp Business (/auto,
     /saude, /resid, /dados...): cada pergunta é feita uma vez só.
     Nada é guardado no site: as respostas ficam só na memória da página
     enquanto ela está aberta. Documento com foto, valores e dados de saúde
     nunca são pedidos aqui.
     Links com data-direto continuam abrindo o WhatsApp sem o fluxo. */
  var SEGUROS = {
    automovel: { nome: 'Automóvel' },
    moto: { nome: 'Moto' },
    saude: { nome: 'Plano de Saúde' },
    odontologico: { nome: 'Plano Odontológico' },
    vida: { nome: 'Vida' },
    residencial: { nome: 'Residencial' },
    empresarial: { nome: 'Empresarial', empresa: true },
    consorcio: { nome: 'Consórcio', semRenovar: true },
    viagem: { nome: 'Viagem' },
    equipamentos: { nome: 'Equipamentos' },
    'responsabilidade-civil': { nome: 'Responsabilidade Civil' },
    outro: { nome: 'Ainda não sei', semRenovar: true }
  };
  /* Botões "saiba mais" da página Sobre → seguro já marcado */
  var PRODUTO_PARA_SEGURO = {
    automovel: 'automovel', assistencia: 'automovel', 'automovel-roubo': 'automovel',
    'automovel-alagamento': 'automovel', saude: 'saude', vida: 'vida',
    residencial: 'residencial', empresarial: 'empresarial',
    odontologico: 'odontologico', viagem: 'viagem', consorcio: 'consorcio',
    equipamentos: 'equipamentos', 'responsabilidade-civil': 'responsabilidade-civil'
  };
  var NOME_CORRETOR = { luciana: 'Luciana', pedro: 'Pedro' };
  var TIPOS = {
    novo: { txt: 'Quero cotar um seguro novo', ficha: 'Novo' },
    renovar: { txt: 'Quero renovar o meu', ficha: 'Renovar' },
    cliente: { txt: 'Já sou cliente', sub: 'Batida, roubo, guincho ou dúvida da apólice.', ficha: 'Já sou cliente' },
    duvida: { txt: 'Só quero tirar uma dúvida', ficha: 'Dúvida' }
  };
  var PREFERENCIAS = ['Mensagem', 'Áudio', 'Ligação'];
  /* Faixa curta que aparece ao avançar e some sozinha. */
  var INCENTIVO = {
    produtos: 'Ótimo! São só 3 perguntinhas.',
    dados: 'Boa escolha! Você está na metade.',
    contato: 'Quase lá!'
  };

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Respostas: R.tipo, R.seguros, R.nome, R.doc... Ficam aqui enquanto a
     página está aberta (voltar e fechar/abrir o fluxo não apagam nada). */
  var R = {}, cot = null, cotTela = 'inicio', cotLocal = 'cta', cotCorretor = '', cotPre = [];

  function lista(k) { return R[k] || []; }
  function vazio(v) { return v == null || String(v).trim() === ''; }
  function curto() { return R.tipo === 'cliente' || R.tipo === 'duvida'; }
  function ehEmpresa() { return R.quem === 'CNPJ'; }

  /* Telas na ordem; a barra mostra 25, 50, 75 e 100%. */
  function sequencia() {
    return curto() ? ['inicio', 'dados', 'contato'] : ['inicio', 'produtos', 'dados', 'contato'];
  }
  function pctDe(tela) {
    return { inicio: 25, produtos: 50, dados: 75, contato: 100 }[tela] || 100;
  }

  /* ---------- Campos ---------- */
  function opcoes(nome, valores, atual, grande) {
    return '<div class="cot-opcoes' + (grande ? ' cot-opcoes--grande' : '') + '">' + valores.map(function (o) {
      if (typeof o === 'string') o = { v: o, txt: o };
      return '<label class="cot-chip cot-chip--radio"><input type="radio" name="' + nome + '" value="' + esc(o.v) + '" data-k="' + nome + '"' +
        (atual === o.v ? ' checked' : '') + '><span>' + esc(o.txt) +
        (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span></label>';
    }).join('') + '</div>';
  }

  function campo(k, rotulo, attrs, opc, dica) {
    return '<div class="form-field"><label for="c_' + k + '">' + rotulo + (opc ? ' <span class="cot-opc">(opcional)</span>' : '') + '</label>' +
      '<input id="c_' + k + '" class="input" data-k="' + k + '" value="' + esc(R[k] || '') + '"' + attrs + '>' +
      (dica ? '<small class="cot-dica">' + dica + '</small>' : '') + '</div>';
  }

  /* ---------- Telas ---------- */
  function htmlInicio() {
    return '<h2 id="cotTitulo" tabindex="-1">Como podemos te ajudar?</h2>' +
      opcoes('tipo', Object.keys(TIPOS).map(function (k) { return { v: k, txt: TIPOS[k].txt, sub: TIPOS[k].sub }; }), R.tipo, true);
  }

  function htmlProdutos() {
    var marc = lista('seguros');
    return '<h2 id="cotTitulo" tabindex="-1">' + (R.tipo === 'renovar' ? 'Qual seguro você quer renovar?' : 'Qual proteção você procura?') + '</h2>' +
      '<p class="cot-sub">Pode marcar mais de um.</p>' +
      '<div class="cot-chips">' + Object.keys(SEGUROS).filter(function (k) {
        return R.tipo !== 'renovar' || !SEGUROS[k].semRenovar;
      }).map(function (k) {
        return '<label class="cot-chip"><input type="checkbox" name="seguros" value="' + k + '" data-k="seguros" data-multi' +
          (marc.indexOf(k) !== -1 ? ' checked' : '') + '><span>' + esc(SEGUROS[k].nome) + '</span></label>';
      }).join('') + '</div>';
  }

  function htmlDados() {
    if (curto()) {
      return '<h2 id="cotTitulo" tabindex="-1">' + (R.tipo === 'cliente' ? 'Vamos direto ao corretor' : 'Qual é a sua dúvida?') + '</h2>' +
        '<p class="cot-sub">Seu telefone já chega junto com a mensagem do WhatsApp.</p>' +
        campo('nome', 'Seu nome', ' autocomplete="name" placeholder="Ex.: Maria Silva"') +
        '<div class="form-field"><label for="c_obs">O que você precisa?</label>' +
        '<textarea id="c_obs" class="input" rows="3" data-k="obs" placeholder="' +
        (R.tipo === 'cliente' ? 'Ex.: bati o carro, preciso de guincho' : 'Ex.: o seguro cobre enchente?') + '">' + esc(R.obs || '') + '</textarea>' +
        (R.tipo === 'cliente' ? '<small class="cot-dica">Se for urgente, escreva "urgente".</small>' : '') + '</div>';
    }
    var empresa = ehEmpresa();
    return '<h2 id="cotTitulo" tabindex="-1">Seus dados básicos</h2>' +
      '<p class="cot-sub">Só o que toda seguradora pede. O resto o corretor pergunta no WhatsApp.</p>' +
      '<fieldset class="cot-q"><legend>A cotação é para</legend>' +
        opcoes('quem', [{ v: 'CPF', txt: 'Você (CPF)' }, { v: 'CNPJ', txt: 'Sua empresa (CNPJ)' }], R.quem) + '</fieldset>' +
      campo('nome', empresa ? 'Seu nome (responsável)' : 'Nome completo', ' autocomplete="name" placeholder="Ex.: Maria Silva"') +
      (empresa
        ? campo('empresa', 'Nome da empresa', ' autocomplete="organization" placeholder="Ex.: Padaria Bom Pão"')
        : campo('nasc', 'Data de nascimento', ' inputmode="numeric" autocomplete="bday" maxlength="10" data-mask="data" placeholder="dd/mm/aaaa"', false,
            'A idade muda o preço, por isso a seguradora pede.')) +
      campo('doc', empresa ? 'CNPJ' : 'CPF', ' inputmode="numeric" maxlength="18" data-mask="' + (empresa ? 'cnpj' : 'cpf') + '" placeholder="' +
        (empresa ? '00.000.000/0000-00' : '000.000.000-00') + '"', true, 'Se preferir, passe pelo WhatsApp.') +
      campo('cep', empresa ? 'CEP da empresa' : 'CEP onde você mora', ' inputmode="numeric" autocomplete="postal-code" maxlength="9" data-mask="cep" placeholder="00000-000"') +
      campo('email', 'E-mail', ' type="email" autocomplete="email" placeholder="Para receber a proposta em PDF"', true);
  }

  function htmlContato() {
    return '<h2 id="cotTitulo" tabindex="-1">Como você prefere ser atendido?</h2>' +
      opcoes('pref', PREFERENCIAS, R.pref) +
      (curto() ? '' :
        '<div class="form-field"><label for="c_obs">Quer deixar alguma observação? <span class="cot-opc">(opcional)</span></label>' +
        '<textarea id="c_obs" class="input" rows="3" data-k="obs" placeholder="Ex.: melhor horário para falar">' + esc(R.obs || '') + '</textarea></div>') +
      '<label class="cot-declara"><input type="checkbox" data-k="ciente"' + (R.ciente ? ' checked' : '') + '>' +
        '<span>Li e concordo com a <a href="politica-de-privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>. ' +
        'Os dados vão só para o WhatsApp da corretora.</span></label>';
  }

  /* Pop-up de agradecimento, depois que o WhatsApp abre. */
  function htmlFim() {
    return '<div class="cot-obrigado" aria-hidden="true">✓</div>' +
      '<h2 id="cotTitulo" tabindex="-1">Recebemos o seu pedido!</h2>' +
      '<p class="cot-sub">Vamos te retornar o mais rápido possível. Obrigado pela preferência, você é importante para nós.</p>' +
      '<p class="cot-nota">A mensagem só chega para a gente quando você tocar em <strong>enviar</strong> no WhatsApp. ' +
      'Atendemos de segunda a sexta, das 9h às 17h.</p>' +
      '<a class="btn btn-secondary" id="cotDeNovo" href="#" target="_blank" rel="noopener" data-direto>O WhatsApp não abriu? Toque aqui</a>';
  }

  /* ---------- Ficha para o corretor ---------- */
  function novoId() {
    var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    var n = new Uint8Array(4);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(n); else for (var i = 0; i < 4; i++) n[i] = Math.random() * 256;
    for (var j = 0; j < 4; j++) s += c[n[j] % c.length];
    var d = new Date();
    return 'AS-' + String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + s;
  }

  function nomesSeguros() {
    return lista('seguros').map(function (k) { return SEGUROS[k].nome; });
  }

  function mensagem() {
    var id = R.id || (R.id = novoId()), ni = 'não informado';
    var quando = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    var v = function (k) { return vazio(R[k]) ? ni : String(R[k]).trim(); };
    var l = ['Olá! Vim pelo site da Apólice Seg.'];
    if (cotCorretor) l.push('Gostaria de ser atendido(a) por ' + cotCorretor + '.');
    l.push('', '*FICHA DO SITE* ' + id + ' · ' + quando);
    l.push('Tipo: ' + TIPOS[R.tipo].ficha);
    if (!curto()) l.push('Proteção: ' + (nomesSeguros().join(', ') || ni));
    l.push('Nome: ' + v('nome'));
    if (!curto()) {
      if (ehEmpresa()) { l.push('Empresa: ' + v('empresa')); l.push('CNPJ: ' + v('doc')); }
      else { l.push('Nascimento: ' + v('nasc')); l.push('CPF: ' + v('doc')); }
      l.push('CEP: ' + v('cep'));
      l.push('E-mail: ' + v('email'));
    }
    l.push('Prefere: ' + v('pref'));
    if (!vazio(R.obs)) l.push((curto() ? 'Assunto: ' : 'Observação: ') + R.obs.trim());
    return comOrigem(l.join('\n'));
  }

  /* ---------- Validação (só formato; nada trava por falta de resposta,
     exceto o tipo, a proteção, o nome e a ciência da privacidade) ---------- */
  function dataValida(v, min, max) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (!m) return false;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    var idade = (Date.now() - d) / 31557600000;
    return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 && idade >= min && idade < max;
  }
  function validar(tela) {
    var problema = function (chave, texto) { return { chave: chave, texto: texto }; };
    if (tela === 'inicio' && !R.tipo) return problema('tipo', 'Escolha uma opção.');
    if (tela === 'produtos' && !lista('seguros').length) return problema('seguros', 'Marque pelo menos uma opção.');
    if (tela === 'dados') {
      if (vazio(R.nome) || R.nome.trim().length < 2) return problema('nome', 'Escreva seu nome.');
      if (curto()) return null;
      if (!ehEmpresa() && !vazio(R.nasc) && !dataValida(R.nasc.trim(), 16, 110))
        return problema('nasc', 'Confira a data de nascimento (dd/mm/aaaa).');
      var d = (R.doc || '').replace(/\D/g, '');
      if (d && d.length !== (ehEmpresa() ? 14 : 11))
        return problema('doc', 'Confira o ' + (ehEmpresa() ? 'CNPJ' : 'CPF') + ' ou deixe em branco.');
      if (!vazio(R.cep) && R.cep.replace(/\D/g, '').length !== 8) return problema('cep', 'O CEP tem 8 números. Confira ou deixe em branco.');
      if (!vazio(R.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(R.email.trim()))
        return problema('email', 'Confira o e-mail ou deixe em branco.');
    }
    if (tela === 'contato' && !R.ciente) return problema('ciente', 'Marque a caixa da Política de Privacidade para enviar.');
    return null;
  }

  /* ---------- Montagem e navegação ---------- */
  function montarCotacao() {
    var dlg = document.createElement('dialog');
    dlg.className = 'cot';
    dlg.setAttribute('aria-labelledby', 'cotTitulo');
    dlg.innerHTML =
      '<form class="cot-box" novalidate>' +
        '<div class="cot-top">' +
          '<p class="cot-passo" id="cotPasso" aria-live="polite"></p>' +
          '<button type="button" class="cot-x" data-cot="fechar" aria-label="Fechar">×</button>' +
        '</div>' +
        '<div class="cot-barra" aria-hidden="true"><i id="cotBarra"></i></div>' +
        '<p class="cot-toast" id="cotToast" role="status" hidden></p>' +
        '<section class="cot-tela" id="cotTela"></section>' +
        '<p class="cot-erro" id="cotErro" role="alert" hidden></p>' +
        '<div class="cot-acoes">' +
          '<button type="button" class="btn btn-secondary" data-cot="voltar">Voltar</button>' +
          '<button type="submit" class="btn btn-primary" id="cotAvancar">Continuar</button>' +
        '</div>' +
      '</form>';
    document.body.appendChild(dlg);
    return dlg;
  }

  var toastTimer = null;
  function incentivo(tela) {
    var t = document.getElementById('cotToast'), txt = INCENTIVO[tela];
    clearTimeout(toastTimer);
    if (!txt || (tela === 'dados' && curto())) { t.hidden = true; return; }
    t.textContent = txt;
    t.hidden = false;
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function render(focar) {
    var html = { inicio: htmlInicio, produtos: htmlProdutos, dados: htmlDados, contato: htmlContato, fim: htmlFim }[cotTela];
    if (!html) { cotTela = 'inicio'; html = htmlInicio; }
    var tela = document.getElementById('cotTela');
    tela.innerHTML = html();
    tela.className = 'cot-tela' + (cotTela === 'fim' ? ' cot-fim' : '');
    if (cotTela === 'fim') document.getElementById('cotDeNovo').href = cot._url || '#';
    document.getElementById('cotErro').hidden = true;
    var pct = pctDe(cotTela);
    document.getElementById('cotPasso').textContent = cotTela === 'fim' ? 'Pronto' : 'Você está em ' + pct + '%';
    document.getElementById('cotBarra').style.width = pct + '%';
    cot.querySelector('[data-cot="voltar"]').hidden = cotTela === 'inicio';
    cot.querySelector('.cot-acoes').hidden = cotTela === 'fim';
    var envia = cotTela === 'contato';
    var avancar = document.getElementById('cotAvancar');
    avancar.innerHTML = envia ? '<svg class="icon icon-sm"><use href="#i-whatsapp"/></svg>Enviar para o WhatsApp' : 'Continuar';
    avancar.classList.toggle('btn-wa', envia);
    if (focar !== false) {
      cot.querySelector('.cot-box').scrollTop = 0;
      var h = document.getElementById('cotTitulo');
      if (h) h.focus({ preventScroll: true });
    }
  }

  function irPara(tela) {
    cotTela = tela;
    if (tela === 'dados' && !R.quem) R.quem = ehEmpresaPadrao() ? 'CNPJ' : 'CPF';
    render();
    incentivo(tela);
    registrar('cotacao_passo', { passo: tela, local: cotLocal });
  }

  function mostrarErro(p) {
    var e = document.getElementById('cotErro');
    e.textContent = p.texto;
    e.hidden = false;
    var el = cot.querySelector('[data-k="' + p.chave + '"]');
    if (el) { el.focus(); el.setAttribute('aria-invalid', 'true'); }
  }

  function avancar() {
    var p = validar(cotTela);
    if (p) return mostrarErro(p);
    if (cotTela === 'contato') return enviar();
    var seq = sequencia();
    irPara(seq[seq.indexOf(cotTela) + 1]);
  }

  function voltar() {
    var seq = sequencia(), i = seq.indexOf(cotTela);
    if (i > 0) { cotTela = seq[i - 1]; render(); document.getElementById('cotToast').hidden = true; }
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
    var produtos = curto() ? R.tipo : lista('seguros').join(',');
    registrar('generate_lead', { produto: produtos, tipo: R.tipo, local: cotLocal, preferencia: R.pref || '' });
    if (window.fbq) fbq('track', 'Lead', { content_name: produtos });
    cot._url = url;
    abrirLink(url);
    cotTela = 'fim';
    render();
    document.getElementById('cotToast').hidden = true;
  }

  /* Máscaras */
  function mascarar(el) {
    var m = el.getAttribute('data-mask'), v = el.value, d = v.replace(/\D/g, '');
    if (m === 'cep') v = d.slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
    else if (m === 'data') { d = d.slice(0, 8); v = d.length > 4 ? d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4) : d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
    else if (m === 'cpf') v = d.slice(0, 11).replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
    else if (m === 'cnpj') v = d.slice(0, 14).replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    if (v !== el.value) el.value = v;
  }

  function guardar(el) {
    var k = el.getAttribute('data-k');
    if (!k) return;
    if (el.type === 'checkbox' && el.hasAttribute('data-multi')) {
      var atual = lista(k).filter(function (x) { return x !== el.value; });
      if (el.checked) atual.push(el.value);
      R[k] = atual;
    } else if (el.type === 'checkbox') {
      R[k] = el.checked;
    } else {
      R[k] = el.value;
    }
    el.removeAttribute('aria-invalid');
  }

  function abrirCotacao(seguro, local, corretor) {
    if (!cot) {
      cot = montarCotacao();
      var form = cot.querySelector('form');
      form.addEventListener('submit', function (e) { e.preventDefault(); avancar(); });
      cot.addEventListener('click', function (e) {
        var acao = e.target.closest && e.target.closest('[data-cot]');
        if (e.target === cot || (acao && acao.getAttribute('data-cot') === 'fechar')) return cot.close();
        if (acao && acao.getAttribute('data-cot') === 'voltar') return voltar();
      });
      cot.addEventListener('input', function (e) {
        if (e.target.hasAttribute('data-mask')) mascarar(e.target);
        if (e.target.type !== 'radio' && e.target.type !== 'checkbox') guardar(e.target);
      });
      cot.addEventListener('change', function (e) {
        if (e.target.type !== 'radio' && e.target.type !== 'checkbox') return;
        guardar(e.target);
        document.getElementById('cotErro').hidden = true;
        var k = e.target.getAttribute('data-k');
        /* Tela 1: escolher já avança. Trocar CPF/CNPJ muda os campos. */
        if (k === 'tipo') { cotPreAplicar(); return avancar(); }
        if (k === 'quem') {
          R.doc = '';
          render(false);
          var novo = cot.querySelector('input[name="quem"][value="' + R.quem + '"]');
          if (novo) novo.focus();
        }
      });
      cot.addEventListener('close', function () {
        document.documentElement.classList.remove('cot-aberta');
        if (cotTela === 'fim') { R = {}; cotTela = 'inicio'; }
      });
    }
    cotLocal = local || 'cta';
    cotCorretor = corretor || '';
    cotPre = String(seguro || '').split(',').filter(function (s) { return SEGUROS[s]; });
    if (cotPre.length && cotTela !== 'inicio') cotPreAplicar();
    if (typeof cot.showModal === 'function') cot.showModal(); else cot.setAttribute('open', '');
    document.documentElement.classList.add('cot-aberta');
    render();
    registrar('cotacao_aberta', { local: cotLocal });
    if (window.fbq) fbq('track', 'Contact', { content_name: cotLocal });
  }

  /* Seguro que veio do botão clicado (chips do hero, "saiba mais"):
     já fica marcado na tela 2. */
  function cotPreAplicar() {
    if (!cotPre.length || curto()) return;
    var atual = lista('seguros');
    cotPre.forEach(function (s) {
      if (R.tipo === 'renovar' && SEGUROS[s].semRenovar) return;
      if (atual.indexOf(s) === -1) atual.push(s);
    });
    R.seguros = atual;
    cotPre = [];
  }
  function ehEmpresaPadrao() {
    var todos = lista('seguros');
    return todos.length && todos.every(function (k) { return SEGUROS[k].empresa; });
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
