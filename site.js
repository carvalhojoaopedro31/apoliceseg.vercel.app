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
     Todo botão de cotação do site abre este fluxo:
       1. "Como podemos te ajudar?" (novo, renovar/revisar ou já é cliente);
       2. o que cotar (e, na renovação, o que renovar);
       3. dados básicos, uma vez só, valendo para todos os produtos;
       4. poucas perguntas por produto, em telas curtas;
       5. revisão, preferência de contato e envio.
     Quem já é cliente pula tudo e vai direto ao corretor.
     No fim, abre o WhatsApp da corretora com a ficha pronta; o cliente só
     toca em enviar. O telefone não é pedido: chega junto com a mensagem.
     Nada é guardado no site: as respostas ficam só na memória da página
     enquanto ela está aberta. O resto do que a seguradora pede o corretor
     pergunta no WhatsApp, com as respostas rápidas do WhatsApp Business
     (textos na pasta do projeto: Apolice Seg/WhatsApp/respostas-rapidas).
     Links com data-direto continuam abrindo o WhatsApp sem o fluxo.

     Tipos de pergunta: radio, check (várias), text, cep, placa, money, data
     (dd/mm/aaaa), date (calendário), num, idades (lista de idades),
     itens (lista de equipamentos) e textarea.
     ess: pergunta essencial; se ficar em branco, a ficha avisa o corretor.
     se: mostra a pergunta só quando a função devolve true.
     alerta: texto que a ficha destaca para o corretor avaliar. */
  var SIM_NAO = ['Sim', 'Não'];
  var SIM_NAO_NS = ['Sim', 'Não', 'Não sei'];
  var SEGUROS = {
    automovel: { nome: 'Automóvel', nasc: true, telas: [
      [ { id: 'tipo', tipo: 'radio', rotulo: 'Qual veículo?', opcoes: ['Carro', 'Moto', 'Caminhonete / SUV', 'Caminhão', 'Outro'], ess: 1 },
        { id: 'modelo', tipo: 'text', rotulo: 'Modelo, versão e ano', ex: 'Ex.: Onix 1.0 LT 2021', ess: 1 },
        { id: 'placa', tipo: 'placa', rotulo: 'Placa', opc: 1, dica: 'Zero-quilômetro? Deixe em branco.' } ],
      [ { id: 'cep', tipo: 'cep', rotulo: 'CEP onde o veículo dorme', ess: 1 },
        { id: 'uso', tipo: 'radio', rotulo: 'Uso principal', opcoes: ['Particular', 'Trabalho', 'Aplicativo de transporte', 'Entregas'], ess: 1 },
        { id: 'jovem', tipo: 'radio', rotulo: 'Alguém de 18 a 25 anos dirige o veículo?', opcoes: SIM_NAO, ess: 1 },
        { id: 'atual', tipo: 'radio', rotulo: 'Já tem seguro em outra seguradora?', opcoes: SIM_NAO } ]
    ] },
    saude: { nome: 'Plano de Saúde', nota: 'Aqui não pedimos dados de saúde. Carências e portabilidade dependem da análise da operadora.', telas: [
      [ { id: 'para', tipo: 'radio', rotulo: 'Para quem é o plano?', opcoes: ['Só para mim', 'Para a família', 'Para a empresa (CNPJ)'], ess: 1 },
        { id: 'idades', tipo: 'idades', rotulo: 'Idade de cada pessoa', dica: 'Inclua você, se for usar o plano.', ess: 1 } ],
      [ { id: 'cidade', tipo: 'text', rotulo: 'Cidade onde vai usar o plano', ex: 'Ex.: Sorocaba', ess: 1 },
        { id: 'abrangencia', tipo: 'radio', rotulo: 'Atendimento', opcoes: ['Regional', 'Estadual', 'Nacional', 'Quero comparar'] },
        { id: 'atual', tipo: 'radio', rotulo: 'Já tem plano de saúde?', opcoes: SIM_NAO },
        { id: 'hospital', tipo: 'text', rotulo: 'Hospital de preferência', opc: 1, ex: 'Ex.: Unimed, Santa Lucinda' } ]
    ] },
    vida: { nome: 'Vida', nasc: function (g) { return g('para') !== 'Para outra pessoa' && g('para') !== 'Para sócios ou funcionários'; },
      nota: 'Aqui não pedimos dados de saúde. Preço e aceitação dependem da análise da seguradora.', telas: [
      [ { id: 'para', tipo: 'radio', rotulo: 'Para quem é o seguro?', opcoes: ['Para mim', 'Para a família', 'Para outra pessoa', 'Para sócios ou funcionários'], ess: 1 },
        { id: 'nascSeg', tipo: 'data', rotulo: 'Nascimento da pessoa segurada', se: function (g) { return g('para') === 'Para outra pessoa'; }, ess: 1 },
        { id: 'profissao', tipo: 'text', rotulo: 'Profissão', ex: 'Ex.: Engenheira', ess: 1 } ],
      [ { id: 'coberturas', tipo: 'check', rotulo: 'O que mais te interessa?', opcoes: ['Morte natural e acidental', 'Invalidez', 'Doenças graves', 'Diárias se ficar sem trabalhar', 'Assistência funeral', 'Quero orientação'] },
        { id: 'capital', tipo: 'radio', rotulo: 'Valor de cobertura', opcoes: ['Até R$ 100 mil', 'R$ 100 mil a R$ 300 mil', 'R$ 300 mil a R$ 1 milhão', 'Mais de R$ 1 milhão', 'Ainda não sei'] },
        { id: 'risco', tipo: 'radio', rotulo: 'Tem profissão ou esporte de risco?', opcoes: SIM_NAO_NS },
        { id: 'riscoQual', tipo: 'text', rotulo: 'Qual?', ex: 'Ex.: motociclismo, trabalho em altura', se: function (g) { return g('risco') === 'Sim'; }, alerta: 'Atividade de risco' } ]
    ] },
    residencial: { nome: 'Residencial', telas: [
      [ { id: 'tipo', tipo: 'radio', rotulo: 'Tipo de imóvel', opcoes: ['Casa', 'Apartamento', 'Casa em condomínio', 'Sítio / chácara', 'Outro'], ess: 1 },
        { id: 'posse', tipo: 'radio', rotulo: 'O imóvel é', opcoes: ['Próprio', 'Alugado'], ess: 1 },
        { id: 'papel', tipo: 'radio', rotulo: 'Você é', opcoes: ['Inquilino', 'Proprietário que aluga'], se: function (g) { return g('posse') === 'Alugado'; } },
        { id: 'uso', tipo: 'radio', rotulo: 'Uso do imóvel', opcoes: ['Moro nele', 'Casa de temporada', 'Alugo para outra pessoa', 'Está desocupado'], ess: 1,
          alerta: function (v) { return v === 'Casa de temporada' || v === 'Está desocupado' ? 'Imóvel ' + v.toLowerCase() + ': precisa de avaliação' : ''; } } ],
      [ { id: 'cep', tipo: 'cep', rotulo: 'CEP do imóvel', ess: 1 },
        { id: 'coberturas', tipo: 'check', rotulo: 'O que quer proteger?', opcoes: ['Incêndio, raio e explosão', 'Danos elétricos', 'Roubo / furto', 'Vendaval', 'Danos a terceiros', 'Assistência (chaveiro, encanador)', 'Quero orientação'] } ]
    ] },
    empresarial: { nome: 'Empresarial', empresa: true, telas: [
      [ { id: 'ramo', tipo: 'text', rotulo: 'Ramo da empresa', ex: 'Ex.: padaria, escritório, indústria', ess: 1, se: function (g, r) { return !r['dados.ramo']; } },
        { id: 'cep', tipo: 'cep', rotulo: 'CEP do estabelecimento', ess: 1 },
        { id: 'imovel', tipo: 'radio', rotulo: 'O imóvel é', opcoes: ['Próprio', 'Alugado', 'Compartilhado'] } ],
      [ { id: 'coberturas', tipo: 'check', rotulo: 'O que quer proteger?', opcoes: ['Incêndio e explosão', 'Danos elétricos', 'Roubo / furto', 'Máquinas e equipamentos', 'Estoque e mercadorias', 'Lucros cessantes', 'Responsabilidade Civil', 'Assistências', 'Quero orientação'] },
        { id: 'risco', tipo: 'radio', rotulo: 'Trabalha com atividade ou material de risco especial?', opcoes: SIM_NAO_NS },
        { id: 'riscoQual', tipo: 'text', rotulo: 'Qual?', ex: 'Ex.: inflamáveis, solda, fogos', se: function (g) { return g('risco') === 'Sim'; }, alerta: 'Risco especial' } ]
    ] },
    odontologico: { nome: 'Plano Odontológico', nota: 'Aparelho, prótese e implante dependem do plano escolhido.', telas: [
      [ { id: 'para', tipo: 'radio', rotulo: 'Para quem é o plano?', opcoes: ['Só para mim', 'Para a família', 'Para a empresa (CNPJ)'], ess: 1 },
        { id: 'pessoas', tipo: 'num', rotulo: 'Quantas pessoas?', ex: 'Ex.: 3', ess: 1 },
        { id: 'cidade', tipo: 'text', rotulo: 'Cidade', ex: 'Ex.: Sorocaba', ess: 1 },
        { id: 'servicos', tipo: 'check', rotulo: 'O que procura?', opcoes: ['Consultas e limpeza', 'Restaurações', 'Canal', 'Aparelho', 'Prótese ou implante', 'Quero orientação'] } ]
    ] },
    viagem: { nome: 'Viagem', telas: [
      [ { id: 'destino', tipo: 'radio', rotulo: 'Para onde vai?', opcoes: ['Brasil', 'América do Sul', 'Europa', 'América do Norte', 'Ásia / Oceania', 'Outro'], ess: 1 },
        { id: 'cidades', tipo: 'text', rotulo: 'Cidades ou países', opc: 1, ex: 'Ex.: Lisboa e Madri' },
        { id: 'ida', tipo: 'date', rotulo: 'Data de ida', ess: 1 },
        { id: 'volta', tipo: 'date', rotulo: 'Data de volta', ess: 1 } ],
      [ { id: 'idades', tipo: 'idades', rotulo: 'Idade de cada viajante', ess: 1 },
        { id: 'motivo', tipo: 'radio', rotulo: 'Motivo da viagem', opcoes: ['Turismo', 'Negócios', 'Estudos', 'Intercâmbio', 'Esportes', 'Outro'] },
        { id: 'extras', tipo: 'check', rotulo: 'Interesse extra', opc: 1, opcoes: ['Bagagem', 'Cancelamento', 'Esportes e aventura', 'Gestante', 'Eletrônicos', 'Quero orientação'] },
        { id: 'atividade', tipo: 'text', rotulo: 'Alguma atividade especial?', opc: 1, ex: 'Ex.: esqui, mergulho', alerta: function (v) { return v ? 'Atividade especial na viagem' : ''; } } ]
    ] },
    consorcio: { nome: 'Consórcio', semRenovar: true, nota: 'Consórcio não é seguro. A contemplação é por sorteio ou lance, conforme as regras do grupo, sem data garantida.', telas: [
      [ { id: 'objetivo', tipo: 'radio', rotulo: 'Qual é o seu objetivo?', opcoes: ['Automóvel', 'Moto', 'Imóvel', 'Reforma ou construção', 'Serviços', 'Veículo pesado', 'Outro'], ess: 1 },
        { id: 'credito', tipo: 'money', rotulo: 'Valor da carta de crédito', ex: 'Ex.: 80.000', ess: 1 },
        { id: 'parcela', tipo: 'radio', rotulo: 'Parcela que cabe no bolso', opcoes: ['Até R$ 500', 'R$ 501 a R$ 1.000', 'R$ 1.001 a R$ 2.000', 'Acima de R$ 2.000'] } ],
      [ { id: 'lance', tipo: 'radio', rotulo: 'Tem algum valor para dar de lance?', opcoes: ['Sim', 'Não', 'Ainda não sei'] },
        { id: 'lanceValor', tipo: 'money', rotulo: 'Valor aproximado do lance', opc: 1, se: function (g) { return g('lance') === 'Sim'; } },
        { id: 'quando', tipo: 'radio', rotulo: 'Quando quer usar o crédito?', opcoes: ['O quanto antes', 'Tenho um prazo', 'Sem prazo definido'] },
        { id: 'prazo', tipo: 'text', rotulo: 'Qual prazo?', ex: 'Ex.: em 1 ano', se: function (g) { return g('quando') === 'Tenho um prazo'; } } ]
    ] },
    equipamentos: { nome: 'Equipamentos', nota: 'A nota fiscal você manda depois, pelo WhatsApp.', telas: [
      [ { id: 'itens', tipo: 'itens', rotulo: 'Quais equipamentos?', ess: 1 },
        { id: 'uso', tipo: 'radio', rotulo: 'Uso principal', opcoes: ['Pessoal', 'Profissional', 'Empresarial'] } ],
      [ { id: 'onde', tipo: 'radio', rotulo: 'Onde ele é usado?', opcoes: ['Local fixo', 'Em vários locais', 'Em campo / obras', 'Em viagens'] },
        { id: 'nf', tipo: 'radio', rotulo: 'Tem nota fiscal?', opcoes: SIM_NAO, alerta: function (v) { return v === 'Não' ? 'Sem nota fiscal' : ''; } },
        { id: 'exterior', tipo: 'radio', rotulo: 'Usa fora do Brasil?', opcoes: SIM_NAO, alerta: function (v) { return v === 'Sim' ? 'Uso fora do Brasil' : ''; } } ]
    ] },
    'responsabilidade-civil': { nome: 'Responsabilidade Civil', telas: [
      [ { id: 'para', tipo: 'radio', rotulo: 'Para quem é?', opcoes: ['Pessoa física', 'Profissional autônomo', 'Empresa', 'Condomínio', 'Organizador de eventos', 'Outro'], ess: 1 },
        { id: 'modalidade', tipo: 'radio', rotulo: 'Que tipo de proteção procura?', opcoes: ['Erros no meu trabalho (profissional)', 'Danos nas operações da empresa', 'Eventos', 'Condomínio', 'Produtos que vendo ou fabrico', 'Obras', 'Não sei qual preciso'], ess: 1 },
        { id: 'atividade', tipo: 'text', rotulo: 'Profissão ou ramo', ex: 'Ex.: engenheiro, clínica, construtora', ess: 1, se: function (g, r) { return !r['dados.ramo']; } } ],
      [ { id: 'detalhe', tipo: 'textarea', ess: 1, rotulo: function (g) {
            var m = g('modalidade') || '';
            return /profissional/.test(m) ? 'Sua especialidade e os serviços que presta'
                 : m === 'Eventos' ? 'Tipo de evento, data, local e público estimado'
                 : m === 'Obras' ? 'Tipo de obra, prazo e valor aproximado'
                 : m === 'Condomínio' ? 'Tipo de condomínio e número de unidades'
                 : /Produtos/.test(m) ? 'Que produtos e onde vende'
                 : 'Conte em poucas palavras o que você faz'; } },
        { id: 'cidade', tipo: 'text', rotulo: 'Cidade onde atua', ex: 'Ex.: Sorocaba', ess: 1 },
        { id: 'limite', tipo: 'radio', rotulo: 'Limite de cobertura', opcoes: ['Até R$ 100 mil', 'R$ 100 mil a R$ 500 mil', 'Acima de R$ 500 mil', 'Quero orientação'] } ]
    ] },
    frotas: { nome: 'Frotas', empresa: true, telas: [
      [ { id: 'qtd', tipo: 'text', rotulo: 'Quantos veículos e de que tipo', ex: 'Ex.: 6 carros e 2 caminhões', ess: 1 },
        { id: 'cidade', tipo: 'text', rotulo: 'Cidade onde ficam', ex: 'Ex.: Sorocaba', ess: 1 } ]
    ] },
    outro: { nome: 'Outro / ainda não sei', semRenovar: true, telas: [] }
  };
  /* Renovação ou revisão: no lugar das perguntas de cotação nova. */
  var RENOVAR = [
    { id: 'seguradora', tipo: 'text', rotulo: 'Seguradora ou operadora atual', ex: 'Ex.: Porto Seguro', ess: 1 },
    { id: 'vence', tipo: 'radio', rotulo: 'Quando vence?', opcoes: ['Este mês', 'Próximo mês', 'Em 2 a 3 meses', 'Não sei'], ess: 1 },
    { id: 'quer', tipo: 'check', rotulo: 'O que você quer?', opcoes: ['Renovar como está', 'Revisar coberturas', 'Buscar preço melhor', 'Trocar o bem ou incluir pessoas'] }
  ];
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
    novo: 'Sou novo, quero uma cotação',
    renovar: 'Quero renovar ou revisar',
    cliente: 'Já sou cliente, quero falar com o corretor'
  };

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Respostas: R['dados.nome'], R['automovel.cep'], R['ren.saude.vence']...
     Ficam aqui enquanto a página está aberta (voltar, trocar de produto e
     fechar/abrir o fluxo não apagam nada). */
  var R = {}, cot = null, cotTela = 'inicio', cotLocal = 'cta', cotCorretor = '', cotPre = [];

  function lista(k) { return R[k] || []; }
  function getter(prefixo) { return function (id) { return R[prefixo + id]; }; }
  function produtosNovos() { return lista('novo'); }
  function produtosRenovar() { return R.tipo === 'renovar' ? lista('renovar') : []; }
  function ehEmpresa() { return R['dados.quem'] === 'Para sua empresa (CNPJ)'; }
  function precisaNasc() {
    if (ehEmpresa()) return false;
    return produtosNovos().some(function (k) {
      var n = SEGUROS[k].nasc;
      return typeof n === 'function' ? n(getter(k + '.')) : !!n;
    });
  }
  function vazio(v) {
    if (Array.isArray(v)) return !v.some(function (x) { return x && (typeof x === 'string' ? x.trim() : (x.d || x.v)); });
    return v == null || String(v).trim() === '';
  }
  function visivel(f, prefixo) { return !f.se || f.se(getter(prefixo), R); }
  function rotuloDe(f, prefixo) { return typeof f.rotulo === 'function' ? f.rotulo(getter(prefixo)) : f.rotulo; }

  /* Telas na ordem. Cada tela: { id, titulo, campos, prefixo } */
  function sequencia() {
    var s = [{ id: 'inicio' }];
    if (R.tipo === 'cliente') { s.push({ id: 'cliente' }); return s; }
    s.push({ id: 'produtos' }, { id: 'dados' });
    produtosRenovar().forEach(function (k) {
      s.push({ id: 'ren:' + k, titulo: SEGUROS[k].nome, sub: 'Renovação ou revisão', campos: RENOVAR, prefixo: 'ren.' + k + '.', produto: k });
    });
    produtosNovos().forEach(function (k) {
      var t = SEGUROS[k].telas;
      t.forEach(function (campos, i) {
        s.push({ id: 'p:' + k + ':' + i, titulo: SEGUROS[k].nome, sub: t.length > 1 ? 'Parte ' + (i + 1) + ' de ' + t.length : '', campos: campos, prefixo: k + '.', produto: k });
      });
    });
    s.push({ id: 'revisao' });
    return s;
  }
  function telaAtual(seq) {
    for (var i = 0; i < seq.length; i++) if (seq[i].id === cotTela) return i;
    return -1;
  }

  /* ---------- Campos ---------- */
  function idCampo(chave) { return 'c_' + chave.replace(/[^\w]/g, '_'); }

  function opcoesHtml(f, chave, multi) {
    var v = R[chave];
    return '<div class="cot-opcoes">' + f.opcoes.map(function (o) {
      var marcado = multi ? (v || []).indexOf(o) !== -1 : v === o;
      return '<label class="cot-chip cot-chip--' + (multi ? 'check' : 'radio') + '"><input type="' + (multi ? 'checkbox' : 'radio') +
        '" name="' + idCampo(chave) + '" value="' + esc(o) + '" data-k="' + esc(chave) + '"' + (multi ? ' data-multi' : '') +
        (marcado ? ' checked' : '') + '><span>' + esc(o) + '</span></label>';
    }).join('') + '</div>';
  }

  function campoHtml(f, prefixo) {
    var chave = prefixo + f.id, id = idCampo(chave), v = R[chave];
    var rot = esc(rotuloDe(f, prefixo)) + (f.opc ? ' <span class="cot-opc">(opcional)</span>' : '');
    var dica = f.dica ? '<small class="cot-dica">' + esc(f.dica) + '</small>' : '';
    if (f.tipo === 'radio' || f.tipo === 'check') {
      return '<fieldset class="cot-q"><legend>' + rot + (f.tipo === 'check' ? ' <span class="cot-opc">(pode marcar mais de um)</span>' : '') +
        '</legend>' + opcoesHtml(f, chave, f.tipo === 'check') + dica + '</fieldset>';
    }
    if (f.tipo === 'idades') {
      var idades = v && v.length ? v : [''];
      return '<fieldset class="cot-q"><legend>' + rot + '</legend>' + dica + '<div class="cot-lista">' +
        idades.map(function (x, i) {
          return '<div class="cot-linha"><label class="cot-sr" for="' + id + '_' + i + '">Pessoa ' + (i + 1) + '</label>' +
            '<span class="cot-linha-n" aria-hidden="true">' + (i + 1) + '</span>' +
            '<input id="' + id + '_' + i + '" class="input" type="text" inputmode="numeric" maxlength="3" placeholder="Idade" data-k="' + esc(chave) + '" data-i="' + i + '" value="' + esc(x) + '">' +
            (idades.length > 1 ? '<button type="button" class="cot-rem" data-rem="' + esc(chave) + '" data-i="' + i + '" aria-label="Remover pessoa ' + (i + 1) + '">×</button>' : '') +
            '</div>';
        }).join('') + '</div><button type="button" class="cot-add" data-add="' + esc(chave) + '">+ Adicionar pessoa</button></fieldset>';
    }
    if (f.tipo === 'itens') {
      var itens = v && v.length ? v : [{ d: '', v: '' }];
      return '<fieldset class="cot-q"><legend>' + rot + '</legend><div class="cot-lista">' +
        itens.map(function (x, i) {
          return '<div class="cot-item"><span class="cot-linha-n" aria-hidden="true">' + (i + 1) + '</span>' +
            '<div class="form-field"><label for="' + id + '_d' + i + '">Equipamento, marca e modelo</label>' +
            '<input id="' + id + '_d' + i + '" class="input" placeholder="Ex.: notebook Dell Inspiron" data-k="' + esc(chave) + '" data-i="' + i + '" data-sub="d" value="' + esc(x.d || '') + '"></div>' +
            '<div class="form-field"><label for="' + id + '_v' + i + '">Valor aproximado</label>' +
            '<div class="cot-rs"><span aria-hidden="true">R$</span><input id="' + id + '_v' + i + '" class="input" inputmode="numeric" placeholder="Ex.: 5.000" data-k="' + esc(chave) + '" data-i="' + i + '" data-sub="v" data-mask="money" value="' + esc(x.v || '') + '"></div></div>' +
            (itens.length > 1 ? '<button type="button" class="cot-rem" data-rem="' + esc(chave) + '" data-i="' + i + '" aria-label="Remover equipamento ' + (i + 1) + '">×</button>' : '') +
            '</div>';
        }).join('') + '</div><button type="button" class="cot-add" data-add="' + esc(chave) + '">+ Adicionar equipamento</button></fieldset>';
    }
    var attrs = ' id="' + id + '" class="input" data-k="' + esc(chave) + '" value="' + esc(v || '') + '"';
    var campo;
    if (f.tipo === 'textarea') {
      campo = '<textarea id="' + id + '" class="input" rows="3" data-k="' + esc(chave) + '" placeholder="' + esc(f.ex || '') + '">' + esc(v || '') + '</textarea>';
    } else if (f.tipo === 'money') {
      campo = '<div class="cot-rs"><span aria-hidden="true">R$</span><input' + attrs + ' inputmode="numeric" data-mask="money" placeholder="' + esc(f.ex || '') + '"></div>';
    } else if (f.tipo === 'date') {
      campo = '<input' + attrs + ' type="date" min="' + hojeISO() + '">';
    } else {
      var extra = {
        cep: ' inputmode="numeric" autocomplete="postal-code" maxlength="9" data-mask="cep" placeholder="00000-000"',
        placa: ' autocapitalize="characters" maxlength="8" data-mask="placa" placeholder="ABC1D23"',
        data: ' inputmode="numeric" maxlength="10" data-mask="data" placeholder="dd/mm/aaaa"',
        num: ' inputmode="numeric" maxlength="4" data-mask="num" placeholder="' + esc(f.ex || '') + '"'
      }[f.tipo] || ' placeholder="' + esc(f.ex || '') + '"';
      campo = '<input' + attrs + extra + '>';
    }
    return '<div class="form-field"><label for="' + id + '">' + rot + '</label>' + campo + dica + '</div>';
  }

  /* ---------- Telas ---------- */
  function htmlInicio() {
    return '<h2 id="cotTitulo" tabindex="-1">Como podemos te ajudar?</h2>' +
      '<div class="cot-opcoes cot-opcoes--grande">' + Object.keys(TIPOS).map(function (k) {
        return '<label class="cot-chip cot-chip--radio"><input type="radio" name="cotTipo" value="' + k + '" data-k="tipo"' + (R.tipo === k ? ' checked' : '') + '><span>' + esc(TIPOS[k]) +
          (k === 'cliente' ? '<small>Inclui batida, roubo, guincho e dúvidas da apólice.</small>' : '') + '</span></label>';
      }).join('') + '</div>';
  }

  function chipsProdutos(chave, filtro) {
    var marc = lista(chave);
    return '<div class="cot-chips">' + Object.keys(SEGUROS).filter(filtro || function () { return true; }).map(function (k) {
      return '<label class="cot-chip"><input type="checkbox" name="' + chave + '" value="' + k + '" data-k="' + chave + '" data-multi' + (marc.indexOf(k) !== -1 ? ' checked' : '') + '><span>' + esc(SEGUROS[k].nome) + '</span></label>';
    }).join('') + '</div>';
  }

  function htmlProdutos() {
    if (R.tipo === 'renovar') {
      return '<h2 id="cotTitulo" tabindex="-1">O que você quer renovar ou revisar?</h2>' +
        chipsProdutos('renovar', function (k) { return !SEGUROS[k].semRenovar; }) +
        '<h3 class="cot-h3">Quer aproveitar e cotar algo novo? <span class="cot-opc">(opcional)</span></h3>' +
        chipsProdutos('novo');
    }
    return '<h2 id="cotTitulo" tabindex="-1">O que você quer cotar?</h2>' +
      '<p class="cot-sub">Pode marcar mais de um.</p>' + chipsProdutos('novo');
  }

  function htmlDados() {
    var campos = [
      { id: 'quem', tipo: 'radio', rotulo: 'A cotação é', opcoes: ['Para você (CPF)', 'Para sua empresa (CNPJ)'] },
      { id: 'nome', tipo: 'text', rotulo: 'Seu nome', ex: 'Ex.: Maria Silva' },
      { id: 'empresa', tipo: 'text', rotulo: 'Nome da empresa', opc: 1, ex: 'Ex.: Padaria Bom Pão', se: ehEmpresa },
      { id: 'ramo', tipo: 'text', rotulo: 'Ramo de atividade', ex: 'Ex.: comércio, restaurante, consultoria', se: ehEmpresa },
      { id: 'nasc', tipo: 'data', rotulo: 'Data de nascimento', dica: 'A idade muda o preço, por isso a seguradora pede.', se: precisaNasc },
      { id: 'email', tipo: 'text', rotulo: 'E-mail', opc: 1, ex: 'Para receber a proposta em PDF' }
    ];
    return '<h2 id="cotTitulo" tabindex="-1">Seus dados</h2>' +
      '<p class="cot-sub">Seu telefone já chega junto com a mensagem do WhatsApp.</p>' +
      campos.filter(function (f) { return visivel(f, 'dados.'); }).map(function (f) {
        var h = campoHtml(f, 'dados.');
        if (f.id === 'nome') h = h.replace('class="input"', 'class="input" autocomplete="name"');
        if (f.id === 'email') h = h.replace('class="input"', 'class="input" type="email" autocomplete="email"');
        if (f.id === 'nasc') h = h.replace('class="input"', 'class="input" autocomplete="bday"');
        return h;
      }).join('');
  }

  function htmlPerguntas(t) {
    var s = SEGUROS[t.produto];
    var nota = s.nota && t.id.slice(-2) === ':0' ? '<p class="cot-nota">' + esc(s.nota) + '</p>' : '';
    var renov = t.id.indexOf('ren:') === 0 ? '<p class="cot-nota">Tem a apólice ou a carteirinha? Mande uma foto no WhatsApp depois, que adianta tudo.</p>' : '';
    return '<p class="cot-eyebrow">' + esc(t.sub || 'Cotação') + '</p>' +
      '<h2 id="cotTitulo" tabindex="-1">' + esc(t.titulo) + '</h2>' + nota + renov +
      '<p class="cot-sub">Não sabe alguma? Pode pular, o corretor confirma depois.</p>' +
      t.campos.filter(function (f) { return visivel(f, t.prefixo); }).map(function (f) { return campoHtml(f, t.prefixo); }).join('');
  }

  function htmlCliente() {
    return '<h2 id="cotTitulo" tabindex="-1">Tudo certo. Vamos direto ao corretor.</h2>' +
      '<p class="cot-sub">Se quiser, adiante o assunto. Se for urgente, é só escrever "urgente".</p>' +
      campoHtml({ id: 'obs', tipo: 'textarea', rotulo: 'Observação', opc: 1, ex: 'Ex.: quero tirar uma dúvida da minha apólice' }, 'cliente.');
  }

  function htmlRevisao() {
    var f = ficha(), blocos = [];
    var dados = f.cliente.map(function (l) { return '<li>' + esc(l[0]) + ': <b>' + esc(l[1]) + '</b></li>'; }).join('');
    blocos.push(resumo('Seus dados', 'dados', dados));
    f.produtos.forEach(function (p) {
      var itens = p.respostas.map(function (l) { return '<li>' + esc(l[0]) + ': <b>' + esc(l[1]) + '</b></li>'; }).join('');
      if (p.faltando.length) itens += '<li class="cot-falta">O corretor vai perguntar: ' + esc(p.faltando.join(', ')) + '</li>';
      blocos.push(resumo(p.nome + (p.modo === 'renovacao' ? ' (renovação)' : ''), p.primeiraTela, itens || '<li class="cot-falta">O corretor vai perguntar os detalhes.</li>'));
    });
    return '<h2 id="cotTitulo" tabindex="-1">Confira antes de enviar</h2>' +
      '<div class="cot-resumo">' + blocos.join('') + '</div>' +
      campoHtml({ id: 'pref', tipo: 'radio', rotulo: 'Por aqui, você prefere conversar por mensagem, áudio ou ligação? 😊', opcoes: ['Mensagem', 'Áudio', 'Ligação'],
        dica: 'Assim a gente segue do jeito que for melhor para você!' }, 'fim.') +
      campoHtml({ id: 'obs', tipo: 'textarea', rotulo: 'Existe alguma necessidade específica que devemos considerar?', opc: 1, ex: 'Ex.: melhor horário para falar' }, 'fim.') +
      '<p class="cot-priv">Usamos estes dados só para preparar sua cotação. O site não guarda nada: as respostas vão para o WhatsApp da corretora quando você tocar em enviar. Não pedimos documentos nem dados de saúde aqui. <a href="politica-de-privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a></p>' +
      '<label class="cot-declara"><input type="checkbox" data-k="fim.declaro"' + (R['fim.declaro'] ? ' checked' : '') + '><span>Confirmo que as informações estão corretas, até onde sei.</span></label>';
  }
  function resumo(titulo, tela, itens) {
    return '<section class="cot-bloco"><div class="cot-bloco-top"><h3>' + esc(titulo) + '</h3>' +
      '<button type="button" class="cot-editar" data-ir="' + esc(tela) + '">Editar</button></div><ul>' + itens + '</ul></section>';
  }

  function htmlFim() {
    return '<h2 id="cotTitulo" tabindex="-1">Abrimos o WhatsApp com sua mensagem</h2>' +
      '<p class="cot-sub">Ela só chega para a gente quando você tocar em <strong>enviar</strong> lá no WhatsApp. ' +
      'De segunda a sexta, das 9h às 17h, respondemos em até 30 minutos.</p>' +
      '<a class="btn btn-secondary" id="cotDeNovo" href="#" target="_blank" rel="noopener" data-direto>O WhatsApp não abriu? Toque aqui</a>';
  }

  /* ---------- Ficha para o corretor ---------- */
  function valorTexto(f, v) {
    if (f.tipo === 'idades') {
      var ns = (v || []).filter(function (x) { return String(x).trim(); });
      return ns.length ? ns.length + (ns.length > 1 ? ' pessoas: ' : ' pessoa: ') + ns.join(', ') + (ns.length > 1 ? ' anos' : ' anos') : '';
    }
    if (f.tipo === 'itens') {
      return (v || []).filter(function (x) { return x.d || x.v; }).map(function (x) {
        return (x.d || 'Equipamento') + (x.v ? ' (R$ ' + x.v + ')' : '');
      }).join('; ');
    }
    if (Array.isArray(v)) return v.join(', ');
    if (f.tipo === 'money') return v ? 'R$ ' + v : '';
    if (f.tipo === 'date' && v) { var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
    return v ? String(v).trim() : '';
  }
  function curto(r) { return r.replace(/ \(.*\)$|\?$/, ''); }

  function novoId() {
    var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    var n = new Uint8Array(4);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(n); else for (var i = 0; i < 4; i++) n[i] = Math.random() * 256;
    for (var j = 0; j < 4; j++) s += c[n[j] % c.length];
    var d = new Date();
    return 'AS-' + String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + s;
  }

  /* Dados estruturados da solicitação. Hoje viram o texto do WhatsApp;
     quando houver um sistema de atendimento, é este objeto que se envia. */
  function ficha() {
    var f = {
      id: R.id || (R.id = novoId()),
      criadoEm: new Date().toISOString(),
      origem: origem || 'site', local: cotLocal,
      tipo: R.tipo, corretor: cotCorretor,
      preferencia: R['fim.pref'] || '',
      cliente: [], produtos: [], alertas: [],
      observacao: (R.tipo === 'cliente' ? R['cliente.obs'] : R['fim.obs']) || '',
      declaracao: !!R['fim.declaro']
    };
    var add = function (rot, v) { if (!vazio(v)) f.cliente.push([rot, String(v).trim()]); };
    add('Nome', R['dados.nome']);
    if (R.tipo === 'cliente') return f;
    if (ehEmpresa()) { add('Para', 'Empresa (CNPJ)'); add('Empresa', R['dados.empresa']); add('Ramo', R['dados.ramo']); }
    if (precisaNasc()) add('Nascimento', R['dados.nasc']);
    add('E-mail', R['dados.email']);
    sequencia().forEach(function (t) {
      if (!t.produto) return;
      var modo = t.id.indexOf('ren:') === 0 ? 'renovacao' : 'novo';
      var p = f.produtos.filter(function (x) { return x.id === t.produto && x.modo === modo; })[0];
      if (!p) { p = { id: t.produto, nome: SEGUROS[t.produto].nome, modo: modo, respostas: [], faltando: [], primeiraTela: t.id }; f.produtos.push(p); }
      t.campos.forEach(function (c) {
        if (!visivel(c, t.prefixo)) return;
        var v = valorTexto(c, R[t.prefixo + c.id]), rot = curto(rotuloDe(c, t.prefixo));
        if (v) p.respostas.push([rot, v]);
        else if (c.ess) p.faltando.push(/^[A-Z]{2}/.test(rot) ? rot : rot.charAt(0).toLowerCase() + rot.slice(1));
        var a = typeof c.alerta === 'function' ? c.alerta(R[t.prefixo + c.id]) : (v && c.alerta);
        if (a) f.alertas.push(p.nome + ': ' + a);
      });
    });
    produtosNovos().forEach(function (k) {
      if (!SEGUROS[k].telas.length) f.produtos.push({ id: k, nome: SEGUROS[k].nome, modo: 'novo', respostas: [], faltando: [], primeiraTela: 'produtos' });
    });
    return f;
  }

  function mensagem() {
    var f = ficha(), l = [];
    var quando = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (f.tipo === 'cliente') {
      l.push('Olá! Já sou cliente e quero falar com o corretor.');
      if (cotCorretor) l.push('Gostaria de ser atendido(a) por ' + cotCorretor + '.');
      if (f.observacao.trim()) l.push('', '*Assunto:* ' + f.observacao.trim());
    } else {
      l.push(f.tipo === 'renovar' ? 'Olá! Quero renovar ou revisar meu seguro pelo site da Apólice Seg.' : 'Olá! Quero uma cotação pelo site da Apólice Seg.');
      if (cotCorretor) l.push('Gostaria de ser atendido(a) por ' + cotCorretor + '.');
      l.push('', '*Ficha ' + f.id + '* · ' + quando);
      l.push('Atendimento: ' + (f.tipo === 'renovar' ? 'renovação ou revisão' : 'cliente novo'));
      if (f.preferencia) l.push('Prefere conversar por: ' + f.preferencia.toLowerCase());
      l.push('', '*Dados*');
      f.cliente.forEach(function (x) { l.push('• ' + x[0] + ': ' + x[1]); });
      f.produtos.forEach(function (p) {
        l.push('', '*' + p.nome + (p.modo === 'renovacao' ? ' (renovação)' : '') + '*');
        p.respostas.forEach(function (x) { l.push('• ' + x[0] + ': ' + x[1]); });
        if (p.faltando.length) l.push('• A confirmar: ' + p.faltando.join(', '));
      });
      if (f.alertas.length) { l.push('', '*Para avaliar*'); f.alertas.forEach(function (a) { l.push('• ' + a); }); }
      if (f.observacao.trim()) l.push('', '*Necessidade específica:* ' + f.observacao.trim());
      if (f.declaracao) l.push('', 'Confirmo que as informações estão corretas, até onde sei.');
    }
    return comOrigem(l.join('\n'));
  }

  /* ---------- Validação (só formato; nada trava por falta de resposta,
     exceto o nome e a confirmação final) ---------- */
  function hojeISO() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function dataValida(v, min, max) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (!m) return false;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    var idade = (Date.now() - d) / 31557600000;
    return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 && idade >= min && idade < max;
  }
  function validar(t) {
    var problema = function (chave, texto) { return { chave: chave, texto: texto }; };
    if (t.id === 'inicio' && !R.tipo) return problema('tipo', 'Escolha uma opção.');
    if (t.id === 'produtos') {
      if (!produtosNovos().length && !produtosRenovar().length)
        return problema(R.tipo === 'renovar' ? 'renovar' : 'novo', 'Marque pelo menos uma opção.');
    }
    if (t.id === 'dados') {
      if (vazio(R['dados.nome']) || R['dados.nome'].trim().length < 2) return problema('dados.nome', 'Escreva seu nome.');
      if (precisaNasc() && !vazio(R['dados.nasc']) && !dataValida(R['dados.nasc'].trim(), 16, 110))
        return problema('dados.nasc', 'Confira a data de nascimento (dd/mm/aaaa).');
      if (!vazio(R['dados.email']) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(R['dados.email'].trim()))
        return problema('dados.email', 'Confira o e-mail ou deixe em branco.');
    }
    if (t.campos) {
      for (var i = 0; i < t.campos.length; i++) {
        var f = t.campos[i], k = t.prefixo + f.id, v = R[k];
        if (!visivel(f, t.prefixo) || vazio(v)) continue;
        if (f.tipo === 'cep' && v.replace(/\D/g, '').length !== 8) return problema(k, 'O CEP tem 8 números. Confira ou deixe em branco.');
        if (f.tipo === 'placa' && !/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/.test(v)) return problema(k, 'Confira a placa (ex.: ABC1D23) ou deixe em branco.');
        if (f.tipo === 'data' && !dataValida(v, 0, 110)) return problema(k, 'Confira a data (dd/mm/aaaa).');
        if (f.tipo === 'idades' && v.some(function (x) { return String(x).trim() && !(+x >= 0 && +x <= 110); }))
          return problema(k, 'Confira as idades (de 0 a 110).');
      }
      if (t.produto === 'viagem' && t.id === 'p:viagem:0') {
        var ida = R['viagem.ida'], volta = R['viagem.volta'];
        if (ida && ida < hojeISO()) return problema('viagem.ida', 'A data de ida já passou.');
        if (ida && volta && volta <= ida) return problema('viagem.volta', 'A volta precisa ser depois da ida.');
      }
    }
    if (t.id === 'revisao' && !R['fim.declaro']) return problema('fim.declaro', 'Marque a confirmação para enviar.');
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

  function progresso(seq, i) {
    /* Antes de escolher os produtos, conta 2 telas de perguntas para a
       barra não andar para trás depois. */
    var total = seq.length - 1 + (seq.some(function (t) { return t.produto; }) || R.tipo === 'cliente' ? 0 : 2);
    var pct = Math.round(i / Math.max(total, 1) * 100);
    var txt = cotTela === 'fim' ? 'Pronto'
      : cotTela === 'inicio' ? 'Leva cerca de 2 minutos'
      : cotTela === 'revisao' || cotTela === 'cliente' ? 'Última etapa: é só conferir e enviar'
      : pct >= 50 ? 'Você preencheu ' + pct + '%, falta pouco!'
      : 'Você preencheu ' + pct + '%';
    document.getElementById('cotPasso').textContent = txt;
    document.getElementById('cotBarra').style.width = (cotTela === 'fim' ? 100 : Math.max(pct, 4)) + '%';
  }

  function render(focar) {
    var seq = sequencia(), i = telaAtual(seq);
    if (cotTela !== 'fim' && i === -1) { cotTela = 'inicio'; i = 0; }
    var t = seq[i] || { id: 'fim' };
    var html = t.id === 'inicio' ? htmlInicio()
      : t.id === 'produtos' ? htmlProdutos()
      : t.id === 'dados' ? htmlDados()
      : t.id === 'cliente' ? htmlCliente()
      : t.id === 'revisao' ? htmlRevisao()
      : t.id === 'fim' ? htmlFim()
      : htmlPerguntas(t);
    var tela = document.getElementById('cotTela');
    tela.innerHTML = html;
    tela.className = 'cot-tela' + (t.id === 'fim' ? ' cot-fim' : '');
    if (t.id === 'fim') document.getElementById('cotDeNovo').href = cot._url || '#';
    document.getElementById('cotErro').hidden = true;
    progresso(seq, i);
    cot.querySelector('[data-cot="voltar"]').hidden = t.id === 'inicio';
    cot.querySelector('.cot-acoes').hidden = t.id === 'fim';
    var envia = t.id === 'revisao' || t.id === 'cliente';
    var avancar = document.getElementById('cotAvancar');
    avancar.innerHTML = envia ? '<svg class="icon icon-sm"><use href="#i-whatsapp"/></svg>Enviar pelo WhatsApp' : 'Continuar';
    avancar.classList.toggle('btn-wa', envia);
    if (focar !== false) {
      cot.querySelector('.cot-box').scrollTop = 0;
      var h = document.getElementById('cotTitulo');
      if (h) h.focus({ preventScroll: true });
    }
  }

  function irPara(id) {
    cotTela = id;
    if (id === 'dados' && !R['dados.quem']) R['dados.quem'] = ehEmpresaPadrao() ? 'Para sua empresa (CNPJ)' : 'Para você (CPF)';
    render();
    registrar('cotacao_passo', { passo: id.replace(/:\d+$/, ''), local: cotLocal });
  }

  function mostrarErro(p) {
    var e = document.getElementById('cotErro');
    e.textContent = p.texto;
    e.hidden = false;
    var el = cot.querySelector('[data-k="' + p.chave + '"]');
    if (el) { el.focus(); el.setAttribute('aria-invalid', 'true'); }
  }

  function avancar() {
    var seq = sequencia(), i = telaAtual(seq), t = seq[i];
    var p = validar(t);
    if (p) return mostrarErro(p);
    if (t.id === 'revisao' || t.id === 'cliente') return enviar();
    irPara(sequencia()[i + 1].id);
  }

  function voltar() {
    var seq = sequencia(), i = telaAtual(seq);
    if (i > 0) irPara(seq[i - 1].id);
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
    var produtos = R.tipo === 'cliente' ? 'cliente' : produtosRenovar().map(function (k) { return 'renovar_' + k; }).concat(produtosNovos()).join(',');
    registrar('generate_lead', { produto: produtos, tipo: R.tipo, local: cotLocal });
    if (window.fbq) fbq('track', 'Lead', { content_name: produtos });
    cot._url = url;
    abrirLink(url);
    irPara('fim');
  }

  /* Máscaras */
  function mascarar(el) {
    var m = el.getAttribute('data-mask'), v = el.value, d = v.replace(/\D/g, '');
    if (m === 'cep') v = d.slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
    else if (m === 'data') { d = d.slice(0, 8); v = d.length > 4 ? d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4) : d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
    else if (m === 'money') v = d ? (+d.slice(0, 10)).toLocaleString('pt-BR') : '';
    else if (m === 'num') v = d.slice(0, 4);
    else if (m === 'placa') v = v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
    if (el.getAttribute('data-i') !== null && !el.getAttribute('data-sub')) v = d.slice(0, 3);
    if (v !== el.value) el.value = v;
  }

  function guardar(el) {
    var k = el.getAttribute('data-k');
    if (!k) return;
    var i = el.getAttribute('data-i'), sub = el.getAttribute('data-sub');
    if (el.type === 'checkbox' && el.hasAttribute('data-multi')) {
      var atual = lista(k).filter(function (x) { return x !== el.value; });
      if (el.checked) atual.push(el.value);
      R[k] = atual;
    } else if (el.type === 'checkbox') {
      R[k] = el.checked;
    } else if (el.type === 'radio') {
      R[k] = el.value;
    } else if (i !== null) {
      var arr = (R[k] || []).slice();
      if (sub) { arr[+i] = arr[+i] || { d: '', v: '' }; arr[+i] = { d: arr[+i].d, v: arr[+i].v }; arr[+i][sub] = el.value; }
      else arr[+i] = el.value;
      R[k] = arr;
    } else {
      R[k] = el.value;
    }
    el.removeAttribute('aria-invalid');
  }

  function rerenderMantendoFoco(el) {
    var id = el.id, nome = el.name, valor = el.value;
    render(false);
    var novo = (id && document.getElementById(id)) ||
      cot.querySelector('input[name="' + nome + '"][value="' + valor.replace(/"/g, '\\"') + '"]');
    if (novo) novo.focus();
  }

  function abrirCotacao(seguro, local, corretor) {
    if (!cot) {
      cot = montarCotacao();
      var form = cot.querySelector('form');
      form.addEventListener('submit', function (e) { e.preventDefault(); avancar(); });
      cot.addEventListener('click', function (e) {
        var alvo = e.target;
        if (!alvo.closest) return;
        var acao = alvo.closest('[data-cot]');
        if (e.target === cot || (acao && acao.getAttribute('data-cot') === 'fechar')) return cot.close();
        if (acao && acao.getAttribute('data-cot') === 'voltar') return voltar();
        var ir = alvo.closest('[data-ir]');
        if (ir) return irPara(ir.getAttribute('data-ir'));
        var add = alvo.closest('[data-add]');
        if (add) {
          var k = add.getAttribute('data-add'), arr = (R[k] && R[k].length ? R[k] : [k.slice(-5) === 'itens' ? { d: '', v: '' } : '']).slice();
          arr.push(k.slice(-5) === 'itens' ? { d: '', v: '' } : '');
          R[k] = arr; render(false);
          var ins = cot.querySelectorAll('[data-k="' + k + '"]');
          if (ins.length) ins[ins.length - (k.slice(-5) === 'itens' ? 2 : 1)].focus();
          return;
        }
        var rem = alvo.closest('[data-rem]');
        if (rem) {
          var kr = rem.getAttribute('data-rem'), lr = (R[kr] || []).slice();
          lr.splice(+rem.getAttribute('data-i'), 1);
          R[kr] = lr; render(false);
          var bt = cot.querySelector('[data-add="' + kr + '"]'); if (bt) bt.focus();
        }
      });
      cot.addEventListener('input', function (e) {
        if (e.target.hasAttribute('data-mask') || e.target.getAttribute('data-i') !== null) mascarar(e.target);
        if (e.target.type !== 'radio' && e.target.type !== 'checkbox') guardar(e.target);
      });
      cot.addEventListener('change', function (e) {
        if (e.target.type !== 'radio' && e.target.type !== 'checkbox') return;
        guardar(e.target);
        document.getElementById('cotErro').hidden = true;
        /* Escolhas mudam quais perguntas aparecem: redesenha a tela. */
        if (e.target.getAttribute('data-k') === 'tipo') { cotPreAplicar(); return avancar(); }
        rerenderMantendoFoco(e.target);
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
     já fica marcado na lista certa. */
  function cotPreAplicar() {
    if (!cotPre.length || R.tipo === 'cliente') return;
    var chave = R.tipo === 'renovar' ? 'renovar' : 'novo';
    var atual = lista(chave);
    cotPre.forEach(function (s) {
      if (chave === 'renovar' && SEGUROS[s].semRenovar) return;
      if (atual.indexOf(s) === -1) atual.push(s);
    });
    R[chave] = atual;
    if (ehEmpresaPadrao()) R['dados.quem'] = R['dados.quem'] || 'Para sua empresa (CNPJ)';
    cotPre = [];
  }
  function ehEmpresaPadrao() {
    var todos = produtosNovos().concat(produtosRenovar());
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
