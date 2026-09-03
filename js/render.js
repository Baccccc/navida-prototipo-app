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
      var v = S.answers[key];
      if (v == null || v === '') {
        var def = {
          nome: 'tu',
          lavoroSogni: 'il ruolo che sogni',
          titoloStudio: 'il tuo titolo di studio',
          email: 'la tua email'
        };
        return def[key] || m;
      }
      return Array.isArray(v) ? v.join(', ') : String(v);
    });
  }

  /** Testo modificabile dal team. */
  function T(screen, key, fallback) {
    var path = screen.id + '.' + key;
    return S.text(path, fallback);
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
      node.setAttribute('data-variant', S.variant(screen.id, opts.variant, VAR[opts.variant].predefinita));
      applyVariantClass(node, opts.variant, screen.id);
    }
    return node;
  }

  /** Alcune varianti agiscono su classi, non solo su data-variant. */
  function applyVariantClass(node, name, screenId) {
    var v = S.variant(screenId, name, VAR[name].predefinita);
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
    var vName = S.variant(screen.id, 'progress', VAR.progress.predefinita);
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
    var v = S.variant(screen.id, 'mascotte', VAR.mascotte.predefinita);
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
    applyVariantClass(b, 'cta', screen.id);
    return b;
  }

  function optionsBox(screen, kids) {
    // la schermata può chiedere un suo stile di lista (es. "grid" per le card)
    var base = screen.listStyle || VAR.answerList.predefinita;
    var box = h('div', {
      class: 'options',
      'data-varname': 'answerList',
      'data-variant': S.variant(screen.id, 'answerList', base),
      'data-lato': S.variant(screen.id, 'latoControlli', VAR.latoControlli.predefinita)
    }, kids);
    return box;
  }

  /**
   * Intestazione della domanda: titolo semplice oppure la mascotte
   * che te la chiede dentro un fumetto.
   */
  function intestazione(screen, extraCls) {
    var v = S.variant(screen.id, 'domanda', VAR.domanda.predefinita);
    var titolo = editable('h1', 'title title--question ' + (extraCls || ''), screen, 'title', screen.title, { variant: 'title' });

    if (v !== 'mascotte') {
      titolo.setAttribute('data-varname', 'domanda');
      return titolo;
    }

    titolo.classList.remove('title');
    titolo.classList.add('bubble__testo');
    return h('div', { class: 'ask', 'data-varname': 'domanda' }, [
      h('div', { class: 'ask__mascotte' }, [
        window.NavidaMascotte.elemento(screen.mascotte || 'indicare')
      ]),
      h('div', { class: 'bubble' }, [titolo])
    ]);
  }

  /**
   * Commento della mascotte dopo una scelta.
   * Se l'opzione ha `reazione` usa quella, altrimenti una frase generica.
   */
  function reazione(host, testo) {
    if (!host) return;
    var vecchia = host.querySelector('.reazione');
    if (vecchia) vecchia.remove();
    if (!testo) return;
    var n = h('div', { class: 'reazione' }, [
      h('span', { class: 'reazione__ico' }, [icon('sparkles', 14)]),
      h('span', { text: testo })
    ]);
    host.appendChild(n);
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
      item.style.top = (rect.top - host.top) + 'px';
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
      var top = latestY - host.top - grabOffsetY;
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
          class: secondarioPieno ? 'btn btn--outline' : 'linkbtn',
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

  /* --- info ---------------------------------------------------------- */
  Screens.info = function (screen, progress) {
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

    var bodyText = T(screen, 'body', screen.body);
    if (bodyText) body.appendChild(editable('p', 'lead', screen, 'body', screen.body));

    /* anteprima corta della linea di carriera: la usa ob3, che deve far
       vedere il percorso mentre lo racconta invece di descriverlo */
    if (screen.percorso && window.NavidaPercorso) {
      var stilePerc = S.variant(screen.id, 'path', VAR.path.predefinita);
      if (NavidaPercorso.modi.indexOf(stilePerc) === -1) stilePerc = 'serpentina';
      var mini = NavidaPercorso.disegna(screen.percorso, {
        variante: stilePerc,
        mini: true,
        attiva: screen.percorsoAttiva == null ? 1 : screen.percorsoAttiva
      });
      mini.setAttribute('data-varname', 'path');
      mini.setAttribute('data-variant', stilePerc);
      body.appendChild(mini);
    }

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

    function paint() {
      box.innerHTML = '';
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
        if (type === 'singleInfo' && selected && o.info) {
          col.appendChild(h('span', { class: 'opt__info', 'data-editable': screen.id + '.info.' + oi, text: S.text(screen.id + '.info.' + oi, o.info) }));
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

          var bolla = testa.querySelector ? testa.querySelector('.bubble') : null;

          if (isMulti) {
            var k = current.indexOf(val);
            if (k === -1) current.push(val); else current.splice(k, 1);
            S.setAnswer(screen.field, current);
            paint(); refreshCta();
            if (k === -1) reazione(bolla, o.reazione || null);
          } else {
            current = val;
            S.setAnswer(screen.field, current);
            if (screen.optionsFrom === 'professioni') S.setAnswer('categoria', val);
            paint(); refreshCta();
            reazione(bolla, o.reazione || null);
            var attesa = (o.reazione && bolla) ? 1100 : 190;
            if (!hasCta) setTimeout(function () { window.NavidaApp.next(); }, attesa);
          }
        });

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
        class: 'linkbtn',
        'data-editable': screen.id + '.footerLink',
        text: T(screen, 'footerLink', screen.footerLink),
        onclick: function () {
          if (S.mode) return;
          window.NavidaApp.goTo(screen.footerTarget);
        }
      }));
    }

    paint();
    return [header(screen, progress), body, footer];
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

    var modo = S.variant(screen.id, 'rank', VAR.rank.predefinita);

    function salva(order) {
      S.setAnswer(screen.field, order);
      if (S.mode === 'order') S.setOrder(screen.id, order);
    }

    /* ---------------------------------------------------------------
       1 · TRASCINAMENTO — tutta la card e' afferrabile. Il numero vive
       nella stessa riga della proposta, quindi rimane sempre allineato.
       A destra resta una fascia libera per scorrere da telefono.
       --------------------------------------------------------------- */
    function costruisciManiglia() {
      var box = optionsBox(screen, []);
      box.classList.add('rankList');

      function paint() {
        box.innerHTML = '';
        seq.forEach(function (entry, pos) {
          box.appendChild(h('div', {
            class: 'rankItem',
            'data-oi': entry.i,
            'aria-grabbed': 'false'
          }, [
            h('span', { class: 'opt__pos', text: String(pos + 1) }),
            h('div', { class: 'opt opt--rank' }, [
              h('span', { class: 'opt__grip', 'aria-hidden': 'true' }, [icon('grip-vertical', 16)]),
              h('span', {
                class: 'opt__label',
                'data-editable': screen.id + '.opt.' + entry.i,
                text: optLabel(screen, entry.i, entry.o.label)
              })
            ])
          ]));
        });
      }
      paint();

      makeSortable(box, function (order) {
        seq = order.map(function (i) { return indexed[i]; });
        salva(order);
        Array.prototype.forEach.call(box.querySelectorAll('.rankItem'), function (n, pos) {
          n.querySelector('.opt__pos').textContent = String(pos + 1);
        });
      }, { itemSelector: '.rankItem' });

      return h('div', { class: 'rankWrap' }, [
        box,
        h('div', {
          class: 'rankScrollRail',
          'aria-hidden': 'true',
          title: 'Scorri qui'
        })
      ]);
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
    // apertura automatica della tastiera dopo 1 secondo (come da nota nel design)
    setTimeout(function () { try { input.focus(); autoGrow(); } catch (e) {} }, 1000);

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
    var variant = S.pageVariant(screen.id, 'orbite');

    var art = window.NavidaWow.sogno(T(screen, 'frase', screen.frase), variant);
    art.classList.add('dreamArt--enter');

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

    // gli anelli entrano, poi si fermano: si può scrivere
    setTimeout(function () {
      if (new URLSearchParams(window.location.search).get('autofocus') === '0') return;
      try { input.focus(); autoGrow(); } catch (e) {}
    }, 1500);

    function avanti() {
      // la tastiera scende e gli anelli riprendono a girare
      window.NavidaKeyboard.hide();
      input.blur();
      art.classList.remove('dreamArt--enter');
      art.classList.add('dreamArt--exit');
      if (ctaBtn) ctaBtn.disabled = true;
      setTimeout(function () { window.NavidaApp.next(); }, 900);
    }

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), avanti, !value.trim());

    var root = h('div', { class: 'dream dream--' + variant }, [
      header(screen, progress),
      art,
      h('div', { class: 'dream__center' }, [
        input,
        screen.descrizione
          ? h('p', {
              class: 'dream__desc',
              'data-editable': screen.id + '.descrizione',
              text: T(screen, 'descrizione', screen.descrizione)
            })
          : null
      ].filter(Boolean)),
      h('div', { class: 'dream__footer' }, [ctaBtn])
    ]);

    return root;
  };

  /* --- elaborazione: mascotte e professioni a rotazione ---------------- */
  Screens.circles = function (screen) {
    var variante = S.pageVariant(screen.id, 'mascotte');
    return window.NavidaWow.professioni(variante, function () { window.NavidaApp.next(); });
  };

  /* --- spiegazione del riordino, con dimostrazione animata ------------ */
  Screens.rankIntro = function (screen, progress) {
    var righe = (screen.demo || ['Stipendio', 'Flessibilità', 'Crescita']);

    /* Stessa anatomia delle domande rank reali: numero fuori dalla card,
       maniglia dentro la risposta e intera riga trascinabile. La mano vive
       nella card, quindi ne eredita sempre il movimento. */
    var lista = h('div', { class: 'rankDemo__list rankList' }, righe.map(function (t, i) {
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
      return h('div', { class: 'rankItem rankDemo__row', 'data-i': String(i) }, [
        h('span', { class: 'opt__pos', text: String(i + 1) }),
        h('div', { class: 'opt opt--rank' }, cardKids)
      ]);
    }));

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

  /* Fa crescere la linea con un solo avanzamento e accende gli step
     quando la punta della linea raggiunge davvero la loro posizione. */
  function avviaCostruzione(root, durata) {
    var nodes = Array.prototype.slice.call(root.querySelectorAll('.loadingBuild__step'));
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var started = false;

    function ready() {
      if (started) return;
      if (!root.isConnected) { requestAnimationFrame(ready); return; }
      started = true;
      if (reduced) {
        root.style.setProperty('--build-progress', '1');
        nodes.forEach(function (node) { node.classList.add('is-on'); });
        return;
      }

      var start = null;
      var next = 0;
      var last = Math.max(1, nodes.length - 1);
      root.classList.add('is-building');

      function frame(now) {
        if (start == null) start = now;
        var time = Math.min(1, (now - start) / durata);
        var progress = time < .5
          ? 4 * time * time * time
          : 1 - Math.pow(-2 * time + 2, 3) / 2;
        root.style.setProperty('--build-progress', String(progress));
        while (next < nodes.length && progress >= next / last) {
          nodes[next].classList.add('is-on');
          next++;
        }
        if (time < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(ready);
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

    if (variant === 'linea' && window.NavidaPercorso) {
      art = NavidaPercorso.disegna(steps, { variante: 'serpentina', attiva: 1, durata: 6200 });
      art.classList.add('loadingPath__serpentina');
    } else {
      art = h('div', { class: 'loadingBuild' }, [
        h('span', { class: 'loadingBuild__rail', 'aria-hidden': 'true' })
      ].concat(steps.map(function (step, i) {
        var stato = i === 0 ? 'done' : (i === 1 ? 'active' : (i === steps.length - 1 ? 'goal' : 'todo'));
        return h('div', {
          class: 'loadingBuild__step loadingBuild__step--' + stato,
          style: '--i:' + i
        }, [
          h('span', { class: 'loadingBuild__dot' }, [careerIcon(stato, 16)]),
          h('span', { class: 'loadingBuild__copy' }, [
            h('small', { text: 'Step ' + (i + 1) }),
            h('strong', { text: step.nome }),
            h('span', { text: step.durata })
          ])
        ]);
      })));
      avviaCostruzione(art, 5600);
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
    ]);
    return scene;
  }

  /* --- loading -------------------------------------------------------- */
  Screens.loading = function (screen, progress) {
    var status = (screen.status && screen.status.length ? screen.status : [
      'Mettiamo a fuoco il punto di partenza',
      'Colleghiamo le opportunità più adatte',
      'La tua rotta è quasi pronta'
    ]).filter(Boolean);
    var variant = screen.id === 'fineTest'
      ? S.pageVariant(screen.id, PAGEVAR.fineTest.predefinita)
      : 'spazio';

    var durata = screen.durata || 7200;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      durata = Math.min(durata, 2600);
    }

    if (variant !== 'spazio') {
      var pathScene = loadingPathScene(screen, variant, status);
      var pathTimer = setTimeout(function () { window.NavidaApp.next(); }, durata);
      window.NavidaApp._pending = pathTimer;
      pathScene.appendChild(h('button', {
        class: 'loadingPath__skip',
        text: 'Salta l’attesa',
        onclick: function () { clearTimeout(pathTimer); window.NavidaApp.next(); }
      }));
      return pathScene;
    }

    var statusHost = h('div', { class: 'journey__status', 'aria-live': 'polite' },
      status.map(function (testo, i) {
        return h('span', { class: 'journey__statusLine journey__statusLine--' + (i + 1), text: testo });
      })
    );

    var route = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    route.setAttribute('class', 'journey__route');
    route.setAttribute('viewBox', '0 0 393 852');
    route.setAttribute('preserveAspectRatio', 'none');
    route.setAttribute('aria-hidden', 'true');
    route.innerHTML = '' +
      '<path class="journey__routeGlow" pathLength="1" d="M58 708 C84 578 263 603 296 466 C324 350 236 306 276 178"/>' +
      '<path class="journey__routeLine" pathLength="1" d="M58 708 C84 578 263 603 296 466 C324 350 236 306 276 178"/>';

    var scene = h('section', { class: 'journey', role: 'status', 'aria-label': screen.title }, [
      h('img', { class: 'journey__space', src: 'assets/percorso/spazio-navida.webp', alt: '' }),
      route,
      h('div', { class: 'journey__star journey__star--one', 'aria-hidden': 'true' }),
      h('div', { class: 'journey__star journey__star--two', 'aria-hidden': 'true' }),
      h('img', { class: 'journey__planet journey__planet--violet', src: 'assets/percorso/pianeta-viola.webp', alt: '' }),
      h('img', { class: 'journey__planet journey__planet--gold', src: 'assets/percorso/pianeta-anelli.webp', alt: '' }),
      h('img', { class: 'journey__rocket', src: 'assets/percorso/razzo-navida.webp', alt: 'Astronauta Navida in viaggio nello spazio' }),
      h('img', { class: 'journey__earth', src: 'assets/percorso/terra-partenza.webp', alt: '' }),
      h('div', { class: 'journey__copy' }, [
        editable('h1', 'journey__title', screen, 'title', screen.title, { variant: 'title' }),
        screen.body ? editable('p', 'journey__lead', screen, 'body', screen.body) : null,
        statusHost
      ].filter(Boolean))
    ]);

    var t = setTimeout(function () { window.NavidaApp.next(); }, durata);
    window.NavidaApp._pending = t;
    scene.appendChild(h('button', {
      class: 'journey__skip',
      text: 'Salta l’attesa',
      onclick: function () { clearTimeout(t); window.NavidaApp.next(); }
    }));
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
      var mie = ['lavoroSogni', 'nome'].map(function (k) { return S.answer(k, ''); })
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
    var unoTitolo = S.text(screen.id + '.tip.0.title', uno.title);
    var unoTesto = interp(S.text(screen.id + '.tip.0.desc', uno.description));

    /* --- 1 · VOCE: Navida ti parla ---------------------------------
       Un messaggio firmato dentro una card, su un fondo che cambia
       rispetto alle schermate di domanda. Si legge come una risposta,
       non come un risultato di sistema. */
    if (variant === 'voce') {
      body.className = 'body body--voce';
      body.innerHTML = '';
      /* la firma dice gia' chi parla: il titolo della schermata qui
         sarebbe una ripetizione, quindi il consiglio diventa la frase */
      var bolla = h('div', { class: 'voce' }, [
        h('div', { class: 'voce__firma' }, [
          h('span', { class: 'voce__logo' }, [icon('sparkles', 14)]),
          h('span', { text: 'Navida' })
        ]),
        h('h1', { class: 'voce__title', 'data-editable': screen.id + '.tip.0.title' },
          [conParoleTue(unoTitolo)]),
        h('p', { class: 'voce__testo', 'data-editable': screen.id + '.tip.0.desc' },
          [conParoleTue(unoTesto)])
      ]);
      body.appendChild(bolla);
      var mAst = mascotte({ id: screen.id, mascotte: 'volare' });
      if (mAst) { mAst.classList.add('voce__mascotte'); body.appendChild(mAst); }

    /* --- 2 · VERDETTO: la frase e' la schermata --------------------- */
    } else if (variant === 'verdetto') {
      body.className = 'body body--verdetto';
      body.innerHTML = '';
      body.appendChild(h('h1', {
        class: 'verdetto__frase',
        'data-editable': screen.id + '.tip.0.title'
      }, [conParoleTue(unoTitolo)]));
      body.appendChild(h('p', { class: 'verdetto__sotto', 'data-editable': screen.id + '.tip.0.desc' },
        [conParoleTue(unoTesto)]));

    /* --- 3 · PROVA: il verdetto, e sotto una sola prova ------------- */
    } else if (variant === 'prova') {
      body.appendChild(h('div', { class: 'prova' }, [
        h('h2', { class: 'prova__frase', 'data-editable': screen.id + '.tip.0.title' },
          [conParoleTue(unoTitolo)]),
        h('p', { class: 'prova__testo', 'data-editable': screen.id + '.tip.0.desc' },
          [conParoleTue(unoTesto)])
      ]));
      if (window.NavidaPercorso) {
        var salita = NavidaPercorso.disegna([
          { nome: 'Oggi' },
          { nome: interp('{lavoroSogni}') || 'Il ruolo che sogni' }
        ], { variante: 'curva', mini: true });
        salita.classList.add('prova__grafico');
        body.appendChild(salita);
      }

    } else if (variant === 'single') {
      body.appendChild(h('div', { class: 'tips', 'data-varname': 'tips', 'data-variant': S.variant(screen.id, 'tips', 'accent') }, [
        h('div', { class: 'tip' }, [
          h('div', { class: 'tip__title', 'data-editable': screen.id + '.tip.0.title', text: unoTitolo }),
          h('div', { class: 'tip__desc', 'data-editable': screen.id + '.tip.0.desc', text: unoTesto })
        ])
      ]));
    } else {
      // i consigli entrano uno dopo l'altro, come nell'ultima animazione ludica
      var tips = h('div', {
        class: 'tips',
        'data-varname': 'tips',
        'data-variant': S.variant(screen.id, 'tips', VAR.tips.predefinita)
      }, screen.tips.map(function (t, i) {
        return h('div', {
          class: 'tip tip--in',
          style: 'animation-delay:' + (400 + i * 550) + 'ms'
        }, [
          h('div', { class: 'tip__n', text: String(i + 1) }),
          h('div', { class: 'tip__title', 'data-editable': screen.id + '.tip.' + i + '.title', text: S.text(screen.id + '.tip.' + i + '.title', t.title) }),
          h('div', { class: 'tip__desc', 'data-editable': screen.id + '.tip.' + i + '.desc', text: interp(S.text(screen.id + '.tip.' + i + '.desc', t.description)) })
        ]);
      }));
      body.appendChild(tips);
    }

    var footer = h('div', { class: 'footer' }, [
      cta(screen, T(screen, 'ctaPrimaria', screen.ctaPrimaria), function () { window.NavidaApp.next(); }),
      h('p', { class: 'nota', 'data-editable': screen.id + '.ctaPrimariaNota', text: T(screen, 'ctaPrimariaNota', screen.ctaPrimariaNota) }),
      h('button', {
        class: 'linkbtn',
        'data-editable': screen.id + '.ctaSecondaria',
        text: T(screen, 'ctaSecondaria', screen.ctaSecondaria),
        onclick: function () { if (!S.mode) window.NavidaApp.goTo('lavoroSogni'); }
      })
    ]);

    return [header(screen, progress), body, footer];
  };

  /* --- login: pagina normale, a tutto schermo ------------------------- */
  Screens.login = function (screen, progress) {
    var email = S.answer('email', '');
    var pwd = S.answer('password', '');
    var goBtn;

    function valido() {
      return /\S+@\S+\.\S+/.test(email) && pwd.length >= 6;
    }
    function aggiorna() {
      S.setAnswer('email', email);
      S.setAnswer('password', pwd);
      if (goBtn) goBtn.disabled = !valido();
    }
    function avanti() {
      if (S.mode) return;
      if (!S.answer('email')) S.setAnswer('email', 'marco.rossi@example.com');
      window.NavidaApp.next();
    }

    var emailInput = h('input', {
      class: 'field__input', type: 'email', inputmode: 'email',
      placeholder: 'nome@esempio.it', value: email, autocomplete: 'email'
    });
    emailInput.addEventListener('input', function () { email = emailInput.value; aggiorna(); });
    window.NavidaKeyboard.attach(emailInput, ['marco@', 'gmail.com', 'libero.it']);

    var pwdInput = h('input', {
      class: 'field__input', type: 'password',
      placeholder: 'Almeno 6 caratteri', value: pwd, autocomplete: 'current-password'
    });
    pwdInput.addEventListener('input', function () { pwd = pwdInput.value; aggiorna(); });
    window.NavidaKeyboard.attach(pwdInput);

    var variant = S.pageVariant(screen.id, PAGEVAR.registrazione.predefinita);

    var campi = h('div', { class: 'loginForm' }, [
      h('div', { class: 'field' }, [
        h('label', { class: 'field__label', text: 'Email' }),
        emailInput
      ]),
      h('div', { class: 'field' }, [
        h('label', { class: 'field__label', text: 'Password' }),
        pwdInput
      ]),
      h('button', { class: 'linkbtn linkbtn--right', text: 'Password dimenticata?' })
    ]);

    var social = h('div', { class: 'loginSocial' }, [
      h('button', { class: 'social social--wide', onclick: avanti }, [googleIcon(), 'Continua con Google']),
      h('button', { class: 'social social--wide social--apple', onclick: avanti }, [appleIcon('#fff'), 'Continua con Apple'])
    ]);

    goBtn = cta(screen, T(screen, 'cta', screen.cta), avanti, !valido());

    var titolo = editable('h1', 'title', screen, 'title', screen.title);
    var sotto = editable('p', 'lead', screen, 'body', screen.body);

    /* --- Essenziale: solo email, il resto sotto (rif. Cuvva) ---------- */
    if (variant === 'essenziale') {
      titolo.classList.add('title--left');
      sotto.classList.add('lead--left');
      var soloMail = h('input', {
        class: 'field__input field__input--tondo', type: 'email',
        placeholder: 'Indirizzo email', value: email
      });
      soloMail.addEventListener('input', function () {
        email = soloMail.value;
        S.setAnswer('email', email);
        if (goBtn) goBtn.disabled = !/\S+@\S+\.\S+/.test(email);
      });
      window.NavidaKeyboard.attach(soloMail, ['marco@', 'gmail.com', 'libero.it']);
      goBtn = cta(screen, 'Entra con l’email', avanti, !/\S+@\S+\.\S+/.test(email));

      return [
        h('div', { class: 'loginTop' }, [
          h('button', {
            class: 'loginTop__round', 'aria-label': 'Chiudi',
            onclick: function () { window.NavidaApp.back(); }
          }, [icon('x', 20)]),
          h('button', { class: 'loginTop__round', 'aria-label': 'Aiuto' }, [icon('lightbulb', 18)])
        ]),
        h('div', { class: 'body login--essenziale' }, [
          titolo, sotto,
          soloMail,
          goBtn,
          h('div', { class: 'divider', text: C.ui.oppure }),
          social,
          h('button', {
            class: 'linkbtn linkbtn--forte',
            text: 'Non hai un account? Registrati',
            onclick: avanti
          })
        ]),
        h('div', { class: 'footer' }, [
          h('p', { class: 'legal', text: C.ui.legale })
        ])
      ];
    }

    /* --- Compatta: email e password uniti (rif. Duolingo) ------------- */
    if (variant === 'compatta') {
      emailInput.classList.add('field__input--unito');
      pwdInput.classList.add('field__input--unito');
      return [
        h('div', { class: 'loginBar' }, [
          h('button', {
            class: 'loginBar__back', 'aria-label': 'Indietro',
            onclick: function () { window.NavidaApp.back(); }
          }, [icon('chevron-left', 22)]),
          h('span', { class: 'loginBar__title', 'data-editable': screen.id + '.title', text: T(screen, 'title', screen.title) })
        ]),
        h('div', { class: 'body login--compatta' }, [
          h('div', { class: 'fieldGroup' }, [emailInput, pwdInput]),
          goBtn,
          h('button', { class: 'linkbtn linkbtn--forte', text: 'Password dimenticata?' })
        ]),
        h('div', { class: 'footer' }, [
          social,
          h('p', { class: 'legal', text: C.ui.legale })
        ])
      ];
    }

    /* --- 1 · centrata: tutto al centro, pulita ------------------------ */
    if (variant === 'centrata') {
      return [
        header(screen, progress),
        h('div', { class: 'body body--center login--centrata' }, [
          h('div', { class: 'loginHead__logo' }, [window.NavidaMascotte.elemento('salutare')]),
          titolo, sotto, campi
        ]),
        h('div', { class: 'footer' }, [
          goBtn,
          h('div', { class: 'divider', text: C.ui.oppure }),
          social
        ])
      ];
    }

    /* --- 2 · social first --------------------------------------------- */
    if (variant === 'social') {
      titolo.classList.add('title--left');
      sotto.classList.add('lead--left');
      return [
        header(screen, progress),
        h('div', { class: 'body login--social' }, [
          titolo, sotto,
          social,
          h('div', { class: 'divider', text: 'o accedi con la tua email' }),
          campi
        ]),
        h('div', { class: 'footer' }, [goBtn, h('p', { class: 'legal', text: C.ui.legale })])
      ];
    }

    /* --- 3 · con copertina colorata ----------------------------------- */
    if (variant === 'copertina') {
      titolo.classList.add('title--left');
      sotto.classList.add('lead--left');
      return [
        h('div', { class: 'login__cover' }, [
          h('button', {
            class: 'login__back', 'aria-label': 'Indietro',
            onclick: function () { window.NavidaApp.back(); }
          }, [icon('chevron-left', 22)]),
          h('div', { class: 'login__coverArt' }, [window.NavidaMascotte.elemento('salutare')])
        ]),
        h('div', { class: 'login__sheet' }, [
          titolo, sotto, campi, goBtn,
          h('div', { class: 'divider', text: C.ui.oppure }),
          social
        ])
      ];
    }

    /* --- 4 · pagina semplice (la prima versione) ----------------------- */
    titolo.classList.add('title--left');
    sotto.classList.add('lead--left');
    return [
      header(screen, progress),
      h('div', { class: 'body' }, [
        h('div', { class: 'loginHead' }, [
          h('div', { class: 'loginHead__logo' }, [window.NavidaMascotte.elemento('salutare')]),
          titolo, sotto
        ]),
        campi,
        h('div', { class: 'divider', text: C.ui.oppure }),
        social
      ]),
      h('div', { class: 'footer' }, [goBtn, h('p', { class: 'legal', text: C.ui.legale })])
    ];
  };

  /* --- vecchie varianti a popup, tenute per confronto ------------------ */
  Screens.loginPopup = function (screen) {
    var variant = S.pageVariant(screen.id, PAGEVAR.registrazione.predefinita);
    var email = S.answer('email', '');
    var frag = document.createDocumentFragment();

    var bg = h('div', {
      class: 'loginBg' + (variant === 'popup' || variant === 'header' ? ' loginBg--dim' : '')
    });
    frag.appendChild(bg);

    var goBtn;
    function setEmail(v) {
      email = v;
      S.setAnswer('email', v);
      var ok = /\S+@\S+\.\S+/.test(v);
      if (goBtn) goBtn.disabled = !ok;
    }

    var emailInput = h('input', { placeholder: C.ui.email, type: 'email', value: email });
    emailInput.addEventListener('input', function () { setEmail(emailInput.value); });

    function googleApple(wide) {
      if (wide) {
        return [
          h('button', { class: 'social social--wide', onclick: proceed }, [googleIcon(), 'Continua con Google']),
          h('button', { class: 'social social--wide social--apple', onclick: proceed }, [appleIcon('#fff'), 'Continua con Apple'])
        ];
      }
      return [h('div', { class: 'socialRow' }, [
        h('button', { class: 'social', onclick: proceed }, [googleIcon()]),
        h('button', { class: 'social', onclick: proceed }, [appleIcon('#000')])
      ])];
    }

    function proceed() {
      if (S.mode) return;
      if (!S.answer('email')) S.setAnswer('email', 'pinco.pallino82@gmail.com');
      window.NavidaApp.next();
    }

    var container;

    if (variant === 'popup') {
      container = h('div', { class: 'modal' }, [
        h('div', { style: 'width:92px;height:126px;margin:0 auto', html: window.NavidaMascotte.pose('computer') }),
        editable('h2', 'sheet__title', screen, 'title', screen.title),
        editable('p', 'sheet__sub', screen, 'body', screen.body),
        h('div', { class: 'inputRow' }, [emailInput]),
        (goBtn = cta(screen, T(screen, 'cta', screen.cta), proceed, !/\S+@\S+\.\S+/.test(email))),
        h('div', { class: 'divider', text: C.ui.oppure })
      ].concat(googleApple(false), [
        h('p', { class: 'legal', text: C.ui.legale })
      ]));
      container.querySelector('.sheet__title').style.textAlign = 'center';
      container.querySelector('.sheet__sub').style.textAlign = 'center';

    } else if (variant === 'header') {
      container = h('div', { class: 'sheet' }, [
        h('div', { class: 'sheetHeader' }, [
          h('div', { class: 'sheetHeader__logo', text: 'N' }),
          editable('h2', '', screen, 'titleC', screen.titleC),
          editable('p', '', screen, 'bodyC', screen.bodyC),
          h('button', { class: 'sheetHeader__close' }, [icon('x', 20)])
        ])
      ].concat(googleApple(true), [
        h('div', { class: 'divider', text: 'o usa la tua email' }),
        h('div', { class: 'inputRow' }, [
          emailInput,
          (goBtn = h('button', {
            class: 'inputRow__go',
            disabled: !/\S+@\S+\.\S+/.test(email),
            onclick: proceed
          }, [icon('arrow-right', 16)]))
        ]),
        h('p', { class: 'legal', text: C.ui.legale })
      ]));

    } else {
      container = h('div', { class: 'sheet' }, [
        h('div', { class: 'sheet__head' }, [
          h('div', { style: 'width:40px;height:40px', html: window.NavidaMascotte.pose('salutare') }),
          h('button', { class: 'sheet__close' }, [icon('chevron-down', 20)])
        ]),
        editable('h2', 'sheet__title', screen, 'title', screen.title),
        editable('p', 'sheet__sub', screen, 'body', screen.body),
        h('div', { class: 'inputRow' }, [
          emailInput,
          h('button', { class: 'inputRow__action', onclick: function () { emailInput.value = ''; setEmail(''); } }, [icon('x', 16)])
        ]),
        (goBtn = cta(screen, T(screen, 'cta', screen.cta), proceed, !/\S+@\S+\.\S+/.test(email))),
        h('div', { class: 'divider', text: C.ui.oppure })
      ].concat(googleApple(false)));
    }

    frag.appendChild(container);
    return frag;
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
      var curveSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      curveSvg.setAttribute('class', 'careerCurve__line');
      curveSvg.setAttribute('viewBox', '0 0 345 760');
      curveSvg.setAttribute('preserveAspectRatio', 'none');
      curveSvg.setAttribute('aria-hidden', 'true');
      var curvePath = 'M47 36 L47 104 C47 156 85 184 149 184 L252 184 C302 184 323 218 323 270 L323 354 C323 406 288 438 228 438 L132 438 C76 438 48 472 48 526 L48 604 C48 660 88 694 148 694 L298 694';
      curveSvg.innerHTML = '<path class="careerCurve__track" d="' + curvePath + '" />' +
        '<path class="careerCurve__progress" d="' + curvePath + '" />';
      var curve = h('div', { class: 'careerCurve' }, [curveSvg]);
      steps.forEach(function (step, i) {
        curve.appendChild(stepButton(step, i, 'careerCurve__step careerCurve__step--' + (i + 1)));
      });
      avviaPercorsoConsultabile(curve, Array.prototype.slice.call(curve.querySelectorAll('.careerCurve__step')), 4600);
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
