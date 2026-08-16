/* ==========================================================================
   NAVIDA — Tastiera finta iOS
   ==========================================================================
   Il prototipo è un mockup da cellulare: quando un campo di testo prende il
   fuoco, la tastiera sale dal basso come su un telefono vero.
   È solo scenografia — si scrive con la tastiera del computer — ma i tasti
   funzionano anche al clic.
   ========================================================================== */

(function () {
  'use strict';

  var RIGHE = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  var Keyboard = {

    campo: null,
    nodo: null,

    /** Aggancia la tastiera a un campo: sale al focus, scende al blur. */
    attach: function (input, suggerimenti) {
      var K = this;
      input.addEventListener('focus', function () { K.show(input, suggerimenti); });
      input.addEventListener('blur', function () {
        // se il clic è finito sulla tastiera stessa non la chiudiamo
        setTimeout(function () {
          if (document.activeElement !== input) K.hide();
        }, 120);
      });
    },

    show: function (input, suggerimenti) {
      this.campo = input;
      if (this.nodo) { this.nodo.classList.add('is-up'); return; }

      var h = window.NavidaRender.h;
      var K = this;
      var host = document.querySelector('.device');
      if (!host) return;

      function tasto(ch) {
        return h('button', {
          class: 'kb__key',
          tabindex: '-1',
          text: ch,
          onmousedown: function (e) { e.preventDefault(); K.digita(ch); }
        });
      }

      var kb = h('div', { class: 'kb' }, [
        h('div', { class: 'kb__suggest' }, (suggerimenti || ['Ciao', 'Comunque', 'Grazie']).map(function (s, i) {
          return h('button', {
            class: 'kb__sugg' + (i === 0 ? ' is-first' : ''),
            tabindex: '-1',
            text: s,
            onmousedown: function (e) { e.preventDefault(); K.digita(s + ' '); }
          });
        })),
        h('div', { class: 'kb__row' }, RIGHE[0].map(tasto)),
        h('div', { class: 'kb__row kb__row--2' }, RIGHE[1].map(tasto)),
        h('div', { class: 'kb__row' }, [
          h('button', { class: 'kb__key kb__key--mod', tabindex: '-1', html: '&#8679;', onmousedown: function (e) { e.preventDefault(); } })
        ].concat(RIGHE[2].map(tasto), [
          h('button', {
            class: 'kb__key kb__key--mod', tabindex: '-1', html: '&#9003;',
            onmousedown: function (e) { e.preventDefault(); K.cancella(); }
          })
        ])),
        h('div', { class: 'kb__row kb__row--last' }, [
          h('button', { class: 'kb__key kb__key--alt', tabindex: '-1', text: 'ABC', onmousedown: function (e) { e.preventDefault(); } }),
          h('button', {
            class: 'kb__key kb__key--space', tabindex: '-1', text: 'space',
            onmousedown: function (e) { e.preventDefault(); K.digita(' '); }
          }),
          h('button', {
            class: 'kb__key kb__key--alt', tabindex: '-1', text: 'return',
            onmousedown: function (e) { e.preventDefault(); K.campo && K.campo.blur(); }
          })
        ]),
        h('div', { class: 'kb__bar' })
      ]);

      host.appendChild(kb);
      this.nodo = kb;
      requestAnimationFrame(function () { kb.classList.add('is-up'); });
      document.querySelector('.device').classList.add('kb-open');
    },

    digita: function (ch) {
      if (!this.campo) return;
      this.campo.value += ch;
      this.campo.dispatchEvent(new Event('input', { bubbles: true }));
    },

    cancella: function () {
      if (!this.campo) return;
      this.campo.value = this.campo.value.slice(0, -1);
      this.campo.dispatchEvent(new Event('input', { bubbles: true }));
    },

    hide: function () {
      var kb = this.nodo;
      this.campo = null;
      var dev = document.querySelector('.device');
      if (dev) dev.classList.remove('kb-open');
      if (!kb) return;
      kb.classList.remove('is-up');
      this.nodo = null;
      setTimeout(function () { if (kb.parentNode) kb.remove(); }, 280);
    },

    /** Da chiamare a ogni cambio schermata. */
    reset: function () {
      if (this.nodo && this.nodo.parentNode) this.nodo.remove();
      this.nodo = null;
      this.campo = null;
      var dev = document.querySelector('.device');
      if (dev) dev.classList.remove('kb-open');
    }
  };

  window.NavidaKeyboard = Keyboard;
})();
