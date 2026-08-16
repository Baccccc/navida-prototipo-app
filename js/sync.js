/* ==========================================================================
   NAVIDA — Sincronizzazione delle modifiche fra tutti
   ==========================================================================
   Se il prototipo gira su un hosting con PHP (es. Hostinger), le modifiche
   applicate vengono salvate sul server e chiunque apra il link le vede.

   Se PHP non c'è (apertura del file in locale, oppure Cloudflare Pages),
   tutto continua a funzionare usando solo il browser: le modifiche restano
   di chi le ha fatte.
   ========================================================================== */

(function () {
  'use strict';

  var URL_API = 'api/config.php';

  var Sync = {

    disponibile: false,
    ultimoErrore: null,

    /** Parola d'ordine chiesta una volta per sessione, poi tenuta in memoria. */
    _password: null,

    /**
     * Scarica le modifiche condivise e le usa come base.
     * Quelle salvate nel browser hanno la precedenza, così chi sta
     * lavorando non si vede sovrascrivere quello che ha appena fatto.
     */
    pull: function (S, done) {
      var fatto = false;
      function fine() { if (!fatto) { fatto = true; done(); } }

      // serve http(s) e serve fetch: altrimenti si va avanti senza server
      if (typeof fetch !== 'function') return fine();
      if (location.protocol !== 'http:' && location.protocol !== 'https:') {
        return fine();
      }

      var t = setTimeout(fine, 2500);   // non bloccare mai l'avvio

      fetch(URL_API, { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
          Sync.disponibile = true;
          var remoto = (data && data.overrides) || {};
          ['text', 'colors', 'order', 'variants', 'page'].forEach(function (k) {
            if (!remoto[k]) return;
            // il locale vince: sono modifiche più recenti di chi sta qui
            S.overrides[k] = Object.assign({}, remoto[k], S.overrides[k]);
          });
        })
        .catch(function (e) { Sync.ultimoErrore = e; })
        .then(function () { clearTimeout(t); fine(); });
    },

    /** Manda al server le modifiche applicate. */
    push: function (overrides) {
      if (!this.disponibile || typeof fetch !== 'function') return;

      if (!this._password) {
        this._password = prompt(
          'Parola d’ordine per salvare le modifiche per tutti.\n' +
          '(Annulla: le modifiche restano solo su questo browser)'
        );
        if (!this._password) return;
      }

      fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this._password, overrides: overrides })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && res.j.ok) {
            window.NavidaRender.toast('Salvato per tutti.');
          } else {
            Sync._password = null;
            window.NavidaRender.toast(res.j.errore || 'Salvataggio non riuscito.');
          }
        })
        .catch(function () {
          window.NavidaRender.toast('Server non raggiungibile: salvato solo qui.');
        });
    },

    /** Etichetta da mostrare nella barra laterale. */
    stato: function () {
      if (location.protocol === 'file:') return 'Modifiche salvate solo su questo browser';
      if (!this.disponibile) return 'Server non attivo: modifiche solo su questo browser';
      var d = this.info || {};
      var dove = d.modo === 'database' ? 'nel database' : 'in un file sul server';
      return 'Le modifiche valgono per tutti, salvate ' + dove +
             (d.versioni ? ' · ' + d.versioni + ' versioni conservate' : '');
    },

    /** Se qualcosa non va, la spiegazione da mostrare in evidenza. */
    problema: function () {
      var d = this.info || {};
      return d.nota || '';
    },

    /** Chiede al server come sta messo il salvataggio. */
    chiediStato: function (poi) {
      if (!this.disponibile || typeof fetch !== 'function') return poi && poi();
      fetch(URL_API + '?stato=1', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (j) { Sync.info = j; })
        .catch(function () {})
        .then(function () { if (poi) poi(); });
    },

    /* ==================================================================
       COPIE DI SICUREZZA
       ================================================================== */

    /** Scarica un file JSON con tutte le modifiche applicate. */
    scarica: function (overrides) {
      var payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        overrides: overrides
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      var d = new Date();
      var stamp = d.getFullYear() +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        ('0' + d.getDate()).slice(-2) + '-' +
        ('0' + d.getHours()).slice(-2) +
        ('0' + d.getMinutes()).slice(-2);
      a.href = URL.createObjectURL(blob);
      a.download = 'navida-modifiche-' + stamp + '.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    },

    /** Carica un file JSON e lo rimette al suo posto. */
    ripristina: function (S, poi) {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'application/json';
      inp.onchange = function () {
        var f = inp.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          try {
            var data = JSON.parse(fr.result);
            if (!data || !data.overrides) throw new Error('Non è una copia di Navida');
            S.overrides = Object.assign(
              { text: {}, colors: {}, order: {}, variants: {}, page: {} },
              data.overrides
            );
            S.save();
            S.applyColors();
            if (poi) poi();
          } catch (e) {
            alert('File non valido: ' + e.message);
          }
        };
        fr.readAsText(f);
      };
      inp.click();
    },

    /** Elenco delle versioni conservate sul server. */
    storico: function (poi) {
      if (!this.disponibile || typeof fetch !== 'function') return poi([]);
      fetch(URL_API + '?storico=1', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (j) { poi(j.versioni || []); })
        .catch(function () { poi([]); });
    },

    /** Riporta in vita una versione precedente. */
    riprendi: function (id, S, poi) {
      fetch(URL_API + '?versione=' + encodeURIComponent(id), { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data || !data.overrides) throw new Error('versione vuota');
          S.overrides = Object.assign(
            { text: {}, colors: {}, order: {}, variants: {}, page: {} },
            data.overrides
          );
          S.save();
          S.applyColors();
          Sync.push(S.overrides);
          if (poi) poi();
        })
        .catch(function () { window.NavidaRender.toast('Non riesco a leggere quella versione.'); });
    }
  };

  window.NavidaSync = Sync;
})();
