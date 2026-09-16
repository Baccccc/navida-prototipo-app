/* ==========================================================================
   NAVIDA — Rendering delle schermate
   ========================================================================== */

(function () {
  'use strict';

  var S = window.NavidaState;
  var C = window.NAVIDA_CONTENT;
  var VAR = window.NAVIDA_VARIANTS;
  var PAGEVAR = window.NAVIDA_PAGE_VARIANTS;
  var PROF = window.NAVIDA_PROFESSIONI;

  /* ======================================================================
     UTILITY
     ====================================================================== */

  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
    }
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  /**
   * Icona Lucide.
   * Se la geometria è incorporata in icons.js, disegna l'SVG direttamente:
   * il tratto usa currentColor, quindi prende sempre il colore del contenitore
   * (su fondo blu diventa bianca da sola) e funziona anche senza rete.
   * Altrimenti lascia il segnaposto che il CDN Lucide sostituirà.
   */
  function icon(name, size) {
    size = size || 20;
    var geo = window.NAVIDA_ICONS && window.NAVIDA_ICONS[name];
    if (geo) {
      return h('span', {
        class: 'ico',
        'aria-hidden': 'true',
        style: 'width:' + size + 'px;height:' + size + 'px',
        html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
              'fill="none" stroke="currentColor" stroke-width="2" ' +
              'stroke-linecap="round" stroke-linejoin="round" ' +
              'width="' + size + '" height="' + size + '">' + geo + '</svg>'
      });
    }
    return h('i', { 'data-lucide': name, style: 'width:' + size + 'px;height:' + size + 'px' });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /** Sostituisce i segnaposto {campo} con le risposte dell'utente. */
  function interp(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, function (m, key) {
      var v = S.valore(key);
      if (v == null || v === '') {
        var def = {
          nome: 'tu',
          lavoroSogni: 'il ruolo che sogni',
          titoloStudio: 'il tuo titolo di studio',
          email: 'la tua email',
          ultimaPosizione: 'dove sei oggi',
          /* Nella versione finita questo passo lo scrive l'AI sul
             profilo della persona. Qui resta un testo di riserva. */
          primoPasso: 'un corso breve sulle competenze che ti mancano'
        };
        return def[key] || m;
      }
      return Array.isArray(v) ? v.join(', ') : String(v);
    });
  }

  /**
   * Testo modificabile dal team.
   * Se la schermata porta `kitTesti`, il testo del brand kit attivo
   * prende il posto di quello di partenza.
   * Se porta `varianteTesti`, vale lo stesso per la versione scelta di
   * un'altra schermata: con la registrazione "compatta" il nome si
   * chiede dopo, quindi "Piacere, {nome}!" diventa "Piacere di conoscerti!".
   */
  function T(screen, key, fallback) {
    var perKit = screen.kitTesti && screen.kitTesti[S.brandKit()];
    if (perKit && perKit[key] != null) fallback = perKit[key];
    if (screen.varianteTesti && window.NavidaApp) {
      Object.keys(screen.varianteTesti).forEach(function (id) {
        var perVar = screen.varianteTesti[id][window.NavidaApp.variante(id)];
        if (perVar && perVar[key] != null) fallback = perVar[key];
      });
    }
    return S.text(screen.id + '.' + key, fallback);
  }

  /** Crea un nodo di testo modificabile in modalità "Testi". */
  function editable(tag, cls, screen, key, fallback, opts) {
    opts = opts || {};
    var raw = T(screen, key, fallback);
    var node = h(tag, {
      class: cls,
      'data-editable': screen.id + '.' + key,
      text: opts.raw ? raw : interp(raw)
    });
    if (opts.variant) {
      node.setAttribute('data-varname', opts.variant);
      node.setAttribute('data-variant', variante(screen, opts.variant));
      applyVariantClass(node, opts.variant, screen);
    }
    return node;
  }

  /**
   * Variante di un elemento, in ordine di precedenza:
   * 1. la modifica del team (barra di modifica / server)
   * 2. la scelta scritta nella schermata:  varianti: { domanda: 'titolo' }
   * 3. la predefinita del gruppo in js/variants.js
   */
  function variante(screen, name, base) {
    var sua = screen && screen.varianti && screen.varianti[name];
    return S.variant(screen.id, name, sua || base || VAR[name].predefinita);
  }

  /** Alcune varianti agiscono su classi, non solo su data-variant. */
  function applyVariantClass(node, name, screen) {
    var v = variante(screen, name);
    if (name === 'title') {
      node.classList.toggle('title--left', v === 'left');
      node.classList.toggle('title--lg', v === 'lg');
    }
    if (name === 'cta') {
      node.classList.remove('btn--outline', 'btn--dark', 'btn--soft', 'btn--passivo', 'btn--transparent');
      if (v !== 'solid') node.classList.add('btn--' + v);
    }
  }

  /* ======================================================================
     ELEMENTI RIUSABILI
     ====================================================================== */

  function header(screen, progress) {
    var vName = variante(screen, 'progress');
    var bar;

    if (vName === 'dots') {
      var dots = [];
      var n = Math.min(progress.total, 24);
      for (var i = 0; i < n; i++) {
        dots.push(h('span', { class: 'dot' + (i < Math.round(progress.value * n) ? ' on' : '') }));
      }
      bar = h('div', { class: 'progress progress--dots' }, dots);
    } else if (vName === 'steps') {
      var segs = [];
      var m = Math.min(progress.total, 20);
      for (var j = 0; j < m; j++) {
        segs.push(h('span', { class: 'seg' + (j < Math.round(progress.value * m) ? ' on' : '') }));
      }
      bar = h('div', { class: 'progress progress--steps' }, segs);
    } else {
      bar = h('div', { class: 'progress' }, [
        h('div', { class: 'progress__fill', style: 'width:' + Math.round(progress.value * 100) + '%' })
      ]);
    }

    if (vName === 'hidden' || progress.hidden) bar.classList.add('progress--hidden');
    bar.setAttribute('data-varname', 'progress');

    // la barra sta in un contenitore centrato fra i due slot da 24px,
    // così resta esattamente al centro della schermata
    return h('div', { class: 'hdr' }, [
      h('button', {
        class: 'hdr__back',
        'aria-label': 'Indietro',
        hidden: !progress.canBack,
        onclick: function () { window.NavidaApp.back(); }
      }, [icon('chevron-left', 24)]),
      h('div', { class: 'hdr__center' }, [bar]),
      h('div', { class: 'hdr__slot' })
    ]);
  }

  function mascotte(screen, cls) {
    var v = variante(screen, 'mascotte');
    var pose = v === 'auto' ? (screen.mascotte || 'indicare') : v;
    if (v === 'nascosta' || (!screen.mascotte && v === 'auto')) return null;

    var wrap = h('div', {
      class: 'mascotte mascotte--float ' + (cls || '') +
             (screen.mascotteAnima ? ' mascotte--' + screen.mascotteAnima : ''),
      'data-varname': 'mascotte'
    });
    // rispetta le proporzioni native della posa
    var r = window.NavidaMascotte.ratio[pose];
    if (r) wrap.style.aspectRatio = String(r);
    wrap.appendChild(window.NavidaMascotte.elemento(pose));
    return wrap;
  }

  function cta(screen, label, onClick, disabled) {
    var b = h('button', {
      class: 'btn',
      'data-varname': 'cta',
      disabled: !!disabled,
      onclick: onClick
    }, [h('span', { 'data-editable': screen.id + '.cta', text: label })]);
    applyVariantClass(b, 'cta', screen);
    return b;
  }

  function optionsBox(screen, kids) {
    // la schermata può chiedere un suo stile di lista (es. "grid" per le card)
    var base = screen.listStyle || VAR.answerList.predefinita;
    var box = h('div', {
      class: 'options',
      'data-varname': 'answerList',
      'data-variant': variante(screen, 'answerList', base),
      'data-lato': variante(screen, 'latoControlli')
    }, kids);
    return box;
  }

  /* Pose "da domanda" per le schermate senza una mascotte scelta in
     content.js. Si pesca sempre la stessa per la stessa schermata,
     cosi' non cambia a ogni ridisegno. */
  var POSE_DOMANDA = ['pensare', 'non-so', 'lente-ingrandimento', 'indicare', 'megafono'];

  function posaDomanda(screen) {
    var n = 0, id = String(screen.id || '');
    for (var i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % 997;
    return POSE_DOMANDA[n % POSE_DOMANDA.length];
  }

  /**
   * Intestazione della domanda: titolo semplice oppure la mascotte
   * che te la chiede dentro un fumetto.
   */
  function intestazione(screen, extraCls) {
    var v = variante(screen, 'domanda');
    var titolo = editable('h1', 'title title--question ' + (extraCls || ''), screen, 'title', screen.title, { variant: 'title' });

    // la posa scelta dalla barra di modifica vince su quella del progetto
    var vm = variante(screen, 'mascotte');
    if (v !== 'mascotte' || vm === 'nascosta') {
      titolo.setAttribute('data-varname', 'domanda');
      return titolo;
    }
    var posa = (vm && vm !== 'auto') ? vm : (screen.mascotte || posaDomanda(screen));

    // le pose larghe (es. due astronauti) prendono un po' piu' di spazio
    var box = h('div', { class: 'ask__mascotte' }, [window.NavidaMascotte.elemento(posa)]);
    var r = window.NavidaMascotte.ratio[posa];
    if (r > 0.74) box.style.width = Math.min(Math.round(84 * r), 100) + 'px';

    titolo.classList.remove('title');
    titolo.classList.add('bubble__testo');
    return h('div', { class: 'ask', 'data-varname': 'domanda' }, [
      box,
      h('div', { class: 'bubble' }, [titolo])
    ]);
  }

  function toast(msg) {
    var host = document.querySelector('.device');
    var t = h('div', { class: 'toast', text: msg });
    host.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  /* ======================================================================
     SORTABLE — trascinamento con puntatore (funziona anche su mobile)
     ====================================================================== */

  function makeSortable(container, onEnd, opts) {
    opts = opts || {};
    container.classList.add('sortable');

    var selector = opts.itemSelector || '.opt';
    var dragging = null;
    var placeholder = null;
    var pointerId = null;
    var grabOffsetY = 0;
    var latestY = 0;
    var frame = 0;

    function righe() {
      return Array.prototype.slice.call(container.querySelectorAll(selector));
    }

    /* fotografa la posizione di ogni riga, per l'animazione FLIP */
    function foto() {
      return righe().map(function (n) {
        return { n: n, top: n.getBoundingClientRect().top };
      });
    }

    /* FLIP: le righe scavalcate partono da dov'erano e scivolano al
       posto nuovo. Senza questo il riordino e' uno scatto secco, ed e'
       il motivo per cui sembrava uno scambio di campi. */
    function scivola(prima) {
      prima.forEach(function (v) {
        if (v.n === dragging || !v.n.isConnected) return;
        var dy = v.top - v.n.getBoundingClientRect().top;
        if (!dy) return;
        v.n.style.transition = 'none';
        v.n.style.transform = 'translateY(' + dy + 'px)';
        requestAnimationFrame(function () {
          v.n.style.transition = 'transform 150ms var(--ease)';
          v.n.style.transform = '';
        });
      });
    }

    function solleva(item, e) {
      var rect = item.getBoundingClientRect();
      var host = container.getBoundingClientRect();

      dragging = item;
      pointerId = e.pointerId;
      latestY = e.clientY;
      grabOffsetY = e.clientY - rect.top;

      placeholder = h('div', { class: 'rankPlaceholder' });
      placeholder.style.height = rect.height + 'px';
      container.insertBefore(placeholder, item);

      item.classList.add('is-dragging');
      item.setAttribute('aria-grabbed', 'true');
      container.classList.add('is-sorting');
      item.style.position = 'absolute';
      item.style.left = (rect.left - host.left) + 'px';
      /* la lista scorre: la posizione assoluta va misurata sul contenuto,
         non sulla finestra, altrimenti la card salta appena la afferri */
      item.style.top = (rect.top - host.top + container.scrollTop) + 'px';
      item.style.width = rect.width + 'px';
      item.style.margin = '0';
      item.setPointerCapture && item.setPointerCapture(e.pointerId);
      attach();
    }

    function onDown(e) {
      if (S.mode || e.button > 0) return;
      var item = e.target.closest(selector);
      if (!item || !container.contains(item)) return;
      e.preventDefault();
      solleva(item, e);
      if (navigator.vibrate) navigator.vibrate(6);
    }

    function onMove(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      latestY = e.clientY;
      e.preventDefault();
      if (!frame) frame = requestAnimationFrame(aggiornaDrag);
    }

    function aggiornaDrag() {
      frame = 0;
      if (!dragging) return;

      var host = container.getBoundingClientRect();
      var hItem = dragging.getBoundingClientRect().height;
      var top = latestY - host.top - grabOffsetY + container.scrollTop;
      var max = Math.max(0, container.scrollHeight - hItem);
      dragging.style.top = Math.max(0, Math.min(max, top)) + 'px';

      var lista = righe().filter(function (n) { return n !== dragging; });
      var prima = foto();
      var inserito = false;

      for (var i = 0; i < lista.length; i++) {
        var q = lista[i].getBoundingClientRect();
        if (latestY < q.top + q.height / 2) {
          if (placeholder.nextSibling !== lista[i]) container.insertBefore(placeholder, lista[i]);
          inserito = true;
          break;
        }
      }
      if (!inserito && placeholder !== container.lastElementChild) container.appendChild(placeholder);
      scivola(prima);
    }

    function onUp(e) {
      if (!dragging || (e && e.pointerId !== pointerId)) return;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        aggiornaDrag();
      }

      var item = dragging;
      container.insertBefore(item, placeholder);
      placeholder.remove();
      placeholder = null;
      dragging = null;
      pointerId = null;
      container.classList.remove('is-sorting');
      item.classList.remove('is-dragging');
      item.setAttribute('aria-grabbed', 'false');
      item.style.position = '';
      item.style.left = '';
      item.style.top = '';
      item.style.width = '';
      item.style.margin = '';

      detach();
      onEnd(righe().map(function (n) {
        return parseInt(n.getAttribute('data-oi'), 10);
      }));
    }

    // i listener globali vivono solo durante il trascinamento,
    // così non si accumulano a ogni render
    function attach() {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }
    function detach() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    }

    container.addEventListener('pointerdown', function (e) {
      onDown(e);
    });
  }

  /* ======================================================================
     RISOLUZIONE DELLE OPZIONI
     ====================================================================== */

  function resolveOptions(screen) {
    if (screen.optionsFrom === 'professioni') {
      return PROF.map(function (c) { return { label: c.nome, value: c.id }; });
    }
    if (screen.optionsFrom === 'mansioni') {
      // la categoria può essere una sola o più d'una
      var sel = S.answer('categoria');
      var ids = Array.isArray(sel) ? sel : (sel ? [sel] : []);
      var out = [];
      ids.forEach(function (id) {
        var cat = PROF.filter(function (c) { return c.id === id; })[0];
        if (!cat) return;
        cat.mansioni.forEach(function (m) {
          if (out.indexOf(m) === -1) out.push(m);
        });
      });
      if (!out.length) {
        return [{ label: 'Nessun ruolo per il settore scelto', value: '__altro', disabled: true }];
      }
      return out.map(function (m) { return { label: m, value: m }; });
    }
    return (screen.options || []).slice();
  }

  /** Testo di un'opzione tenendo conto delle modifiche del team. */
  function optLabel(screen, originalIndex, fallback) {
    return S.text(screen.id + '.opt.' + originalIndex, fallback);
  }

  /* ======================================================================
     TIPI DI SCHERMATA
     ====================================================================== */

  var Screens = {};

  /* --- splash: caricamento iniziale, stile Duolingo -------------------- */
  Screens.splash = function (screen) {
    var variant = S.pageVariant(screen.id, PAGEVAR.splash.predefinita);
    var root = h('div', { class: 'splash splash--' + variant }, [
      h('div', { class: 'splash__art' }, [window.NavidaMascotte.elemento(screen.mascotte || 'volare')]),
      editable('div', 'splash__wordmark', screen, 'title', screen.title)
    ]);

    var t = setTimeout(function () { window.NavidaApp.next(); }, screen.durata || 2000);
    window.NavidaApp._pending = t;
    root.addEventListener('click', function () { clearTimeout(t); window.NavidaApp.next(); });

    return root;
  };

  /* --- hero: cinque versioni della schermata di apertura --------------- */
  Screens.hero = function (screen) {
    var variant = S.pageVariant(screen.id, PAGEVAR.welcome.predefinita);
    var root = h('div', { class: 'hero hero--' + variant });

    /* eyebrow, marchio e payoff formano un blocco unico, con spaziature
       strette fra loro: così il testo si legge come una cosa sola */
    function blocco(classeMarchio) {
      return h('div', { class: 'hero__testi' }, [
        screen.eyebrow ? editable('div', 'hero__eyebrow', screen, 'eyebrow', screen.eyebrow) : null,
        editable('h1', classeMarchio || 'hero__title', screen, 'title', screen.title),
        editable('p', 'hero__sub', screen, 'body', screen.body)
      ].filter(Boolean));
    }

    function testi() { return [blocco()]; }

    function azioni(secondarioPieno) {
      var box = h('div', { class: 'hero__cta' }, [
        cta(screen, T(screen, 'cta', screen.cta), function () { window.NavidaApp.next(); })
      ]);
      if (screen.footerLink) {
        // stile Duolingo: secondo pulsante con contorno, non un link
        box.appendChild(h('button', {
          class: secondarioPieno ? 'btn btn--outline' : 'linkbtn linkbtn--azione',
          'data-editable': screen.id + '.footerLink',
          onclick: function () {
            if (S.mode) return;
            window.NavidaApp.goTo(screen.footerTarget);
          }
        }, [h('span', { text: T(screen, 'footerLink', screen.footerLink) })]));
      }
      return box;
    }

    if (variant === 'marchio') {
      /* stile Duolingo: mascotte, marchio, payoff, due pulsanti in basso */
      root.appendChild(h('div', { class: 'hero__stack' }, [
        mascotte(screen),
        blocco('hero__wordmark')
      ]));
      root.appendChild(azioni(true));
      return root;
    }

    if (variant === 'grande') {
      /* mascotte a tutta larghezza in alto, testo e pulsanti sotto */
      root.appendChild(h('div', { class: 'hero__big' }, [mascotte(screen)]));
      root.appendChild(h('div', { class: 'hero__stack' }, [blocco('hero__wordmark')]));
      root.appendChild(azioni(true));
      return root;
    }

    if (variant === 'split') {
      /* copertina colorata in alto, card bianca in basso */
      root.appendChild(h('div', { class: 'hero__cover' }, [mascotte(screen)]));
      root.appendChild(h('div', { class: 'hero__card' }, testi().concat([azioni()])));

    } else if (variant === 'dark') {
      /* notturna: fondo indigo, mascotte grande, testo chiaro */
      root.appendChild(h('div', { class: 'hero__glow' }));
      var m = mascotte(screen);
      if (m) root.appendChild(m);
      testi().forEach(function (n) { root.appendChild(n); });
      root.appendChild(azioni());

    } else {
      /* alone lavanda: la versione di partenza */
      var m2 = mascotte(screen);
      if (m2) root.appendChild(m2);
      testi().forEach(function (n) { root.appendChild(n); });
      root.appendChild(azioni());
    }

    return root;
  };

  /* --- info: le schermate di racconto (mascotte + testo) --------------
     Tre disegni, scelti dalla variante "intro" (js/variants.js). Il
     riferimento e' il modo in cui Duolingo racconta l'onboarding:

       fumetto  frase corta dentro un fumetto, mascotte sotto
       sopra    mascotte in alto, testo sotto, tutto centrato
       elenco   mascotte piccola col fumetto di fianco, poi i punti

     "auto" sceglie da sola guardando cosa contiene la schermata.
     "classica" e' il disegno di prima, tenuto per confronto. */

  /** Quale disegno usare quando la variante e' "auto". */
  function introAuto(screen) {
    if (screen.lista || screen.listaNum || screen.paragrafi) return 'elenco';
    if (screen.percorso || !screen.mascotte) return 'sopra';
    var titolo = T(screen, 'title', screen.title) || '';
    var testo = T(screen, 'body', screen.body) || '';
    /* oltre questa lunghezza il fumetto diventa un muro di testo */
    return (titolo.length + testo.length) > 120 ? 'sopra' : 'fumetto';
  }

  /** Lista, elenco numerato e paragrafi diventano tutti "punti". */
  function introPunti(screen) {
    var punti = [];
    (screen.lista || []).forEach(function (item, i) {
      var k = screen.id + '.lista.' + i;
      var ico = (screen.listaIcone || [])[i];
      punti.push({ forte: S.text(k, item), testo: '', keyForte: k, ico: ico });
    });
    (screen.listaNum || []).forEach(function (item, i) {
      var kf = screen.id + '.listaNum.' + i + '.forte';
      var kt = screen.id + '.listaNum.' + i + '.testo';
      /* niente numeri: ogni passaggio ha la sua icona (campo ico) */
      punti.push({
        forte: S.text(kf, item.forte), testo: S.text(kt, item.testo),
        keyForte: kf, keyTesto: kt, ico: item.ico || 'sparkles'
      });
    });
    (screen.paragrafi || []).forEach(function (item, i) {
      var pf = screen.id + '.paragrafi.' + i + '.forte';
      var pt = screen.id + '.paragrafi.' + i + '.testo';
      punti.push({
        forte: S.text(pf, item.forte), testo: S.text(pt, item.testo),
        keyForte: pf, keyTesto: pt, ico: item.ico
      });
    });
    return punti;
  }

  /**
   * L'elenco a icone: quadratino colorato, titolo in grassetto e
   * descrizione sotto. Lo usano le schermate di racconto e i consigli
   * della prima proiezione, cosi' il codice visivo resta uno solo.
   */
  /* Icone di riserva per l'elenco, tutte Lucide gia' in js/icons.js.
     Servono quando un punto non ha l'icona, o ne ha una gia' usata
     sulla stessa pagina: nella stessa schermata un'icona non si ripete. */
  var ICONE_RISERVA = ['sparkles', 'target', 'lightbulb', 'compass', 'trending-up',
                       'heart', 'users', 'eye', 'leaf', 'sun', 'layers', 'smile'];

  function elencoIcone(punti) {
    var usate = {};
    punti.forEach(function (p) {
      if (p.ico && window.NAVIDA_ICONS[p.ico] && !usate[p.ico]) usate[p.ico] = p;
    });
    punti.forEach(function (p) {
      if (p.ico && usate[p.ico] === p) return;
      var libera = ICONE_RISERVA.filter(function (n) { return !usate[n] && window.NAVIDA_ICONS[n]; })[0];
      p.ico = libera || 'check';
      usate[p.ico] = p;
    });

    return h('ul', { class: 'oblist' }, punti.map(function (p, i) {
      var segno = icon(p.ico, 20);

      var testi = [h('strong', {
        class: 'oblist__forte',
        'data-editable': p.keyForte,
        text: interp(p.forte)
      })];
      if (p.testo) {
        testi.push(h('span', {
          class: 'oblist__testo',
          'data-editable': p.keyTesto,
          text: interp(p.testo)
        }));
      }

      return h('li', {
        class: 'oblist__item',
        style: 'animation-delay:' + (140 + i * 120) + 'ms'
      }, [
        h('span', { class: 'oblist__ico', 'data-tema': String((i % 5) + 1) }, [segno]),
        h('div', { class: 'oblist__txt' }, testi)
      ]);
    }));
  }

  /** Anteprima corta della linea di carriera (la usa ob3). */
  function introPercorso(screen, body) {
    if (!screen.percorso || !window.NavidaPercorso) return;
    var stile = variante(screen, 'path');
    if (NavidaPercorso.modi.indexOf(stile) === -1) stile = 'serpentina';
    var mini = NavidaPercorso.disegna(screen.percorso, {
      variante: stile,
      mini: true,
      attiva: screen.percorsoAttiva == null ? 1 : screen.percorsoAttiva
    });
    mini.setAttribute('data-varname', 'path');
    mini.setAttribute('data-variant', stile);
    body.appendChild(mini);
  }

  /** 1 - Fumetto sopra la mascotte, tutto al centro della schermata. */
  function introFumetto(screen) {
    var body = h('div', { class: 'body body--ob ob ob--fumetto' });
    var bolla = h('div', { class: 'ob__bolla' }, [
      editable('h1', 'ob__title', screen, 'title', screen.title, { variant: 'title' })
    ]);
    if (T(screen, 'body', screen.body)) {
      bolla.appendChild(editable('p', 'ob__lead', screen, 'body', screen.body));
    }
    body.appendChild(bolla);

    var m = mascotte(screen);
    if (m) { m.classList.add('ob__mascotte'); body.appendChild(m); }
    return body;
  }

  /** 2 - Mascotte in alto, occhiello e testo sotto, tutto centrato. */
  function introSopra(screen) {
    var body = h('div', { class: 'body body--ob ob ob--sopra' });

    var m = mascotte(screen);
    if (m) { m.classList.add('ob__mascotte'); body.appendChild(m); }

    if (screen.eyebrow) body.appendChild(editable('div', 'eyebrow', screen, 'eyebrow', screen.eyebrow));
    body.appendChild(editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }));
    if (T(screen, 'body', screen.body)) {
      body.appendChild(editable('p', 'lead', screen, 'body', screen.body));
    }
    introPercorso(screen, body);
    return body;
  }

  /** 3 - Mascotte piccola col fumetto di fianco, poi l'elenco a icone. */
  function introElenco(screen) {
    var body = h('div', { class: 'body body--ob ob ob--elenco' });

    var riga = h('div', { class: 'ob__riga' });
    var m = mascotte(screen);
    if (m) { m.classList.add('ob__mini'); riga.appendChild(m); }
    riga.appendChild(h('div', { class: 'ob__bolla ob__bolla--riga' }, [
      editable('h1', 'ob__title', screen, 'title', screen.title, { variant: 'title' })
    ]));
    body.appendChild(riga);

    var punti = introPunti(screen);
    if (punti.length) body.appendChild(elencoIcone(punti));

    if (T(screen, 'body', screen.body)) {
      body.appendChild(editable('p', 'lead lead--left', screen, 'body', screen.body));
    }
    introPercorso(screen, body);
    return body;
  }

  /** 4 - Il disegno di prima, tenuto per confronto. */
  function introClassica(screen) {
    var body = h('div', { class: 'body body--center' });

    var m = mascotte(screen);
    if (m && screen.id === 'tuoMomento') {
      var momentoVariant = S.pageVariant(screen.id, PAGEVAR.tuoMomento.predefinita);
      var momentoArt = h('div', {
        class: 'momentoArt momentoArt--' + momentoVariant
      }, [
        h('span', { class: 'momentoArt__glow', 'aria-hidden': 'true' }),
        h('span', { class: 'momentoArt__orbit', 'aria-hidden': 'true' }),
        h('span', { class: 'momentoArt__gate momentoArt__gate--left', 'aria-hidden': 'true' }),
        h('span', { class: 'momentoArt__gate momentoArt__gate--right', 'aria-hidden': 'true' })
      ]);
      m.classList.add('momentoArt__mascotte');
      momentoArt.appendChild(m);
      body.appendChild(momentoArt);
    } else if (m) {
      body.appendChild(m);
    }

    if (screen.eyebrow) body.appendChild(editable('div', 'eyebrow', screen, 'eyebrow', screen.eyebrow));
    body.appendChild(editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }));

    if (screen.lista) {
      var ul = h('ul', { class: 'listPlain' }, screen.lista.map(function (item, i) {
        return h('li', {}, [
          h('span', { class: 'ico' }, [icon('check', 16)]),
          h('span', { 'data-editable': screen.id + '.lista.' + i, text: S.text(screen.id + '.lista.' + i, item) })
        ]);
      }));
      body.appendChild(ul);
    }

    /* elenco numerato: "1. Titolo in grassetto. Testo che segue." */
    if (screen.listaNum) {
      var ol = h('ol', { class: 'listNum' }, screen.listaNum.map(function (item, i) {
        return h('li', {}, [
          h('span', { class: 'listNum__n', text: (i + 1) + '.' }),
          h('span', { class: 'listNum__txt' }, [
            h('strong', { 'data-editable': screen.id + '.listaNum.' + i + '.forte', text: S.text(screen.id + '.listaNum.' + i + '.forte', item.forte) }),
            document.createTextNode(' '),
            h('span', { 'data-editable': screen.id + '.listaNum.' + i + '.testo', text: S.text(screen.id + '.listaNum.' + i + '.testo', item.testo) })
          ])
        ]);
      }));
      body.appendChild(ol);
    }

    /* paragrafi con attacco in grassetto */
    if (screen.paragrafi) {
      screen.paragrafi.forEach(function (item, i) {
        body.appendChild(h('p', { class: 'lead lead--left' }, [
          h('strong', { 'data-editable': screen.id + '.paragrafi.' + i + '.forte', text: S.text(screen.id + '.paragrafi.' + i + '.forte', item.forte) }),
          document.createTextNode(' '),
          h('span', { 'data-editable': screen.id + '.paragrafi.' + i + '.testo', text: S.text(screen.id + '.paragrafi.' + i + '.testo', item.testo) })
        ]));
      });
    }

    if (T(screen, 'body', screen.body)) body.appendChild(editable('p', 'lead', screen, 'body', screen.body));
    introPercorso(screen, body);
    return body;
  }

  Screens.info = function (screen, progress) {
    var stile = variante(screen, 'intro');
    /* "Ora tocca a te" ha la sua animazione: resta com'era */
    if (screen.id === 'tuoMomento') stile = 'classica';
    if (stile === 'auto') stile = introAuto(screen);

    var body =
      stile === 'fumetto' ? introFumetto(screen) :
      stile === 'elenco' ? introElenco(screen) :
      stile === 'sopra' ? introSopra(screen) :
      introClassica(screen);

    body.setAttribute('data-varname', 'intro');
    body.setAttribute('data-variant', stile);

    if (screen.nota) body.appendChild(editable('p', 'nota', screen, 'nota', screen.nota));

    return [
      header(screen, progress),
      body,
      h('div', { class: 'footer' }, [
        cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () { window.NavidaApp.next(); })
      ])
    ];
  };

  /* --- domande a scelta (single / singleCta / singleInfo / multi) ----- */
  function choiceScreen(screen, progress) {
    var type = screen.type;
    var isMulti = type === 'multi';
    var hasCta = isMulti || type === 'singleCta' || type === 'singleInfo' || type === 'singleText' || !!screen.cta;
    var raw = resolveOptions(screen);

    // indice originale conservato per riordino e modifica testo
    var indexed = raw.map(function (o, i) { return { o: o, i: i }; });
    var ordered = S.ordered(screen.id, indexed);

    var current = S.answer(screen.field, isMulti ? [] : null);
    if (isMulti && !Array.isArray(current)) current = [];

    var textValues = S.answer(screen.field + '__testo', {}) || {};
    var ctaBtn = null;
    var searchTerm = '';

    var box = optionsBox(screen, []);

    function isSel(val) {
      return isMulti ? current.indexOf(val) !== -1 : current === val;
    }

    function refreshCta() {
      if (!ctaBtn) return;
      var ok = isMulti ? current.length > 0 : current != null;
      ctaBtn.disabled = !ok;
    }

    /* i bottoni disegnati adesso: servono alle schermate con la riga di
       info, che cambiano scelta senza ridisegnare tutta la lista */
    var nodi = [];

    function paint() {
      box.innerHTML = '';
      nodi = [];
      ordered.forEach(function (entry) {
        var o = entry.o;
        var oi = entry.i;
        var label = optLabel(screen, oi, o.label);
        var val = o.value != null ? o.value : label;

        if (searchTerm && label.toLowerCase().indexOf(searchTerm) === -1) return;

        var selected = isSel(val);
        var kids = [];

        if (isMulti) {
          kids.push(h('span', { class: 'opt__check' }, selected ? [icon('check', 12)] : []));
        }
        // icona opzionale: usata dalla variante "Card con icone"
        if (o.ico) kids.push(h('span', { class: 'opt__ico' }, [icon(o.ico, 20)]));

        var col = h('div', { class: 'opt__col' }, [
          h('span', { class: 'opt__label', 'data-editable': screen.id + '.opt.' + oi, text: label })
        ]);
        if (o.hint) col.appendChild(h('span', { class: 'opt__hint', text: o.hint }));
        if (type === 'singleInfo' && o.info) {
          col.appendChild(h('span', { class: 'opt__info' }, [
            h('span', {
              class: 'opt__info__testo',
              'data-editable': screen.id + '.info.' + oi,
              text: S.text(screen.id + '.info.' + oi, o.info)
            })
          ]));
        }
        kids.push(col);
        if (o.chip) kids.push(h('span', { class: 'opt__chip', text: o.chip }));

        var node = h('button', {
          class: 'opt' + (selected ? ' is-selected' : '') + (o.disabled ? ' is-disabled' : ''),
          'data-oi': oi,
          type: 'button'
        }, kids);

        if (type === 'singleText' && o.allowText && selected) {
          var inp = h('input', {
            class: 'opt__inlineInput',
            placeholder: o.textPlaceholder || C.ui.scriviQui,
            value: textValues[val] || ''
          });
          inp.addEventListener('input', function () {
            textValues[val] = inp.value;
            S.setAnswer(screen.field + '__testo', textValues);
          });
          inp.addEventListener('click', function (e) { e.stopPropagation(); });
          node.appendChild(inp);
          node.style.flexDirection = 'column';
          node.style.alignItems = 'stretch';
          setTimeout(function () { inp.focus(); }, 60);
        }

        node.addEventListener('click', function () {
          if (S.mode === 'text' || S.mode === 'order' || S.mode === 'pick') return;
          if (o.disabled) { toast(o.chip ? 'Presto disponibile.' : 'Non ancora attivo.'); return; }

          if (isMulti) {
            var k = current.indexOf(val);
            if (k === -1) current.push(val); else current.splice(k, 1);
            S.setAnswer(screen.field, current);
            paint(); refreshCta();
          } else {
            current = val;
            S.setAnswer(screen.field, current);
            if (screen.optionsFrom === 'professioni') S.setAnswer('categoria', val);
            if (type === 'singleInfo') {
              /* niente ridisegno: la riga di info si apre e si chiude
                 con la transizione, invece di comparire di scatto */
              nodi.forEach(function (r) { r.n.classList.toggle('is-selected', r.val === current); });
              refreshCta();
            } else {
              paint(); refreshCta();
            }
            if (!hasCta) setTimeout(function () { window.NavidaApp.next(); }, 190);
          }
        });

        if (type === 'singleInfo') nodi.push({ n: node, val: val });
        box.appendChild(node);
      });

      if (!box.children.length) {
        box.appendChild(h('p', { class: 'nota', text: C.ui.nessunRisultato }));
      }

      if (S.mode === 'order') {
        makeSortable(box, function (order) {
          // order = indici originali nella nuova sequenza
          S.setOrder(screen.id, order);
          ordered = order.map(function (i) { return indexed[i]; });
        });
      }
    }

    var body = h('div', { class: 'body' });
    var testa = intestazione(screen);
    body.appendChild(testa);
    if (screen.body) body.appendChild(editable('p', 'lead', screen, 'body', screen.body));
    if (isMulti && !screen.body) body.appendChild(h('p', { class: 'nota', text: C.ui.sceltaMultiplaHint }));

    if (screen.searchable) {
      var s = h('div', { class: 'search' }, [
        h('span', { class: 'search__icon' }, [icon('search', 16)]),
        h('input', { placeholder: 'Cerca…', type: 'search' })
      ]);
      s.querySelector('input').addEventListener('input', function (e) {
        searchTerm = e.target.value.trim().toLowerCase();
        paint();
      });
      body.appendChild(s);
    }

    body.appendChild(box);
    if (screen.nota) body.appendChild(editable('p', 'nota', screen, 'nota', screen.nota));

    var footer = h('div', { class: 'footer' });
    if (hasCta) {
      ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () { window.NavidaApp.next(); }, true);
      footer.appendChild(ctaBtn);
      refreshCta();
    }
    if (screen.footerLink) {
      footer.appendChild(h('button', {
        class: 'linkbtn linkbtn--azione',
        'data-editable': screen.id + '.footerLink',
        text: T(screen, 'footerLink', screen.footerLink),
        onclick: function () {
          if (S.mode) return;
          window.NavidaApp.goTo(screen.footerTarget);
        }
      }));
    }

    /* Senza pulsante il footer resta vuoto: non va messo in pagina,
       altrimenti si mangia lo spazio in fondo e la lista delle risposte
       viene tagliata prima del bordo dello sfondo. */
    if (!hasCta) box.classList.add('options--pieno');

    paint();
    return [header(screen, progress), body, footer.children.length ? footer : null];
  }

  Screens.single = choiceScreen;
  Screens.singleCta = choiceScreen;
  Screens.singleInfo = choiceScreen;
  Screens.singleText = choiceScreen;
  Screens.multi = choiceScreen;

  /* --- ordinamento ---------------------------------------------------- */
  Screens.rank = function (screen, progress) {
    var raw = resolveOptions(screen);
    var indexed = raw.map(function (o, i) { return { o: o, i: i }; });
    var start = S.answer(screen.field, null);
    var seq = start && start.length === indexed.length
      ? start.map(function (i) { return indexed[i]; })
      : S.ordered(screen.id, indexed);

    var modo = variante(screen, 'rank');

    function salva(order) {
      S.setAnswer(screen.field, order);
      if (S.mode === 'order') S.setOrder(screen.id, order);
    }

    /* ---------------------------------------------------------------
       1 · TRASCINAMENTO — si trascina la card, non la riga intera.
       I numeri stanno in una colonna a sinistra, fuori da cio' che si
       muove: sono le posizioni della classifica, non un'etichetta della
       risposta. Premendo sui numeri si scorre la pagina, cosi' da
       telefono la lista si puo' leggere tutta senza riordinarla per
       sbaglio. Le due colonne sono tenute in riga da una griglia, cosi'
       restano allineate anche quando un'etichetta va a capo.
       --------------------------------------------------------------- */
    function costruisciManiglia() {
      var box = optionsBox(screen, []);
      box.classList.add('rankList');

      function paint() {
        box.innerHTML = '';
        /* prima la colonna dei numeri: sta in griglia a riga fissa e non
           viene mai riordinata, quindi non serve rinumerarla dopo */
        seq.forEach(function (entry, pos) {
          box.appendChild(h('span', {
            class: 'opt__pos',
            'aria-hidden': 'true',
            style: 'grid-row:' + (pos + 1),
            text: String(pos + 1)
          }));
        });
        /* poi le card, che sono le uniche cose che si trascinano */
        seq.forEach(function (entry) {
          box.appendChild(h('div', {
            class: 'opt opt--rank',
            'data-oi': entry.i,
            'aria-grabbed': 'false'
          }, [
            h('span', { class: 'opt__grip', 'aria-hidden': 'true' }, [icon('grip-vertical', 16)]),
            h('span', {
              class: 'opt__label',
              'data-editable': screen.id + '.opt.' + entry.i,
              text: optLabel(screen, entry.i, entry.o.label)
            })
          ]));
        });
      }
      paint();

      makeSortable(box, function (order) {
        seq = order.map(function (i) { return indexed[i]; });
        salva(order);
      }, { itemSelector: '.opt--rank' });

      return h('div', { class: 'rankWrap' }, [box]);
    }

    /* ---------------------------------------------------------------
       2 · PODIO — in alto le caselle numerate vuote, sotto le risposte
       ancora libere. Un tocco le fa salire. Nessun trascinamento, quindi
       da telefono non c'e' niente che possa non funzionare.
       --------------------------------------------------------------- */
    function costruisciPodio() {
      var scelti = [];                    // entry gia' messe in classifica
      var slots = h('div', { class: 'podio' });
      var pool = h('div', { class: 'podio__pool' });

      function aggiorna() {
        slots.innerHTML = '';
        indexed.forEach(function (_, pos) {
          var entry = scelti[pos];
          var vuoto = !entry;
          var slot = h('button', {
            class: 'podioSlot' + (vuoto ? ' is-vuoto' : ''),
            type: 'button',
            disabled: vuoto,
            'aria-label': vuoto
              ? 'Posizione ' + (pos + 1) + ', ancora vuota'
              : 'Togli ' + optLabel(screen, entry.i, entry.o.label) + ' dalla posizione ' + (pos + 1),
            onclick: function () {
              if (vuoto) return;
              scelti.splice(pos, 1);
              aggiorna();
            }
          }, [
            h('span', { class: 'podioSlot__n', text: String(pos + 1) }),
            vuoto
              ? h('span', { class: 'podioSlot__vuoto' })
              : h('span', { class: 'podioSlot__label', text: optLabel(screen, entry.i, entry.o.label) }),
            vuoto ? null : h('span', { class: 'podioSlot__x' }, [icon('x', 14)])
          ].filter(Boolean));
          slots.appendChild(slot);
        });

        pool.innerHTML = '';
        var liberi = indexed.filter(function (e) { return scelti.indexOf(e) === -1; });
        if (!liberi.length) {
          pool.appendChild(h('p', { class: 'nota', text: 'Fatto. Tocca una posizione per cambiarla.' }));
        }
        liberi.forEach(function (entry) {
          pool.appendChild(h('button', {
            class: 'podioVoce',
            type: 'button',
            onclick: function () {
              scelti.push(entry);
              salva(scelti.map(function (e) { return e.i; }));
              aggiorna();
            }
          }, [
            h('span', {
              class: 'opt__label',
              'data-editable': screen.id + '.opt.' + entry.i,
              text: optLabel(screen, entry.i, entry.o.label)
            }),
            h('span', { class: 'podioVoce__piu' }, [icon('arrow-up', 16)])
          ]));
        });
      }
      aggiorna();

      return h('div', { class: 'podioWrap' }, [slots, pool]);
    }

    /* ---------------------------------------------------------------
       3 · TOCCA IN ORDINE — si toccano le risposte dalla piu' importante
       alla meno. Ogni tocco appiccica un numero e porta la riga in alto,
       con lo scivolamento FLIP. Un secondo tocco la libera.
       --------------------------------------------------------------- */
    function costruisciTocca() {
      var scelti = [];
      var box = optionsBox(screen, []);

      function ordine() {
        var resto = indexed.filter(function (e) { return scelti.indexOf(e) === -1; });
        return scelti.concat(resto);
      }

      function aggiorna(animato) {
        var prima = animato
          ? Array.prototype.slice.call(box.children).map(function (n) {
              return { n: n, top: n.getBoundingClientRect().top, oi: n.getAttribute('data-oi') };
            })
          : null;

        box.innerHTML = '';
        ordine().forEach(function (entry) {
          var pos = scelti.indexOf(entry);
          var attivo = pos > -1;
          box.appendChild(h('button', {
            class: 'opt opt--tocca' + (attivo ? ' is-on' : ''),
            type: 'button',
            'data-oi': entry.i,
            'aria-pressed': attivo ? 'true' : 'false',
            onclick: function () {
              if (attivo) scelti.splice(pos, 1);
              else scelti.push(entry);
              salva(scelti.map(function (e) { return e.i; }));
              aggiorna(true);
            }
          }, [
            h('span', { class: 'toccaN', text: attivo ? String(pos + 1) : '' }),
            h('span', {
              class: 'opt__label',
              'data-editable': screen.id + '.opt.' + entry.i,
              text: optLabel(screen, entry.i, entry.o.label)
            })
          ]));
        });

        if (!prima) return;
        // FLIP: ogni riga parte da dov'era e scivola al posto nuovo
        Array.prototype.forEach.call(box.children, function (n) {
          var vecchia = null;
          prima.forEach(function (v) { if (v.oi === n.getAttribute('data-oi')) vecchia = v; });
          if (!vecchia) return;
          var dy = vecchia.top - n.getBoundingClientRect().top;
          if (!dy) return;
          n.style.transition = 'none';
          n.style.transform = 'translateY(' + dy + 'px)';
          void n.offsetHeight;
          n.style.transition = 'transform 260ms var(--ease)';
          n.style.transform = '';
        });
      }
      aggiorna(false);

      return box;
    }

    var lista = modo === 'podio' ? costruisciPodio()
              : modo === 'tocca' ? costruisciTocca()
              : costruisciManiglia();

    var hint = modo === 'podio' ? C.ui.ordinaHintPodio
             : modo === 'tocca' ? C.ui.ordinaHintTocca
             : C.ui.ordinaHint;

    var body = h('div', { class: 'body body--rank' }, [
      h('div', { class: 'rankHead' }, [
        intestazione(screen, 'title--rank'),
        screen.eyebrow ? editable('div', 'eyebrow eyebrow--sub', screen, 'eyebrow', screen.eyebrow) : null,
        screen.body ? editable('p', 'lead', screen, 'body', screen.body) : null
      ].filter(Boolean)),
      h('p', { class: 'nota', text: hint }),
      lista
    ].filter(Boolean));

    return [
      header(screen, progress),
      body,
      h('div', { class: 'footer' }, [
        cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () {
          if (!S.answer(screen.field)) {
            S.setAnswer(screen.field, seq.map(function (e) { return e.i; }));
          }
          window.NavidaApp.next();
        })
      ])
    ];
  };

  /* --- testo libero --------------------------------------------------- */
  Screens.text = function (screen, progress) {
    var value = S.answer(screen.field, '');
    var ctaBtn;

    // sempre un textarea: il testo lungo va a capo invece di uscire
    var input = h('textarea', {
      class: screen.multiline ? 'field__input' : 'bigInput',
      rows: '1',
      placeholder: screen.placeholder || C.ui.scriviQui,
      inputmode: screen.inputMode || 'text',
      style: screen.multiline ? 'min-height:140px' : ''
    });
    input.value = value;

    function autoGrow() {
      if (screen.multiline) return;
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }

    input.addEventListener('input', function () {
      value = input.value;
      S.setAnswer(screen.field, value);
      if (ctaBtn) ctaBtn.disabled = !value.trim();
      autoGrow();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !screen.multiline) {
        e.preventDefault();
        if (value.trim()) window.NavidaApp.next();
      }
    });

    window.NavidaKeyboard.attach(input, ['Marco', 'Bac', 'Ciao']);
    /* Il campo NON prende il fuoco da solo: su computer bloccava le
       frecce per passare da una schermata all'altra. */
    setTimeout(function () { try { autoGrow(); } catch (e) {} }, 1000);

    // i campi di testo stanno in alto, come tutte le altre schermate
    var body = h('div', { class: 'body' }, [
      editable('h1', 'title title--question', screen, 'title', screen.title, { variant: 'title' }),
      screen.body ? editable('p', 'lead', screen, 'body', screen.body) : null,
      input,
      screen.nota ? editable('p', 'nota', screen, 'nota', screen.nota) : null
    ].filter(Boolean));

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () { window.NavidaApp.next(); }, !value.trim());

    return [header(screen, progress), body, h('div', { class: 'footer' }, [ctaBtn])];
  };

  /* --- sezione ludica: anelli rotanti + campo centrale ---------------- */
  Screens.dream = function (screen, progress) {
    var value = S.answer(screen.field, '');
    var ctaBtn;
    /* Una scelta salvata prima puo' puntare a una versione tolta:
       in quel caso si torna alla predefinita. */
    var sceltaSogno = PAGEVAR.lavoroSogni;
    var variant = S.pageVariant(screen.id, sceltaSogno.predefinita);
    if (!sceltaSogno.options.some(function (o) { return o.value === variant; })) {
      variant = sceltaSogno.predefinita;
    }

    var frase = T(screen, 'frase', screen.frase);
    var art = window.NavidaWow.sogno(frase, variant);
    art.classList.add('dreamArt--enter');

    /* Nelle versioni nuove la domanda non e' piu' solo disegnata dentro
       l'animazione: e' un titolo vero, quindi si legge anche con un
       lettore di schermo e si modifica dalla scheda "Testi". */
    var domanda = window.NavidaWow.domandaVisibile(variant)
      ? h('h1', { class: 'dream__q', 'data-editable': screen.id + '.frase', text: frase })
      : null;

    var input = h('textarea', {
      class: 'dream__input',
      rows: '1',
      placeholder: T(screen, 'placeholder', screen.placeholder)
    });
    input.value = value;

    function autoGrow() {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }

    input.addEventListener('input', function () {
      value = input.value;
      S.setAnswer(screen.field, value);
      if (ctaBtn) ctaBtn.disabled = !value.trim();
      autoGrow();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (value.trim()) avanti(); }
    });

    window.NavidaKeyboard.attach(input, ['Direttore creativo', 'Sviluppatore', 'Chef']);

    /* Nebulosa: toccare un mestiere che fluttua lo scrive nel campo.
       Serve a chi resta bloccato davanti al foglio bianco. */
    if (variant === 'nebulosa') {
      art.addEventListener('click', function (e) {
        var scelto = e.target.closest && e.target.closest('[data-mestiere]');
        if (!scelto) return;
        input.value = scelto.getAttribute('data-mestiere');
        input.dispatchEvent(new Event('input'));
        art.querySelectorAll('.is-scelto').forEach(function (n) { n.classList.remove('is-scelto'); });
        scelto.classList.add('is-scelto');
      });
    }

    /* Gli anelli entrano e si fermano, ma la tastiera NON sale da sola:
       si apre solo toccando il campo. autoGrow resta, serve a dare al
       campo l'altezza giusta se c'e' gia' una risposta salvata. */
    setTimeout(function () {
      try { autoGrow(); } catch (e) {}
    }, 1500);

    function avanti() {
      // la tastiera scende e gli anelli riprendono a girare
      window.NavidaKeyboard.hide();
      input.blur();
      art.classList.remove('dreamArt--enter');
      art.classList.add('dreamArt--exit');
      if (root) root.classList.add('is-exit');
      if (ctaBtn) ctaBtn.disabled = true;
      setTimeout(function () { window.NavidaApp.next(); }, 900);
    }

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), avanti, !value.trim());

    var desc = screen.descrizione
      ? h('p', {
          class: 'dream__desc',
          'data-editable': screen.id + '.descrizione',
          text: T(screen, 'descrizione', screen.descrizione)
        })
      : null;

    /* Nella targhetta la riga d'aiuto sta dentro il badge. Nelle altre
       scende appena sopra il pulsante, piccola: non ruba la scena. */
    var descNelBadge = variant === 'targhetta';

    var root = h('div', { class: 'dream dream--' + variant }, [
      header(screen, progress),
      art,
      h('div', { class: 'dream__center' }, [
        domanda,
        input,
        descNelBadge ? desc : null
      ].filter(Boolean)),
      h('div', { class: 'dream__footer' }, [descNelBadge ? null : desc, ctaBtn].filter(Boolean))
    ]);

    return root;
  };

  /* --- elaborazione: attesa con la mascotte che cambia veste ---------- */
  Screens.circles = function () {
    return window.NavidaWow.professioni(function () { window.NavidaApp.next(); });
  };

  /* --- spiegazione del riordino, con dimostrazione animata ------------ */
  Screens.rankIntro = function (screen, progress) {
    var righe = (screen.demo || ['Stipendio', 'Flessibilità', 'Crescita']);

    /* Stessa anatomia delle domande rank reali: i numeri stanno in una
       colonna a sinistra e restano fermi, si muovono solo le card. Cosi'
       la dimostrazione spiega davvero cosa succede: il numero e' la
       posizione in classifica, non un'etichetta della risposta.
       La mano vive dentro la card, quindi ne eredita il movimento. */
    var lista = h('div', { class: 'rankDemo__list' });

    righe.forEach(function (t, i) {
      lista.appendChild(h('span', {
        class: 'opt__pos',
        style: 'grid-row:' + (i + 1),
        text: String(i + 1)
      }));
    });

    righe.forEach(function (t, i) {
      var cardKids = [
        h('span', { class: 'opt__grip' }, [icon('grip-vertical', 16)]),
        h('span', { class: 'opt__label rankDemo__label', text: t })
      ];
      if (i === 2) {
        cardKids.push(h('span', {
          class: 'rankDemo__hand',
          'aria-hidden': 'true',
          html: manina()
        }));
      }
      lista.appendChild(h('div', {
        class: 'opt opt--rank rankDemo__card',
        'data-i': String(i)
      }, cardKids));
    });

    var demo = h('div', { class: 'rankDemo', 'aria-hidden': 'true' }, [lista]);

    var body = h('div', { class: 'body body--center' }, [
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      editable('p', 'lead', screen, 'body', screen.body),
      demo
    ]);

    return [
      header(screen, progress),
      body,
      h('div', { class: 'footer' }, [
        cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () { window.NavidaApp.next(); })
      ])
    ];
  };

  function manina() {
    return '<svg viewBox="0 0 24 24" width="26" height="26" xmlns="http://www.w3.org/2000/svg" ' +
      'fill="#fff" stroke="#314158" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12"/>' +
      '<path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0V12"/>' +
      '<path d="M14 10.5a1.5 1.5 0 0 1 3 0V12"/>' +
      '<path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1a1.5 1.5 0 0 1 3 0"/>' +
      '</svg>';
  }

  /* --- testo con suggerimenti ---------------------------------------- */
  Screens.textSuggest = function (screen, progress) {
    var all = [];
    PROF.forEach(function (c) { c.mansioni.forEach(function (m) { all.push(m); }); });

    var value = S.answer(screen.field, '');
    var ctaBtn;

    var input = h('input', { class: 'bigInput', placeholder: screen.placeholder || C.ui.cercaProfessione });
    input.value = value;

    var sugg = h('div', { class: 'suggestions' });

    function paintSugg() {
      sugg.innerHTML = '';
      var q = value.trim().toLowerCase();
      if (q.length < 2) return;
      var hits = all.filter(function (m) { return m.toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
      hits.forEach(function (m) {
        sugg.appendChild(h('button', {
          class: 'suggestion', text: m,
          onclick: function () {
            value = m; input.value = m;
            S.setAnswer(screen.field, m);
            sugg.innerHTML = '';
            if (ctaBtn) ctaBtn.disabled = false;
          }
        }));
      });
    }

    input.addEventListener('input', function () {
      value = input.value;
      S.setAnswer(screen.field, value);
      if (ctaBtn) ctaBtn.disabled = !value.trim();
      paintSugg();
    });
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 1000);

    var body = h('div', { class: 'body' }, [
      editable('h1', 'title title--question', screen, 'title', screen.title, { variant: 'title' }),
      input,
      sugg
    ]);

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () { window.NavidaApp.next(); }, !value.trim());
    paintSugg();

    return [header(screen, progress), body, h('div', { class: 'footer' }, [ctaBtn])];
  };

  /* --- form ----------------------------------------------------------- */
  Screens.form = function (screen, progress) {
    var ctaBtn;
    var fields = screen.fields || [];

    function valid() {
      return fields.every(function (f) {
        if (f.optional) return true;
        var v = S.answer(f.key, '');
        return String(v || '').trim().length > 0;
      });
    }

    var wrap = h('div', { class: 'options', style: 'gap:14px' });
    fields.forEach(function (f, i) {
      var input = f.multiline
        ? h('textarea', { class: 'field__input', placeholder: f.placeholder || '' })
        : h('input', { class: 'field__input', placeholder: f.placeholder || '', inputmode: f.inputMode || 'text' });
      input.value = S.answer(f.key, '') || '';
      input.addEventListener('input', function () {
        S.setAnswer(f.key, input.value);
        if (ctaBtn) ctaBtn.disabled = !valid();
      });
      wrap.appendChild(h('div', { class: 'field' }, [
        h('label', { class: 'field__label', 'data-editable': screen.id + '.field.' + i, text: S.text(screen.id + '.field.' + i, f.label) }),
        input
      ]));
    });

    var body = h('div', { class: 'body' }, [
      editable('h1', 'title title--question', screen, 'title', screen.title, { variant: 'title' }),
      screen.nota ? editable('p', 'nota', screen, 'nota', screen.nota) : null,
      wrap
    ].filter(Boolean));

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () { window.NavidaApp.next(); }, !valid());
    return [header(screen, progress), body, h('div', { class: 'footer' }, [ctaBtn])];
  };

  function careerSteps(screen) {
    return (screen.steps || []).map(function (st, i) {
      return {
        nome: interp(S.text(screen.id + '.step.' + i + '.nome', st.nome)),
        ruolo: interp(st.ruolo),
        durata: st.durata,
        obiettivo: interp(S.text(screen.id + '.step.' + i + '.obj', st.obiettivo)),
        stato: i === 0 ? 'done' : (i === 1 ? 'active' : (i === (screen.steps.length - 1) ? 'goal' : 'todo'))
      };
    });
  }

  function careerIcon(stato, size) {
    if (stato === 'done') return icon('check', size || 18);
    if (stato === 'goal') return icon('trophy', size || 18);
    return icon('circle', size || 18);
  }

  function avviaPercorsoConsultabile(root, nodes, durata) {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var started = false;

    function ready() {
      if (started) return;
      if (!root.isConnected) { requestAnimationFrame(ready); return; }
      started = true;
      var path = root.querySelector('.careerCurve__progress') || root.querySelector('path');
      var length = path && path.getTotalLength ? path.getTotalLength() : 0;
      if (length) {
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length);
      }
      if (reduced) {
        root.style.setProperty('--career-progress', '1');
        if (path) path.style.strokeDashoffset = '0';
        nodes.forEach(function (node) { node.classList.add('is-on'); });
        return;
      }

      var start = null;
      var next = 0;
      var last = Math.max(1, nodes.length - 1);
      root.classList.add('career-is-anim');

      function frame(now) {
        if (start == null) start = now;
        var time = Math.min(1, (now - start) / durata);
        var progress = time < .5
          ? 4 * time * time * time
          : 1 - Math.pow(-2 * time + 2, 3) / 2;
        root.style.setProperty('--career-progress', String(progress));
        if (path) path.style.strokeDashoffset = String(length * (1 - progress));
        /* L'ultimo nodo ha un'area visiva: si accende appena la punta entra
           nella sua zona, senza aspettare l'ultimo sub-pixel del tracciato. */
        while (next < nodes.length && progress >= (next === nodes.length - 1 ? .985 : next / last)) {
          nodes[next].classList.add('is-on');
          next++;
        }
        if (time < 1) requestAnimationFrame(frame);
        else if (path) path.style.strokeDashoffset = '0';
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(ready);
  }

  function loadingPathScene(screen, variant, status) {
    var source = C.screens.find(function (item) { return item.id === 'preview'; });
    var steps = source ? careerSteps(source) : [];
    var art;

    if (window.NavidaPercorso) {
      art = NavidaPercorso.disegna(steps, { variante: 'serpentina', attiva: 1, durata: 6200 });
      art.classList.add('loadingPath__serpentina');
    }

    var scene = h('section', {
      class: 'loadingPath loadingPath--' + variant,
      role: 'status',
      'aria-label': screen.title
    }, [
      h('div', { class: 'loadingPath__copy' }, [
        editable('h1', 'loadingPath__title', screen, 'title', screen.title, { variant: 'title' }),
        editable('p', 'loadingPath__lead', screen, 'body', screen.body),
        h('div', { class: 'loadingPath__statuses', 'aria-live': 'polite' }, status.map(function (testo, i) {
          return h('span', { class: 'loadingPath__status loadingPath__status--' + (i + 1), text: testo });
        }))
      ]),
      art
    ].filter(Boolean));
    return scene;
  }

  /* --- loading -------------------------------------------------------- */
  /* "Il tuo percorso sta prendendo forma" e' un'attesa: l'app prepara la
     risposta e cerca gli annunci. Le due versioni nello spazio girano in
     loop e mostrano solo il titolo, senza sottotitolo, frasi di stato o
     pulsante. Nel prototipo si va avanti da soli dopo "durata", oppure
     toccando lo schermo. */
  function titoloAttesa(screen) {
    return h('div', { class: 'journey__copy' }, [
      editable('h1', 'journey__title', screen, 'title', screen.title, { variant: 'title' }),
      h('span', { class: 'journey__dots', 'aria-hidden': 'true' }, [h('i', {}), h('i', {}), h('i', {})])
    ]);
  }

  /* Versione "spazio": la navicella resta al centro e dondola un poco.
     A dare il movimento sono le stelle che scorrono dietro. */
  function scenaNavicella(screen) {
    return h('section', { class: 'journey journey--ferma', role: 'status', 'aria-label': screen.title }, [
      h('img', { class: 'journey__space', src: 'assets/percorso/spazio-navida.webp', alt: '' }),
      h('div', { class: 'journey__stars journey__stars--far', 'aria-hidden': 'true' }),
      h('div', { class: 'journey__stars journey__stars--near', 'aria-hidden': 'true' }),
      h('div', { class: 'journey__streaks', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5].map(function (i) {
        return h('span', { class: 'journey__streak journey__streak--' + i });
      })),
      h('div', { class: 'journey__ship' }, [
        h('img', { class: 'journey__rocket', src: 'assets/percorso/razzo-navida.webp', alt: 'Astronauta Navida in viaggio nello spazio' })
      ]),
      titoloAttesa(screen)
    ]);
  }

  /* Versione "tappe": la navicella passa da 5 tappe, una alla volta.
     Arrivata all'ultima, tutto sfuma e il giro riparte dalla prima. */
  function scenaTappe(screen, reduced) {
    var NS = 'http://www.w3.org/2000/svg';
    var tratti = [
      'M70 430 C130 430 240 410 240 350',
      'M240 350 C240 290 80 310 80 250',
      'M80 250 C80 190 240 210 240 150',
      'M240 150 C240 95 150 105 150 50'
    ];
    var punti = [[70, 430], [240, 350], [80, 250], [240, 150], [150, 50]];

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'journey__map');
    svg.setAttribute('viewBox', '0 0 320 480');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '' +
      '<path class="journey__track" d="' + tratti.join(' ') + '"/>' +
      '<g class="journey__play">' +
        tratti.map(function (d) {
          return '<path class="journey__trail" pathLength="1" d="' + d + '"/>';
        }).join('') +
        punti.map(function (p, i) {
          return '<g class="journey__stop' + (i === punti.length - 1 ? ' journey__stop--goal' : '') + '" transform="translate(' + p[0] + ' ' + p[1] + ')">' +
            '<circle class="journey__stopHalo" r="15"/><circle class="journey__stopDot" r="6.5"/></g>';
        }).join('') +
        '<g class="journey__pilot"><image href="assets/percorso/razzo-navida.webp" x="-33" y="-30" width="66" height="60"/></g>' +
      '</g>';

    var scene = h('section', { class: 'journey journey--tappe', role: 'status', 'aria-label': screen.title }, [
      h('div', { class: 'journey__stars journey__stars--still', 'aria-hidden': 'true' }),
      svg,
      titoloAttesa(screen)
    ]);

    var play = svg.querySelector('.journey__play');
    var trail = Array.prototype.slice.call(svg.querySelectorAll('.journey__trail'));
    var stops = Array.prototype.slice.call(svg.querySelectorAll('.journey__stop'));
    var pilot = svg.querySelector('.journey__pilot');

    function metti(seg, p, raggiunte, opacita, bob) {
      trail.forEach(function (path, i) {
        path.style.strokeDashoffset = String(i < seg ? 0 : (i === seg ? 1 - p : 1));
      });
      stops.forEach(function (stop, i) { stop.classList.toggle('is-on', i < raggiunte); });
      var path = trail[seg];
      var len = path.getTotalLength();
      var a = path.getPointAtLength(Math.max(0, p * len - .5));
      var b = path.getPointAtLength(Math.min(len, p * len + .5));
      var pt = path.getPointAtLength(p * len);
      /* il disegno del razzo punta in alto a destra (-45 gradi) */
      var angolo = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 45;
      pilot.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + (pt.y + bob).toFixed(2) + ') rotate(' + angolo.toFixed(2) + ')');
      play.style.opacity = String(opacita);
    }

    var MUOVI = 950, SOSTA = 380, INIZIO = 450, FINE = 900, SPARISCI = 450, VUOTO = 200;
    var passo = MUOVI + SOSTA;
    var ciclo = INIZIO + tratti.length * passo + FINE + SPARISCI + VUOTO;
    var start = null;

    function frame(now) {
      if (!svg.isConnected) {
        if (start == null) requestAnimationFrame(frame);
        return; // la schermata e' stata chiusa: il loop si ferma
      }
      if (reduced) { metti(tratti.length - 1, 1, punti.length, 1, 0); return; }
      if (start == null) start = now;

      var t = (now - start) % ciclo;
      var seg = 0, p = 0, raggiunte = 1, opacita = Math.min(1, t / 300);
      if (t >= INIZIO) {
        var u = t - INIZIO;
        var k = Math.floor(u / passo);
        if (k < tratti.length) {
          var v = u - k * passo;
          var x = Math.min(1, v / MUOVI);
          seg = k;
          p = x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
          raggiunte = k + 1 + (v >= MUOVI ? 1 : 0);
        } else {
          var w = u - tratti.length * passo;
          seg = tratti.length - 1; p = 1; raggiunte = punti.length;
          opacita = w < FINE ? 1 : Math.max(0, 1 - (w - FINE) / SPARISCI);
        }
      }
      metti(seg, p, raggiunte, opacita, Math.sin(now / 280) * 1.6);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return scene;
  }

  Screens.loading = function (screen, progress) {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var variant = screen.id === 'fineTest'
      ? S.pageVariant(screen.id, PAGEVAR.fineTest.predefinita)
      : 'spazio';
    /* una scelta salvata che non esiste piu' (es. "costruzione") torna alla predefinita */
    if (!PAGEVAR.fineTest.options.some(function (o) { return o.value === variant; })) {
      variant = PAGEVAR.fineTest.predefinita;
    }

    var durata = screen.durata || 9000;
    if (reduced) durata = Math.min(durata, 2600);

    var timer = setTimeout(function () { window.NavidaApp.next(); }, durata);
    window.NavidaApp._pending = timer;
    function avanti() { clearTimeout(timer); window.NavidaApp.next(); }

    if (variant === 'linea') {
      var status = (screen.status && screen.status.length ? screen.status : [
        'Mettiamo a fuoco il punto di partenza',
        'Colleghiamo le opportunità più adatte',
        'La tua rotta è quasi pronta'
      ]).filter(Boolean);
      var pathScene = loadingPathScene(screen, variant, status);
      pathScene.appendChild(h('button', {
        class: 'loadingPath__skip',
        text: 'Salta l’attesa',
        onclick: avanti
      }));
      return pathScene;
    }

    var scene = variant === 'tappe' ? scenaTappe(screen, reduced) : scenaNavicella(screen);
    scene.addEventListener('click', function (e) {
      /* non disturbare chi sta modificando il titolo dalla barra */
      if (e.target.closest('[data-editable]') || document.querySelector('.is-editing')) return;
      avanti();
    });
    return scene;
  };

  /* --- risultato / prima proiezione ----------------------------------- */
  Screens.result = function (screen, progress) {
    var variant = S.pageVariant(screen.id, PAGEVAR.previsione.predefinita);

    var body = h('div', { class: 'body' }, [
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      editable('p', 'lead', screen, 'body', screen.body)
    ]);

    /* Le parole che vengono dalle risposte dell'utente si accendono:
       e' quello che fa sembrare il messaggio scritto per lui e non
       una frase uguale per tutti. */
    function conParoleTue(testo) {
      var mie = ['lavoroSogni', 'nome'].map(function (k) { return S.valore(k) || ''; })
        .filter(function (v) { return v && String(v).length > 2; });
      var out = h('span', {});
      var resto = String(testo);
      if (!mie.length) { out.textContent = resto; return out; }

      while (resto.length) {
        var pos = -1, trovata = '';
        mie.forEach(function (v) {
          var p = resto.toLowerCase().indexOf(String(v).toLowerCase());
          if (p > -1 && (pos === -1 || p < pos)) { pos = p; trovata = String(v); }
        });
        if (pos === -1) { out.appendChild(document.createTextNode(resto)); break; }
        if (pos > 0) out.appendChild(document.createTextNode(resto.slice(0, pos)));
        out.appendChild(h('span', { class: 'tua', text: resto.substr(pos, trovata.length) }));
        resto = resto.slice(pos + trovata.length);
      }
      return out;
    }

    var uno = screen.tips[0];
    var unoTitolo = interp(S.text(screen.id + '.tip.0.title', uno.title));
    var unoTesto = interp(S.text(screen.id + '.tip.0.desc', uno.description));

    /* --- 1 · MESSAGGIO CHE SI SCRIVE -------------------------------
       La mascotte parla: il messaggio sta nel suo fumetto, con la
       codina che punta verso di lei. Prima compaiono i tre puntini,
       come in una chat quando l'altro sta scrivendo. Poi il messaggio
       entra parola per parola. Il fumetto e' lo stesso delle schermate
       di racconto (.ob__bolla), cosi' il codice visivo resta uno. */
    if (variant === 'scrive') {
      body.className = 'body body--ob ob ob--fumetto body--scrive';
      body.innerHTML = '';

      /* Ogni parola diventa un pezzetto che entra un attimo dopo la
         precedente. Le parole "tue" entrano intere. Restituisce il
         ritardo da cui deve partire il blocco dopo. */
      var PUNTINI_MS = 1300, PASSO_MS = 55;
      function aParole(nodo, da) {
        var t = da;
        Array.prototype.slice.call(nodo.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (pezzo) {
              if (!pezzo) return;
              if (/^\s+$/.test(pezzo)) { frag.appendChild(document.createTextNode(pezzo)); return; }
              frag.appendChild(h('span', { class: 'parola', style: 'animation-delay:' + t + 'ms', text: pezzo }));
              t += PASSO_MS;
            });
            nodo.replaceChild(frag, n);
          } else {
            n.classList.add('parola');
            n.style.animationDelay = t + 'ms';
            t += PASSO_MS;
          }
        });
        return t;
      }

      var sTitolo = conParoleTue(unoTitolo);
      var sTesto = conParoleTue(unoTesto);
      var dopoTitolo = aParole(sTitolo, PUNTINI_MS);
      aParole(sTesto, dopoTitolo + 250);

      body.appendChild(h('div', {
        /* mentre si modificano i testi il messaggio e' gia' tutto scritto */
        class: 'ob__bolla scrive' + (S.mode ? ' is-scritto' : '')
      }, [
        h('div', { class: 'scrive__puntini', 'aria-hidden': 'true' }, [h('i'), h('i'), h('i')]),
        h('h2', { class: 'ob__title scrive__title', 'data-editable': screen.id + '.tip.0.title' }, [sTitolo]),
        h('p', { class: 'ob__lead scrive__testo', 'data-editable': screen.id + '.tip.0.desc' }, [sTesto])
      ]));
      var parla = mascotte(screen);
      if (parla) { parla.classList.add('ob__mascotte'); body.appendChild(parla); }

    /* --- 2 · PROVA: il verdetto, e sotto una sola prova -------------
       Niente card intorno: il testo sta sul fondo della schermata.
       Il grafico mostra oggi, le tappe 1-2-3 e il ruolo che sogni. La
       linea e' piena solo fino alla tappa 1, il prossimo passo; il
       resto e' tratteggiato perche' e' ancora da costruire. */
    } else {
      /* qui comanda il verdetto, quindi il titolo di servizio della
         schermata non va ripetuto. Un occhiello piccolo dice cos'e'. */
      body.className = 'body body--prova';
      body.innerHTML = '';
      body.appendChild(h('div', { class: 'prova' }, [
        h('div', { class: 'prova__occhiello' }, [
          icon('sparkles', 14),
          editable('span', '', screen, 'occhiello', screen.occhiello || 'La tua prima previsione')
        ]),
        h('h2', { class: 'prova__frase', 'data-editable': screen.id + '.tip.0.title' },
          [conParoleTue(unoTitolo)]),
        unoTesto ? h('p', { class: 'prova__testo', 'data-editable': screen.id + '.tip.0.desc' },
          [conParoleTue(unoTesto)]) : null
      ].filter(Boolean)));
      if (window.NavidaPercorso) {
        var salita = NavidaPercorso.disegna([
          { nome: 'Oggi' },
          { segno: '1' },
          { segno: '2' },
          { segno: '3' },
          { nome: interp('{lavoroSogni}') || 'Il ruolo che sogni' }
        ], { variante: 'curva', mini: true, pienaFino: 1 });
        salita.classList.add('prova__grafico');
        body.appendChild(salita);
      }
    }

    var footer = h('div', { class: 'footer' }, [
      /* una riga di accompagnamento sopra il bottone: dice alla persona
         cosa succede se va avanti */
      screen.nota ? editable('p', 'footer__nota', screen, 'nota', screen.nota) : null,
      cta(screen, T(screen, 'ctaPrimaria', screen.ctaPrimaria), function () { window.NavidaApp.next(); }),
      /* nel kit Maturo diventa un pulsante vero: vedi brand-maturo.css */
      h('button', {
        class: 'linkbtn linkbtn--azione',
        'data-editable': screen.id + '.ctaSecondaria',
        text: T(screen, 'ctaSecondaria', screen.ctaSecondaria),
        onclick: function () { if (!S.mode) window.NavidaApp.goTo('lavoroSogni'); }
      })
    ].filter(Boolean));

    return [header(screen, progress), body, footer];
  };

  /* --- login: una sola schermata per entrare o registrarsi -------------
     Non c'e' "Registrati": se l'email o l'account Google/Apple non ha
     ancora un profilo, il profilo si crea da solo. In alto c'e' solo la
     solita freccia indietro.
     Due versioni (js/variants.js), con lo stesso aspetto:
     - essenziale: solo l'email, poi il codice via email;
     - compatta:   nome e cognome, senza codice via email (js/app.js). */
  Screens.login = function (screen, progress) {
    var compatta = window.NavidaApp.variante(screen.id) === 'compatta';
    var goBtn;
    var pronto;
    var campi;

    function avanti() {
      if (S.mode || !pronto()) return;
      window.NavidaApp.next();
    }

    /* I pulsanti social sono una scorciatoia da demo, non un vero
       accesso: riempiono con dati finti quello che manca. */
    function conSocial() {
      if (S.mode) return;
      if (!S.answer('nome')) S.setAnswer('nome', 'Marco');
      if (!S.answer('cognome')) S.setAnswer('cognome', 'Rossi');
      if (!S.answer('email')) S.setAnswer('email', 'marco.rossi@example.com');
      window.NavidaApp.next();
    }

    if (compatta) {
      var valori = { nome: S.answer('nome', ''), cognome: S.answer('cognome', '') };
      pronto = function () {
        return String(valori.nome).trim() !== '' && String(valori.cognome).trim() !== '';
      };
      campi = [
        { key: 'nome', placeholder: 'Nome', autocomplete: 'given-name' },
        { key: 'cognome', placeholder: 'Cognome', autocomplete: 'family-name' }
      ].map(function (c) {
        var input = h('input', {
          class: 'field__input field__input--tondo', type: 'text',
          placeholder: S.text(screen.id + '.campo.' + c.key, c.placeholder),
          value: valori[c.key], autocomplete: c.autocomplete
        });
        input.addEventListener('input', function () {
          valori[c.key] = input.value;
          S.setAnswer(c.key, input.value);
          goBtn.disabled = !pronto();
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); avanti(); }
        });
        window.NavidaKeyboard.attach(input);
        return input;
      });
    } else {
      var email = S.answer('email', '');
      pronto = function () { return /\S+@\S+\.\S+/.test(email); };
      var mail = h('input', {
        class: 'field__input field__input--tondo', type: 'email', inputmode: 'email',
        placeholder: 'Indirizzo email', value: email, autocomplete: 'email'
      });
      mail.addEventListener('input', function () {
        email = mail.value;
        S.setAnswer('email', email);
        goBtn.disabled = !pronto();
      });
      window.NavidaKeyboard.attach(mail, ['marco@', 'gmail.com', 'libero.it']);
      campi = [mail];
    }

    var chiaveCta = compatta ? 'ctaCompatta' : 'cta';
    goBtn = cta(screen, T(screen, chiaveCta, screen[chiaveCta]), avanti, !pronto());
    goBtn.querySelector('[data-editable]').setAttribute('data-editable', screen.id + '.' + chiaveCta);

    var chiaveTitolo = compatta ? 'titleCompatta' : 'title';
    var testa = [editable('h1', 'title title--left', screen, chiaveTitolo, screen[chiaveTitolo])];
    if (!compatta) testa.push(editable('p', 'lead lead--left', screen, 'body', screen.body));

    return [
      header(screen, progress),
      h('div', { class: 'body login login--' + (compatta ? 'compatta' : 'essenziale') }, testa.concat([
        h('div', { class: 'loginCampi' }, campi),
        goBtn,
        h('div', { class: 'divider', text: C.ui.oppure }),
        h('div', { class: 'loginSocial' }, [
          h('button', { class: 'social social--wide', onclick: conSocial }, [googleIcon(), 'Continua con Google']),
          h('button', { class: 'social social--wide social--apple', onclick: conSocial }, [appleIcon('#fff'), 'Continua con Apple'])
        ])
      ])),
      h('div', { class: 'footer' }, [
        h('p', { class: 'legal', text: C.ui.legale })
      ])
    ];
  };

  function googleIcon() {
    return h('span', {
      style: 'width:18px;height:18px;display:inline-block',
      html: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.6z"/><path fill="#FBBC05" d="M10.4 28.2a14.5 14.5 0 0 1 0-8.4l-7.8-6.1a24 24 0 0 0 0 20.6l7.8-6.1z"/><path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.4-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.8 2.3-6.4 0-11.7-4.4-13.6-10.3l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z"/></svg>'
    });
  }
  function appleIcon(color) {
    return h('span', {
      style: 'width:18px;height:18px;display:inline-block',
      html: '<svg viewBox="0 0 24 24" fill="' + color + '" xmlns="http://www.w3.org/2000/svg"><path d="M16.4 12.8c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.5 0 2 .8 3.3.8 1.4 0 2.2-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.6-1-2.6-3.9zM14 5.2c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z"/></svg>'
    });
  }

  /* --- OTP ------------------------------------------------------------ */
  Screens.otp = function (screen, progress) {
    var code = ['', '', '', '', ''];
    var ctaBtn;
    var inputs = [];

    var row = h('div', { class: 'otpRow' });
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        var inp = h('input', { inputmode: 'numeric', maxlength: '1' });
        inp.addEventListener('input', function () {
          code[idx] = inp.value.replace(/\D/g, '').slice(0, 1);
          inp.value = code[idx];
          if (code[idx] && inputs[idx + 1]) inputs[idx + 1].focus();
          if (ctaBtn) ctaBtn.disabled = code.join('').length < 5;
        });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !inp.value && inputs[idx - 1]) inputs[idx - 1].focus();
        });
        inputs.push(inp);
        row.appendChild(inp);
      })(i);
    }
    setTimeout(function () { try { inputs[0].focus(); } catch (e) {} }, 400);

    var body = h('div', { class: 'body body--center' }, [
      h('div', { class: 'otpIcon' }, [icon('mail', 26)]),
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      editable('p', 'lead', screen, 'body', screen.body),
      row,
      h('button', { class: 'otpResend', onclick: function () { toast('Codice inviato di nuovo.'); } }, [
        icon('refresh-cw', 13),
        h('span', { 'data-editable': screen.id + '.reinvia', text: T(screen, 'reinvia', screen.reinvia) })
      ])
    ]);

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta), function () { window.NavidaApp.next(); }, true);

    return [
      header(screen, progress),
      body,
      h('div', { class: 'footer' }, [
        h('p', { class: 'nota', 'data-editable': screen.id + '.scadenza', text: T(screen, 'scadenza', screen.scadenza) }),
        ctaBtn
      ])
    ];
  };

  /* --- anteprima linea di carriera ------------------------------------ */
  Screens.preview = function (screen, progress) {
    var variant = S.pageVariant(screen.id, PAGEVAR.preview.predefinita);
    var steps = careerSteps(screen);
    var selected = 1;
    var view;
    var detail = h('section', { class: 'careerDetail', 'aria-live': 'polite' });

    function updateDetail(index, reveal) {
      selected = index;
      var step = steps[index];
      detail.innerHTML = '';
      detail.appendChild(h('div', { class: 'careerDetail__head' }, [
        h('span', { class: 'careerDetail__state careerDetail__state--' + step.stato }, [careerIcon(step.stato, 18)]),
        h('div', { class: 'careerDetail__heading' }, [
          h('small', { text: 'Step ' + (index + 1) }),
          h('h2', { text: step.ruolo })
        ])
      ]));
      detail.appendChild(h('p', { text: step.obiettivo }));
      detail.appendChild(h('div', { class: 'careerDetail__meta' }, [
        icon('clock', 14),
        h('span', { text: step.durata || 'Traguardo' })
      ]));
      detail.appendChild(h('button', {
        class: 'careerDetail__action',
        type: 'button',
        onclick: function () { toast('Le attività di questo step saranno disponibili nella dashboard.'); }
      }, [h('span', { text: 'Vedi attività e opportunità' }), icon('chevron-right', 16)]));

      if (view) {
        Array.prototype.forEach.call(view.querySelectorAll('[data-career-index]'), function (node) {
          var active = Number(node.getAttribute('data-career-index')) === index;
          node.classList.toggle('is-selected', active);
          node.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        if (reveal) {
          requestAnimationFrame(function () {
            if (!detail.isConnected) return;
            var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            detail.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
          });
        }
      }
    }

    function stepButton(step, index, extra) {
      return h('button', {
        class: 'careerStep careerStep--' + step.stato + (extra ? ' ' + extra : ''),
        type: 'button',
        'data-career-index': index,
        'aria-pressed': index === selected ? 'true' : 'false',
        onclick: function () { updateDetail(index, true); }
      }, [
        h('span', { class: 'careerStep__state' }, [careerIcon(step.stato, 18)]),
        h('span', { class: 'careerStep__copy' }, [
          h('small', { text: 'Step ' + (index + 1) }),
          h('strong', { 'data-editable': screen.id + '.step.' + index + '.nome', text: step.nome }),
          h('span', { class: 'careerStep__role', text: step.ruolo }),
          h('span', { class: 'careerStep__time' }, [icon('clock', 12), step.durata || 'Traguardo'])
        ]),
        icon('chevron-right', 18)
      ]);
    }

    function overview() {
      return h('section', { class: 'careerOverview' }, [
        h('div', { class: 'careerOverview__copy' }, [
          h('h2', { text: 'Il tuo percorso' }),
          h('p', { text: 'Ogni step ti avvicina al lavoro che hai scelto.' }),
          h('div', { class: 'careerOverview__meta' }, [
            h('span', {}, [icon('circle-check', 14), '1 completato']),
            h('span', {}, [icon('circle', 14), '4 da fare'])
          ])
        ]),
        h('div', { class: 'careerOverview__ring', 'aria-label': '20 per cento completato' }, [h('strong', { text: '20%' })])
      ]);
    }

    if (variant === 'serpentina') {
      /* Stessa anatomia della lista — pallino a sinistra, testo a destra —
         ma il pallino oscilla dentro la sua corsia e la linea li unisce
         con curve morbide a S. Le tappe stanno nel flusso normale: niente
         altezze fisse, niente coordinate cablate, quindi regge un numero
         qualsiasi di tappe e i titoli che vanno a capo. */
      var ONDA = 30;   /* di quanti pixel si sposta il pallino delle dispari */
      var curveSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      curveSvg.setAttribute('class', 'careerCurve__line');
      curveSvg.setAttribute('preserveAspectRatio', 'none');
      curveSvg.setAttribute('aria-hidden', 'true');
      curveSvg.innerHTML =
        '<path class="careerCurve__track" fill="none" vector-effect="non-scaling-stroke" />' +
        '<path class="careerCurve__progress" fill="none" vector-effect="non-scaling-stroke" />';
      var curve = h('div', { class: 'careerCurve' }, [curveSvg]);
      steps.forEach(function (step, i) {
        var riga = stepButton(step, i, 'careerCurve__step');
        riga.style.setProperty('--dx', (i % 2 ? ONDA : 0) + 'px');
        curve.appendChild(riga);
      });

      /* La linea nasce dai centri veri dei pallini, misurati quando la
         schermata e' in pagina: se cambia il numero di tappe o l'altezza
         di una card, il tracciato la segue da solo. */
      var tracciaCurva = function () {
        var box = curve.getBoundingClientRect();
        var dischi = Array.prototype.slice.call(curve.querySelectorAll('.careerStep__state'));
        if (!box.width || dischi.length < 2) return false;
        var punti = dischi.map(function (el) {
          var r = el.getBoundingClientRect();
          return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
        });
        var dd = 'M ' + punti[0].x.toFixed(1) + ' ' + punti[0].y.toFixed(1);
        for (var i = 1; i < punti.length; i++) {
          var a = punti[i - 1], b = punti[i], k = (b.y - a.y) * .5;
          dd += ' C ' + a.x.toFixed(1) + ' ' + (a.y + k).toFixed(1) +
                ', ' + b.x.toFixed(1) + ' ' + (b.y - k).toFixed(1) +
                ', ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
        }
        curveSvg.setAttribute('viewBox', '0 0 ' + box.width.toFixed(1) + ' ' + box.height.toFixed(1));
        Array.prototype.forEach.call(curveSvg.querySelectorAll('path'), function (p) {
          p.setAttribute('d', dd);
        });
        /* a disegno finito il tratteggio non serve piu': se lo lasciassimo
           con la lunghezza vecchia, un ridimensionamento taglierebbe la coda */
        if (curve.style.getPropertyValue('--career-progress') === '1') {
          var fatta = curveSvg.querySelector('.careerCurve__progress');
          fatta.style.strokeDasharray = '';
          fatta.style.strokeDashoffset = '';
        }
        return true;
      };

      (function attendi(tentativi) {
        if (!curve.isConnected || !tracciaCurva()) {
          if (tentativi > 90) return;
          requestAnimationFrame(function () { attendi(tentativi + 1); });
          return;
        }
        /* nasconde subito la linea gia' fatta: senza questo, per un
           fotogramma si vedrebbe tutto il tracciato prima che parta */
        var fatta = curveSvg.querySelector('.careerCurve__progress');
        var lung = fatta.getTotalLength();
        fatta.style.strokeDasharray = String(lung);
        fatta.style.strokeDashoffset = String(lung);
        avviaPercorsoConsultabile(curve, Array.prototype.slice.call(curve.querySelectorAll('.careerCurve__step')), 4600);
        if (window.ResizeObserver) new ResizeObserver(tracciaCurva).observe(curve);
      })(0);

      view = h('div', { class: 'careerView careerView--serpentina' }, [
        h('div', { class: 'careerView__compactHead' }, [
          h('strong', { text: '1 di 5 step completato' }),
          h('span', { text: 'Tocca una tappa per consultarla' })
        ]),
        curve,
        detail
      ]);
    } else if (variant === 'mappa') {
      var rail = h('div', { class: 'careerMap__rail', role: 'group', 'aria-label': 'Tappe del percorso' });
      steps.forEach(function (step, i) {
        rail.appendChild(h('button', {
          class: 'careerMap__node careerMap__node--' + step.stato,
          type: 'button',
          'data-career-index': i,
          'aria-label': 'Step ' + (i + 1) + ': ' + step.nome,
          'aria-pressed': i === selected ? 'true' : 'false',
          onclick: function () { updateDetail(i, true); }
        }, [careerIcon(step.stato, 16), h('span', { text: String(i + 1) })]));
      });
      avviaPercorsoConsultabile(rail, Array.prototype.slice.call(rail.querySelectorAll('.careerMap__node')), 3800);
      var compactList = h('div', { class: 'careerMap__index' }, steps.map(function (step, i) {
        return h('button', {
          type: 'button',
          'data-career-index': i,
          'aria-pressed': i === selected ? 'true' : 'false',
          onclick: function () { updateDetail(i, true); }
        }, [h('span', { text: String(i + 1) }), h('strong', { text: step.nome })]);
      }));
      view = h('div', { class: 'careerView careerView--mappa' }, [overview(), rail, detail, compactList]);
    } else {
      var careerList = h('div', { class: 'careerList' }, steps.map(function (step, i) { return stepButton(step, i); }));
      avviaPercorsoConsultabile(careerList, Array.prototype.slice.call(careerList.querySelectorAll('.careerStep')), 4200);
      view = h('div', { class: 'careerView careerView--lista' }, [
        overview(),
        careerList,
        detail
      ]);
    }

    updateDetail(selected);

    var body = h('div', { class: 'body body--career' }, [
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      editable('p', 'lead', screen, 'body', screen.body),
      view
    ]);

    return [
      header(screen, progress),
      body,
      h('div', { class: 'footer' }, [
        cta(screen, T(screen, 'cta', screen.cta), function () {
          if (screen.href) window.location.href = screen.href;
          else window.NavidaApp.next();
        }),
        h('p', { class: 'nota', text: screen.ctaNota })
      ])
    ];
  };

  /* ======================================================================
     EXPORT
     ====================================================================== */

  window.NavidaRender = {
    h: h,
    icon: icon,
    toast: toast,
    interp: interp,
    screens: Screens,
    resolveOptions: resolveOptions
  };
})();
