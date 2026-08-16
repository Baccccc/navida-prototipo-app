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
    { bg: '#e9eaf5', testo: '#4340b3', label: 'Analizzando le risposte' },
    { bg: '#e8eff5', testo: '#4085b3', label: 'Calcolando profilo utente' },
    { bg: '#efecf6', testo: '#8f40b3', label: 'Creando suggerimenti' }
  ];

  /**
   * Anelli di testo circolare.
   * @param {string} frase  testo ripetuto lungo il cerchio
   */
  var VB = 600;                 // lato della viewBox
  var CX = VB / 2, CY = VB / 2; // centro

  function anelli(frase) {
    var h = window.NavidaRender.h;
    var box = h('div', { class: 'ring' });
    var unico = String(Date.now()) + Math.round(Math.random() * 999);

    // tre anelli concentrici: raggio, corpo del testo, opacità, velocità, verso
    var conf = [
      { r: 122, size: 19, opacity: 1,   dur: 38, dir: 1 },
      { r: 178, size: 22, opacity: .48, dur: 54, dir: -1 },
      { r: 236, size: 26, opacity: .22, dur: 72, dir: 1 }
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

      box.appendChild(h('div', {
        class: 'ring__layer',
        style: 'animation-duration:' + c.dur + 's;' +
               'animation-direction:' + (c.dir > 0 ? 'normal' : 'reverse') + ';' +
               'opacity:' + c.opacity,
        html: '<svg viewBox="0 0 ' + VB + ' ' + VB + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
              '<defs><path id="' + id + '" d="' + d + '" fill="none"/></defs>' +
              '<text font-family="DM Sans, sans-serif" font-size="' + c.size + '" ' +
              'font-weight="700" fill="currentColor" letter-spacing="0.2">' +
              // textLength forza il testo a chiudere esattamente il giro
              '<textPath href="#' + id + '" xlink:href="#' + id + '" startOffset="0" ' +
              'textLength="' + circ.toFixed(1) + '" lengthAdjust="spacing">' +
              testo +
              '</textPath></text></svg>'
      }));
    });

    return box;
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

    var t = setTimeout(function () { if (typeof fine === 'function') fine(); }, CERCHI.length * durata + 500);
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
    cerchi: cerchi,
    CERCHI: CERCHI
  };
})();
