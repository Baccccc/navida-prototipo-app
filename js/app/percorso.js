/* ==========================================================================
   NAVIDA — Linea di carriera estesa
   ==========================================================================
   La stessa vista vive in due posti:

     fase3.html   schermata "percorso" (type nvPercorso): dentro l'app, si
                  arriva dalla dashboard e toccando una tappa si apre lo step
     index.html   schermata "preview": alla fine del questionario. Qui le
                  schermate dell'app non esistono, quindi la freccia torna
                  indietro nel questionario, una tappa apre un pannello con
                  i suoi dati e il pulsante in fondo porta alla dashboard

   Bac l'ha chiesta "come un percorso, un filo ludico, stile Duolingo", ma
   con pochi step molto distanziati, una piccola mappa diretta dallo step 1
   al traguardo, pochi dati per tappa e lo stato chiarissimo. Niente
   percentuali.

   Tre versioni (pannello Versione):
     base     Sentiero  sentiero che serpeggia dall'alto in basso, nodi tondi
                        da gioco, "Sei qui" con la mascotte sulla tappa attuale
     pianeti  Pianeti   cielo notturno: si parte dalla Terra in basso e il
                        razzo sale di pianeta in pianeta fino al traguardo
     tappe    Tappe     mini mappa orizzontale da 1 a 5 e grandi carte-tappa
                        che scorrono di lato

   Dati: NV.dati.percorso e NV.steps() (js/app/dati.js).
   Stile: css/app/percorso.css. Prefisso delle classi: nv-path-
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV;
  var R = window.NavidaRender;
  if (!NV || !R) return;

  var h = NV.h, icon = NV.icon, ICO = NV.ICO;
  var SVG = 'http://www.w3.org/2000/svg';
  var IMMAGINI = 'assets/percorso/';

  /* ==================================================================
     VERSIONI
     Le stesse tre per l'app e per l'anteprima: e' la stessa vista.
     "preview" sostituisce la voce vecchia di js/variants.js (lista,
     serpentina, mappa), che disegnava js/render.js.
     ================================================================== */
  var OPZIONI = [
    { value: 'base',    label: 'Sentiero' },
    { value: 'pianeti', label: 'Pianeti' },
    { value: 'tappe',   label: 'Tappe' }
  ];

  window.NAVIDA_PAGE_VARIANTS = window.NAVIDA_PAGE_VARIANTS || {};
  window.NAVIDA_PAGE_VARIANTS.percorso = {
    etichetta: 'Versione della linea di carriera',
    predefinita: 'base',
    options: OPZIONI
  };
  window.NAVIDA_PAGE_VARIANTS.preview = {
    etichetta: 'Versione di “La tua linea di carriera”',
    predefinita: 'base',
    options: OPZIONI.slice()
  };

  /* Per le prove: &provaStep=3 finge di essere allo step 3, cosi' si
     vedono insieme tappe fatte, attuale e da fare. Cambia i dati solo in
     memoria e solo se il parametro c'e': senza, non tocca niente. */
  try {
    var provaStep = parseInt(new URLSearchParams(window.location.search).get('provaStep'), 10);
    var P = NV.dati.percorso;
    if (!isNaN(provaStep) && P && P.steps && P.steps.length > 1) {
      var indiceProva = Math.max(0, Math.min(P.steps.length - 2, provaStep - 1));
      P.steps.forEach(function (s, i) {
        if (i === P.steps.length - 1) return;
        s.stato = i < indiceProva ? 'fatto' : i === indiceProva ? 'attuale' : 'da-fare';
      });
      P.attuale = indiceProva;
    }
  } catch (e) {}

  /* ==================================================================
     PICCOLI AIUTI
     ================================================================== */

  function movimentoRidotto() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* Il renderer lavora prima che la schermata sia nel documento: le misure
     (sentiero, scorrimento) si prendono appena l'elemento c'e' davvero. */
  function quandoPronto(el, fn) {
    var giri = 0;
    (function prova() {
      if (el.isConnected && el.getBoundingClientRect().width) { fn(); return; }
      if (++giri > 120) return;
      requestAnimationFrame(prova);
    })();
  }

  function f(n) { return (Math.round(n * 10) / 10).toString(); }

  /* 1240 -> "1.240". A mano: in italiano il browser non separa le
     migliaia sotto i 10.000. */
  function migliaia(n) {
    if (n == null || isNaN(Number(n))) return '';
    return String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /* "circa 7 anni" diventa il valore "7 anni" con l'etichetta "Durata stimata" */
  function durataTotale() {
    var testo = String(NV.dati.percorso.durataTotale || '');
    var circa = /^circa\s+/i.test(testo);
    return { valore: testo.replace(/^circa\s+/i, ''), etichetta: circa ? 'Durata stimata' : 'Durata totale' };
  }

  /* ==================================================================
     DATI DI UNA TAPPA
     Quello che si legge senza aprirla: step, tipo, durata, compiti o
     stipendio. Mai percentuali.
     ================================================================== */

  function eUltima(i) { return i === NV.steps().length - 1; }
  function stato(s) { return NV.STATI_STEP[s.stato] || NV.STATI_STEP['da-fare']; }
  function occhiello(s, i) { return 'Step ' + (i + 1) + ' · ' + s.tipo; }

  function durata(s) {
    return (!s.durata || s.durata === 'Traguardo') ? '' : s.durata;
  }

  function compiti(s) {
    var c = NV.conteggio(s);
    if (!c.totali) return '';
    if (s.stato === 'fatto') return 'Tutti i compiti fatti';
    if (s.stato === 'attuale') return c.fatti + ' di ' + c.totali + ' compiti fatti';
    return c.totali + (c.totali === 1 ? ' compito' : ' compiti');
  }

  /* Lo stipendio va accanto all'icona dell'euro: il simbolo nel testo
     sarebbe doppio. */
  function stipendio(s) {
    return s.stipendio ? String(s.stipendio).replace(/€\s*/, '') : '';
  }

  /* Due dati al massimo sotto il titolo: la durata e poi lo stipendio,
     se c'e', altrimenti i compiti. Sulla tappa attuale i compiti fatti
     contano di piu'. Il traguardo mostra solo lo stipendio. */
  function datiBrevi(s, i, classe) {
    var parti = [];
    if (eUltima(i)) {
      if (s.stipendio) parti.push(NV.meta('euro', stipendio(s)));
    } else {
      if (durata(s)) parti.push(NV.meta('clock', durata(s)));
      if (s.stato === 'attuale' && compiti(s)) parti.push(NV.meta('list-checks', compiti(s)));
      else if (s.stipendio) parti.push(NV.meta('euro', stipendio(s)));
      else if (compiti(s)) parti.push(NV.meta('list-checks', compiti(s)));
    }
    return h('span', { class: 'nv-path-dati' + (classe ? ' ' + classe : '') }, parti);
  }

  function descrizioneAccessibile(s, i) {
    return 'Step ' + (i + 1) + ' di ' + NV.steps().length + ': ' + s.titolo + '. ' + stato(s).etichetta +
      (durata(s) ? '. Durata ' + durata(s) : '') + '.';
  }

  /* ==================================================================
     APRIRE UNA TAPPA
     Nell'app si va al dettaglio dello step. Nell'anteprima quella pagina
     non esiste: si apre un pannello con i dati della tappa.
     ================================================================== */

  function apri(i, anteprima) {
    if (anteprima) foglioTappa(i);
    else NV.apriStep(i);
  }

  function foglioTappa(i) {
    var lista = NV.steps();
    var s = lista[i];
    if (!s) return;
    var st = stato(s);
    var tipo = s.stato === 'attuale' ? 'main' : s.stato === 'fatto' ? 'ok' : s.stato === 'traguardo' ? 'sponsor' : 'neutra';
    var c = NV.conteggio(s);
    var tot = durataTotale();

    function dato(etichetta, valore) {
      return h('div', { class: 'nv-dato' }, [h('small', { text: etichetta }), h('strong', { text: valore })]);
    }

    NV.apriFoglio({
      titolo: s.titolo,
      sottotitolo: 'Step ' + (i + 1) + ' di ' + lista.length + ' · ' + s.tipo,
      classe: 'nv-path-foglio',
      contenuto: [
        h('div', { class: 'nv-path-foglio__stato' }, [NV.etichetta(st.etichetta, tipo, st.icona)]),
        s.obiettivo ? h('p', { class: 'nv-body nv-path-foglio__obiettivo', text: s.obiettivo }) : null,
        h('div', { class: 'nv-path-foglio__dati' }, [
          eUltima(i) ? dato('Ci arrivi in', tot.valore) : dato('Durata', durata(s) || '—'),
          dato('Compiti', c.totali ? String(c.totali) : '—'),
          s.stipendio ? h('div', { class: 'nv-dato nv-path-foglio__largo' }, [h('small', { text: 'Stipendio' }), h('strong', { text: s.stipendio })]) : null
        ]),
        (s.competenze && s.competenze.length) ? h('div', { class: 'nv-path-foglio__blocco' }, [
          h('span', { class: 'nv-eyebrow', text: 'Cosa impari' }),
          h('div', { class: 'nv-path-foglio__competenze' }, s.competenze.map(function (x) {
            return h('span', { class: 'nv-tag nv-tag--neutra', text: x });
          }))
        ]) : null
      ],
      azioni: [NV.pulsante('Ho capito', { variante: 'secondario', onclick: NV.chiudiFoglio })]
    });
  }

  /* ==================================================================
     PEZZI COMUNI
     ================================================================== */

  /* Barra in alto. Nell'anteprima la freccia torna nel questionario:
     NV.indietro porterebbe a schermate dell'app che li' non ci sono. */
  function barra(anteprima, opts) {
    opts = opts || {};
    if (!anteprima) return NV.barra({ indietro: 'dashboard', titolo: opts.titolo, classe: opts.classe });
    return h('header', { class: 'nv-bar' + (opts.classe ? ' ' + opts.classe : '') }, [
      NV.iconBtn('chevron-left', 'Indietro', function () {
        if (window.NavidaApp) window.NavidaApp.back();
      }, 'nv-back'),
      opts.titolo
        ? h('span', { class: 'nv-bar__titolo', text: opts.titolo })
        : h('span', { class: 'nv-bar__spazio' }),
      h('div', { class: 'nv-bar__azioni' })
    ]);
  }

  function testa(screen, sottotitolo) {
    return NV.intestazione(screen, {
      titolo: screen.title || 'La tua linea di carriera',
      sottotitolo: sottotitolo
    });
  }

  /* I tre numeri del viaggio: quanto dura, quanti step, quante persone
     come te l'hanno gia' fatto. */
  function riepilogo(classe) {
    var tot = durataTotale();
    function voce(valore, etichetta) {
      return h('div', { class: 'nv-path-riepilogo__voce' }, [
        h('strong', { text: valore }),
        h('span', { text: etichetta })
      ]);
    }
    return h('div', { class: 'nv-path-riepilogo' + (classe ? ' ' + classe : '') }, [
      voce(tot.valore, tot.etichetta),
      voce(String(NV.steps().length), 'Step'),
      voce(migliaia(NV.dati.percorso.personeSimili), 'Persone come te')
    ]);
  }

  /* Il pulsante fisso in fondo all'anteprima: si va alla dashboard. */
  function piede(screen, notte) {
    var btn = NV.pulsante(screen.cta || 'Vai alla dashboard', {
      variante: notte ? 'bianco' : null,
      iconaDopo: 'arrow-right',
      onclick: function () { window.location.href = screen.href || 'fase3.html'; }
    });
    /* il testo resta modificabile dalla barra, come nel questionario */
    var etichetta = btn.querySelector('span:not(.ico)');
    if (etichetta) btn.replaceChild(NV.testo(screen, 'cta', screen.cta || 'Vai alla dashboard', 'span'), etichetta);
    return h('div', { class: 'nv-path-piede' + (notte ? ' nv-path-piede--notte' : '') }, [btn]);
  }

  /* Il contenuto del nodo tondo: numero, spunta o coppa. */
  function faccia(s, i) {
    if (eUltima(i)) return h('span', { class: 'nv-path-nodo__medaglia' }, [icon('trophy', ICO.LG)]);
    if (s.stato === 'fatto') return icon('check', ICO.LG);
    return h('span', { class: 'nv-path-nodo__numero', text: String(i + 1) });
  }

  /* ==================================================================
     VERSIONE 1 · SENTIERO
     ------------------------------------------------------------------
     Le tappe stanno nel flusso normale della pagina (niente altezze
     fisse): la tappa attuale e il traguardo al centro, le altre a destra
     e a sinistra. Il sentiero e' un SVG disegnato dai centri veri dei
     nodi, misurati a schermata pronta: pieno fino a dove sei, a puntini
     dopo.
     ================================================================== */
  function vistaSentiero(screen, anteprima) {
    var lista = NV.steps();
    var p = NV.dati.percorso;
    var ultima = lista.length - 1;
    var attuale = NV.stepAttuale();

    var mappa = h('section', { class: 'nv-path-sentiero', 'aria-label': 'Le tappe del tuo percorso' });

    var svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'nv-path-sentiero__traccia');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<path class="nv-path-traccia__futuro" d="M0 0"/>' +
      '<path class="nv-path-traccia__fatto" pathLength="1" d="M0 0"/>';
    mappa.appendChild(svg);

    var partenza = h('div', { class: 'nv-path-partenza' }, [
      icon('flag', ICO.SM),
      h('span', { text: 'Parti da' }),
      h('strong', { text: p.partenza })
    ]);
    mappa.appendChild(h('div', { class: 'nv-path-riga nv-path-riga--partenza' }, [partenza]));

    /* dove sta ogni tappa: centro per quella attuale e per il traguardo,
       le altre alternate */
    var lato = 0;
    var posizioni = lista.map(function (s, i) {
      if (s.stato === 'attuale' || i === ultima) return 'centro';
      return (lato++ % 2 === 0) ? 'destra' : 'sinistra';
    });

    var nodi = [];
    lista.forEach(function (s, i) {
      var pos = posizioni[i];
      var qui = s.stato === 'attuale';

      var nodo = h('span', {
        class: 'nv-path-nodo nv-path-nodo--' + s.stato + (i === ultima ? ' nv-path-nodo--fine' : '')
      }, [faccia(s, i)]);
      if (s.stato === 'da-fare') {
        nodo.appendChild(h('span', { class: 'nv-path-nodo__lucchetto' }, [icon('lock', ICO.SM)]));
      }
      if (qui) {
        /* la mascotte guarda verso il lato libero: il sentiero esce
           dall'altra parte, verso la tappa dopo */
        var dopo = posizioni[i + 1];
        var latoMascotte = dopo === 'sinistra' ? 'destra' : 'sinistra';
        nodo.appendChild(h('span', { class: 'nv-path-fumetto', text: stato(s).etichetta }));
        nodo.appendChild(NV.mascotte('indicare', 'nv-path-sentiero__mascotte nv-path-sentiero__mascotte--' + latoMascotte));
      }
      nodi.push(nodo);

      var testi = h('span', { class: 'nv-path-etichetta' }, [
        h('span', { class: 'nv-path-etichetta__occhiello', text: occhiello(s, i) }),
        h('strong', { class: 'nv-path-etichetta__titolo', text: s.titolo }),
        datiBrevi(s, i),
        qui ? h('span', { class: 'nv-path-apri' }, [
          h('span', { text: anteprima ? 'Vedi i dettagli' : 'Apri lo step' }),
          icon('chevron-right', ICO.SM)
        ]) : null
      ]);

      var tappa = h('button', {
        class: 'nv-path-tappa nv-path-tappa--' + pos + ' is-' + s.stato,
        type: 'button',
        'aria-label': descrizioneAccessibile(s, i),
        'aria-current': qui ? 'step' : null,
        onclick: function () { apri(i, anteprima); }
      }, [nodo, testi]);

      mappa.appendChild(h('div', {
        class: 'nv-path-riga nv-path-riga--' + pos + (qui ? ' nv-path-riga--attuale' : '')
      }, [tappa]));
    });

    /* --- il sentiero --------------------------------------------------- */
    function tratto(a, b) {
      var s = 'M ' + f(a.x) + ' ' + f(a.y);
      var dx = b.x - a.x;
      /* dal centro verso un lato: esce di fianco al nodo e scende dritto,
         cosi' non passa sopra l'etichetta che sta sotto */
      if (a.pos === 'centro' && b.pos !== 'centro' && Math.abs(dx) > 1) {
        var raggio = Math.min(Math.abs(dx), (b.y - a.y) / 2);
        var verso = dx > 0 ? 1 : -1;
        return s +
          ' L ' + f(b.x - verso * raggio) + ' ' + f(a.y) +
          ' Q ' + f(b.x) + ' ' + f(a.y) + ' ' + f(b.x) + ' ' + f(a.y + raggio) +
          ' L ' + f(b.x) + ' ' + f(b.y) + ' ';
      }
      var k = (b.y - a.y) / 2;
      return s + ' C ' + f(a.x) + ' ' + f(a.y + k) + ', ' + f(b.x) + ' ' + f(b.y - k) + ', ' + f(b.x) + ' ' + f(b.y) + ' ';
    }

    function disegna() {
      var box = mappa.getBoundingClientRect();
      if (!box.width) return;
      var pr = partenza.getBoundingClientRect();
      var punti = [{ x: pr.left - box.left + pr.width / 2, y: pr.top - box.top + pr.height / 2, pos: 'partenza' }];
      nodi.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        punti.push({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, pos: posizioni[i] });
      });
      var fatto = '', futuro = '';
      for (var k = 1; k < punti.length; k++) {
        /* il tratto che arriva alla tappa k-1 e' "fatto" se la tappa e'
           gia' raggiunta (quella attuale compresa) */
        if (k - 1 <= attuale) fatto += tratto(punti[k - 1], punti[k]);
        else futuro += tratto(punti[k - 1], punti[k]);
      }
      svg.setAttribute('viewBox', '0 0 ' + f(box.width) + ' ' + f(box.height));
      svg.querySelector('.nv-path-traccia__fatto').setAttribute('d', fatto || 'M0 0');
      svg.querySelector('.nv-path-traccia__futuro').setAttribute('d', futuro || 'M0 0');
    }

    quandoPronto(mappa, function () {
      disegna();
      /* un fotogramma dopo parte il tratto pieno che si disegna */
      requestAnimationFrame(function () { mappa.classList.add('is-pronto'); });
      if (window.ResizeObserver) new ResizeObserver(disegna).observe(mappa);
    });

    var pagina = NV.pagina('nv-path nv-path--base' + (anteprima ? ' nv-path--anteprima' : ''), [
      barra(anteprima),
      testa(screen, 'Ogni step ti avvicina a ' + p.obiettivo + '.'),
      riepilogo(),
      mappa
    ]);
    return [pagina, anteprima ? piede(screen) : null];
  }

  /* ==================================================================
     VERSIONE 2 · PIANETI
     ------------------------------------------------------------------
     Cielo notturno a tutta pagina. Si legge dal basso: la Terra e' la
     partenza, il razzo sta sul pianeta dove sei, il traguardo e' Saturno
     in cima. All'apertura la pagina scorre fino alla tappa attuale.
     I pianeti di passaggio sono lo stesso disegno con tinte diverse.
     ================================================================== */
  var TINTE = [-38, 62, -88, 22, -60];

  function vistaPianeti(screen, anteprima) {
    var lista = NV.steps();
    var p = NV.dati.percorso;
    var ultima = lista.length - 1;
    var attuale = NV.stepAttuale();
    var tot = durataTotale();

    var cielo = h('section', { class: 'nv-path-cielo', 'aria-label': 'Le tappe del tuo percorso, dalla partenza al traguardo' });
    var svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'nv-path-cielo__traccia');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<path class="nv-path-scia__futuro" d="M0 0"/>' +
      '<path class="nv-path-scia__fatta" pathLength="1" d="M0 0"/>';
    cielo.appendChild(svg);

    var corpi = [];   /* indice della tappa -> corpo del pianeta */

    function astro(s, i) {
      var qui = s.stato === 'attuale';
      var fine = i === ultima;
      var pos = fine ? 'fine' : (i % 2 === 0 ? 'sinistra' : 'destra');

      var corpo = h('span', {
        class: 'nv-path-astro__corpo',
        style: fine ? null : '--nv-path-tinta:' + TINTE[i % TINTE.length] + 'deg'
      }, [
        h('img', {
          class: 'nv-path-astro__img',
          src: IMMAGINI + (fine ? 'pianeta-anelli.webp' : 'pianeta-viola.webp'),
          alt: '',
          decoding: 'async'
        })
      ]);
      if (qui) corpo.appendChild(h('img', { class: 'nv-path-razzo', src: IMMAGINI + 'razzo-navida.webp', alt: '', decoding: 'async' }));
      if (s.stato === 'da-fare') corpo.appendChild(h('span', { class: 'nv-path-astro__bollino' }, [icon('lock', ICO.SM)]));
      if (s.stato === 'fatto') corpo.appendChild(h('span', { class: 'nv-path-astro__bollino nv-path-astro__bollino--ok' }, [icon('check', ICO.SM)]));
      corpi[i] = corpo;

      var testi = h('span', { class: 'nv-path-astro__testi' }, [
        qui ? h('span', { class: 'nv-path-qui' }, [icon('navigation', ICO.SM), h('span', { text: stato(s).etichetta })]) : null,
        h('span', { class: 'nv-path-etichetta__occhiello', text: occhiello(s, i) }),
        h('strong', { class: 'nv-path-etichetta__titolo', text: s.titolo }),
        datiBrevi(s, i)
      ]);

      return h('button', {
        class: 'nv-path-astro nv-path-astro--' + pos + ' is-' + s.stato,
        type: 'button',
        'aria-label': descrizioneAccessibile(s, i),
        'aria-current': qui ? 'step' : null,
        onclick: function () { apri(i, anteprima); }
      }, [corpo, testi]);
    }

    /* dall'alto: traguardo, poi gli step a scendere */
    for (var i = ultima; i >= 0; i--) cielo.appendChild(astro(lista[i], i));

    var partenza = h('span', { class: 'nv-path-terra__partenza' }, [
      icon('flag', ICO.SM),
      h('span', { text: 'Parti da' }),
      h('strong', { text: p.partenza })
    ]);
    cielo.appendChild(h('div', { class: 'nv-path-terra' }, [
      h('img', { class: 'nv-path-terra__img', src: IMMAGINI + 'terra-partenza.webp', alt: '', decoding: 'async' }),
      h('div', { class: 'nv-path-terra__testi' }, [
        partenza,
        h('span', { class: 'nv-path-terra__dati' }, [
          NV.meta('clock', tot.valore + ' di viaggio'),
          NV.meta('users', migliaia(p.personeSimili) + ' persone come te')
        ])
      ])
    ]));

    /* --- la scia del razzo -------------------------------------------- */
    function disegna() {
      var box = cielo.getBoundingClientRect();
      if (!box.width) return;
      function centro(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      }
      var punti = [centro(partenza)].concat(corpi.map(centro));
      var fatta = '', futuro = '';
      for (var k = 1; k < punti.length; k++) {
        var a = punti[k - 1], b = punti[k], c = (b.y - a.y) / 2;
        var d = 'M ' + f(a.x) + ' ' + f(a.y) + ' C ' + f(a.x) + ' ' + f(a.y + c) + ', ' + f(b.x) + ' ' + f(b.y - c) + ', ' + f(b.x) + ' ' + f(b.y) + ' ';
        if (k - 1 <= attuale) fatta += d; else futuro += d;
      }
      svg.setAttribute('viewBox', '0 0 ' + f(box.width) + ' ' + f(box.height));
      svg.querySelector('.nv-path-scia__fatta').setAttribute('d', fatta || 'M0 0');
      svg.querySelector('.nv-path-scia__futuro').setAttribute('d', futuro || 'M0 0');
    }

    var pagina = NV.pagina('nv-page--piena nv-path nv-path--pianeti' + (anteprima ? ' nv-path--anteprima' : ''), [cielo]);

    quandoPronto(cielo, function () {
      disegna();
      requestAnimationFrame(function () { cielo.classList.add('is-pronto'); });
      if (window.ResizeObserver) new ResizeObserver(disegna).observe(cielo);
      /* la tappa attuale in vista subito: sta un po' sopra la meta'
         dello schermo, cosi' sotto si vede la Terra da cui parti */
      var corpo = corpi[attuale];
      if (corpo) {
        var pr = pagina.getBoundingClientRect();
        var r = corpo.getBoundingClientRect();
        pagina.scrollTop += (r.top + r.height / 2) - (pr.top + pr.height * 0.42);
      }
    });

    return [
      barra(anteprima, { titolo: screen.title || 'La tua linea di carriera', classe: 'nv-path-barra-notte' }),
      pagina,
      anteprima ? piede(screen, true) : null
    ];
  }

  /* ==================================================================
     VERSIONE 3 · TAPPE
     ------------------------------------------------------------------
     In alto la mappa piccola: cinque tappe su una linea, piena fino a
     dove sei. Sotto, una carta grande per tappa che scorre di lato. La
     mappa segue la carta in vista e toccandola si salta alla carta.
     ================================================================== */
  function vistaTappe(screen, anteprima) {
    var lista = NV.steps();
    var p = NV.dati.percorso;
    var ultima = lista.length - 1;
    var attuale = NV.stepAttuale();
    var tot = durataTotale();
    var carte = [];
    var voci = [];

    /* --- mini mappa --------------------------------------------------- */
    var mini = h('div', {
      class: 'nv-path-mini',
      role: 'group',
      'aria-label': 'Mappa del percorso',
      style: '--nv-path-n:' + lista.length
    });
    var quota = lista.length > 1 ? Math.min(1, attuale / (lista.length - 1)) : 0;
    mini.appendChild(h('span', { class: 'nv-path-mini__linea', 'aria-hidden': 'true' }, [
      h('span', { class: 'nv-path-mini__fatta', style: 'width:' + f(quota * 100) + '%' })
    ]));
    lista.forEach(function (s, i) {
      var fine = i === ultima;
      var voce = h('button', {
        class: 'nv-path-mini__tappa is-' + s.stato + (fine ? ' is-fine' : ''),
        type: 'button',
        'aria-label': descrizioneAccessibile(s, i),
        'aria-current': s.stato === 'attuale' ? 'step' : null,
        onclick: function () { vaiACarta(i, true); }
      }, [
        s.stato === 'attuale' ? h('span', { class: 'nv-path-mini__qui', text: stato(s).etichetta }) : null,
        h('span', { class: 'nv-path-mini__posto' }, [
          h('span', { class: 'nv-path-mini__nodo' }, [
            fine ? icon('trophy', ICO.SM)
              : s.stato === 'fatto' ? icon('check', ICO.SM)
              : h('span', { text: String(i + 1) })
          ])
        ]),
        h('span', { class: 'nv-path-mini__nome', text: s.breve || ('Step ' + (i + 1)) })
      ]);
      voci.push(voce);
      mini.appendChild(voce);
    });

    /* --- carte -------------------------------------------------------- */
    var carosello = h('div', { class: 'nv-path-carosello', role: 'list', 'aria-label': 'Le tappe una per una' });

    function dato(etichetta, valore, classe) {
      return h('div', { class: 'nv-dato' + (classe ? ' ' + classe : '') }, [h('small', { text: etichetta }), h('strong', { text: valore })]);
    }

    lista.forEach(function (s, i) {
      var qui = s.stato === 'attuale';
      var fine = i === ultima;
      var st = stato(s);
      var tipoTag = qui ? 'chiara' : s.stato === 'fatto' ? 'ok' : fine ? 'sponsor' : 'neutra';
      var c = NV.conteggio(s);

      var dati = [
        fine ? dato('Ci arrivi in', tot.valore) : dato('Durata', durata(s) || '—'),
        dato(qui ? 'Compiti fatti' : 'Compiti', qui ? (c.fatti + ' di ' + c.totali) : String(c.totali || '—'))
      ];
      if (s.stipendio) dati.push(dato(fine || s.tipo === 'Lavoro' ? 'Stipendio' : 'Compenso', s.stipendio, 'nv-path-carta__largo'));

      var carta = h('button', {
        class: 'nv-path-carta is-' + s.stato + (fine ? ' is-fine' : ''),
        type: 'button',
        role: 'listitem',
        'aria-label': descrizioneAccessibile(s, i),
        'aria-current': qui ? 'step' : null,
        onclick: function () { apri(i, anteprima); }
      }, [
        h('span', { class: 'nv-path-carta__testa' }, [
          h('span', { class: 'nv-path-carta__numero', text: (i + 1 < 10 ? '0' : '') + (i + 1) }),
          NV.etichetta(st.etichetta, tipoTag, fine ? 'trophy' : st.icona)
        ]),
        h('span', { class: 'nv-path-carta__copy' }, [
          h('span', { class: 'nv-path-etichetta__occhiello', text: s.tipo }),
          h('strong', { class: 'nv-path-carta__titolo', text: s.titolo }),
          s.obiettivo ? h('span', { class: 'nv-path-carta__obiettivo', text: s.obiettivo }) : null
        ]),
        h('span', { class: 'nv-path-carta__dati' }, dati),
        h('span', { class: 'nv-path-apri' }, [
          h('span', { text: anteprima ? 'Vedi i dettagli' : 'Apri lo step' }),
          icon('chevron-right', ICO.SM)
        ]),
        qui ? NV.mascotte('salutare', 'nv-path-carta__mascotte') : null
      ]);
      carte.push(carta);
      carosello.appendChild(carta);
    });

    function vaiACarta(i, liscio) {
      var carta = carte[i];
      if (!carta) return;
      var margine = parseFloat(window.getComputedStyle(carosello).paddingLeft) || 0;
      var sinistra = carta.offsetLeft - margine;
      if (carosello.scrollTo) carosello.scrollTo({ left: sinistra, behavior: liscio && !movimentoRidotto() ? 'smooth' : 'auto' });
      else carosello.scrollLeft = sinistra;
    }

    /* la mappa segue la carta che hai davanti */
    var inAttesa = false;
    function segui() {
      inAttesa = false;
      var bordo = carosello.getBoundingClientRect().left + (parseFloat(window.getComputedStyle(carosello).paddingLeft) || 0);
      var vicina = 0, distanza = Infinity;
      carte.forEach(function (carta, i) {
        var d = Math.abs(carta.getBoundingClientRect().left - bordo);
        if (d < distanza) { distanza = d; vicina = i; }
      });
      voci.forEach(function (v, i) { v.classList.toggle('is-vista', i === vicina); });
    }
    carosello.addEventListener('scroll', function () {
      if (inAttesa) return;
      inAttesa = true;
      requestAnimationFrame(segui);
    }, { passive: true });

    quandoPronto(carosello, function () {
      vaiACarta(attuale, false);
      segui();
    });

    var pagina = NV.pagina('nv-path nv-path--tappe' + (anteprima ? ' nv-path--anteprima' : ''), [
      barra(anteprima),
      testa(screen, 'Da ' + p.partenza + ' a ' + p.obiettivo + ', una tappa alla volta.'),
      mini,
      carosello,
      riepilogo()
    ]);
    return [pagina, anteprima ? piede(screen) : null];
  }

  /* ==================================================================
     REGISTRAZIONE DELLE SCHERMATE
     ================================================================== */
  function disegnaVista(screen, anteprima) {
    var v = NV.variante(screen.id);
    if (v === 'pianeti') return vistaPianeti(screen, anteprima);
    if (v === 'tappe') return vistaTappe(screen, anteprima);
    return vistaSentiero(screen, anteprima);
  }

  /* Per le prove: ?screen=preview&foglio=1 apre subito il pannello della
     tappa 1 (vale solo nell'anteprima, dove le tappe aprono un pannello). */
  var foglioDiProva = (function () {
    try {
      var n = parseInt(new URLSearchParams(window.location.search).get('foglio'), 10);
      return isNaN(n) ? null : n - 1;
    } catch (e) { return null; }
  })();

  /* Nell'app */
  R.screens.nvPercorso = function (screen) {
    return disegnaVista(screen, false);
  };

  /* Alla fine del questionario: prende il posto del vecchio disegno di
     js/render.js. */
  R.screens.preview = function (screen) {
    var out = disegnaVista(screen, true);
    if (foglioDiProva != null) {
      var i = foglioDiProva;
      foglioDiProva = null;
      setTimeout(function () { foglioTappa(Math.max(0, Math.min(NV.steps().length - 1, i))); }, 0);
    }
    return out;
  };
})();
