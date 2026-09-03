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

  function sogno(frase, variante) {
    if (variante === 'costellazione') return costellazione(frase);
    if (variante === 'portale') return portale();
    if (variante === 'tunnel') return tunnelTipografico(frase);
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

  /* Sequenza di mascotte per la schermata di elaborazione. La variante
     "professioni" usa cinque asset generati sul personaggio Navida piu'
     la posa al computer gia' presente nel progetto. */
  var POSE_ELABORAZIONE = [
    { posa: 'computer',  label: 'Tecnologia' },
    { posa: 'matita',    label: 'Creatività' },
    { posa: 'leggere',   label: 'Formazione' },
    { posa: 'calcolare', label: 'Analisi' },
    { posa: 'tablet',    label: 'Digitale' },
    { posa: 'zaino',     label: 'Nuovi percorsi' }
  ];

  var RUOLI_ELABORAZIONE = [
    { posa: 'computer', label: 'Sviluppo software' },
    { src: 'assets/mascotte-professione-medico.png', label: 'Medicina' },
    { src: 'assets/mascotte-professione-chef.png', label: 'Ristorazione' },
    { src: 'assets/mascotte-professione-ingegnere.png', label: 'Ingegneria' },
    { src: 'assets/mascotte-professione-docente.png', label: 'Formazione' },
    { src: 'assets/mascotte-professione-designer.png', label: 'Design' }
  ];

  function professioni(variante, fine) {
    var h = window.NavidaRender.h;
    var items = variante === 'professioni' ? RUOLI_ELABORAZIONE : POSE_ELABORAZIONE;
    var passo = 900;
    var box = h('div', { class: 'jobSpin' }, [
      h('div', { class: 'jobSpin__orbit', 'aria-hidden': 'true' }),
      h('p', { class: 'jobSpin__title', text: 'Stiamo esplorando le possibilità' }),
      h('div', { class: 'jobSpin__dots', 'aria-hidden': 'true' }, [
        h('span'), h('span'), h('span')
      ])
    ]);

    items.forEach(function (item, i) {
      var art = item.src
        ? h('img', { src: item.src, alt: 'Astronauta Navida, ' + item.label })
        : window.NavidaMascotte.elemento(item.posa);

      box.appendChild(h('div', {
        class: 'jobSpin__slide',
        style: 'animation-delay:' + (i * passo) + 'ms'
      }, [
        h('div', { class: 'jobSpin__art' }, [art]),
        h('span', { class: 'jobSpin__label', text: item.label })
      ]));
    });

    var t = setTimeout(function () {
      if (box.isConnected && typeof fine === 'function') fine();
    }, items.length * passo + 250);
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
    cerchi: cerchi,
    professioni: professioni,
    CERCHI: CERCHI
  };
})();
