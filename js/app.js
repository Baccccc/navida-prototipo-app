/* ==========================================================================
   NAVIDA — Router e avvio
   ========================================================================== */

(function () {
  'use strict';

  var S = window.NavidaState;
  var C = window.NAVIDA_CONTENT;
  var R = window.NavidaRender;

  var App = {

    _pending: null,

    /* ------------------------------------------------------------------ */
    screens: function () { return C.screens; },

    current: function () { return C.screens[S.index]; },

    /** La schermata va saltata? (es. "ultima posizione" per chi cerca il primo lavoro) */
    shouldSkip: function (screen) {
      if (!screen || !screen.skipIf) return false;
      return S.answer(screen.skipIf.field) === screen.skipIf.equals;
    },

    /* ------------------------------------------------------------------ */
    next: function () {
      if (this._pending) { clearTimeout(this._pending); this._pending = null; }
      var i = S.index;
      do { i++; } while (i < C.screens.length && this.shouldSkip(C.screens[i]));

      if (i >= C.screens.length) { this.restart(); return; }
      S.direction = 'forward';
      S.index = i;
      this.render();
    },

    back: function () {
      if (this._pending) { clearTimeout(this._pending); this._pending = null; }
      var i = S.index;
      do { i--; } while (i > 0 && this.shouldSkip(C.screens[i]));
      if (i < 0) return;
      S.direction = 'back';
      S.index = i;
      this.render();
    },

    goTo: function (id) {
      if (this._pending) { clearTimeout(this._pending); this._pending = null; }
      var i = C.screens.findIndex(function (s) { return s.id === id; });
      if (i === -1) return;
      S.direction = i > S.index ? 'forward' : 'back';
      S.index = i;
      this.render();
    },

    restart: function () {
      S.resetAnswers();
      S.index = 0;
      S.direction = 'forward';
      this.render();
    },

    /**
     * Riempie tutte le risposte con valori plausibili.
     * Serve al pulsante "Salta al questionario" durante le demo:
     * non c'è bisogno di rifare tutto il percorso ogni volta.
     */
    compilaTutto: function () {
      S.answers = {
        nome: 'Marco', cognome: 'Rossi', eta: '29', citta: 'Padova',
        genere: 'Uomo',
        email: 'marco.rossi@example.com',
        motivazione: 'Sto lavorando, ma non mi riconosco in quello che faccio',
        obiettivo: 'Capire come vorrei cambiare lavoro',
        titoloStudio: 'Laurea triennale',
        specializzazione: 'Nessuna',
        situazione: 'occupato',
        ultimaPosizione: 'Impiegato amministrativo',
        lavoroSogni: 'Front-end developer',
        categoria: 'cat15',
        mansioni: ['Front-end developer', 'Full-stack developer'],
        livello: 'Livello avanzato',
        trasferimento: 'Sì',
        sognoGrande: 'Costruire prodotti digitali che usano milioni di persone.'
      };
      // ordinamenti e domande di personalità
      ['rankSicurezza', 'rankFlessibilita', 'rankCrescita'].forEach(function (k) {
        S.answers[k] = [0, 1, 2, 3, 4, 5];
      });
      for (var i = 1; i <= 7; i++) S.answers['p' + i] = null;
      C.screens.forEach(function (s) {
        if (/^p\d$/.test(s.field || '') && s.options && s.options.length) {
          S.answers[s.field] = s.options[0].label;
        }
        if (s.type === 'multi' && s.options && s.options.length && !S.answers[s.field]) {
          S.answers[s.field] = [s.options[0].label, s.options[1] ? s.options[1].label : s.options[0].label];
        }
      });
      return S.answers;
    },

    /* ------------------------------------------------------------------
       Avanzamento proporzionale, calcolato sul capitolo corrente.
       ------------------------------------------------------------------ */
    progress: function (screen) {
      var chapter = screen.chapter;
      var list = C.screens.filter(function (s) {
        return s.chapter === chapter && !s.noProgress && !App.shouldSkip(s);
      });
      var pos = list.findIndex(function (s) { return s.id === screen.id; });
      var hidden = chapter === 'intro' || chapter === 'auth' || screen.noProgress || pos === -1;

      // le schede di onboarding hanno una loro barra su 4 passi
      if (screen.obStep) {
        return { value: screen.obStep / 4, total: 4, canBack: S.index > 0, hidden: false };
      }

      return {
        value: list.length ? (pos + 1) / list.length : 0,
        total: list.length || 1,
        canBack: S.index > 0,
        hidden: hidden
      };
    },

    /* ------------------------------------------------------------------ */
    render: function () {
      var screen = this.current();
      var host = document.getElementById('app');
      host.innerHTML = '';

      var wrap = document.createElement('div');
      wrap.className = 'screen' + (S.direction === 'back' ? ' screen--back' : '');
      wrap.setAttribute('data-screen', screen.id);

      if (window.NavidaKeyboard) window.NavidaKeyboard.reset();

      var tipo = screen.type;
      // la schermata di accesso ha anche le vecchie versioni a popup
      var POPUP = ['sheet', 'popup', 'header'];
      if (tipo === 'login' && POPUP.indexOf(S.pageVariant(screen.id, 'centrata')) !== -1) {
        tipo = 'loginPopup';
      }

      var renderer = R.screens[tipo];
      if (!renderer) {
        wrap.appendChild(R.h('p', { class: 'lead', text: 'Tipo di schermata non gestito: ' + screen.type }));
      } else {
        var out = renderer(screen, this.progress(screen));
        if (Array.isArray(out)) out.forEach(function (n) { if (n) wrap.appendChild(n); });
        else if (out) wrap.appendChild(out);
      }

      // queste schermate occupano tutto lo spazio, senza margini
      if (screen.type === 'hero' || tipo === 'loginPopup' || screen.type === 'splash' ||
          screen.type === 'dream' || screen.type === 'circles' || screen.type === 'loading' || screen.fullBleed) {
        wrap.style.padding = '0';
      }

      // il badge resta solo sulle schermate wow che non sono ancora state rifatte
      if (screen.wow && screen.type !== 'loading' && screen.type !== 'circles') {
        wrap.appendChild(R.h('div', { class: 'wowBadge', text: 'Sezione ludica · da rifare' }));
      }

      host.appendChild(wrap);

      var device = document.querySelector('.device');
      var isSpaceJourney = screen.type === 'loading' && S.pageVariant(screen.id, 'spazio') === 'spazio';
      if (device) device.classList.toggle('device--space', isSpaceJourney);

      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      if (window.NavidaEditor) window.NavidaEditor.afterRender();
      if (window.NavidaCommenti) window.NavidaCommenti.afterRender();
    },

    /* ------------------------------------------------------------------ */
    init: function () {
      /* Collegamenti di anteprima per review e demo, senza alterare il flusso
         normale: ?screen=lavoroSogni&variant=portale */
      try {
        var preview = new URLSearchParams(window.location.search);
        var target = preview.get('screen');
        var variant = preview.get('variant');
        var targetIndex = target
          ? C.screens.findIndex(function (screen) { return screen.id === target; })
          : -1;
        if (targetIndex > -1) S.index = targetIndex;
        var pageVariant = target && window.NAVIDA_PAGE_VARIANTS[target];
        var validVariant = pageVariant && pageVariant.options.some(function (option) {
          return option.value === variant;
        });
        if (validVariant) {
          S.draft.page[target] = variant;
        }
      } catch (e) {}
      this.render();

      document.addEventListener('keydown', function (e) {
        if (S.mode === 'text') return;
        if (e.target.matches('input, textarea, [contenteditable]')) return;
        if (e.key === 'ArrowRight') App.next();
        if (e.key === 'ArrowLeft') App.back();
      });
    }
  };

  window.NavidaApp = App;

  /* Cornice iPhone su desktop, scalata per stare sempre dentro la finestra. */
  function setupDevice() {
    var d = document.querySelector('.device');
    if (!d) return;
    var wide = window.matchMedia
      ? window.matchMedia('(min-width: 721px)').matches
      : window.innerWidth > 720;
    d.classList.toggle('device--framed', wide);

    if (!wide) { d.style.setProperty('--scale', 1); return; }

    // 393x852 + 12px di cornice per lato + respiro, meno il pannello laterale
    var sidebar = window.innerWidth >= 901 ? 300 : 0;
    var commenti = window.innerWidth >= 1241 ? 300 : 0;
    sidebar += commenti;
    var need = { w: 393 + 24 + 48, h: 852 + 24 + 48 };
    var scale = Math.min(
      1,
      (window.innerWidth - sidebar) / need.w,
      window.innerHeight / need.h
    );
    d.style.setProperty('--scale', Math.max(0.45, Math.round(scale * 1000) / 1000));
  }
  window.addEventListener('resize', function () {
    setupDevice();
  });

  /* icone della finta barra di stato */
  function setupStatusIcons() {
    var host = document.getElementById('statusIcons');
    if (!host) return;
    host.appendChild(R.icon('signal', 15));
    host.appendChild(R.icon('wifi', 15));
    host.appendChild(R.icon('battery-full', 19));
  }

  document.addEventListener('DOMContentLoaded', function () {
    try { setupDevice(); setupStatusIcons(); } catch (e) { console.warn('[Navida]', e); }
    S.load();
    // prima prova a prendere le modifiche condivise dal server, poi disegna
    window.NavidaSync.pull(S, function () {
      S.applyColors();
      // ogni pezzo è opzionale: se un file non carica, l'app parte lo stesso
      if (window.NavidaEditor) window.NavidaEditor.init();
      App.init();
      if (window.NavidaCommenti) window.NavidaCommenti.init();
      // in secondo piano: come sta messo il salvataggio sul server
      window.NavidaSync.chiediStato(function () { window.NavidaEditor.paint(); });
    });
  });
})();
