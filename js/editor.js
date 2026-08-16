/* ==========================================================================
   NAVIDA — Barra di modifica (pannello laterale)
   ==========================================================================
   Sta fuori dallo schermo del telefono, a destra, sempre aperta.
   Su mobile non compare.

   Pannelli:
     Versione   → alterna le versioni della schermata corrente
     Testi      → modifica in linea qualunque testo
     Colori     → cambia i colori del tema
     Ordine     → riordina le risposte trascinandole
     Elemento   → seleziona un elemento e scegli una variante di stile
     Vai a      → salta a una schermata qualsiasi
   ========================================================================== */

(function () {
  'use strict';

  var S = window.NavidaState;
  var C = window.NAVIDA_CONTENT;
  var VAR = window.NAVIDA_VARIANTS;
  var PAGEVAR = window.NAVIDA_PAGE_VARIANTS;
  var h, icon;

  var TABS = [
    { id: 'versione', label: 'Versione', ico: 'layers' },
    { id: 'testi',    label: 'Testi',    ico: 'type' },
    { id: 'colori',   label: 'Colori',   ico: 'palette' },
    { id: 'ordine',   label: 'Ordine',   ico: 'arrow-up-down' },
    { id: 'elemento', label: 'Elemento', ico: 'mouse-pointer-click' },
    { id: 'vai',      label: 'Vai a',    ico: 'list' }
  ];

  var COLORI = [
    { token: '--main',             label: 'Primario' },
    { token: '--bg',               label: 'Sfondo' },
    { token: '--surface',          label: 'Superficie' },
    { token: '--risposte-bg',      label: 'Risposta scelta' },
    { token: '--risposte-outline', label: 'Bordo scelta' },
    { token: '--light-outline',    label: 'Bordo' },
    { token: '--text',             label: 'Testo' },
    { token: '--text-toned',       label: 'Testo 2' },
    { token: '--disabled',         label: 'Disattivato' },
    { token: '--main-2',           label: 'Accento' }
  ];

  var Editor = {

    tab: 'versione',
    aperto: true,
    pronto: false,
    _ultimaSchermata: null,

    /* ================================================================== */
    init: function () {
      h = window.NavidaRender.h;
      icon = window.NavidaRender.icon;
      this.host = document.getElementById('editor');
      this.pronto = true;
      this.setupSkip();
      this.paint();
    },

    /* ==================================================================
       Salto rapido — invisibile finché non premi Tab
       ================================================================== */
    setupSkip: function () {
      var btn = document.getElementById('skip');
      if (!btn) return;

      btn.addEventListener('click', function () {
        // riempie il questionario con risposte finte e va al risultato
        window.NavidaApp.compilaTutto();
        window.NavidaApp.goTo('preview');
        btn.blur();
      });

      /* Il primo Tab deve portare QUI, non alla freccia indietro.
         Intercettiamo il Tab quando il fuoco è ancora sul documento. */
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab' && !e.shiftKey) {
          var a = document.activeElement;
          var fuori = !a || a === document.body || a === document.documentElement;
          if (fuori) {
            e.preventDefault();
            btn.classList.add('is-shown');
            btn.focus();
            return;
          }
        }
        if (e.key === 'Alt' || e.altKey) {
          btn.classList.add('is-shown');
          btn.focus();
        }
        if (e.key === 'Escape') { btn.classList.remove('is-shown'); btn.blur(); }
      }, true);

      btn.addEventListener('blur', function () { btn.classList.remove('is-shown'); });
    },

    /* ================================================================== */
    paint: function () {
      if (!this.pronto) return;
      if (!this.host) this.host = document.getElementById('editor');
      if (!this.host) return;

      this.host.innerHTML = '';
      this.host.classList.toggle('is-closed', !this.aperto);

      var screen = window.NavidaApp.current();
      this._ultimaSchermata = screen.id;

      this.host.appendChild(h('button', {
        class: 'ed-handle',
        title: this.aperto ? 'Chiudi il pannello' : 'Apri il pannello',
        onclick: function () { Editor.aperto = !Editor.aperto; Editor.paint(); }
      }, [icon('chevron-right', 16)]));

      this.host.appendChild(h('div', { class: 'ed-top' }, [
        icon('sliders-horizontal', 15),
        h('h2', { text: 'Modifica prototipo' }),
        h('span', { class: 'ed-screen', text: screen.id })
      ]));

      // ogni scheda attiva subito la sua modalità
      var MODO = { testi: 'text', ordine: 'order', elemento: 'pick' };

      this.host.appendChild(h('div', { class: 'ed-tabs' }, TABS.map(function (t) {
        var on = MODO[t.id] && S.mode === MODO[t.id];
        return h('button', {
          class: 'ed-tab' + (Editor.tab === t.id ? ' is-active' : '') + (on ? ' is-on' : ''),
          onclick: function () {
            Editor.tab = t.id;
            var modo = MODO[t.id] || null;
            if (S.mode !== modo) Editor.setMode(modo);   // render + modalità
            Editor.paint();
          }
        }, [icon(t.ico, 15), t.label]);
      })));

      if (S.mode) {
        var testo = {
          text: 'Clicca un testo e riscrivilo',
          order: 'Trascina le risposte',
          pick: 'Clicca un elemento'
        }[S.mode];
        this.host.appendChild(h('div', { class: 'ed-strip' }, [
          icon('pencil', 13),
          h('span', { text: testo }),
          h('button', { text: 'Esci', onclick: function () { Editor.setMode(null); Editor.paint(); } })
        ]));
      }

      this.host.appendChild(this.panel(screen));

      /* barra delle modifiche non ancora applicate */
      var n = S.inSospeso();
      if (n) {
        this.host.appendChild(h('div', { class: 'ed-pending' }, [
          h('div', { class: 'ed-pending__testa' }, [
            icon('pencil', 13),
            h('span', { text: n + (n === 1 ? ' modifica non applicata' : ' modifiche non applicate') })
          ]),
          h('div', { class: 'ed-pending__azioni' }, [
            h('button', {
              class: 'ed-btn ed-btn--primary',
              onclick: function () {
                S.applica();
                window.NavidaApp.render();
                Editor.paint();
                window.NavidaRender.toast('Modifiche applicate.');
              }
            }, [icon('check', 13), 'Applica']),
            h('button', {
              class: 'ed-btn',
              onclick: function () {
                S.scarta();
                window.NavidaApp.render();
                Editor.paint();
              }
            }, [icon('rotate-ccw', 13), 'Annulla'])
          ]),
          h('p', { class: 'ed-pending__nota', text: 'Applicando, diventano quello che vedranno tutti alla prossima apertura.' })
        ]));
      }

      /* scorciatoie di navigazione, sempre in fondo al pannello.
         Portano alla primissima e all'ultimissima schermata del flusso,
         quali che siano: aggiungendo la dashboard in fondo a content.js,
         "Fine" ci arriverà da sola. */
      var prima = C.screens[0];
      var ultima = C.screens[C.screens.length - 1];

      this.host.appendChild(h('div', { class: 'ed-foot' }, [
        h('button', {
          class: 'ed-btn',
          title: 'Vai a: ' + prima.id,
          onclick: function () {
            window.NavidaApp.restart();
            Editor.paint();
          }
        }, [icon('arrow-up', 13), 'Inizio (' + prima.id + ')']),
        h('button', {
          class: 'ed-btn',
          title: 'Vai a: ' + ultima.id,
          onclick: function () {
            window.NavidaApp.compilaTutto();
            window.NavidaApp.goTo(ultima.id);
            Editor.paint();
          }
        }, [icon('arrow-down', 13), 'Fine (' + ultima.id + ')'])
      ]));

      if (window.lucide) window.lucide.createIcons();
    },

    /* ================================================================== */
    panel: function (screen) {
      var p = h('div', { class: 'ed-panel' });
      if (this.tab === 'versione') this.panelVersione(p, screen);
      if (this.tab === 'testi')    this.panelTesti(p, screen);
      if (this.tab === 'colori')   this.panelColori(p);
      if (this.tab === 'ordine')   this.panelOrdine(p, screen);
      if (this.tab === 'elemento') this.panelElemento(p, screen);
      if (this.tab === 'vai')      this.panelVai(p, screen);
      return p;
    },

    /* --- Versione ----------------------------------------------------- */
    panelVersione: function (p, screen) {
      var def = PAGEVAR[screen.id];
      if (!def) {
        p.appendChild(h('div', { class: 'ed-empty', text: 'Questa schermata ha una sola versione.' }));
      } else {
        p.appendChild(h('div', { class: 'ed-label', text: def.etichetta }));
        var cur = S.pageVariant(screen.id, def.predefinita);
        p.appendChild(h('div', { class: 'ed-seg' }, def.options.map(function (o) {
          return h('button', {
            class: 'ed-chip' + (cur === o.value ? ' is-active' : ''),
            text: o.label,
            onclick: function () {
              S.setPageVariant(screen.id, o.value);
              window.NavidaApp.render();
              Editor.paint();
            }
          });
        })));
      }

      var n = Object.keys(S.overrides.text).length + Object.keys(S.overrides.colors).length +
              Object.keys(S.overrides.order).length + Object.keys(S.overrides.variants).length +
              Object.keys(S.overrides.page).length;

      p.appendChild(h('div', { class: 'ed-label', text: 'Copie di sicurezza' }));
      p.appendChild(h('div', { class: 'ed-actions' }, [
        h('button', {
          class: 'ed-btn',
          onclick: function () {
            window.NavidaSync.scarica(S.overrides);
            window.NavidaRender.toast('Copia scaricata.');
          }
        }, [icon('download', 13), 'Scarica una copia']),
        h('button', {
          class: 'ed-btn',
          onclick: function () {
            window.NavidaSync.ripristina(S, function () {
              window.NavidaSync.push(S.overrides);
              window.NavidaApp.render();
              Editor.paint();
              window.NavidaRender.toast('Copia ripristinata.');
            });
          }
        }, [icon('upload', 13), 'Ripristina da una copia'])
      ]));

      /* versioni conservate sul server */
      if (window.NavidaSync.disponibile) {
        var box = h('div', { class: 'ed-versioni' }, [
          h('p', { class: 'ed-hint', text: 'Carico le versioni…' })
        ]);
        p.appendChild(h('div', { class: 'ed-label', text: 'Versioni sul server' }));
        p.appendChild(box);

        window.NavidaSync.storico(function (lista) {
          box.innerHTML = '';
          if (!lista.length) {
            box.appendChild(h('p', { class: 'ed-hint', text: 'Ancora nessuna versione salvata.' }));
            return;
          }
          lista.slice(0, 8).forEach(function (v) {
            var quando = new Date(v.quando);
            var etichetta = isNaN(quando) ? String(v.quando)
              : quando.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) +
                ' · ' + quando.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            box.appendChild(h('button', {
              class: 'ed-jumpItem',
              text: etichetta + (v.autore ? ' · ' + v.autore : ''),
              onclick: function () {
                if (!confirm('Tornare a questa versione? Quella attuale resta nello storico.')) return;
                window.NavidaSync.riprendi(v.id, S, function () {
                  window.NavidaApp.render();
                  Editor.paint();
                  window.NavidaRender.toast('Versione ripristinata.');
                });
              }
            }));
          });
        });
      }

      p.appendChild(h('div', { class: 'ed-label', text: 'Stato' }));
      p.appendChild(h('p', { class: 'ed-hint', text: n ? (n + ' modifiche applicate.') : 'Nessuna modifica applicata.' }));
      p.appendChild(h('p', { class: 'ed-hint', text: window.NavidaSync.stato() }));
    },

    /* --- Testi -------------------------------------------------------- */
    panelTesti: function (p, screen) {
      var active = S.mode === 'text';
      p.appendChild(h('div', { class: 'ed-label', text: 'Modifica testi' }));
      p.appendChild(h('div', { class: 'ed-actions' }, [
        h('button', {
          class: 'ed-btn' + (active ? ' ed-btn--primary' : ''),
          onclick: function () { Editor.setMode(active ? null : 'text'); Editor.paint(); }
        }, [icon(active ? 'check' : 'type', 13), active ? 'Fine modifica' : 'Attiva modifica testi'])
      ]));
      p.appendChild(h('p', {
        class: 'ed-hint',
        text: active
          ? 'Clicca su un testo nello schermo e scrivi. Esci dal campo per salvare.'
          : 'Attiva la modalità, poi clicca su qualsiasi testo della schermata.'
      }));

      var mine = Object.keys(S.overrides.text).filter(function (k) { return k.indexOf(screen.id + '.') === 0; });
      if (mine.length) {
        p.appendChild(h('div', { class: 'ed-label', text: 'Modificati qui (' + mine.length + ')' }));
        p.appendChild(h('div', { class: 'ed-actions' }, [
          h('button', {
            class: 'ed-btn ed-btn--danger',
            onclick: function () {
              mine.forEach(function (k) { delete S.overrides.text[k]; });
              S.save();
              window.NavidaApp.render();
              Editor.paint();
            }
          }, [icon('rotate-ccw', 13), 'Ripristina questa schermata'])
        ]));
      }
    },

    /* --- Colori ------------------------------------------------------- */
    panelColori: function (p) {
      p.appendChild(h('div', { class: 'ed-label', text: 'Colori del tema' }));
      p.appendChild(h('div', { class: 'ed-colors' }, COLORI.map(function (c) {
        var cur = S.overrides.colors[c.token] ||
          getComputedStyle(document.documentElement).getPropertyValue(c.token).trim() || '#000000';
        var input = h('input', { type: 'color', value: toHex(cur) });
        input.addEventListener('input', function () { S.setColor(c.token, input.value); });
        return h('label', { class: 'ed-color' }, [input, h('span', { text: c.label })]);
      })));
      p.appendChild(h('div', { class: 'ed-actions' }, [
        h('button', {
          class: 'ed-btn ed-btn--danger',
          onclick: function () { S.resetColors(); window.NavidaApp.render(); Editor.paint(); }
        }, [icon('rotate-ccw', 13), 'Colori originali'])
      ]));
    },

    /* --- Ordine ------------------------------------------------------- */
    panelOrdine: function (p, screen) {
      if (!document.querySelector('.screen .options .opt')) {
        p.appendChild(h('div', { class: 'ed-empty', text: 'Qui non ci sono elementi da riordinare.' }));
        return;
      }
      var active = S.mode === 'order';
      p.appendChild(h('div', { class: 'ed-label', text: 'Ordine delle risposte' }));
      p.appendChild(h('div', { class: 'ed-actions' }, [
        h('button', {
          class: 'ed-btn' + (active ? ' ed-btn--primary' : ''),
          onclick: function () { Editor.setMode(active ? null : 'order'); Editor.paint(); }
        }, [icon(active ? 'check' : 'arrow-up-down', 13), active ? 'Fine riordino' : 'Attiva riordino']),
        S.overrides.order[screen.id] ? h('button', {
          class: 'ed-btn ed-btn--danger',
          onclick: function () { S.clearOrder(screen.id); window.NavidaApp.render(); Editor.paint(); }
        }, [icon('rotate-ccw', 13), 'Ordine originale']) : null
      ].filter(Boolean)));
      p.appendChild(h('p', { class: 'ed-hint', text: 'Trascina le risposte nello schermo. Si salva da solo.' }));
    },

    /* --- Elemento ----------------------------------------------------- */
    panelElemento: function (p, screen) {
      var active = S.mode === 'pick';

      p.appendChild(h('div', { class: 'ed-actions' }, [
        h('button', {
          class: 'ed-btn' + (active ? ' ed-btn--primary' : ''),
          onclick: function () {
            Editor.setMode(active ? null : 'pick');
            if (active) S.picked = null;
            Editor.paint();
          }
        }, [icon(active ? 'check' : 'mouse-pointer-click', 13), active ? 'Fine selezione' : 'Seleziona un elemento'])
      ]));

      if (!active) {
        p.appendChild(h('p', { class: 'ed-hint', text: 'Attiva la selezione e clicca un elemento nello schermo: lista risposte, titolo, pulsante, barra, mascotte.' }));
      }

      var present = [];
      document.querySelectorAll('.screen [data-varname]').forEach(function (n) {
        var nm = n.getAttribute('data-varname');
        if (present.indexOf(nm) === -1 && VAR[nm]) present.push(nm);
      });

      if (active && present.length) {
        p.appendChild(h('div', { class: 'ed-label', text: 'Elementi in questa schermata' }));
        p.appendChild(h('div', { class: 'ed-seg' }, present.map(function (nm) {
          return h('button', {
            class: 'ed-chip' + (S.picked === nm ? ' is-active' : ''),
            text: VAR[nm].etichetta,
            onclick: function () { S.picked = nm; Editor.paint(); Editor.markPicked(); }
          });
        })));
      }

      if (S.picked && VAR[S.picked]) {
        var def = VAR[S.picked];
        var base = (S.picked === 'answerList' && screen.listStyle) ? screen.listStyle : def.predefinita;
        var cur = S.variant(screen.id, S.picked, base);
        p.appendChild(h('div', { class: 'ed-label', text: def.etichetta }));
        p.appendChild(h('div', { class: 'ed-seg' }, def.options.map(function (o) {
          return h('button', {
            class: 'ed-chip' + (cur === o.value ? ' is-active' : ''),
            text: o.label,
            onclick: function () {
              S.setVariant(screen.id, S.picked, o.value);
              window.NavidaApp.render();
              Editor.paint();
            }
          });
        })));
        p.appendChild(h('div', { class: 'ed-actions' }, [
          h('button', {
            class: 'ed-btn',
            onclick: function () {
              S.setVariantGlobal(S.picked, S.variant(screen.id, S.picked, base));
              window.NavidaApp.render();
              window.NavidaRender.toast('Applicato a tutte le schermate.');
            }
          }, [icon('copy', 13), 'Applica a tutte'])
        ]));
      }
    },

    /* --- Vai a -------------------------------------------------------- */
    panelVai: function (p, screen) {
      var groups = {};
      C.screens.forEach(function (s, i) {
        (groups[s.chapter] = groups[s.chapter] || []).push({ s: s, i: i });
      });
      var nomi = { intro: 'Ingresso', scoperta: 'Fase 1 · Scoperta', auth: 'Accesso e risultato', test: 'Fase 2 · Questionario' };

      Object.keys(groups).forEach(function (ch) {
        p.appendChild(h('div', { class: 'ed-label', text: nomi[ch] || ch }));
        p.appendChild(h('div', { class: 'ed-jump' }, groups[ch].map(function (e) {
          return h('button', {
            class: 'ed-jumpItem' + (e.s.id === screen.id ? ' is-active' : ''),
            text: e.s.id + ' · ' + String(e.s.title || '').slice(0, 26),
            onclick: function () { window.NavidaApp.goTo(e.s.id); Editor.paint(); }
          });
        })));
      });
    },

    /* ================================================================== */
    setMode: function (mode) {
      S.mode = mode;
      if (mode !== 'pick') S.picked = null;
      window.NavidaApp.render();
    },

    markPicked: function () {
      document.querySelectorAll('.screen [data-varname]').forEach(function (n) {
        n.classList.toggle('is-picked', n.getAttribute('data-varname') === S.picked);
      });
    },

    /* ================================================================== */
    afterRender: function () {
      if (!h) return;

      /* Se siamo passati a un'altra schermata, il pannello va ridisegnato:
         versioni, elementi e ordine sono diversi da schermata a schermata. */
      var idOra = window.NavidaApp.current().id;
      if (this._ultimaSchermata !== idOra) {
        this._ultimaSchermata = idOra;
        this.paint();
        // paint() rifà gli agganci sotto, quindi qui abbiamo finito
        this._agganci();
        return;
      }

      this._agganci();
    },

    /** Agganci alle modalità attive (testi, selezione elemento). */
    _agganci: function () {

      if (S.mode === 'text') {
        document.querySelectorAll('.screen [data-editable]').forEach(function (n) {
          n.classList.add('is-editing');
          n.setAttribute('contenteditable', 'true');
          n.setAttribute('spellcheck', 'false');
          n.addEventListener('blur', function () {
            S.setText(n.getAttribute('data-editable'), n.textContent.trim());
          });
          n.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); n.blur(); }
            e.stopPropagation();
          });
          n.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
        });
      }

      if (S.mode === 'pick') {
        document.querySelectorAll('.screen [data-varname]').forEach(function (n) {
          n.classList.add('is-pickable');
          n.addEventListener('click', function (e) {
            e.preventDefault(); e.stopPropagation();
            S.picked = n.getAttribute('data-varname');
            Editor.paint();
            Editor.markPicked();
          }, true);
        });
        this.markPicked();
      }
    },

    /* ================================================================== */
    exportFile: function () {
      var blob = new Blob([S.exportJSON()], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'navida-modifiche.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    },

    importFile: function () {
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'application/json';
      inp.onchange = function () {
        var f = inp.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          try {
            S.importJSON(fr.result);
            S.applyColors();
            window.NavidaApp.render();
            Editor.paint();
            window.NavidaRender.toast('Modifiche importate.');
          } catch (e) {
            alert('File non valido: ' + e.message);
          }
        };
        fr.readAsText(f);
      };
      inp.click();
    }
  };

  function toHex(v) {
    v = String(v).trim();
    if (v[0] === '#') {
      if (v.length === 4) return '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      return v.slice(0, 7);
    }
    var m = v.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (!m) return '#000000';
    return '#' + [1, 2, 3].map(function (i) {
      return ('0' + parseInt(m[i], 10).toString(16)).slice(-2);
    }).join('');
  }

  window.NavidaEditor = Editor;
})();
