/* ==========================================================================
   NAVIDA — Commenti del team
   ==========================================================================
   Si scrivono e si gestiscono dal pannello di destra (scheda "Commenti"),
   ma COMPAIONO a sinistra dello schermo del telefono, come foglietti
   attaccati accanto alla schermata a cui si riferiscono.

   Se il server PHP non c'è (file aperto in locale), restano comunque nel
   browser di chi li scrive: tutto continua a funzionare.
   ========================================================================== */

(function () {
  'use strict';

  var URL_API = 'api/commenti.php';
  var CHIAVE_LOCALE = 'navida-commenti-v1';

  var h, icon;

  var Commenti = {

    pronto: false,
    disponibile: false,
    lista: [],
    _ultimaSchermata: null,

    /* ================================================================== */
    init: function () {
      h = window.NavidaRender.h;
      icon = window.NavidaRender.icon;
      this.host = document.getElementById('commenti');
      this.pronto = true;
      this.carica();
    },

    /* ==================================================================
       DATI
       ================================================================== */

    localiLeggi: function () {
      try { return JSON.parse(localStorage.getItem(CHIAVE_LOCALE) || '[]'); } catch (e) { return []; }
    },

    localiScrivi: function (lista) {
      try { localStorage.setItem(CHIAVE_LOCALE, JSON.stringify(lista)); } catch (e) {}
    },

    /** Ridisegna sia i foglietti a sinistra sia il pannello di destra. */
    aggiorna: function () {
      this.paint();
      if (window.NavidaEditor && window.NavidaEditor.tab === 'commenti') {
        window.NavidaEditor.paint();
      }
    },

    /** Chiede al server dove finiscono i commenti. */
    chiediStato: function () {
      var C = this;
      if (typeof fetch !== 'function') return;
      fetch(URL_API + '?stato=1', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (j) { C.info = j; if (window.NavidaEditor) window.NavidaEditor.paint(); })
        .catch(function () {});
    },

    /** Scarica i commenti dal server, o li legge dal browser. */
    carica: function (poi) {
      var C = this;

      if (typeof fetch !== 'function' ||
          (location.protocol !== 'http:' && location.protocol !== 'https:')) {
        C.lista = C.localiLeggi();
        C.disponibile = false;
        C.aggiorna();
        if (poi) poi();
        return;
      }

      fetch(URL_API, { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) {
          C.disponibile = true;
          C.lista = j.commenti || [];
          C.chiediStato();
        })
        .catch(function () {
          C.disponibile = false;
          C.lista = C.localiLeggi();
        })
        .then(function () { C.aggiorna(); if (poi) poi(); });
    },

    aggiungi: function (testo) {
      var C = this;
      var schermata = window.NavidaApp.current().id;

      if (!this.disponibile) {
        var lista = this.localiLeggi();
        lista.push({
          id: Date.now(),
          schermata: schermata,
          testo: testo,
          risolto: false,
          quando: new Date().toISOString()
        });
        this.localiScrivi(lista);
        this.lista = lista;
        this.aggiorna();
        window.NavidaRender.toast('Salvato solo su questo browser.');
        return;
      }

      fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ azione: 'nuovo', schermata: schermata, testo: testo })
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.ok) C.carica();
          else window.NavidaRender.toast(j.errore || 'Commento non salvato.');
        })
        .catch(function () { window.NavidaRender.toast('Server non raggiungibile.'); });
    },

    risolvi: function (id) {
      var C = this;
      if (!this.disponibile) {
        var lista = this.localiLeggi().map(function (c) {
          if (c.id === id) c.risolto = !c.risolto;
          return c;
        });
        this.localiScrivi(lista);
        this.lista = lista;
        this.aggiorna();
        return;
      }
      fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ azione: 'risolvi', id: id })
      }).then(function () { C.carica(); });
    },

    cancella: function (id) {
      var C = this;
      if (!confirm('Eliminare questo commento?')) return;

      if (!this.disponibile) {
        var lista = this.localiLeggi().filter(function (c) { return c.id !== id; });
        this.localiScrivi(lista);
        this.lista = lista;
        this.aggiorna();
        return;
      }

      fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ azione: 'cancella', id: id })
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.ok) C.carica();
          else window.NavidaRender.toast(j.errore || 'Non eliminato.');
        });
    },

    /* ==================================================================
       I FOGLIETTI A SINISTRA DELLO SCHERMO
       ================================================================== */

    diQuesta: function () {
      var id = window.NavidaApp.current().id;
      return this.lista.filter(function (c) { return c.schermata === id; });
    },

    quando: function (c) {
      var d = new Date(c.quando);
      if (isNaN(d)) return '';
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ' · ' +
             d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    },

    paint: function () {
      if (!this.pronto) return;
      if (!this.host) this.host = document.getElementById('commenti');
      if (!this.host) return;

      var C = this;
      this._ultimaSchermata = window.NavidaApp.current().id;

      var miei = this.diQuesta();
      this.host.innerHTML = '';
      this.host.classList.toggle('is-vuoto', !miei.length);

      if (!miei.length) return;

      miei.forEach(function (c, i) {
        C.host.appendChild(h('div', {
          class: 'cm-nota' + (c.risolto ? ' is-risolto' : ''),
          style: 'animation-delay:' + (i * 60) + 'ms'
        }, [
          h('div', { class: 'cm-nota__testa' }, [
            h('span', { class: 'cm-nota__data', text: C.quando(c) })
          ]),
          h('p', { class: 'cm-nota__testo', text: c.testo }),
          c.risolto ? h('span', { class: 'cm-nota__tag' }, [icon('check', 11), 'Risolto']) : null
        ].filter(Boolean)));
      });

      if (window.lucide) window.lucide.createIcons();
    },

    /** Chiamata dopo ogni render: se cambia schermata, ridisegna. */
    afterRender: function () {
      if (!this.pronto) return;
      if (this._ultimaSchermata !== window.NavidaApp.current().id) this.paint();
    },

    /* ==================================================================
       IL PANNELLO DI DESTRA (scheda "Commenti" dell'editor)
       ================================================================== */

    pannello: function (p) {
      var C = this;
      var screen = window.NavidaApp.current();
      var miei = this.diQuesta();

      /* --- scrivi ---------------------------------------------------- */
      var campo = h('textarea', {
        class: 'ed-campo',
        rows: '3',
        placeholder: 'Scrivi un commento su “' + (screen.title || screen.id) + '”…'
      });
      campo.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) invia();
      });

      function invia() {
        var t = campo.value.trim();
        if (!t) return;
        campo.value = '';
        C.aggiungi(t);
      }

      p.appendChild(h('div', { class: 'ed-label', text: 'Nuovo commento' }));
      p.appendChild(campo);
      p.appendChild(h('div', { class: 'ed-actions' }, [
        h('button', { class: 'ed-btn ed-btn--primary', onclick: invia }, [icon('arrow-right', 13), 'Invia'])
      ]));
      p.appendChild(h('p', { class: 'ed-hint', text: 'Compare a sinistra dello schermo, sulla schermata corrente.' }));

      /* --- quelli di questa schermata -------------------------------- */
      p.appendChild(h('div', { class: 'ed-label', text: 'Su questa schermata (' + miei.length + ')' }));

      if (!miei.length) {
        p.appendChild(h('div', { class: 'ed-empty', text: 'Ancora nessun commento.' }));
      } else {
        miei.forEach(function (c) {
          p.appendChild(h('div', { class: 'ed-commento' + (c.risolto ? ' is-risolto' : '') }, [
            h('div', { class: 'ed-commento__testa' }, [
              h('span', { class: 'ed-commento__data', text: C.quando(c) })
            ]),
            h('p', { class: 'ed-commento__testo', text: c.testo }),
            h('div', { class: 'ed-commento__azioni' }, [
              h('button', {
                class: 'ed-mini',
                onclick: function () { C.risolvi(c.id); }
              }, [icon(c.risolto ? 'rotate-ccw' : 'check', 12), c.risolto ? 'Riapri' : 'Risolto']),
              h('button', {
                class: 'ed-mini ed-mini--danger',
                onclick: function () { C.cancella(c.id); }
              }, [icon('x', 12), 'Elimina'])
            ])
          ]));
        });
      }

      /* --- le altre schermate che ne hanno --------------------------- */
      var altrove = {};
      this.lista.forEach(function (c) {
        if (c.schermata === screen.id || c.risolto) return;
        altrove[c.schermata] = (altrove[c.schermata] || 0) + 1;
      });
      var chiavi = Object.keys(altrove);

      if (chiavi.length) {
        p.appendChild(h('div', { class: 'ed-label', text: 'Aperti su altre schermate' }));
        p.appendChild(h('div', { class: 'ed-jump' }, chiavi.map(function (id) {
          return h('button', {
            class: 'ed-jumpItem',
            text: id + ' · ' + altrove[id] + (altrove[id] === 1 ? ' commento' : ' commenti'),
            onclick: function () { window.NavidaApp.goTo(id); window.NavidaEditor.paint(); }
          });
        })));
      }

      var info = this.info || {};
      p.appendChild(h('p', { class: 'ed-hint', text: this.disponibile
        ? 'I commenti li vedono tutti' + (info.modo ? ' · salvati ' + (info.modo === 'database' ? 'nel database' : 'in un file') : '') + '.'
        : 'Server non attivo: restano solo su questo browser.' }));

      if (info.sicuro === false) {
        p.appendChild(h('div', { class: 'ed-allarme' }, [
          h('div', { class: 'ed-allarme__testa' }, [icon('lightbulb', 13), 'I commenti non sono al sicuro']),
          h('p', { class: 'ed-allarme__testo', text: info.nota || '' }),
          h('p', { class: 'ed-allarme__testo', text: 'Apri api/diagnostica.php per i dettagli.' })
        ]));
      }
    },

    /** Quanti commenti aperti ci sono in tutto: serve al pallino sulla scheda. */
    apertiTotali: function () {
      return this.lista.filter(function (c) { return !c.risolto; }).length;
    }
  };

  window.NavidaCommenti = Commenti;
})();
