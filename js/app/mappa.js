/* ==========================================================================
   NAVIDA — Mappa
   ==========================================================================
   Una mappa "alla Google Maps" di tutto quello che serve per lo step in cui
   sei: scuole, corsi, workshop, eventi, offerte di lavoro. Vedi cosa c'è
   vicino a te, cerchi per nome e filtri per categoria.

   COME E' FATTA (dal basso verso l'alto)
     - la pianta di Padova, disegnata qui in SVG: niente mappe da rete,
       il prototipo deve funzionare anche offline
     - i segnaposto e il pallino "Tu sei qui": stanno in uno strato a parte,
       cosi' quando avvicini la mappa si allontanano fra loro ma restano
       della stessa misura
     - i pulsanti + / − e "Centra su di me"
     - il pannello in basso con l'elenco dei risultati (si apre con la maniglia)
     - la scheda anteprima di un segnaposto toccato
     - in alto: la ricerca a pastiglia con l'avatar, lo step e le categorie

   DA DOVE ARRIVI (NV.contesto().mappa)
     - barra in basso        tutte le categorie dello step attuale
     - scheda attività       c'è compito o ambito: pastiglia di contesto con la ✕
     - scheda info           selezionata = id da evidenziare e aprire

   PARAMETRI DI PROVA (solo con ?screen=mappa)
     &sel=sid        segnaposto selezionato con la scheda anteprima
     &elenco=1       pannello dei risultati aperto
     &q=design       ricerca scritta, con i risultati a tendina
     &ambito=lavoro  come arrivare dal pulsante "Lavoro" della dashboard

   Stile: css/app/mappa.css (prefisso nv-map-).
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV;
  var h = NV.h, icon = NV.icon, ICO = NV.ICO, D = NV.dati;

  /* Icona della ricerca senza risultati (Lucide "search-x"). */
  NV.icone({
    'search-x': '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
  });

  /* La tela della pianta: le posizioni in % dei dati diventano pixel qui.
     Deve restare uguale a --nv-map-tela-w / -h in mappa.css. */
  var TELA = { w: 700, h: 1000 };
  var ZOOM = { min: 0.8, max: 2.4, passo: 1.4 };

  /* Come si chiamano le cose al singolare e al plurale, e se sono
     femminili ("altre 3 scuole") o maschili ("altri 3 corsi"). */
  var NOMI = {
    tutte:    { uno: 'opportunità', tanti: 'opportunità', f: true },
    scuole:   { uno: 'scuola', tanti: 'scuole', f: true },
    corsi:    { uno: 'corso', tanti: 'corsi', f: false },
    lavoro:   { uno: 'offerta di lavoro', tanti: 'offerte di lavoro', f: true },
    workshop: { uno: 'workshop', tanti: 'workshop', f: false },
    eventi:   { uno: 'evento', tanti: 'eventi', f: false },
    libri:    { uno: 'libro', tanti: 'libri', f: false }
  };
  function nome(chiave) { return NOMI[chiave] || NOMI.tutte; }
  function quanti(n, chiave) { return n + ' ' + (n === 1 ? nome(chiave).uno : nome(chiave).tanti); }

  /* Parametri di prova: si leggono una volta e valgono solo per il primo disegno. */
  var prova = (function () {
    try {
      var qs = new URLSearchParams(window.location.search);
      if (qs.get('screen') !== 'mappa') return null;
      return { sel: qs.get('sel'), elenco: qs.get('elenco') === '1', q: qs.get('q'), ambito: qs.get('ambito'), usata: false };
    } catch (e) { return null; }
  })();

  /* Quello che deve sopravvivere quando la schermata si ridisegna da sola
     (cambio categoria, tolgo il filtro): la vista della mappa resta ferma. */
  var stato = {
    V: null,           // { tx, ty, s } spostamento e ingrandimento
    interno: false,    // il prossimo disegno lo chiede la mappa stessa
    elenco: false,     // pannello dei risultati aperto
    tendina: false,    // risultati della ricerca aperti
    centraSel: false   // dopo il disegno porta in vista la selezionata
  };

  /* ==================================================================
     DATI
     ================================================================== */

  /** Minuscole e senza accenti, lettera per lettera (gli indici restano
      uguali, cosi' si puo' evidenziare il pezzo trovato nel nome). */
  function normalizza(s) {
    return String(s || '').split('').map(function (c) {
      return c.normalize ? c.normalize('NFD').charAt(0) : c;
    }).join('').toLowerCase();
  }

  /** Le opportunità del contesto, prima del filtro per categoria. */
  function insiemeBase(m) {
    if (m.compito) return NV.opportunitaPer({ compito: m.compito });
    if (m.ambito) return NV.opportunitaPer({ ambito: m.ambito, step: NV.contesto().step });
    return NV.opportunitaPer({ step: NV.stepAttuale() });
  }

  /** Testo della pastiglia di contesto, se si arriva da una scheda attività. */
  function filtroContesto(m) {
    if (m.compito) {
      var t = NV.cercaCompito(m.compito);
      if (t) return 'Step ' + (t.stepIndice + 1) + ' · ' + (t.compito.breve || t.compito.titolo);
    }
    if (m.ambito && D.ambiti[m.ambito]) {
      return 'Step ' + (NV.contesto().step + 1) + ' · ' + D.ambiti[m.ambito].titolo;
    }
    return null;
  }

  /** Dove sta: distanza se è sulla mappa, altrimenti "Online", "Libro", "38 km · Venezia". */
  function dove(o) {
    if (o.pos && o.distanza) return o.distanza;
    if (o.modalita === 'Online') return 'Online';
    if (o.categoria === 'libri') return 'Libro';
    if (o.distanza) return o.distanza + (o.citta ? ' · ' + o.citta : '');
    return o.modalita || '';
  }
  function iconaDove(o) {
    if (o.pos || o.distanza) return 'map-pin';
    return o.modalita === 'Online' ? 'globe' : 'book';
  }

  function corrisponde(o, nq) {
    return [o.nome, o.ente, o.citta, o.indirizzo, NV.categoria(o.categoria).etichetta].some(function (t) {
      return normalizza(t).indexOf(nq) > -1;
    });
  }

  function puntoTu() {
    var tu = (D.mappa && D.mappa.tu) || { x: 50, y: 50 };
    return { x: tu.x / 100 * TELA.w, y: tu.y / 100 * TELA.h };
  }

  /* ==================================================================
     LA PIANTA DI PADOVA
     ------------------------------------------------------------------
     Stilizzata, non in scala. Gli isolati sono un motivo a mattoni con
     le vie bianche; sopra ci sono i parchi, il Bacchiglione, il canale
     che gira intorno al centro, la ferrovia e le strade principali.
     I colori sono tutti classi (nv-map-s-*) che leggono le variabili
     di mappa.css: tenui, cosi' i segnaposto risaltano.
     ================================================================== */

  /* Strade principali e vie secondarie: si disegnano due volte,
     prima il bordo lavanda e poi il bianco sopra. */
  var STRADE = [
    'M-10 532C80 526 150 515 200 505C250 495 290 482 330 470',                                          // Corso Milano
    'M455 428C520 400 600 362 710 322',                                                                  // Via Venezia
    'M340 -10C336 60 330 120 326 175C322 240 322 300 326 360C330 420 336 480 342 540C348 600 354 650 358 700', // Corso del Popolo, Via Roma
    'M362 812C366 880 372 940 378 1010',                                                                 // Via Cavalletto
    'M478 110C466 200 446 300 432 400C424 470 432 540 452 620C466 680 470 740 468 800',                  // Via Tommaseo
    'M120 322C170 352 214 384 250 408C282 430 306 450 330 470',                                          // Via Savonarola
    'M-10 236C150 222 320 206 520 186C600 176 650 168 710 162',                                          // viale della stazione
    'M150 652C230 662 320 660 400 642C480 624 580 604 710 594',                                          // Via Gattamelata
    'M655 -10C628 200 672 420 652 600C634 780 574 900 488 1010'                                          // tangenziale est
  ];
  var VIE = [
    'M330 470C380 452 420 440 470 428',
    'M440 186C470 230 520 260 560 300C600 340 640 380 710 400',
    'M200 505C196 580 190 640 186 700C182 780 200 880 230 1010',
    'M358 700C300 690 250 690 190 700',
    'M438 760C470 820 520 860 710 880',
    'M112 380C60 400 30 420 -10 430',
    'M150 60C220 90 260 110 326 120',
    'M520 30C560 60 590 90 610 130'
  ];

  /* Il canale che chiude il centro storico: serve due volte (isolati fitti e acqua). */
  var ANELLO = 'M160 300C200 235 260 210 330 210C410 210 470 245 480 320C490 400 480 500 455 565C430 625 385 655 330 660C255 665 190 635 160 585C138 545 142 470 146 420C150 370 145 335 160 300Z';

  function tratti(lista, classe) {
    return '<g class="' + classe + '">' + lista.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>';
  }
  function scritta(x, y, testo, classe) {
    return '<text x="' + x + '" y="' + y + '" class="nv-map-s-testo ' + classe + '">' + testo + '</text>';
  }
  function scrittaLungo(id, d, testo, classe) {
    return '<path id="' + id + '" d="' + d + '" fill="none"/>' +
      '<text class="nv-map-s-testo ' + classe + '"><textPath href="#' + id + '" startOffset="50%">' + testo + '</textPath></text>';
  }

  function disegnoPadova() {
    return '' +
      '<svg class="nv-map-svg" viewBox="0 0 ' + TELA.w + ' ' + TELA.h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs>' +
        /* periferia: isolati larghi di misure diverse, cosi' non sembra carta a quadretti */
        '<pattern id="nv-map-p-periferia" width="128" height="88" patternUnits="userSpaceOnUse" patternTransform="rotate(-9)">' +
          '<rect width="128" height="88" class="nv-map-s-isolato"/>' +
          '<path d="M0 0H128M0 44H128M0 88H128M40 0V44M96 0V44M20 44V88M76 44V88" class="nv-map-s-vicolo"/>' +
        '</pattern>' +
        /* centro storico: isolati piccoli e fitti */
        '<pattern id="nv-map-p-centro" width="108" height="66" patternUnits="userSpaceOnUse" patternTransform="rotate(7)">' +
          '<rect width="108" height="66" class="nv-map-s-isolato nv-map-s-isolato--centro"/>' +
          '<path d="M0 0H108M0 26H108M0 44H108M0 66H108M30 0V26M78 0V26M14 26V44M56 26V44M92 26V44M42 44V66M86 44V66" class="nv-map-s-vicolo nv-map-s-vicolo--fine"/>' +
        '</pattern>' +
        /* Arcella, oltre la ferrovia: griglia piu' regolare */
        '<pattern id="nv-map-p-nord" width="80" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">' +
          '<rect width="80" height="56" class="nv-map-s-isolato"/>' +
          '<path d="M0 0H80M0 56H80M0 0V56M80 0V56M40 0V28M0 28H40" class="nv-map-s-vicolo"/>' +
        '</pattern>' +
      '</defs>' +

      '<rect width="' + TELA.w + '" height="' + TELA.h + '" class="nv-map-s-terra"/>' +
      '<rect width="' + TELA.w + '" height="' + TELA.h + '" fill="url(#nv-map-p-periferia)"/>' +
      /* campi aperti ai margini: rompono il motivo e fanno "fuori citta'" */
      '<path d="M655 -10C628 200 672 420 652 600C634 780 574 900 488 1010H710V-10Z" class="nv-map-s-terra"/>' +
      '<path d="M0 700C40 720 70 760 90 820C120 900 90 960 60 1010H0Z" class="nv-map-s-terra"/>' +
      '<path d="M0 0H700V112C420 150 200 172 0 188Z" fill="url(#nv-map-p-nord)"/>' +
      '<path d="' + ANELLO + '" fill="url(#nv-map-p-centro)"/>' +

      /* parchi */
      '<path d="M372 236C400 226 440 228 452 246C462 262 452 280 428 284C400 288 372 282 366 264C362 252 362 240 372 236Z" class="nv-map-s-parco"/>' +
      '<rect x="250" y="712" width="54" height="40" rx="10" class="nv-map-s-parco"/>' +
      '<path d="M520 640C580 620 640 650 650 710C660 770 600 800 545 785C500 770 480 690 520 640Z" class="nv-map-s-parco"/>' +
      '<ellipse cx="360" cy="755" rx="78" ry="56" class="nv-map-s-anello-strada"/>' +
      '<ellipse cx="360" cy="755" rx="66" ry="46" class="nv-map-s-parco"/>' +

      /* acqua */
      '<path d="M-20 250C60 260 110 300 112 380C114 470 90 560 100 640C115 750 210 830 330 860C460 890 580 850 720 880" class="nv-map-s-fiume"/>' +
      '<path d="' + ANELLO + '" class="nv-map-s-canale"/>' +
      '<path d="M478 300C560 270 630 252 710 238" class="nv-map-s-canale"/>' +
      '<path d="M186 632C175 690 168 740 172 790" class="nv-map-s-canale"/>' +
      '<ellipse cx="360" cy="755" rx="50" ry="33" class="nv-map-s-canale nv-map-s-canale--fine"/>' +

      /* ferrovia */
      '<path d="M-10 188C200 172 420 150 710 112" class="nv-map-s-ferrovia"/>' +
      '<path d="M-10 188C200 172 420 150 710 112" class="nv-map-s-ferrovia-traversine"/>' +

      /* strade */
      tratti(VIE, 'nv-map-s-via-bordo') +
      tratti(STRADE, 'nv-map-s-strada-bordo') +
      tratti(VIE, 'nv-map-s-via') +
      tratti(STRADE, 'nv-map-s-strada') +

      /* nomi di vie, acque e quartieri */
      scrittaLungo('nv-map-t-milano', 'M140 517C190 507 240 496 300 480', 'Corso Milano', 'nv-map-s-testo--via') +
      scrittaLungo('nv-map-t-venezia', 'M540 382C590 362 640 342 700 322', 'Via Venezia', 'nv-map-s-testo--via') +
      scrittaLungo('nv-map-t-tommaseo', 'M476 120C470 180 462 240 452 300', 'Via Tommaseo', 'nv-map-s-testo--via') +
      scrittaLungo('nv-map-t-roma', 'M343 548C348 590 352 630 356 690', 'Via Roma', 'nv-map-s-testo--via') +
      scrittaLungo('nv-map-t-tangenziale', 'M664 520C670 420 668 320 652 200', 'Tangenziale Est', 'nv-map-s-testo--via') +
      scrittaLungo('nv-map-t-bacchiglione', 'M440 874C510 874 570 862 650 866', 'Bacchiglione', 'nv-map-s-testo--acqua') +
      scrittaLungo('nv-map-t-piovego', 'M530 280C575 266 620 256 680 244', 'Piovego', 'nv-map-s-testo--acqua') +
      scritta(300, 80, 'ARCELLA', 'nv-map-s-testo--quartiere') +
      scritta(226, 290, 'CENTRO', 'nv-map-s-testo--quartiere') +
      scritta(592, 214, 'PORTELLO', 'nv-map-s-testo--quartiere') +
      scritta(578, 486, 'STANGA', 'nv-map-s-testo--quartiere') +
      scritta(236, 944, 'SANTA CROCE', 'nv-map-s-testo--quartiere') +
      scritta(600, 962, 'GUIZZA', 'nv-map-s-testo--quartiere') +
      scritta(60, 580, 'SAVONAROLA', 'nv-map-s-testo--quartiere') +
      scritta(296, 146, 'Stazione', 'nv-map-s-testo--via') +
      scritta(360, 834, 'Prato della Valle', 'nv-map-s-testo--parco') +
      scritta(410, 306, 'Giardini dell’Arena', 'nv-map-s-testo--parco') +
      scritta(277, 772, 'Orto botanico', 'nv-map-s-testo--parco') +
      scritta(572, 716, 'Parco Iris', 'nv-map-s-testo--parco') +
      '</svg>';
  }

  /* ==================================================================
     LA VISTA: SPOSTARE E AVVICINARE
     ------------------------------------------------------------------
     Un punto della tela (cx, cy) sta sullo schermo in
       x = tx + s * cx      y = ty + s * cy
     La pianta si muove con un transform CSS; i segnaposto si
     riposizionano uno per uno (sono pochi) e non cambiano misura.
     ================================================================== */

  function misura(M) {
    M.dim.w = M.vista.clientWidth || M.dim.w;
    M.dim.h = M.vista.clientHeight || M.dim.h;
    M.dim.alto = M.alto.offsetTop + M.alto.offsetHeight || M.dim.alto;
    M.dim.basso = M.testa.offsetHeight || M.dim.basso;
    M.radice.style.setProperty('--nv-map-alto-h', M.dim.alto + 'px');
  }

  /** La fascia di mappa che si vede davvero, fra la ricerca e il pannello. */
  function zona(M) {
    var basso = M.dim.basso;
    if (M.radice.classList.contains('is-anteprima') && M.anteprimaBox.offsetHeight) {
      basso = M.anteprimaBox.offsetHeight + parseFloat(getComputedStyle(M.anteprimaBox).bottom || 0);
    }
    return { top: M.dim.alto, bottom: M.dim.h - basso };
  }

  /** La pianta non esce mai dallo schermo lasciando un buco. */
  function limita(M) {
    var V = stato.V, W = TELA.w * V.s, H = TELA.h * V.s, d = M.dim;
    V.tx = W <= d.w ? (d.w - W) / 2 : Math.min(0, Math.max(d.w - W, V.tx));
    V.ty = H <= d.h ? (d.h - H) / 2 : Math.min(0, Math.max(d.h - H, V.ty));
  }

  function sposta(el, x, y) {
    el.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
  }

  function applica(M) {
    var V = stato.V;
    M.tela.style.transform = 'translate3d(' + V.tx + 'px,' + V.ty + 'px,0) scale(' + V.s + ')';
    M.segni.forEach(function (b) { sposta(b, V.tx + V.s * b._cx, V.ty + V.s * b._cy); });
    var tu = puntoTu();
    sposta(M.tu, V.tx + V.s * tu.x, V.ty + V.s * tu.y);
    /* da lontano l'etichetta "Tu sei qui" finirebbe sopra i segnaposto */
    M.radice.classList.toggle('is-lontano', V.s < 0.95);
  }

  /** Movimento morbido solo per i comandi (pulsanti, scelta di un posto),
      mai mentre trascini: li' la mappa deve stare sotto il dito. */
  function anima(M, si) {
    if (!si) return;
    M.vista.classList.add('is-animata');
    clearTimeout(M.timerAnima);
    M.timerAnima = setTimeout(function () { M.vista.classList.remove('is-animata'); }, 460);
  }

  function centra(M, cx, cy, animata) {
    var z = zona(M), V = stato.V;
    V.tx = M.dim.w / 2 - V.s * cx;
    V.ty = (z.top + z.bottom) / 2 - V.s * cy;
    limita(M);
    anima(M, animata);
    applica(M);
  }

  /** Avvicina o allontana tenendo fermo il punto (px, py) dello schermo. */
  function zoomVerso(M, fattore, px, py, animata) {
    var V = stato.V;
    M.toccata = true;
    var s = Math.max(ZOOM.min, Math.min(ZOOM.max, V.s * fattore));
    if (px == null) {
      var z = zona(M);
      px = M.dim.w / 2;
      py = (z.top + z.bottom) / 2;
    }
    var cx = (px - V.tx) / V.s, cy = (py - V.ty) / V.s;
    V.s = s;
    V.tx = px - s * cx;
    V.ty = py - s * cy;
    limita(M);
    anima(M, animata);
    applica(M);
    M.btnPosizione.classList.remove('is-attivo');
  }

  function centraSuDiMe(M) {
    stato.V.s = 1;
    var tu = puntoTu();
    centra(M, tu.x, tu.y, true);
    M.btnPosizione.classList.add('is-attivo');
  }

  /** Porta in vista un segnaposto, ma solo se adesso non si vede bene. */
  function mostraSegno(M, b) {
    var V = stato.V, z = zona(M);
    var x = V.tx + V.s * b._cx, y = V.ty + V.s * b._cy;
    var margine = 40;
    var visibile = x > margine && x < M.dim.w - margine && y > z.top + margine + 20 && y < z.bottom - margine;
    if (!visibile) centra(M, b._cx, b._cy, true);
  }

  /* Trascinamento con un dito o il mouse, due dita per avvicinare,
     rotellina su computer. Un tocco senza movimento resta un tocco:
     la cattura del puntatore parte solo quando la mappa si muove. */
  function collegaMappa(M) {
    var el = M.vista, punti = {}, gesto = null;

    /* su desktop il telefono e' rimpicciolito: i pixel del mouse non
       sono i pixel della schermata */
    function scalaCornice() {
      var r = el.getBoundingClientRect();
      return el.offsetWidth ? r.width / el.offsetWidth : 1;
    }
    function nuovoGesto() {
      var ids = Object.keys(punti), V = stato.V;
      var g = { k: scalaCornice(), r: el.getBoundingClientRect(), tx: V.tx, ty: V.ty, s: V.s };
      if (ids.length >= 2) {
        var a = punti[ids[0]], b = punti[ids[1]];
        g.dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        g.cx = (a.x + b.x) / 2; g.cy = (a.y + b.y) / 2;
      } else if (ids.length) {
        g.cx = punti[ids[0]].x; g.cy = punti[ids[0]].y;
      }
      return g;
    }

    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      M.toccata = true;
      punti[e.pointerId] = { x: e.clientX, y: e.clientY };
      gesto = nuovoGesto();
    });

    el.addEventListener('pointermove', function (e) {
      if (!punti[e.pointerId] || !gesto) return;
      punti[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(punti), V = stato.V, g = gesto;
      if (ids.length >= 2) {
        var a = punti[ids[0]], b = punti[ids[1]];
        var s = Math.max(ZOOM.min, Math.min(ZOOM.max, g.s * Math.hypot(a.x - b.x, a.y - b.y) / g.dist));
        var cx = ((g.cx - g.r.left) / g.k - g.tx) / g.s;
        var cy = ((g.cy - g.r.top) / g.k - g.ty) / g.s;
        V.s = s;
        V.tx = ((a.x + b.x) / 2 - g.r.left) / g.k - s * cx;
        V.ty = ((a.y + b.y) / 2 - g.r.top) / g.k - s * cy;
      } else {
        var dx = (e.clientX - g.cx) / g.k, dy = (e.clientY - g.cy) / g.k;
        if (!M.trascinando && Math.abs(dx) + Math.abs(dy) < 6) return;
        V.tx = g.tx + dx;
        V.ty = g.ty + dy;
      }
      if (!M.trascinando) {
        M.trascinando = true;
        el.classList.add('is-trascina');
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        chiudiTendina(M);
        M.btnPosizione.classList.remove('is-attivo');
      }
      limita(M);
      applica(M);
    });

    function fine(e) {
      if (!punti[e.pointerId]) return;
      delete punti[e.pointerId];
      if (M.trascinando) {
        M.trascinato = true;
        setTimeout(function () { M.trascinato = false; }, 80);
      }
      if (Object.keys(punti).length) { gesto = nuovoGesto(); return; }
      M.trascinando = false;
      el.classList.remove('is-trascina');
      gesto = null;
    }
    el.addEventListener('pointerup', fine);
    el.addEventListener('pointercancel', fine);

    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = el.getBoundingClientRect(), k = scalaCornice();
      zoomVerso(M, e.deltaY < 0 ? 1.15 : 1 / 1.15, (e.clientX - r.left) / k, (e.clientY - r.top) / k, false);
    }, { passive: false });

    /* tocco sulla mappa vuota: chiude quello che e' aperto, un passo alla volta */
    el.addEventListener('click', function (e) {
      if (M.trascinato || e.target.closest('.nv-map-segno')) return;
      if (stato.tendina) { chiudiTendina(M); M.input.blur(); return; }
      if (M.sel) { deseleziona(M); return; }
      if (stato.elenco) apriElenco(M, false);
    });
  }

  /* ==================================================================
     SELEZIONE E SCHEDA ANTEPRIMA
     ================================================================== */

  /** Ridisegna la schermata senza l'animazione di cambio pagina. */
  function ridisegna(params) {
    stato.interno = true;
    NV.aggiorna({ mappa: params });
  }

  function segnoDi(M, o) {
    for (var i = 0; i < M.segni.length; i++) if (M.segni[i]._o === o) return M.segni[i];
    return null;
  }

  function seleziona(M, id) {
    var o = NV.opportunita(id);
    if (!o) return;
    var b = o.pos ? segnoDi(M, o) : null;
    /* sta sulla mappa ma il filtro l'ha nascosta: si ridisegna con il suo segnaposto */
    if (o.pos && !b) {
      stato.centraSel = true;
      stato.elenco = false;
      ridisegna({ selezionata: id });
      return;
    }
    NV.contesto().mappa.selezionata = id;
    M.sel = o;
    M.segni.forEach(function (s) {
      s.classList.toggle('is-scelto', s === b);
      s.setAttribute('aria-pressed', s === b ? 'true' : 'false');
    });
    if (stato.elenco) apriElenco(M, false);
    mostraAnteprima(M, o);
    if (b) mostraSegno(M, b);
  }

  function deseleziona(M) {
    NV.contesto().mappa.selezionata = null;
    M.sel = null;
    M.segni.forEach(function (s) {
      s.classList.remove('is-scelto');
      s.setAttribute('aria-pressed', 'false');
    });
    M.radice.classList.remove('is-anteprima');
    M.anteprimaBox.innerHTML = '';
  }

  function mostraAnteprima(M, o) {
    var cat = NV.categoria(o.categoria);
    M.anteprimaBox.innerHTML = '';
    M.anteprimaBox.appendChild(h('article', { class: 'nv-map-anteprima', 'aria-label': o.nome }, [
      h('div', { class: 'nv-map-anteprima__testa' }, [
        NV.logo(o),
        h('div', { class: 'nv-map-anteprima__copy' }, [
          h('span', { class: 'nv-map-anteprima__cat nv-map-tono-' + cat.tono }, [
            icon(cat.icona, ICO.SM),
            h('span', { text: cat.singolare }),
            o.sponsorizzato ? NV.sponsor() : null
          ]),
          h('h2', { class: 'nv-map-anteprima__nome', text: o.nome }),
          h('p', { class: 'nv-map-anteprima__ente', text: o.ente })
        ]),
        NV.iconBtn('x', 'Chiudi l’anteprima', function () { deseleziona(M); }, 'nv-map-anteprima__chiudi')
      ]),
      h('div', { class: 'nv-map-anteprima__meta' }, [
        NV.meta(iconaDove(o), dove(o)),
        o.rating ? NV.stelle(o.rating, o.recensioni) : null,
        /* il prezzo ha gia' il simbolo €: niente icona, altrimenti si legge "€ €" */
        o.prezzo ? h('span', { class: 'nv-meta', text: o.prezzo }) : null
      ]),
      h('div', { class: 'nv-btns' }, [
        NV.pulsante('Dettagli', { piccolo: true, onclick: function () { NV.apriScheda(o.id); } }),
        o.pos
          ? NV.pulsante('Indicazioni', {
              variante: 'secondario', icona: 'navigation', piccolo: true,
              onclick: function () { NV.avviso('Apriamo le indicazioni per ' + o.indirizzo); }
            })
          : NV.pulsante('Salva', {
              variante: 'secondario', icona: 'bookmark', piccolo: true,
              onclick: function () { NV.avviso('Salvato tra i tuoi preferiti'); }
            })
      ])
    ]));
    M.radice.classList.add('is-anteprima');
  }

  /* ==================================================================
     PANNELLO DEI RISULTATI
     ================================================================== */

  function apriElenco(M, aperto) {
    stato.elenco = aperto;
    if (aperto) {
      if (M.sel) deseleziona(M);
      chiudiTendina(M);
      M.corpo.scrollTop = 0;
    }
    M.radice.classList.toggle('is-elenco', aperto);
    M.testa.setAttribute('aria-expanded', aperto ? 'true' : 'false');
  }

  /** Titolo e sottotitolo della maniglia: "9 opportunità vicino a te". */
  function testiPannello(M, vicine, lontane) {
    var cat = M.categoria, fuori = ' online o fuori ' + D.mappa.citta;
    /* se sono tutte della stessa categoria (es. dal pulsante Lavoro) si chiamano col loro nome */
    var tutte = vicine.concat(lontane);
    if (cat === 'tutte' && tutte.length && tutte.every(function (o) { return o.categoria === tutte[0].categoria; })) {
      cat = tutte[0].categoria;
    }
    var n = nome(cat);
    if (vicine.length) {
      var altre = lontane.length === 1
        ? (n.f ? 'Un’altra ' : 'Un altro ') + n.uno
        : (n.f ? 'Altre ' : 'Altri ') + lontane.length + ' ' + n.tanti;
      return {
        titolo: quanti(vicine.length, cat) + ' vicino a te',
        sotto: lontane.length ? altre + fuori : 'Tocca un segnaposto per i dettagli'
      };
    }
    if (lontane.length) return { titolo: 'Niente vicino a te', sotto: quanti(lontane.length, cat) + fuori };
    return {
      titolo: (n.f ? 'Nessuna ' : 'Nessun ') + n.uno,
      sotto: M.filtro ? 'Con il filtro ' + M.filtro : 'Per lo step ' + (NV.stepAttuale() + 1)
    };
  }

  function rigaElenco(o) {
    return h('button', { class: 'nv-map-riga nv-press', type: 'button', onclick: function () { NV.apriScheda(o.id); } }, [
      NV.logo(o, 'sm'),
      h('span', { class: 'nv-map-riga__copy' }, [
        h('span', { class: 'nv-map-riga__nome', text: o.nome }),
        h('span', { class: 'nv-map-riga__ente', text: o.ente }),
        h('span', { class: 'nv-map-riga__meta' }, [
          NV.meta(iconaDove(o), dove(o)),
          o.rating ? NV.stelle(o.rating, o.recensioni) : null,
          o.sponsorizzato ? NV.sponsor() : null
        ])
      ]),
      h('span', { class: 'nv-map-riga__chev' }, [icon('chevron-right', ICO.MD)])
    ]);
  }

  function corpoElenco(M, vicine, lontane) {
    if (!vicine.length && !lontane.length) {
      return [h('div', { class: 'nv-map-vuoto' }, [
        NV.mascotte('mappa', 'nv-map-vuoto__mascotte'),
        NV.testo(M.screen, 'vuotoTitolo', 'Qui intorno non c’è niente', 'h3', 'nv-map-vuoto__titolo'),
        NV.testo(M.screen, 'vuotoTesto', 'Per questa categoria non abbiamo ancora trovato posti adatti al tuo step.', 'p', 'nv-map-vuoto__testo'),
        NV.pulsante('Mostra tutte le categorie', {
          variante: 'soft', piccolo: true, classe: 'nv-btn--hug',
          onclick: function () { ridisegna({ categoria: 'tutte' }); }
        })
      ])];
    }
    var gruppi = [];
    if (vicine.length) gruppi.push(gruppo('Vicino a te', vicine));
    if (lontane.length) gruppi.push(gruppo('Online e fuori ' + D.mappa.citta, lontane));
    return gruppi;
  }

  function gruppo(titolo, lista) {
    return h('section', { class: 'nv-map-gruppo' }, [
      h('h3', { class: 'nv-map-gruppo__titolo', text: titolo })
    ].concat(lista.map(rigaElenco)));
  }

  /* ==================================================================
     RICERCA
     ------------------------------------------------------------------
     Mentre scrivi si ridisegna solo la tendina, non la schermata:
     il campo non perde il fuoco. Il testo resta in ctx.mappa.cerca e
     spegne i segnaposto che non c'entrano.
     ================================================================== */

  var TUTTI = { scuole: 'Tutte le', corsi: 'Tutti i', lavoro: 'Tutte le', workshop: 'Tutti i', eventi: 'Tutti gli', libri: 'Tutti i' };

  function chiudiTendina(M) {
    stato.tendina = false;
    M.tendina.hidden = true;
    M.radice.classList.remove('is-cerca');
  }

  function evidenzia(testo, nq) {
    var i = nq ? normalizza(testo).indexOf(nq) : -1;
    if (i < 0) return [testo];
    return [testo.slice(0, i), h('mark', { text: testo.slice(i, i + nq.length) }), testo.slice(i + nq.length)];
  }

  function rigaRisultato(M, o, nq) {
    var c = NV.categoria(o.categoria);
    return h('button', { class: 'nv-map-risultato', type: 'button', role: 'option', onclick: function () { scegliRisultato(M, o); } }, [
      NV.icoChip(c.icona, c.tono),
      /* la distanza apre la riga sotto, come in Google Maps: il nome ha tutta la larghezza */
      h('span', { class: 'nv-map-risultato__copy' }, [
        h('span', { class: 'nv-map-risultato__nome' }, evidenzia(o.nome, nq)),
        h('span', { class: 'nv-map-risultato__sub' }, [
          h('span', { class: 'nv-map-risultato__dove', text: dove(o) }),
          ' · '
        ].concat(evidenzia(o.ente, nq)))
      ])
    ]);
  }

  function rigaCategoria(M, k) {
    var c = D.categorie[k];
    var n = M.base.filter(function (o) { return o.categoria === k; }).length;
    return h('button', {
      class: 'nv-map-risultato nv-map-risultato--categoria', type: 'button', role: 'option',
      onclick: function () {
        M.input.value = '';
        chiudiTendina(M);
        ridisegna({ categoria: k, cerca: '', selezionata: null });
      }
    }, [
      NV.icoChip(c.icona, c.tono),
      h('span', { class: 'nv-map-risultato__copy' }, [
        h('span', { class: 'nv-map-risultato__nome', text: TUTTI[k] + ' ' + nome(k).tanti }),
        h('span', { class: 'nv-map-risultato__sub', text: n ? quanti(n, k) + ' per il tuo step' : 'Nessun risultato per il tuo step' })
      ]),
      h('span', { class: 'nv-map-risultato__chev' }, [icon('chevron-right', ICO.MD)])
    ]);
  }

  function aggiornaRicerca(M) {
    var q = M.input.value;
    NV.contesto().mappa.cerca = q;
    M.cancella.hidden = !q;
    var nq = normalizza(q.trim());
    M.segni.forEach(function (b) { b.classList.toggle('is-spento', !!nq && !corrisponde(b._o, nq)); });

    var box = M.tendina;
    box.innerHTML = '';
    M.risultati = [];
    var aperta = stato.tendina && !!nq;
    box.hidden = !aperta;
    M.radice.classList.toggle('is-cerca', aperta);
    if (!aperta) return;

    /* prima quelle del tuo step, poi tutte le altre */
    var trovate = NV.tutteLeOpportunita().filter(function (o) { return corrisponde(o, nq); });
    var dentro = M.base.filter(function (o) { return trovate.indexOf(o) > -1; });
    var fuori = NV.ordina(trovate.filter(function (o) { return dentro.indexOf(o) === -1; }));
    M.risultati = dentro.concat(fuori);

    /* "scuo" propone subito il filtro "Tutte le scuole" */
    var categorie = Object.keys(D.categorie).filter(function (k) {
      return normalizza(D.categorie[k].etichetta).indexOf(nq) === 0 || normalizza(D.categorie[k].singolare).indexOf(nq) === 0;
    });

    if (!M.risultati.length && !categorie.length) {
      box.appendChild(h('div', { class: 'nv-map-tendina__vuoto' }, [
        icon('search-x', ICO.LG),
        h('strong', { text: 'Nessun risultato per “' + q.trim() + '”' }),
        h('span', { text: 'Prova con il nome di una scuola, di un corso o di una città.' })
      ]));
      return;
    }
    categorie.forEach(function (k) { box.appendChild(rigaCategoria(M, k)); });
    if (M.risultati.length) {
      box.appendChild(h('p', { class: 'nv-map-tendina__conta', text: M.risultati.length === 1 ? '1 risultato' : M.risultati.length + ' risultati' }));
      M.risultati.forEach(function (o) { box.appendChild(rigaRisultato(M, o, nq)); });
    }
  }

  function scegliRisultato(M, o) {
    chiudiTendina(M);
    M.input.blur();
    seleziona(M, o.id);
  }

  function collegaRicerca(M) {
    M.input.addEventListener('input', function () {
      stato.tendina = true;
      aggiornaRicerca(M);
    });
    M.input.addEventListener('focus', function () {
      if (stato.elenco) apriElenco(M, false);
      if (M.input.value.trim()) { stato.tendina = true; aggiornaRicerca(M); }
    });
    M.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (M.risultati && M.risultati[0]) scegliRisultato(M, M.risultati[0]);
      } else if (e.key === 'Escape') {
        chiudiTendina(M);
        M.input.blur();
      }
    });
  }

  /* ==================================================================
     LA SCHERMATA
     ================================================================== */

  function pulsanteMappa(nomeIcona, etichetta, onclick, classe) {
    return h('button', {
      class: 'nv-map-btn' + (classe ? ' ' + classe : ''),
      type: 'button',
      'aria-label': etichetta,
      title: etichetta,
      onclick: onclick
    }, [icon(nomeIcona, ICO.MD)]);
  }

  function creaSegni(M, lista) {
    var visti = {};
    /* dall'alto in basso: quelli piu' in basso stanno sopra, come su una mappa vera */
    return lista.slice().sort(function (a, b) { return a.pos.y - b.pos.y; }).map(function (o) {
      var chiave = o.pos.x + ',' + o.pos.y;
      var doppio = visti[chiave] || 0;
      visti[chiave] = doppio + 1;
      var cat = NV.categoria(o.categoria);
      var piccola = icon(cat.icona, ICO.SM), media = icon(cat.icona, ICO.MD);
      piccola.classList.add('nv-map-segno__ico--sm');
      media.classList.add('nv-map-segno__ico--md');
      var b = h('button', {
        class: 'nv-map-segno nv-map-tono-' + cat.tono + (M.sel === o ? ' is-scelto' : ''),
        type: 'button',
        'aria-label': o.nome + ', ' + dove(o),
        'aria-pressed': M.sel === o ? 'true' : 'false',
        onclick: function (e) {
          e.stopPropagation();
          if (!M.trascinato) seleziona(M, o.id);
        }
      }, [
        h('span', { class: 'nv-map-segno__corpo' }, [piccola, media])
      ]);
      b._o = o;
      /* due posti allo stesso indirizzo: il secondo si scosta un poco */
      b._cx = o.pos.x / 100 * TELA.w + doppio * 30;
      b._cy = o.pos.y / 100 * TELA.h;
      return b;
    });
  }

  /** Inquadra la selezionata, o te se non c'e' niente di scelto. */
  function inquadra(M, animata) {
    var b = M.sel && M.sel.pos ? segnoDi(M, M.sel) : null;
    if (b) { centra(M, b._cx, b._cy, animata); return; }
    var tu = puntoTu();
    centra(M, tu.x, tu.y, animata);
  }

  /** Quando la schermata e' nel documento: si misura e si mette a posto. */
  function avvia(M) {
    if (!M.radice.isConnected) return;
    misura(M);
    if (M.primo) inquadra(M, false);
    else if (stato.centraSel && M.sel && M.sel.pos) mostraSegno(M, segnoDi(M, M.sel));
    else { limita(M); applica(M); }
    stato.centraSel = false;

    /* la categoria scelta sempre in vista nella fila di pastiglie,
       ma la fila si muove solo se la pastiglia e' davvero fuori */
    var attivo = M.fila.querySelector('.is-attivo');
    if (attivo) {
      var margine = parseFloat(getComputedStyle(M.fila).paddingLeft) || 0;
      var fine = attivo.offsetLeft - M.fila.firstChild.offsetLeft + attivo.offsetWidth;
      var spazio = M.fila.clientWidth - margine * 2;
      if (fine > spazio) M.fila.scrollLeft = fine - spazio + margine;
    }
    if (stato.tendina) M.input.focus({ preventScroll: true });

    /* quando arriva il carattere giusto i testi cambiano misura (la scheda
       anteprima soprattutto): si rimisura, se nel frattempo non hai toccato */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { rimisura(M); });
    }
    /* la finestra cambia misura (barra del browser del telefono che sparisce,
       finestra del computer allargata): la mappa resta inquadrata */
    if (window.ResizeObserver) {
      M.osservatore = new ResizeObserver(function () {
        if (!M.radice.isConnected) { M.osservatore.disconnect(); return; }
        rimisura(M);
      });
      M.osservatore.observe(M.vista);
    }
  }

  function rimisura(M) {
    if (!M.radice.isConnected) return;
    var w = M.dim.w, h0 = M.dim.h, a = M.dim.alto;
    misura(M);
    if (w === M.dim.w && h0 === M.dim.h && a === M.dim.alto) return;
    if (M.primo && !M.toccata) inquadra(M, false);
    else { limita(M); applica(M); }
  }

  window.NavidaRender.screens.nvMappa = function (screen) {
    var ctx = NV.contesto();
    var m = ctx.mappa;
    var interno = stato.interno;
    stato.interno = false;
    if (!interno) {
      stato.V = null;
      stato.elenco = false;
      stato.tendina = false;
    }
    if (prova && !prova.usata) {
      prova.usata = true;
      if (prova.ambito) { m.ambito = prova.ambito; m.compito = null; }
      if (prova.sel) m.selezionata = prova.sel;
      if (prova.q) { m.cerca = prova.q; stato.tendina = true; }
      if (prova.elenco) stato.elenco = true;
    }

    var categoria = m.categoria || 'tutte';
    var base = insiemeBase(m);
    var visibili = base.filter(function (o) { return categoria === 'tutte' || o.categoria === categoria; });
    var vicine = visibili.filter(function (o) { return o.pos; });
    var lontane = visibili.filter(function (o) { return !o.pos; });
    var sel = m.selezionata ? NV.opportunita(m.selezionata) : null;
    if (!sel) m.selezionata = null;
    if (sel) stato.elenco = false;

    var M = {
      screen: screen,
      categoria: categoria,
      base: base,
      sel: sel,
      primo: !stato.V,
      /* misure provvisorie (telefono 393 x 852): quelle vere arrivano in avvia() */
      dim: { w: 393, h: 772, alto: 214, basso: 100 }
    };

    /* --- la mappa ------------------------------------------------------ */
    M.tela = h('div', { class: 'nv-map-tela', html: disegnoPadova() });
    var conSegno = vicine.slice();
    if (sel && sel.pos && conSegno.indexOf(sel) === -1) conSegno.push(sel);
    M.segni = creaSegni(M, conSegno);
    M.tu = h('div', { class: 'nv-map-tu', role: 'img', 'aria-label': 'Tu sei qui' }, [
      h('span', { class: 'nv-map-tu__alone' }),
      h('span', { class: 'nv-map-tu__punto' }),
      h('span', { class: 'nv-map-tu__etichetta', text: 'Tu sei qui' })
    ]);
    M.vista = h('div', { class: 'nv-map-vista' }, [
      M.tela,
      h('div', { class: 'nv-map-segni' }, M.segni.concat([M.tu]))
    ]);

    /* --- in alto: ricerca con avatar, step, categorie ------------------- */
    M.input = h('input', {
      class: 'nv-map-cerca__campo',
      type: 'search',
      placeholder: 'Cerca scuole, corsi, eventi',
      'aria-label': 'Cerca sulla mappa',
      autocomplete: 'off',
      spellcheck: 'false',
      enterkeyhint: 'search'
    });
    M.input.value = m.cerca || '';
    M.cancella = NV.iconBtn('x', 'Cancella la ricerca', function () {
      M.input.value = '';
      aggiornaRicerca(M);
      M.input.focus();
    }, 'nv-iconbtn--vuoto nv-map-cerca__cancella');

    var barraCerca = h('div', { class: 'nv-map-cerca', role: 'search' }, [
      h('span', { class: 'nv-map-cerca__ico' }, [icon('search', ICO.MD)]),
      M.input,
      M.cancella,
      h('button', {
        class: 'nv-avatar nv-map-cerca__avatar',
        type: 'button',
        'aria-label': 'Apri il profilo',
        title: 'Profilo',
        onclick: function () { NV.vai('profilo'); }
      }, [h('img', { src: D.utente.avatar, alt: '' })])
    ]);

    var filtro = filtroContesto(m);
    M.filtro = filtro;
    var contesto = filtro
      ? h('button', {
          class: 'nv-map-contesto nv-map-contesto--filtro',
          type: 'button',
          'aria-label': 'Togli il filtro ' + filtro,
          onclick: function () { ridisegna({ compito: null, ambito: null, selezionata: null }); }
        }, [
          icon('route', ICO.SM),
          h('span', { text: filtro }),
          h('span', { class: 'nv-map-contesto__x' }, [icon('x', ICO.SM)])
        ])
      : h('div', { class: 'nv-map-contesto' }, [
          icon('route', ICO.SM),
          h('span', { text: 'Step ' + (NV.stepAttuale() + 1) + ' · ' + NV.step(NV.stepAttuale()).titolo })
        ]);

    var conteggi = {};
    base.forEach(function (o) { conteggi[o.categoria] = (conteggi[o.categoria] || 0) + 1; });
    var chips = [NV.chip('Tutte', {
      attivo: categoria === 'tutte',
      conteggio: base.length,
      onclick: categoria === 'tutte' ? null : function () { ridisegna({ categoria: 'tutte', selezionata: null }); }
    })];
    Object.keys(D.categorie).forEach(function (k) {
      if (!conteggi[k] && categoria !== k) return;
      var c = D.categorie[k];
      var ch = NV.chip(c.etichetta, {
        attivo: categoria === k,
        icona: c.icona,
        conteggio: conteggi[k] || 0,
        onclick: function () { ridisegna({ categoria: categoria === k ? 'tutte' : k, selezionata: null }); }
      });
      ch.classList.add('nv-map-tono-' + c.tono);
      chips.push(ch);
    });
    chips.forEach(function (ch) { ch.classList.add('nv-map-chip'); });
    M.fila = NV.filaChip(chips, 'nv-map-chips');

    M.alto = h('div', { class: 'nv-map-alto' }, [barraCerca, contesto, M.fila]);
    M.tendina = h('div', { class: 'nv-map-tendina', role: 'listbox', 'aria-label': 'Risultati della ricerca', hidden: true });

    /* --- a destra: + / − e Centra su di me ------------------------------ */
    M.btnPosizione = pulsanteMappa('locate-fixed', 'Centra su di me', function () { centraSuDiMe(M); },
      'nv-map-btn--posizione' + (M.primo && !sel ? ' is-attivo' : ''));
    M.controlli = h('div', { class: 'nv-map-controlli' }, [
      h('div', { class: 'nv-map-zoom' }, [
        pulsanteMappa('plus', 'Avvicina', function () { zoomVerso(M, ZOOM.passo, null, null, true); }),
        pulsanteMappa('minus', 'Allontana', function () { zoomVerso(M, 1 / ZOOM.passo, null, null, true); })
      ]),
      M.btnPosizione
    ]);

    /* --- in basso: pannello dei risultati e scheda anteprima ------------ */
    var testi = testiPannello(M, vicine, lontane);
    M.testa = h('button', {
      class: 'nv-map-pannello__testa',
      type: 'button',
      'aria-expanded': 'false',
      onclick: function () { apriElenco(M, !stato.elenco); }
    }, [
      h('span', { class: 'nv-sheet__maniglia nv-map-pannello__maniglia', 'aria-hidden': 'true' }),
      h('span', { class: 'nv-map-pannello__riga' }, [
        h('span', { class: 'nv-map-pannello__copy' }, [
          h('strong', { class: 'nv-map-pannello__titolo', text: testi.titolo }),
          h('span', { class: 'nv-map-pannello__sotto', text: testi.sotto })
        ]),
        h('span', { class: 'nv-map-pannello__freccia', 'aria-hidden': 'true' }, [icon('chevron-up', ICO.MD)])
      ])
    ]);
    M.corpo = h('div', { class: 'nv-map-pannello__corpo' }, corpoElenco(M, vicine, lontane));
    M.pannello = h('section', { class: 'nv-map-pannello', 'aria-label': 'Elenco dei risultati' }, [M.testa, M.corpo]);
    M.anteprimaBox = h('div', { class: 'nv-map-anteprima-box' });

    M.radice = NV.pagina('nv-page--piena nv-map' + (interno ? ' nv-map--ridisegno' : ''), [
      M.vista, M.controlli, M.pannello, M.anteprimaBox, M.alto, M.tendina
    ]);

    collegaMappa(M);
    collegaRicerca(M);
    if (sel) mostraAnteprima(M, sel);
    if (stato.elenco) apriElenco(M, true);
    aggiornaRicerca(M);

    /* posizione provvisoria subito (niente segnaposto ammucchiati in un
       angolo), quella precisa appena la schermata e' nel documento */
    if (!stato.V) stato.V = { s: 1, tx: 0, ty: 0 };
    if (M.primo) inquadra(M, false); else applica(M);
    setTimeout(function () { avvia(M); }, 0);

    return [M.radice, NV.navBasso('mappa')];
  };
})();
