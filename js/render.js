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
      class: 'mascotte mascotte--float ' + (cls || ''),
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
    var titolo = editable('h1', 'title ' + (extraCls || ''), screen, 'title', screen.title, { variant: 'title' });

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

  function makeSortable(container, onEnd) {
    container.classList.add('sortable');
    var dragging = null, startY = 0, items = [];

    function onDown(e) {
      var item = e.target.closest('.opt');
      if (!item || !container.contains(item)) return;
      dragging = item;
      startY = e.clientY;
      items = Array.prototype.slice.call(container.querySelectorAll('.opt'));
      item.classList.add('is-dragging');
      item.setPointerCapture && item.setPointerCapture(e.pointerId);
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      var y = e.clientY;
      var idx = items.indexOf(dragging);
      for (var i = 0; i < items.length; i++) {
        if (items[i] === dragging) continue;
        var r = items[i].getBoundingClientRect();
        var mid = r.top + r.height / 2;
        if (i < idx && y < mid) { container.insertBefore(dragging, items[i]); break; }
        if (i > idx && y > mid) { container.insertBefore(dragging, items[i].nextSibling); break; }
      }
      items = Array.prototype.slice.call(container.querySelectorAll('.opt'));
    }

    function onUp() {
      if (!dragging) return;
      dragging.classList.remove('is-dragging');
      dragging = null;
      detach();
      var order = Array.prototype.slice.call(container.querySelectorAll('.opt'))
        .map(function (n) { return parseInt(n.getAttribute('data-oi'), 10); });
      onEnd(order);
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
      if (dragging) attach();
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
    if (m) body.appendChild(m);

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

    var bodyText = T(screen, 'body', screen.body);
    if (bodyText) body.appendChild(editable('p', 'lead', screen, 'body', screen.body));
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

    var box = optionsBox(screen, []);

    /* i numeri stanno FUORI dai box, in una colonna a sinistra:
       restano fermi mentre trascini, così si legge come una classifica */
    var scala = h('div', { class: 'rankScale' });

    function numeri() {
      scala.innerHTML = '';
      seq.forEach(function (_, pos) {
        scala.appendChild(h('span', { class: 'opt__pos', text: String(pos + 1) }));
      });
    }

    function paint() {
      box.innerHTML = '';
      seq.forEach(function (entry) {
        var label = optLabel(screen, entry.i, entry.o.label);
        box.appendChild(h('div', { class: 'opt opt--rank', 'data-oi': entry.i }, [
          h('span', { class: 'opt__grip' }, [icon('grip-vertical', 16)]),
          h('span', { class: 'opt__label', 'data-editable': screen.id + '.opt.' + entry.i, text: label })
        ]));
      });
      numeri();
    }
    paint();

    makeSortable(box, function (order) {
      seq = order.map(function (i) { return indexed[i]; });
      S.setAnswer(screen.field, order);
      if (S.mode === 'order') S.setOrder(screen.id, order);
    });

    var body = h('div', { class: 'body' }, [
      screen.eyebrow ? editable('div', 'eyebrow eyebrow--sub', screen, 'eyebrow', screen.eyebrow) : null,
      intestazione(screen, 'title--rank'),
      screen.body ? editable('p', 'lead', screen, 'body', screen.body) : null,
      h('p', { class: 'nota', text: C.ui.ordinaHint }),
      h('div', { class: 'rankWrap' }, [scala, box])
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
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
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

    var ring = window.NavidaWow.anelli(T(screen, 'frase', screen.frase));
    ring.classList.add('ring--enter');

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
      try { input.focus(); autoGrow(); } catch (e) {}
    }, 1500);

    function avanti() {
      // la tastiera scende e gli anelli riprendono a girare
      window.NavidaKeyboard.hide();
      input.blur();
      ring.classList.remove('ring--enter');
      ring.classList.add('ring--spin');
      if (ctaBtn) ctaBtn.disabled = true;
      setTimeout(function () { window.NavidaApp.next(); }, 900);
    }

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), avanti, !value.trim());

    var root = h('div', { class: 'dream' }, [
      header(screen, progress),
      ring,
      h('div', { class: 'dream__center' }, [input]),
      h('div', { class: 'dream__footer' }, [ctaBtn])
    ]);

    return root;
  };

  /* --- sezione ludica: i tre cerchi che coprono lo schermo ------------ */
  Screens.circles = function (screen) {
    return window.NavidaWow.cerchi(function () { window.NavidaApp.next(); });
  };

  /* --- spiegazione del riordino, con dimostrazione animata ------------ */
  Screens.rankIntro = function (screen, progress) {
    var righe = (screen.demo || ['Stipendio', 'Flessibilità', 'Crescita']);

    var demo = h('div', { class: 'rankDemo' }, righe.map(function (t, i) {
      return h('div', { class: 'rankDemo__row', 'data-i': String(i) }, [
        h('span', { class: 'opt__pos', text: String(i + 1) }),
        h('span', { class: 'opt__grip' }, [icon('grip-vertical', 16)]),
        h('span', { class: 'rankDemo__label', text: t })
      ]);
    }));
    // il dito che trascina la terza riga in cima, in loop
    demo.appendChild(h('span', { class: 'rankDemo__hand', html: manina() }));

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
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
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
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      screen.nota ? editable('p', 'nota', screen, 'nota', screen.nota) : null,
      wrap
    ].filter(Boolean));

    ctaBtn = cta(screen, T(screen, 'cta', screen.cta || C.ui.continua), function () { window.NavidaApp.next(); }, !valid());
    return [header(screen, progress), body, h('div', { class: 'footer' }, [ctaBtn])];
  };

  /* --- loading -------------------------------------------------------- */
  Screens.loading = function (screen, progress) {
    var stack = h('div', { class: 'loader__stack' }, [h('div', { class: 'loader__ring' })]);
    var wordHost = h('div', { class: 'loader__word' });
    stack.appendChild(wordHost);

    if (screen.loop && screen.loop.length) {
      var i = 0;
      wordHost.textContent = screen.loop[0];
      var timer = setInterval(function () {
        i = (i + 1) % screen.loop.length;
        wordHost.textContent = screen.loop[i];
        wordHost.style.animation = 'none';
        void wordHost.offsetWidth;
        wordHost.style.animation = '';
      }, 520);
      setTimeout(function () { clearInterval(timer); }, screen.durata || 3000);
    } else {
      wordHost.innerHTML = window.NavidaMascotte.pose('saltare');
      wordHost.style.width = '80px';
      wordHost.style.height = '104px';
    }

    var body = h('div', { class: 'body body--center' }, [
      h('div', { class: 'loader' }, [stack]),
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      screen.body ? editable('p', 'lead', screen, 'body', screen.body) : null,
      screen.attesa ? editable('p', 'nota', screen, 'attesa', screen.attesa) : null
    ].filter(Boolean));

    var t = setTimeout(function () { window.NavidaApp.next(); }, screen.durata || 3000);
    window.NavidaApp._pending = t;

    return [
      header(screen, progress),
      body,
      h('div', { class: 'footer' }, [
        h('button', { class: 'linkbtn', text: 'Salta l’attesa', onclick: function () { clearTimeout(t); window.NavidaApp.next(); } })
      ])
    ];
  };

  /* --- risultato / prima proiezione ----------------------------------- */
  Screens.result = function (screen, progress) {
    var variant = S.pageVariant(screen.id, PAGEVAR.previsione.predefinita);

    var body = h('div', { class: 'body' }, [
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      editable('p', 'lead', screen, 'body', screen.body)
    ]);

    if (variant === 'single') {
      var first = screen.tips[0];
      body.appendChild(h('div', { class: 'tips', 'data-varname': 'tips', 'data-variant': S.variant(screen.id, 'tips', 'accent') }, [
        h('div', { class: 'tip' }, [
          h('div', { class: 'tip__title', 'data-editable': screen.id + '.tip.0.title', text: S.text(screen.id + '.tip.0.title', first.title) }),
          h('div', { class: 'tip__desc', 'data-editable': screen.id + '.tip.0.desc', text: interp(S.text(screen.id + '.tip.0.desc', first.description)) })
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
    var path = h('div', {
      class: 'path',
      'data-varname': 'path',
      'data-variant': S.variant(screen.id, 'path', VAR.path.predefinita)
    }, screen.steps.map(function (st, i) {
      return h('div', { class: 'pathStep' }, [
        h('div', { class: 'pathStep__rail' }, [
          h('div', { class: 'pathStep__dot', text: String(i + 1) }),
          h('div', { class: 'pathStep__line' })
        ]),
        h('div', { class: 'pathStep__body' }, [
          h('div', { class: 'pathStep__nome', 'data-editable': screen.id + '.step.' + i + '.nome', text: interp(S.text(screen.id + '.step.' + i + '.nome', st.nome)) }),
          h('div', { class: 'pathStep__meta', text: interp(st.ruolo) + ' · ' + st.durata }),
          h('div', { class: 'pathStep__obj', 'data-editable': screen.id + '.step.' + i + '.obj', text: interp(S.text(screen.id + '.step.' + i + '.obj', st.obiettivo)) })
        ])
      ]);
    }));

    var body = h('div', { class: 'body' }, [
      editable('h1', 'title', screen, 'title', screen.title, { variant: 'title' }),
      editable('p', 'lead', screen, 'body', screen.body),
      path
    ]);

    return [
      header(screen, progress),
      body,
      h('div', { class: 'footer' }, [
        cta(screen, T(screen, 'cta', screen.cta), function () { window.NavidaApp.next(); }),
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
