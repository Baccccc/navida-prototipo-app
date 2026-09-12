/* ==========================================================================
   NAVIDA — La linea di carriera
   ==========================================================================
   Un modulo solo e una sola anatomia, in tre versioni della stessa idea:
   da dove sei oggi a dove vuoi arrivare, tappa dopo tappa.

   L'ANATOMIA (uguale per tutte le versioni a elenco)
     Ogni tappa e' una riga in flusso normale, senza altezze fisse:

       [ pallino ]  Tappa 1              <- occhiello, 11px tenue
                    Nome della tappa     <- titolo, 14px semibold, va a capo
                    ruolo · durata       <- meta, 11px tenue

     Il pallino sta sempre a sinistra, il testo sempre a destra e prende
     tutta la larghezza che resta: i titoli lunghi vanno a capo e non
     rompono niente. La linea di collegamento e' un livello SVG DIETRO le
     righe (z-index 0), disegnata sui centri veri dei pallini misurati a
     schermo: se cambia il numero di tappe, o l'altezza di una riga, la
     linea segue da sola.

   LE VERSIONI
     serpentina   i pallini oscillano a destra e a sinistra dentro la loro
                  corsia e la linea li unisce con curve morbide a S.
     filo         i pallini stanno tutti in colonna, la linea e' dritta e
                  la tappa di adesso e' una card in rilievo.
     curva        non e' un elenco ma un grafico: un arco unico da "Oggi"
                  al traguardo. Lo usa la prima proiezione.

   Si usa cosi':
     NavidaPercorso.disegna(steps, { variante: 'serpentina', attiva: 0 })
   e restituisce un elemento da appendere. Con mini:true fa la versione
   corta per la schermata di introduzione: pallini piu' piccoli e solo il
   nome della tappa.

   Il disegno parte da solo appena l'elemento entra nella pagina.
   Con "riduci animazioni" attivo il percorso e' gia' tutto visibile.
   ========================================================================== */

(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';

  /* Misure dell'anatomia, in pixel. Sono i numeri del riferimento
     "Struttura del programma" del Figma: pallino da 32, testo staccato di
     14, tappe distanti fra loro. L'onda e' quanto il pallino puo'
     spostarsi di lato nella serpentina. */
  var MISURE = {
    normale: { pallino: 32, gap: 14, passo: 22, onda: 30 },
    mini:    { pallino: 26, gap: 12, passo: 18, onda: 22 }
  };

  function s(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) {
      if (attrs[k] != null) n.setAttribute(k, String(attrs[k]));
    }
    return n;
  }

  function d(tag, cls, testo) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (testo != null) n.textContent = testo;
    return n;
  }

  /* Il disegno parte appena l'elemento e' entrato nella pagina e il
     browser ha calcolato le misure: prima di allora getBoundingClientRect()
     e getTotalLength() non hanno niente di vero da misurare.
     Si aspetta la connessione al documento, non un timer a caso: le
     schermate vengono costruite fuori dal DOM e appese dopo. */
  function alColpo(root, avvia) {
    var partito = false;
    var tentativi = 0;

    function via() {
      if (partito) return;
      partito = true;
      /* da qui in poi comanda l'animazione: e' questa classe che
         permette al CSS di nascondere le tappe prima di accenderle.
         Senza di lei il percorso resta visibile e basta — che e'
         il comportamento giusto se lo script non arriva mai. */
      root.classList.add('is-anim');
      avvia();
    }

    function prova() {
      if (partito) return;
      if (root.isConnected && root.getBoundingClientRect().width > 0) {
        requestAnimationFrame(function () { requestAnimationFrame(via); });
        return;
      }
      if (++tentativi > 90) { via(); return; }
      requestAnimationFrame(prova);
    }
    prova();

    /* In una scheda in secondo piano requestAnimationFrame non gira.
       Il percorso resta visibile e fermo, e riparte da solo quando
       la scheda torna davanti. */
    document.addEventListener('visibilitychange', function ripiglia() {
      if (document.hidden || partito) return;
      document.removeEventListener('visibilitychange', ripiglia);
      prova();
    });
  }

  function ridotte() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* Disegna una linea e usa il suo stesso avanzamento per accendere le
     tappe. In questo modo una tappa non puo' comparire prima che la linea
     l'abbia raggiunta. `disegno` tiene memoria di dove siamo arrivati:
     serve a rimettere a posto la linea se la pagina cambia misura. */
  function animaLinea(linea, nodi, durata, disegno) {
    var inizio = null;
    var prossimo = 0;
    var ultimo = Math.max(1, nodi.length - 1);

    disegno.L = linea.getTotalLength();
    linea.style.strokeDasharray = String(disegno.L);
    linea.style.strokeDashoffset = String(disegno.L);

    if (ridotte()) {
      disegno.avanzamento = 1;
      linea.style.strokeDashoffset = '0';
      nodi.forEach(function (n) { n.classList.add('is-on'); });
      return;
    }

    function morbida(t) {
      return t < .5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function fotogramma(ora) {
      if (inizio == null) inizio = ora;
      var tempo = Math.min(1, (ora - inizio) / durata);
      disegno.avanzamento = morbida(tempo);

      linea.style.strokeDashoffset = String(disegno.L * (1 - disegno.avanzamento));

      while (prossimo < nodi.length && disegno.avanzamento >= prossimo / ultimo) {
        nodi[prossimo].classList.add('is-on');
        prossimo++;
      }

      if (tempo < 1) requestAnimationFrame(fotogramma);
      else {
        disegno.avanzamento = 1;
        linea.style.strokeDashoffset = '0';
      }
    }

    requestAnimationFrame(fotogramma);
  }

  /* ======================================================================
     LA LINEA DIETRO LE TAPPE
     ======================================================================
     Non ci sono coordinate scritte a mano: si misurano i centri veri dei
     pallini e si uniscono con una curva a S (tangenti verticali alle due
     estremita', cosi' la linea entra ed esce dal pallino dritta).
     ====================================================================== */
  function tracciaFilo(root, svg, tracce, pallini) {
    var box = root.getBoundingClientRect();
    if (!box.width || pallini.length < 2) return false;

    var punti = pallini.map(function (p) {
      var r = p.getBoundingClientRect();
      return {
        x: r.left - box.left + r.width / 2,
        y: r.top - box.top + r.height / 2
      };
    });

    var dd = 'M ' + punti[0].x.toFixed(1) + ' ' + punti[0].y.toFixed(1);
    for (var i = 1; i < punti.length; i++) {
      var a = punti[i - 1], b = punti[i];
      var k = (b.y - a.y) * .5;
      dd += ' C ' + a.x.toFixed(1) + ' ' + (a.y + k).toFixed(1) +
            ', ' + b.x.toFixed(1) + ' ' + (b.y - k).toFixed(1) +
            ', ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
    }

    svg.setAttribute('viewBox', '0 0 ' + box.width.toFixed(1) + ' ' + box.height.toFixed(1));
    tracce.forEach(function (t) { t.setAttribute('d', dd); });
    return true;
  }

  /* ======================================================================
     ELENCO — l'anatomia condivisa da "serpentina" e "filo"
     ======================================================================
     `onda(i, n)` dice di quanti pixel il pallino della tappa i si sposta
     a destra dentro la sua corsia: e' l'unica differenza fra le due
     versioni, insieme allo stile della linea che sta nel CSS.
     ====================================================================== */
  function elenco(steps, opt, variante, onda) {
    var mini = !!opt.mini;
    var attiva = opt.attiva == null ? 0 : opt.attiva;
    var m = mini ? MISURE.mini : MISURE.normale;
    var n = steps.length;

    var ampiezza = 0;
    for (var k = 0; k < n; k++) ampiezza = Math.max(ampiezza, onda(k, n));

    var root = d('div', 'perc perc--' + variante + (mini ? ' perc--mini' : ''));
    root.style.setProperty('--perc-pallino', m.pallino + 'px');
    root.style.setProperty('--perc-corsia', (m.pallino + ampiezza) + 'px');
    root.style.setProperty('--perc-gap', m.gap + 'px');
    root.style.setProperty('--perc-passo', m.passo + 'px');

    /* il livello della linea sta dietro tutto: inset 0, z-index 0 */
    var svg = s('svg', {
      class: 'perc__filo',
      preserveAspectRatio: 'none',
      'aria-hidden': 'true'
    });
    var scia = s('path', { class: 'perc__scia', fill: 'none', 'vector-effect': 'non-scaling-stroke' });
    var linea = s('path', { class: 'perc__linea', fill: 'none', 'vector-effect': 'non-scaling-stroke' });
    svg.appendChild(scia);
    svg.appendChild(linea);
    root.appendChild(svg);

    var lista = d('div', 'perc__tappe');
    var tappe = [];
    var pallini = [];

    steps.forEach(function (st, i) {
      var stato = i < attiva ? 'fatto' : (i === attiva ? 'ora' : 'poi');
      var riga = d('div', 'perc__tappa perc__tappa--' + stato);
      riga.style.setProperty('--i', String(i));

      var punto = d('span', 'perc__punto');
      punto.style.setProperty('--dx', onda(i, n) + 'px');
      punto.appendChild(d('span', 'perc__segno', stato === 'fatto' ? '✓' : String(i + 1)));
      riga.appendChild(punto);

      var testo = d('div', 'perc__testo');
      if (!mini) testo.appendChild(d('span', 'perc__occhiello', 'Tappa ' + (i + 1)));
      testo.appendChild(d('span', 'perc__nome', st.nome));
      if (!mini) {
        var meta = [st.ruolo, st.durata].filter(Boolean).join(' · ');
        if (meta) testo.appendChild(d('span', 'perc__meta', meta));
      }
      riga.appendChild(testo);

      lista.appendChild(riga);
      tappe.push(riga);
      pallini.push(punto);
    });
    root.appendChild(lista);

    var disegno = { avanzamento: 0, L: 0 };

    function ridisegna() {
      if (!tracciaFilo(root, svg, [scia, linea], pallini)) return;
      disegno.L = linea.getTotalLength();
      linea.style.strokeDasharray = String(disegno.L);
      linea.style.strokeDashoffset = String(disegno.L * (1 - disegno.avanzamento));
    }

    alColpo(root, function () {
      if (!tracciaFilo(root, svg, [scia, linea], pallini)) {
        /* senza misure la linea non si puo' disegnare: meglio nessuna
           linea che una linea sbagliata. Le tappe restano leggibili. */
        tappe.forEach(function (t) { t.classList.add('is-on'); });
        return;
      }
      var durata = opt.durata || (mini ? 2600 : Math.min(3600, 900 + n * 480));
      animaLinea(linea, tappe, durata, disegno);

      /* se la cornice cambia misura (rotazione, ridimensionamento del
         desktop) la linea si rifa' sui pallini nella nuova posizione */
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function () { ridisegna(); });
        ro.observe(root);
      }
    });

    return root;
  }

  /* ======================================================================
     1 · SERPENTINA
     ======================================================================
     I pallini oscillano dentro la corsia di sinistra: pari a filo del
     margine, dispari spostati di "onda". Il testo non si muove mai, quindi
     resta allineato e ha sempre la stessa larghezza.
     ====================================================================== */
  function serpentina(steps, opt) {
    var m = opt.mini ? MISURE.mini : MISURE.normale;
    return elenco(steps, opt, 'serpentina', function (i) {
      return i % 2 === 0 ? 0 : m.onda;
    });
  }

  /* ======================================================================
     2 · FILO
     ======================================================================
     Pallini in colonna e linea dritta. La sola tappa di adesso e' una card
     in rilievo: la card veste il testo, non la riga intera, cosi' il
     pallino resta sul filo invece di uscire dal componente.
     ====================================================================== */
  function filo(steps, opt) {
    return elenco(steps, opt, 'filo', function () { return 0; });
  }

  /* ======================================================================
     3 · CURVA
     ======================================================================
     Qui non c'e' un elenco: c'e' un grafico. Un arco unico che sale da
     oggi al traguardo, con le tappe appoggiate sopra. Lo usa la prima
     proiezione ("Decidi se restare o cambiare"), dove conta la promessa.
     ====================================================================== */
  function curva(steps, opt) {
    var mini = !!opt.mini;
    var W = 300, H = mini ? 130 : 190;
    var y0 = H - (mini ? 26 : 40), y1 = mini ? 24 : 34;
    var R = mini ? 7 : 13;

    var root = d('div', 'perc perc--curva' + (mini ? ' perc--mini' : ''));
    var svg = s('svg', {
      class: 'perc__svg',
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'xMidYMid meet',
      'aria-hidden': 'true'
    });

    var dd = 'M 26 ' + y0 + ' C 128 ' + y0 + ', 150 ' + y1 + ', ' + (W - 26) + ' ' + y1;

    /* il grigio sotto e' "senza percorso": serve solo come confronto */
    svg.appendChild(s('path', {
      class: 'perc__piatta',
      d: 'M 26 ' + y0 + ' C 140 ' + (y0 - 4) + ', 190 ' + (y0 - 10) + ', ' + (W - 26) + ' ' + (y0 - 16),
      fill: 'none'
    }));

    var linea = s('path', { class: 'perc__linea', d: dd, fill: 'none' });
    svg.appendChild(linea);
    root.appendChild(svg);

    /* i pallini si appoggiano sulla curva, calcolati sul path vero.
       Non sono anonimi: portano il numero della tappa (o la spunta), e
       l'ultimo e' il traguardo. */
    var nodi = [];
    steps.forEach(function (st, i) {
      var ultimo = i === steps.length - 1;
      var stato = ultimo ? 'meta' : (i === 0 ? 'ora' : 'poi');
      var g = s('g', { class: 'perc__nodo perc__nodo--' + stato });
      g.appendChild(s('circle', { class: 'perc__disco', r: ultimo ? R + 3 : R }));
      /* nella versione mini i pallini sono troppo piccoli per un numero:
         li' restano punti puliti, senza tratteggio */
      if (!mini) {
        var seg = s('text', {
          class: 'perc__seg',
          'text-anchor': 'middle',
          'dominant-baseline': 'central'
        });
        seg.textContent = String(i + 1);
        g.appendChild(seg);
      }
      svg.appendChild(g);
      nodi.push(g);
    });

    var etichette = d('div', 'curva__et');
    etichette.appendChild(d('span', 'curva__oggi', steps.length ? steps[0].nome : 'Oggi'));
    etichette.appendChild(d('span', 'curva__meta', steps.length ? steps[steps.length - 1].nome : ''));
    root.appendChild(etichette);

    alColpo(root, function () {
      var L = linea.getTotalLength();
      nodi.forEach(function (g, i) {
        var p = linea.getPointAtLength(L * (i / Math.max(1, nodi.length - 1)));
        g.querySelector('circle').setAttribute('cx', p.x);
        g.querySelector('circle').setAttribute('cy', p.y);
        var t = g.querySelector('text');
        if (t) { t.setAttribute('x', p.x); t.setAttribute('y', p.y); }
      });

      animaLinea(linea, nodi, mini ? 2800 : 3200, { avanzamento: 0, L: 0 });
      root.classList.add('is-on');
    });

    return root;
  }

  var MODI = { serpentina: serpentina, filo: filo, curva: curva };

  window.NavidaPercorso = {
    disegna: function (steps, opzioni) {
      var opt = opzioni || {};
      var f = MODI[opt.variante] || serpentina;
      return f(steps || [], opt);
    },
    modi: Object.keys(MODI)
  };
})();
