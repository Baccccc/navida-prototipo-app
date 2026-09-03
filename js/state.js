/* ==========================================================================
   NAVIDA — Stato dell'applicazione + persistenza
   ==========================================================================
   Tutte le modifiche fatte dalla barra di modifica finiscono qui e vengono
   salvate nel browser (localStorage). Si possono esportare/importare in JSON
   per passarle da una persona all'altra o metterle in produzione.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'navida-prototipo-v1';

  var State = {

    /* --- navigazione ------------------------------------------------ */
    index: 0,
    direction: 'forward',

    /* --- risposte dell'utente --------------------------------------- */
    answers: {},

    /* --- modifiche APPLICATE (quelle che vedono tutti) --------------- */
    overrides: {
      text: {},      // "screenId.title" -> "nuovo testo"
      colors: {},    // "--main" -> "#4240ba"
      order: {},     // "screenId" -> [2,0,1,...]
      variants: {},  // "screenId:nomeVariante" -> "valore"
      page: {}       // "screenId" -> "varianteDiPagina"
    },

    /* --- modifiche IN BOZZA (visibili solo a chi le sta facendo) -----
       Restano qui finché non si preme "Applica". */
    draft: {
      text: {}, colors: {}, order: {}, variants: {}, page: {}
    },

    /* --- modalità dell'editor --------------------------------------- */
    mode: null,        // null | 'text' | 'order' | 'pick'
    editorOpen: false,
    picked: null,      // nome della variante selezionata in modalità 'pick'

    /* ================================================================
       PERSISTENZA
       ================================================================ */

    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (!raw) return;
        var data = JSON.parse(raw);
        if (data && data.overrides) {
          this.overrides = Object.assign(this.overrides, data.overrides);
        }
      } catch (e) {
        console.warn('[Navida] impossibile leggere le modifiche salvate', e);
      }
    },

    save: function () {
      try {
        localStorage.setItem(KEY, JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          overrides: this.overrides
        }));
      } catch (e) {
        console.warn('[Navida] impossibile salvare le modifiche', e);
      }
    },

    reset: function () {
      this.overrides = { text: {}, colors: {}, order: {}, variants: {}, page: {} };
      this.draft = { text: {}, colors: {}, order: {}, variants: {}, page: {} };
      try { localStorage.removeItem(KEY); } catch (e) {}
    },

    /* ================================================================
       BOZZA
       ================================================================ */

    /** Chiamata a ogni modifica: avvisa l'editor che c'è roba da applicare. */
    tocca: function () {
      // l'editor potrebbe non essere ancora pronto: in quel caso non fa nulla
      if (window.NavidaEditor && window.NavidaEditor.pronto) {
        window.NavidaEditor.paint();
      }
    },

    /** Quante modifiche sono in attesa di essere applicate. */
    inSospeso: function () {
      var n = 0;
      var d = this.draft;
      ['text', 'colors', 'order', 'variants', 'page'].forEach(function (k) {
        n += Object.keys(d[k]).length;
      });
      return n;
    },

    /** Porta la bozza nelle modifiche applicate e salva. */
    applica: function () {
      var d = this.draft, o = this.overrides;
      ['text', 'colors', 'order', 'variants', 'page'].forEach(function (k) {
        Object.keys(d[k]).forEach(function (key) { o[k][key] = d[k][key]; });
        d[k] = {};
      });
      this.save();
      if (window.NavidaSync) window.NavidaSync.push(this.overrides);
    },

    /** Butta via la bozza e torna a quello che era applicato. */
    scarta: function () {
      Object.keys(this.draft.colors).forEach(function (k) {
        document.documentElement.style.removeProperty(k);
      });
      this.draft = { text: {}, colors: {}, order: {}, variants: {}, page: {} };
      this.applyColors();
    },

    exportJSON: function () {
      return JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        overrides: this.overrides
      }, null, 2);
    },

    importJSON: function (raw) {
      var data = JSON.parse(raw);
      if (!data || !data.overrides) throw new Error('File non valido');
      this.overrides = Object.assign(
        { text: {}, colors: {}, order: {}, variants: {}, page: {} },
        data.overrides
      );
      this.save();
    },

    /* ================================================================
       TESTI
       ================================================================ */

    /** Legge un testo tenendo conto delle modifiche del team. */
    text: function (path, fallback) {
      if (Object.prototype.hasOwnProperty.call(this.draft.text, path)) return this.draft.text[path];
      if (Object.prototype.hasOwnProperty.call(this.overrides.text, path)) return this.overrides.text[path];
      return fallback == null ? '' : fallback;
    },

    setText: function (path, value) {
      this.draft.text[path] = value;
      this.tocca();
    },

    /* ================================================================
       COLORI
       ================================================================ */

    applyColors: function () {
      var root = document.documentElement;
      var tutti = Object.assign({}, this.overrides.colors, this.draft.colors);
      Object.keys(tutti).forEach(function (k) { root.style.setProperty(k, tutti[k]); });
    },

    setColor: function (token, value) {
      this.draft.colors[token] = value;
      document.documentElement.style.setProperty(token, value);
      this.tocca();
    },

    resetColors: function () {
      var tutti = Object.assign({}, this.overrides.colors, this.draft.colors);
      Object.keys(tutti).forEach(function (k) {
        document.documentElement.style.removeProperty(k);
      });
      this.overrides.colors = {};
      this.draft.colors = {};
      this.save();
    },

    /* ================================================================
       ORDINE DEGLI ELEMENTI
       ================================================================ */

    /** Restituisce le opzioni riordinate secondo le modifiche del team. */
    ordered: function (screenId, options) {
      var order = this.draft.order[screenId] || this.overrides.order[screenId];
      if (!order || order.length !== options.length) return options.slice();
      var out = [];
      for (var i = 0; i < order.length; i++) {
        var item = options[order[i]];
        if (item) out.push(item);
      }
      return out.length === options.length ? out : options.slice();
    },

    setOrder: function (screenId, order) {
      this.draft.order[screenId] = order;
      this.tocca();
    },

    clearOrder: function (screenId) {
      delete this.draft.order[screenId];
      delete this.overrides.order[screenId];
      this.save();
    },

    /* ================================================================
       VARIANTI
       ================================================================ */

    /** Variante di stile di un elemento nella schermata corrente. */
    variant: function (screenId, name, fallback) {
      var key = screenId + ':' + name;
      var glob = '*:' + name;
      if (Object.prototype.hasOwnProperty.call(this.draft.variants, key)) return this.draft.variants[key];
      if (Object.prototype.hasOwnProperty.call(this.overrides.variants, key)) return this.overrides.variants[key];
      if (Object.prototype.hasOwnProperty.call(this.draft.variants, glob)) return this.draft.variants[glob];
      if (Object.prototype.hasOwnProperty.call(this.overrides.variants, glob)) return this.overrides.variants[glob];
      return fallback;
    },

    setVariant: function (screenId, name, value) {
      this.draft.variants[screenId + ':' + name] = value;
      this.tocca();
    },

    setVariantGlobal: function (name, value) {
      this.draft.variants['*:' + name] = value;
      this.tocca();
    },

    /** Variante di pagina (es. quale dei 3 login mostrare). */
    pageVariant: function (screenId, fallback) {
      if (Object.prototype.hasOwnProperty.call(this.draft.page, screenId)) return this.draft.page[screenId];
      if (Object.prototype.hasOwnProperty.call(this.overrides.page, screenId)) return this.overrides.page[screenId];
      return fallback;
    },

    setPageVariant: function (screenId, value) {
      this.draft.page[screenId] = value;
      this.tocca();
    },

    /* ================================================================
       RISPOSTE
       ================================================================ */

    answer: function (field, fallback) {
      if (!field) return fallback;
      return Object.prototype.hasOwnProperty.call(this.answers, field)
        ? this.answers[field]
        : fallback;
    },

    setAnswer: function (field, value) {
      if (!field) return;
      this.answers[field] = value;
    },

    resetAnswers: function () {
      this.answers = {};
    }
  };

  window.NavidaState = State;
})();
