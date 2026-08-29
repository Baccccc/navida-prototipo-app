/* ==========================================================================
   NAVIDA — La linea di carriera
   ==========================================================================
   Un modulo solo, tre versioni della stessa idea: da dove sei oggi a dove
   vuoi arrivare, tappa dopo tappa.

     serpentina   il percorso zigzaga, la linea si disegna dall'alto in
                  basso e ogni tappa si accende quando la linea la tocca.
     filo         un filo verticale sottile che cresce, e una sola tappa
                  in rilievo come card. La versione piu' adulta.
     curva        un arco unico da "Oggi" al traguardo, con le tappe
                  appoggiate sopra.

   Si usa cosi':
     NavidaPercorso.disegna(steps, { variante: 'serpentina', attiva: 0 })
   e restituisce un elemento da appendere. Se si passa mini:true fa la
   versione corta per la schermata di introduzione (ob3), senza testi.

   Il disegno parte da solo appena l'elemento entra nella pagina.
   Con "riduci animazioni" attivo il percorso e' gia' tutto visibile.
   ========================================================================== */

(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';

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
     browser ha calcolato le misure: prima di allora getTotalLength()
     non ha un percorso vero da misurare.
     Si aspetta la connessione al documento, non un timer a caso: le
     schermate vengono costruite fuori dal DOM e appese dopo. */
  function alColpo(root, avvia) {
    var partito = false;
    var tentativi = 0;

    function via() {
      if (partito) return;
      partito = true;
      /* da qui in poi comanda l'animazione: e' questa classe che
         permette al CSS di nascondere i nodi prima di accenderli.
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

  /* ======================================================================
     1 · SERPENTINA
     ======================================================================
     I nodi si alternano a sinistra e a destra. La linea li unisce con
     curve morbide e si disegna in un colpo solo: e' un percorso, non
     cinque elementi separati.
     ====================================================================== */
  function serpentina(steps, opt) {
    var mini = !!opt.mini;
    var attiva = opt.attiva == null ? 0 : opt.attiva;

    var W = 300;
    var passo = mini ? 58 : 104;
    var margine = mini ? 26 : 46;
    var H = margine * 2 + passo * (steps.length - 1);
    var R = mini ? 13 : 17;

    var root = d('div', 'perc perc--serpentina' + (mini ? ' perc--mini' : ''));
    var svg = s('svg', {
      class: 'perc__svg',
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'xMidYMin meet',
      'aria-hidden': 'true'
    });

    /* posizione di ogni tappa: sinistra, destra, sinistra... */
    var punti = steps.map(function (_, i) {
      var sx = i % 2 === 0;
      return { x: sx ? 74 : W - 74, y: margine + passo * i, sx: sx };
    });

    /* la linea: una curva a S tra un nodo e il successivo */
    var dd = 'M ' + punti[0].x + ' ' + punti[0].y;
    for (var i = 1; i < punti.length; i++) {
      var a = punti[i - 1], b = punti[i];
      var my = (a.y + b.y) / 2;
      dd += ' C ' + a.x + ' ' + my + ', ' + b.x + ' ' + my + ', ' + b.x + ' ' + b.y;
    }

    var scia = s('path', { class: 'perc__scia', d: dd, fill: 'none' });
    var linea = s('path', { class: 'perc__linea', d: dd, fill: 'none' });
    svg.appendChild(scia);
    svg.appendChild(linea);

    var nodi = [];
    punti.forEach(function (p, i) {
      var stato = i < attiva ? 'fatto' : (i === attiva ? 'ora' : 'poi');
      var g = s('g', { class: 'perc__nodo perc__nodo--' + stato });

      if (stato === 'ora') {
        g.appendChild(s('circle', { class: 'perc__alone', cx: p.x, cy: p.y, r: R + 7 }));
      }
      g.appendChild(s('circle', { class: 'perc__disco', cx: p.x, cy: p.y, r: R }));

      var seg = s('text', {
        class: 'perc__seg',
        x: p.x, y: p.y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central'
      });
      seg.textContent = stato === 'fatto' ? '✓' : String(i + 1);
      g.appendChild(seg);

      if (!mini) {
        var et = s('text', {
          class: 'perc__et',
          x: p.sx ? p.x + R + 14 : p.x - R - 14,
          y: p.y,
          'text-anchor': p.sx ? 'start' : 'end',
          'dominant-baseline': 'central'
        });
        et.textContent = steps[i].nome;
        g.appendChild(et);
      }

      svg.appendChild(g);
      nodi.push(g);
    });

    root.appendChild(svg);

    alColpo(root, function () {
      var L = linea.getTotalLength();
      linea.style.strokeDasharray = L;
      linea.style.strokeDashoffset = L;
      var durata = Math.min(2000, 380 + steps.length * 260);
      // forza il ricalcolo prima di far partire la corsa
      void linea.getBoundingClientRect();
      linea.style.transition = 'stroke-dashoffset ' + durata + 'ms cubic-bezier(.16,1,.3,1)';
      linea.style.strokeDashoffset = '0';

      // ogni nodo si accende quando la linea lo raggiunge
      nodi.forEach(function (g, i) {
        var quando = 120 + (durata * (i / Math.max(1, nodi.length - 1))) * .82;
        setTimeout(function () { g.classList.add('is-on'); }, quando);
      });
    });

    return root;
  }

  /* ======================================================================
     2 · FILO
     ======================================================================
     Un filo verticale sottile che cresce. Le tappe sono righe di testo;
     una sola, quella di adesso, e' una card in rilievo. Cosi' l'occhio
     sa dove guardare anche con cinque tappe e testi lunghi.
     ====================================================================== */
  function filo(steps, opt) {
    var mini = !!opt.mini;
    var attiva = opt.attiva == null ? 0 : opt.attiva;

    var root = d('div', 'perc perc--filo' + (mini ? ' perc--mini' : ''));
    var rail = d('div', 'filo__rail');
    rail.appendChild(d('div', 'filo__crescita'));
    root.appendChild(rail);

    var lista = d('div', 'filo__lista');
    steps.forEach(function (st, i) {
      var stato = i < attiva ? 'fatto' : (i === attiva ? 'ora' : 'poi');
      var riga = d('div', 'filo__tappa filo__tappa--' + stato);
      riga.style.setProperty('--i', String(i));

      var punto = d('span', 'filo__punto');
      if (stato === 'fatto') punto.textContent = '✓';
      riga.appendChild(punto);

      var corpo = d('div', 'filo__corpo');
      corpo.appendChild(d('div', 'filo__nome', st.nome));
      if (!mini) {
        if (st.ruolo) corpo.appendChild(d('div', 'filo__meta', st.ruolo + (st.durata ? ' · ' + st.durata : '')));
        if (stato === 'ora' && st.obiettivo) corpo.appendChild(d('div', 'filo__obj', st.obiettivo));
      }
      riga.appendChild(corpo);
      lista.appendChild(riga);
    });
    root.appendChild(lista);

    alColpo(root, function () { root.classList.add('is-on'); });
    return root;
  }

  /* ======================================================================
     3 · CURVA
     ======================================================================
     Un arco unico che sale da oggi al traguardo, con le tappe appoggiate
     sopra. Dice "si sale" in un colpo d'occhio. Da usare quando conta
     la promessa, non l'elenco: i testi lunghi qui non ci stanno.
     ====================================================================== */
  function curva(steps, opt) {
    var mini = !!opt.mini;
    var W = 300, H = mini ? 130 : 190;
    var y0 = H - (mini ? 26 : 40), y1 = mini ? 24 : 34;

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

    // i pallini si appoggiano sulla curva, calcolati sul path vero
    var nodi = [];
    steps.forEach(function (st, i) {
      var g = s('g', { class: 'perc__nodo perc__nodo--' + (i === steps.length - 1 ? 'meta' : 'poi') });
      g.appendChild(s('circle', { class: 'perc__disco', r: i === steps.length - 1 ? 11 : 6 }));
      svg.appendChild(g);
      nodi.push(g);
    });

    var etichette = d('div', 'curva__et');
    etichette.appendChild(d('span', 'curva__oggi', 'Oggi'));
    etichette.appendChild(d('span', 'curva__meta', steps[steps.length - 1].nome));
    root.appendChild(etichette);

    alColpo(root, function () {
      var L = linea.getTotalLength();
      nodi.forEach(function (g, i) {
        var p = linea.getPointAtLength(L * (i / Math.max(1, nodi.length - 1)));
        g.querySelector('circle').setAttribute('cx', p.x);
        g.querySelector('circle').setAttribute('cy', p.y);
      });

      linea.style.strokeDasharray = L;
      linea.style.strokeDashoffset = L;
      void linea.getBoundingClientRect();
      linea.style.transition = 'stroke-dashoffset 1500ms cubic-bezier(.16,1,.3,1)';
      linea.style.strokeDashoffset = '0';

      nodi.forEach(function (g, i) {
        setTimeout(function () { g.classList.add('is-on'); },
          160 + 1500 * (i / Math.max(1, nodi.length - 1)) * .84);
      });
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
