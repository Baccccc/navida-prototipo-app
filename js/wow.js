/* ==========================================================================
   NAVIDA — Sezione ludica (momento wow)
   ==========================================================================
   Ricostruzione delle schermate "Animaz ludica 1-12" del file Figma.

   1. Anelli di testo "Qual è il lavoro che sogni?" che compaiono in
      dissolvenza, si ingrandiscono e ruotano, poi si fermano.
   2. Al centro il campo di testo, con la tastiera che sale.
   3. Premuto Continua: gli anelli riprendono a girare.
   4. Tre cerchi giganti entrano uno dopo l'altro dal centro e coprono lo
      schermo, ognuno con la sua etichetta.
   5. Poi compaiono i suggerimenti.

   È tutto da rifare insieme, ma intanto si comporta come il progetto attuale.
   ========================================================================== */

(function () {
  'use strict';

  /* colori e testi dei tre cerchi, presi dal component set "Cerchio animazione" */
  var CERCHI = [
    { bg: '#e9eaf5', testo: '#4240ba', label: 'Analizzando le risposte' },
    { bg: '#e8eff5', testo: '#4085b3', label: 'Calcolando profilo utente' },
    { bg: '#efecf6', testo: '#6b21a8', label: 'Creando suggerimenti' }
  ];

  /**
   * Anelli di testo circolare.
   * @param {string} frase  testo ripetuto lungo il cerchio
   */
  var VB = 600;                 // lato della viewBox
  var CX = VB / 2, CY = VB / 2; // centro

  function anelli(frase) {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'dreamArt ring', 'aria-hidden': 'true' });
    var anchor = h('div', { class: 'ring__anchor' });
    var unico = String(Date.now()) + Math.round(Math.random() * 999);

    // tre anelli concentrici: raggio, corpo del testo, opacità, velocità, verso
    var conf = [
      { r: 122, size: 19, opacity: 1,   dur: 38, dir: 1 },
      { r: 178, size: 22, opacity: .58, dur: 54, dir: -1 },
      { r: 236, size: 26, opacity: .30, dur: 72, dir: 1 }
    ];

    conf.forEach(function (c, i) {
      var circ = 2 * Math.PI * c.r;
      var unita = frase + '  ◆  ';

      // quante ripetizioni servono per chiudere il cerchio, stimando
      // la larghezza media di un carattere a questo corpo
      // si arrotonda per eccesso: meglio stringere un po' le spaziature
      // che stirare le lettere
      var largheggiaChar = c.size * 0.52;
      var ripeti = Math.max(2, Math.ceil(circ / (unita.length * largheggiaChar)));

      var testo = '';
      for (var k = 0; k < ripeti; k++) testo += unita;

      var id = 'ring-' + unico + '-' + i;
      // cerchio completo: due archi da mezzo giro ciascuno
      var d = 'M ' + (CX - c.r) + ',' + CY +
              ' a ' + c.r + ',' + c.r + ' 0 1,1 ' + (c.r * 2) + ',0' +
              ' a ' + c.r + ',' + c.r + ' 0 1,1 -' + (c.r * 2) + ',0';

      anchor.appendChild(h('div', {
        class: 'ring__layer',
        style: 'animation-duration:' + c.dur + 's;' +
               'animation-direction:' + (c.dir > 0 ? 'normal' : 'reverse') + ';' +
               'opacity:' + c.opacity,
        html: '<svg viewBox="0 0 ' + VB + ' ' + VB + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
              '<defs><path id="' + id + '" d="' + d + '" fill="none"/></defs>' +
              '<text font-family="Atkinson Hyperlegible Next, sans-serif" font-size="' + c.size + '" ' +
              'font-weight="700" fill="currentColor" letter-spacing="0.2">' +
              // textLength forza il testo a chiudere esattamente il giro
              '<textPath href="#' + id + '" xlink:href="#' + id + '" startOffset="0" ' +
              'textLength="' + circ.toFixed(1) + '" lengthAdjust="spacing">' +
              testo +
              '</textPath></text></svg>'
      }));
    });

    box.appendChild(anchor);
    return box;
  }

  /* Tre direzioni alternative volutamente lontane dagli anelli. */
  function costellazione(frase) {
    var h = window.NavidaRender.h;
    var punti = [
      [50, 13, 8], [24, 27, 5], [73, 31, 6], [14, 52, 4],
      [49, 48, 7], [85, 58, 5], [30, 72, 6], [65, 79, 4], [48, 91, 5]
    ];
    var linee = [
      [50,13,24,27], [50,13,73,31], [24,27,14,52], [24,27,49,48],
      [73,31,49,48], [73,31,85,58], [14,52,30,72], [49,48,30,72],
      [49,48,85,58], [49,48,65,79], [30,72,48,91], [65,79,48,91]
    ];
    var svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' +
      linee.map(function (l) {
        return '<path d="M' + l[0] + ' ' + l[1] + ' L' + l[2] + ' ' + l[3] + '"/>';
      }).join('') + '</svg>';
    var box = h('div', { class: 'dreamArt constellation', 'aria-hidden': 'true', html: svg });
    punti.forEach(function (p, i) {
      box.appendChild(h('span', {
        class: 'constellation__star constellation__star--' + (i % 3),
        style: '--x:' + p[0] + '%;--y:' + p[1] + '%;--s:' + p[2] + 'px;--d:' + (i * 130) + 'ms'
      }));
    });
    ['curiosità', 'talento', 'impatto'].forEach(function (testo, i) {
      box.appendChild(h('span', {
        class: 'constellation__word constellation__word--' + (i + 1),
        text: testo
      }));
    });
    return box;
  }

  function portale() {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'dreamArt portal', 'aria-hidden': 'true' });
    var tunnel = h('div', { class: 'portal__tunnel' });
    for (var i = 0; i < 7; i++) {
      tunnel.appendChild(h('span', {
        class: 'portal__gate',
        style: '--i:' + i + ';--w:' + (74 + i * 51) + 'px;--h:' + (116 + i * 59) + 'px;--a:' + (.78 - i * .075).toFixed(3)
      }));
    }
    tunnel.appendChild(h('span', { class: 'portal__horizon' }));
    box.appendChild(tunnel);
    box.appendChild(h('span', { class: 'portal__label', text: 'OLTRE QUELLO CHE GIÀ SAI' }));
    return box;
  }

  function tunnelTipografico(frase) {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'dreamArt typeTunnel', 'aria-hidden': 'true' });
    var testo = (frase + '  ◆  ').repeat(4);
    for (var i = 0; i < 7; i++) {
      var rail = h('div', {
        class: 'typeTunnel__rail typeTunnel__rail--' + (i % 2 ? 'reverse' : 'forward'),
        style: '--i:' + i + ';--fs:' + (12 + i * 2.2).toFixed(1) + 'px;--a:' + (.18 + i * .075).toFixed(3) + ';--dur:' + (26 - i * 1.4).toFixed(1) + 's'
      });
      rail.appendChild(h('span', { text: testo }));
      rail.appendChild(h('span', { text: testo }));
      box.appendChild(rail);
    }
    box.appendChild(h('span', { class: 'typeTunnel__focus' }));
    return box;
  }

  /* ======================================================================
     CINQUE VERSIONI NUOVE DELLA SCHERMATA DEL SOGNO
     ----------------------------------------------------------------------
     Nelle quattro versioni sopra la domanda e' solo decorazione: gira
     dentro il disegno e un lettore di schermo non la legge.

     In queste cinque la domanda e' un titolo vero dentro la scheda.
     Si legge, si modifica dalla scheda "Testi" e resta ferma mentre si
     scrive. Le funzioni qui sotto disegnano solo la scena intorno: la
     domanda e il campo li mette js/render.js.
     ====================================================================== */

  var CON_DOMANDA = {
    insegna: true,
    targhetta: true,
    nebulosa: true,
    orizzonte: true,
    pensiero: true
  };

  /** true se la versione vuole la domanda scritta, non solo disegnata. */
  function domandaVisibile(variante) {
    return CON_DOMANDA[variante] === true;
  }

  /* ----------------------------------------------------------------------
     1. INSEGNA AL NEON
     La luce della stanza si spegne. Resta accesa solo l'insegna con la
     domanda, che sfarfalla due volte e poi tiene. Il campo di testo e' il
     tubo di luce sotto l'insegna: piu' scrivi, piu' l'insegna e' viva.
     ---------------------------------------------------------------------- */
  function insegna() {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'dreamArt neon', 'aria-hidden': 'true' }, [
      h('span', { class: 'neon__notte' }),
      h('span', { class: 'neon__alone' })
    ]);

    /* pulviscolo: granelli di luce che salgono piano davanti all'insegna */
    var pulviscolo = h('div', { class: 'neon__pulviscolo' });
    var colonne = [7, 14, 22, 29, 37, 44, 51, 58, 64, 71, 78, 84, 90, 95, 18, 61];
    colonne.forEach(function (x, i) {
      pulviscolo.appendChild(h('span', {
        style: '--x:' + x + '%;' +
               '--s:' + (2 + (i % 3)) + 'px;' +
               '--dur:' + (12 + (i % 5) * 2.6).toFixed(1) + 's;' +
               '--dl:' + (i * 780) + 'ms'
      }));
    });
    box.appendChild(pulviscolo);
    return box;
  }

  /* ----------------------------------------------------------------------
     2. TARGHETTA DA LAVORO
     Un badge aziendale scende dal cordino e dondola fino a fermarsi.
     Nome dell'azienda: Navida. Ruolo: vuoto. Lo scrivi tu.
     E' la metafora piu' concreta di tutte: il lavoro dei sogni scritto
     sul cartellino che porti al collo.
     ---------------------------------------------------------------------- */
  function targhetta() {
    var h = window.NavidaRender.h;
    return h('div', { class: 'dreamArt badge', 'aria-hidden': 'true' }, [
      h('span', { class: 'badge__carta' }),
      h('span', { class: 'badge__alone' })
    ]);
  }

  /* ----------------------------------------------------------------------
     3. NEBULOSA DI MESTIERI
     Decine di mestieri veri fluttuano piano intorno al campo, come una
     nebulosa. Il campo al centro e' il punto di gravita': i nomi gli
     girano intorno. Toccarne uno lo scrive nel campo, cosi' chi non sa
     cosa rispondere ha da dove partire.
     ---------------------------------------------------------------------- */
  /* x/y in percentuale, s = corpo del testo, a = trasparenza.
     La fascia centrale (y 40-62) resta libera: li' c'e' la scheda con la
     domanda. In alto si sta sotto la freccia Indietro, in basso sopra il
     pulsante Continua. */
  var MESTIERI_NEBULOSA = [
    { t: 'Chef',            x: 18, y: 13, s: 13, a: .50 },
    { t: 'Architetta',      x: 57, y: 6,  s: 15, a: .78 },
    { t: 'Pilota',          x: 86, y: 10, s: 11, a: .40 },
    { t: 'Veterinario',     x: 31, y: 19, s: 12, a: .48 },
    { t: 'Data scientist',  x: 70, y: 21, s: 14, a: .64 },
    { t: 'Fotografo',       x: 13, y: 26, s: 11, a: .44 },
    { t: 'Insegnante',      x: 47, y: 28, s: 14, a: .70 },
    { t: 'Falegname',       x: 80, y: 31, s: 12, a: .48 },
    { t: 'Regista',         x: 25, y: 34, s: 13, a: .56 },
    { t: 'Infermiera',      x: 62, y: 36, s: 11, a: .42 },
    { t: 'Sviluppatrice',   x: 21, y: 69, s: 14, a: .68 },
    { t: 'Biologo marino',  x: 56, y: 66, s: 12, a: .48 },
    { t: 'Ingegnere',       x: 83, y: 71, s: 13, a: .56 },
    { t: 'Avvocata',        x: 13, y: 77, s: 11, a: .44 },
    { t: 'Astronauta',      x: 42, y: 79, s: 15, a: .80 },
    { t: 'Musicista',       x: 76, y: 82, s: 12, a: .50 },
    { t: 'Psicologa',       x: 26, y: 85, s: 11, a: .40 },
    { t: 'Panettiere',      x: 61, y: 87, s: 13, a: .54 }
  ];

  function nebulosa() {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'dreamArt nebula' }, [
      h('span', { class: 'nebula__nucleo', 'aria-hidden': 'true' })
    ]);

    MESTIERI_NEBULOSA.forEach(function (m, i) {
      box.appendChild(h('button', {
        type: 'button',
        class: 'nebula__parola',
        /* fuori dal giro del tasto Tab: e' un aiuto, non un passaggio
           obbligato. Stessa scelta della tastiera finta. */
        tabindex: '-1',
        'data-mestiere': m.t,
        'aria-label': 'Scrivi ' + m.t,
        text: m.t,
        style: '--x:' + m.x + '%;--y:' + m.y + '%;' +
               '--fs:' + m.s + 'px;--a:' + m.a + ';' +
               '--dur:' + (26 + (i % 6) * 7) + 's;' +
               '--dl:' + (i * -1900) + 'ms'
      }));
    });
    return box;
  }

  /* ----------------------------------------------------------------------
     4. ORIZZONTE ALL'ALBA
     Le stelle si spengono, il sole sale piano da dietro il campo di
     testo e la riga su cui scrivi e' la linea dell'orizzonte.
     E' la versione calma: nessun testo che gira, nessun rumore.
     ---------------------------------------------------------------------- */
  function orizzonte() {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'dreamArt dawn', 'aria-hidden': 'true' }, [
      h('span', { class: 'dawn__cielo' })
    ]);

    var stelle = h('div', { class: 'dawn__stelle' });
    [[13, 9], [31, 5], [48, 13], [67, 7], [83, 15], [22, 19], [58, 21], [92, 4]]
      .forEach(function (p, i) {
        stelle.appendChild(h('span', {
          style: '--x:' + p[0] + '%;--y:' + p[1] + '%;--dl:' + (i * 420) + 'ms'
        }));
      });
    box.appendChild(stelle);

    /* tre nuvole sottili che attraversano il cielo a velocita' diverse */
    [[26, 34, 118], [58, 22, 86], [14, 46, 150]].forEach(function (n, i) {
      box.appendChild(h('span', {
        class: 'dawn__nuvola',
        style: '--y:' + n[0] + '%;--w:' + n[1] + '%;--dur:' + n[2] + 's;--dl:' + (i * -34) + 's'
      }));
    });
    return box;
  }

  /* ----------------------------------------------------------------------
     5. IL PENSIERO DI NAVIDA
     L'astronauta pensa in basso a sinistra. Sopra di lui si gonfia la
     nuvoletta del pensiero, e dentro la nuvoletta c'e' la domanda e il
     campo. La risposta la stai pensando insieme a lui.
     ---------------------------------------------------------------------- */
  function pensiero() {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'dreamArt think', 'aria-hidden': 'true' }, [
      h('span', { class: 'think__cielo' })
    ]);

    var stelle = h('div', { class: 'think__stelle' });
    [[80, 18], [90, 30], [12, 26], [70, 8], [30, 12]].forEach(function (p, i) {
      stelle.appendChild(h('span', {
        style: '--x:' + p[0] + '%;--y:' + p[1] + '%;--dl:' + (i * 560) + 'ms'
      }));
    });
    box.appendChild(stelle);

    box.appendChild(h('div', { class: 'think__mascotte' }, [
      window.NavidaMascotte.elemento('pensare')
    ]));
    return box;
  }

  function sogno(frase, variante) {
    if (variante === 'costellazione') return costellazione(frase);
    if (variante === 'portale') return portale();
    if (variante === 'tunnel') return tunnelTipografico(frase);
    if (variante === 'insegna') return insegna();
    if (variante === 'targhetta') return targhetta();
    if (variante === 'nebulosa') return nebulosa();
    if (variante === 'orizzonte') return orizzonte();
    if (variante === 'pensiero') return pensiero();
    return anelli(frase);
  }

  /**
   * Animazione dei tre cerchi che coprono lo schermo uno dopo l'altro.
   * @param {function} fine  chiamata quando l'ultimo cerchio ha finito
   */
  function cerchi(fine) {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'circles' });
    var durata = 2400;   // più lunga: si deve capire che sta caricando

    CERCHI.forEach(function (c, i) {
      var el = h('div', {
        class: 'circles__c',
        style: 'background:' + c.bg + ';color:' + c.testo + ';animation-delay:' + (i * durata) + 'ms'
      }, [
        h('div', { class: 'circles__label' }, [
          h('span', { class: 'circles__spark', html: sparkle(c.testo) }),
          h('span', { text: c.label })
        ])
      ]);
      box.appendChild(el);
    });

    var t = setTimeout(function () {
      if (box.isConnected && typeof fine === 'function') fine();
    }, CERCHI.length * durata + 500);
    box.dataset.timer = t;
    return box;
  }

  /* Elaborazione: un'attesa semplice, come un loader.
     Un titolo fermo e l'astronauta Navida che cambia veste. Niente nomi
     dei mestieri, niente contatore, niente barra (richiesta di Bac).
     Il cambio e' uno scatto: la mascotte sparisce, resta una breve pausa
     vuota, poi appare la successiva. */
  var VESTI_ELABORAZIONE = [
    'assets/mascotte-professione-medico.png',
    'assets/mascotte-professione-chef.png',
    'assets/mascotte-professione-ingegnere.png',
    'assets/mascotte-professione-docente.png',
    'assets/mascotte-professione-designer.png'
  ];

  var ELAB_PASSO = 1150;  /* quanto resta ogni veste, pausa inclusa */
  var ELAB_PAUSA = 140;   /* lo schermo vuoto tra una veste e l'altra */

  function professioni(fine) {
    var h = window.NavidaRender.h;
    var tot = VESTI_ELABORAZIONE.length;

    /* le mascotte stanno una sopra l'altra: se ne accende una per volta */
    var art = h('div', { class: 'jobV__art', 'aria-hidden': 'true' }, VESTI_ELABORAZIONE.map(function (src) {
      return h('img', { src: src, alt: '' });
    }));
    var box = h('div', { class: 'jobV', role: 'status' }, [
      h('div', { class: 'jobV__head' }, [
        h('p', { class: 'jobV__eyebrow', text: 'Un momento' }),
        h('h2', { class: 'jobV__title', text: 'Stiamo esplorando le possibilità' })
      ]),
      h('div', { class: 'jobV__stage' }, [art, h('span', { class: 'jobV__floor', 'aria-hidden': 'true' })])
    ]);
    var imgs = Array.prototype.slice.call(art.querySelectorAll('img'));

    function mostra(i) {
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
    }

    mostra(0);
    for (var i = 1; i < tot; i++) {
      (function (i) {
        setTimeout(function () { if (box.isConnected) mostra(-1); }, i * ELAB_PASSO - ELAB_PAUSA);
        setTimeout(function () { if (box.isConnected) mostra(i); }, i * ELAB_PASSO);
      })(i);
    }

    var t = setTimeout(function () {
      if (box.isConnected && typeof fine === 'function') fine();
    }, tot * ELAB_PASSO + 300);
    box.dataset.timer = t;
    return box;
  }

  function sparkle(colore) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="' + colore + '">' +
      '<path d="M7 4.2 8 6.6 10.4 7.6 8 8.6 7 11 6 8.6 3.6 7.6 6 6.6z"/>' +
      '<path d="M16 9.2 17.2 12 20 13.2 17.2 14.4 16 17.2 14.8 14.4 12 13.2 14.8 12z"/>' +
      '</svg>';
  }

  window.NavidaWow = {
    anelli: anelli,
    sogno: sogno,
    domandaVisibile: domandaVisibile,
    cerchi: cerchi,
    professioni: professioni,
    CERCHI: CERCHI
  };
})();
