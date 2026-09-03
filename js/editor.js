/* ==========================================================================
   NAVIDA — Barra di modifica (pannello laterale)
   ==========================================================================
   Sta fuori dallo schermo del telefono, a destra, sempre aperta.

   Su mobile il pannello laterale non c'e': al suo posto compare un pulsante
   hamburger fisso in alto a destra, che apre gli stessi comandi a tutto
   schermo, riferiti alla schermata che si sta guardando.

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

  /* Il telefono e' dove il pannello laterale non c'e'.
     Stessa soglia del blocco @media in fondo a css/editor.css. */
  var Q_MOBILE = '(max-width: 900px), (pointer: coarse) and (max-width: 1100px)';

  var S = window.NavidaState;
  var C = window.NAVIDA_CONTENT;
  var VAR = window.NAVIDA_VARIANTS;
  var PAGEVAR = window.NAVIDA_PAGE_VARIANTS;
  var h, icon;

  /* Elementi con stile fisso: restano configurati per il rendering, ma non
     devono comparire tra le varianti modificabili della barra laterale. */
  var VARIANTI_NASCOSTE = {
    answerList: true,
    progress: true,
    title: true,
    cta: true,
    mascotte: true
  };

  function varianteVisibile(nome) {
    return !!VAR[nome] && !VARIANTI_NASCOSTE[nome];
  }

  var TABS = [
    { id: 'versione', label: 'Versione', ico: 'layers' },
    { id: 'testi',    label: 'Testi',    ico: 'type' },
    { id: 'colori',   label: 'Colori',   ico: 'palette' },
    { id: 'mascotte', label: 'Mascotte', ico: 'smile' },
    { id: 'ordine',   label: 'Ordine',   ico: 'arrow-up-down' },
    { id: 'elemento', label: 'Elemento', ico: 'mouse-pointer-click' },
    { id: 'vai',      label: 'Vai a',    ico: 'list' },
    { id: 'commenti', label: 'Commenti', ico: 'message-square' }
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
    apertoMobile: false,
    pronto: false,
    _ultimaSchermata: null,

    /* ================================================================== */
    init: function () {
      h = window.NavidaRender.h;
      icon = window.NavidaRender.icon;
      this.host = document.getElementById('editor');
      this.pronto = true;
      this.setupMobile();
      this.setupSkip();
      this.paint();
    },

    /** Vero quando il pannello laterale e' nascosto e comanda l'hamburger. */
    mobile: function () {
      return !!(window.matchMedia && window.matchMedia(Q_MOBILE).matches);
    },

    /* ==================================================================
       Telefono — hamburger in alto a destra
       ==================================================================
       Sempre presente. Aprendolo, il pannello diventa una pagina a tutto
       schermo con le stesse schede della barra laterale.
       ================================================================== */
    setupMobile: function () {
      if (this.burger) return;

      this.burger = h('button', {
        id: 'edburger',
        type: 'button',
        'aria-label': 'Apri i comandi del prototipo',
        onclick: function () {
          Editor.apertoMobile = !Editor.apertoMobile;
          Editor.paint();
        }
      });
      document.body.appendChild(this.burger);

      /* Striscia della modalita' attiva: resta a schermo quando la pagina
         dei comandi si chiude per lasciarti toccare l'interfaccia. */
      this.stripMobile = h('div', { id: 'edmode' });
      document.body.appendChild(this.stripMobile);
    },

    /** Disegna hamburger e striscia. Sul desktop il CSS li nasconde. */
    paintMobile: function () {
      if (!this.burger) return;

      var aperta = this.apertoMobile;
      this.burger.innerHTML = '';
      this.burger.appendChild(icon(aperta ? 'x' : 'menu', 20));
      this.burger.setAttribute('aria-label',
        aperta ? 'Chiudi i comandi del prototipo' : 'Apri i comandi del prototipo');
      this.burger.classList.toggle('is-open', aperta);

      var strip = this.stripMobile;
      strip.innerHTML = '';

      var testo = {
        text: 'Tocca un testo e riscrivilo',
        order: 'Trascina le risposte',
        pick: 'Tocca un elemento'
      }[S.mode];

      var mostra = !!testo && !aperta;
      strip.classList.toggle('is-on', mostra);
      if (!mostra) return;

      strip.appendChild(icon('pencil', 13));
      strip.appendChild(h('span', { text: testo }));
      strip.appendChild(h('button', {
        type: 'button',
        text: 'Esci',
        onclick: function () { Editor.setMode(null); Editor.paint(); }
      }));
    },

    /* ==================================================================
       Salto rapido — invisibile finché non premi Tab
       ================================================================== */
    setupSkip: function () {
      var btn = document.getElementById('skip');
      if (!btn) return;

      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-target');
        if (target) {
          window.location.href = target;
          return;
        }
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
      this.host.classList.toggle('is-mobile-open', this.apertoMobile);

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

      var schede = TABS.filter(function (t) {
        return t.id !== 'commenti' || !!window.NavidaCommenti;
      });

      this.host.appendChild(h('div', { class: 'ed-tabs' }, schede.map(function (t) {
        var on = MODO[t.id] && S.mode === MODO[t.id];
        var aperti = (t.id === 'commenti' && window.NavidaCommenti)
          ? window.NavidaCommenti.apertiTotali() : 0;

        return h('button', {
          class: 'ed-tab' + (Editor.tab === t.id ? ' is-active' : '') + (on ? ' is-on' : ''),
          onclick: function () {
            Editor.tab = t.id;
            var modo = MODO[t.id] || null;
            if (S.mode !== modo) Editor.setMode(modo);   // render + modalità
            else if (modo && Editor.mobile()) Editor.apertoMobile = false;
            Editor.paint();
          }
        }, [
          h('span', { class: 'ed-tab__ico' }, [
            icon(t.ico, 15),
            aperti ? h('span', { class: 'ed-tab__badge', text: String(aperti) }) : null
          ].filter(Boolean)),
          t.label
        ]);
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

      this.paintMobile();

      if (window.lucide) window.lucide.createIcons();
    },

    /* ================================================================== */
    panel: function (screen) {
      var p = h('div', { class: 'ed-panel' });
      if (this.tab === 'versione') this.panelVersione(p, screen);
      if (this.tab === 'testi')    this.panelTesti(p, screen);
      if (this.tab === 'colori')   this.panelColori(p);
      if (this.tab === 'mascotte') this.panelMascotte(p, screen);
      if (this.tab === 'ordine')   this.panelOrdine(p, screen);
      if (this.tab === 'elemento') this.panelElemento(p, screen);
      if (this.tab === 'vai')      this.panelVai(p, screen);
      if (this.tab === 'commenti' && window.NavidaCommenti) window.NavidaCommenti.pannello(p);
      return p;
    },

    /* --- Versione ------------------------------------------------------
       In cima le versioni della schermata intera, poi tutti gli elementi
       che si possono cambiare su questa schermata. */
    panelVersione: function (p, screen) {

      /* 1 · versioni della schermata */
      var def = PAGEVAR[screen.id];
      if (!def) {
        p.appendChild(h('div', { class: 'ed-label', text: 'Versione della schermata' }));
        p.appendChild(h('p', { class: 'ed-hint', text: 'Questa schermata ha una sola versione.' }));
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

      /* 2 · elementi presenti su questa schermata */
      var presenti = [];
      document.querySelectorAll('.screen [data-varname]').forEach(function (n) {
        var nome = n.getAttribute('data-varname');
        if (presenti.indexOf(nome) === -1 && varianteVisibile(nome)) presenti.push(nome);
      });

      if (presenti.length) {
        p.appendChild(h('div', { class: 'ed-sep' }));

        presenti.forEach(function (nome) {
          var d = VAR[nome];
          var base = (nome === 'answerList' && screen.listStyle) ? screen.listStyle : d.predefinita;
          var attuale = S.variant(screen.id, nome, base);

          var titolo = h('div', {
            class: 'ed-label ed-label--puntabile',
            text: d.etichetta
          });
          // passandoci sopra, l'elemento si illumina nello schermo
          titolo.addEventListener('mouseenter', function () { Editor.illumina(nome, true); });
          titolo.addEventListener('mouseleave', function () { Editor.illumina(nome, false); });
          p.appendChild(titolo);

          p.appendChild(h('div', { class: 'ed-seg' }, d.options.map(function (o) {
            var b = h('button', {
              class: 'ed-chip' + (attuale === o.value ? ' is-active' : ''),
              text: o.label,
              onclick: function () {
                S.setVariant(screen.id, nome, o.value);
                window.NavidaApp.render();
                Editor.paint();
              }
            });
            b.addEventListener('mouseenter', function () { Editor.illumina(nome, true); });
            b.addEventListener('mouseleave', function () { Editor.illumina(nome, false); });
            return b;
          })));

          if (attuale !== base) {
            p.appendChild(h('div', { class: 'ed-actions' }, [
              h('button', {
                class: 'ed-btn',
                onclick: function () {
                  S.setVariantGlobal(nome, attuale);
                  window.NavidaApp.render();
                  Editor.paint();
                  window.NavidaRender.toast('Applicato a tutte le schermate.');
                }
              }, [icon('copy', 13), 'Usa questo ovunque'])
            ]));
          }
        });
      }

      var n = Object.keys(S.overrides.text).length + Object.keys(S.overrides.colors).length +
              Object.keys(S.overrides.order).length + Object.keys(S.overrides.variants).length +
              Object.keys(S.overrides.page).length;

      p.appendChild(h('div', { class: 'ed-sep' }));
      p.appendChild(h('div', { class: 'ed-label', text: 'Stato' }));
      p.appendChild(h('p', { class: 'ed-hint', text: n ? (n + ' modifiche applicate.') : 'Nessuna modifica applicata.' }));
      p.appendChild(h('p', { class: 'ed-hint', text: window.NavidaSync.stato() }));

      var problema = window.NavidaSync.problema();
      if (problema) {
        p.appendChild(h('div', { class: 'ed-allarme' }, [
          h('div', { class: 'ed-allarme__testa' }, [icon('lightbulb', 13), 'Da sistemare sul server']),
          h('p', { class: 'ed-allarme__testo', text: problema })
        ]));
      }

      /* copie di sicurezza: in fondo, fuori dai piedi */
      p.appendChild(h('div', { class: 'ed-minirow' }, [
        h('button', {
          class: 'ed-mini',
          title: 'Scarica un file con tutte le modifiche applicate',
          onclick: function () {
            window.NavidaSync.scarica(S.overrides);
            window.NavidaRender.toast('Copia scaricata.');
          }
        }, [icon('download', 12), 'Scarica copia']),
        h('button', {
          class: 'ed-mini',
          title: 'Rimetti le modifiche da un file scaricato prima',
          onclick: function () {
            window.NavidaSync.ripristina(S, function () {
              window.NavidaSync.push(S.overrides);
              window.NavidaApp.render();
              Editor.paint();
              window.NavidaRender.toast('Copia ripristinata.');
            });
          }
        }, [icon('upload', 12), 'Ripristina']),
        window.NavidaSync.disponibile ? h('button', {
          class: 'ed-mini',
          title: 'Torna a una versione salvata sul server',
          onclick: function () { Editor.mostraStorico(); }
        }, [icon('rotate-ccw', 12), 'Versioni']) : null
      ].filter(Boolean)));
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

    /* --- Mascotte ----------------------------------------------------- */
    panelMascotte: function (p, screen) {
      var def = VAR.mascotte;
      var cur = S.variant(screen.id, 'mascotte', def.predefinita);

      p.appendChild(h('div', { class: 'ed-label', text: 'Scegli la mascotte' }));
      p.appendChild(h('div', { class: 'ed-seg' }, def.options.map(function (o) {
        return h('button', {
          class: 'ed-chip' + (cur === o.value ? ' is-active' : ''),
          text: o.label,
          onclick: function () {
            S.setVariant(screen.id, 'mascotte', o.value);
            window.NavidaApp.render();
            Editor.paint();
          }
        });
      })));

      p.appendChild(h('div', { class: 'ed-actions' }, [
        h('button', {
          class: 'ed-btn',
          onclick: function () {
            S.setVariantGlobal('mascotte', S.variant(screen.id, 'mascotte', def.predefinita));
            window.NavidaApp.render();
            Editor.paint();
            window.NavidaRender.toast('Mascotte applicata a tutte le schermate.');
          }
        }, [icon('copy', 13), 'Usa questa ovunque'])
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
        p.appendChild(h('p', { class: 'ed-hint', text: 'Attiva la selezione e clicca un elemento modificabile nello schermo.' }));
      }

      var present = [];
      document.querySelectorAll('.screen [data-varname]').forEach(function (n) {
        var nm = n.getAttribute('data-varname');
        if (present.indexOf(nm) === -1 && varianteVisibile(nm)) present.push(nm);
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
      var nomi = { intro: 'Ingresso', scoperta: 'Fase 1 · Scoperta', auth: 'Accesso e risultato', test: 'Fase 2 · Questionario', fase3: 'Fase 3 · Dashboard' };

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
      /* Su telefono la pagina dei comandi copre lo schermo. Se la modalità
         chiede di toccare l'interfaccia, la chiudiamo; uscendo, torna. */
      if (this.mobile()) this.apertoMobile = !mode;
      window.NavidaApp.render();
    },

    markPicked: function () {
      document.querySelectorAll('.screen [data-varname]').forEach(function (n) {
        n.classList.toggle('is-picked', n.getAttribute('data-varname') === S.picked);
      });
    },

    /** Illumina nello schermo l'elemento a cui si riferisce una voce. */
    illumina: function (nome, si) {
      document.querySelectorAll('.screen [data-varname="' + nome + '"]').forEach(function (n) {
        n.classList.toggle('is-evidenziato', !!si);
      });
    },

    /** Elenco delle versioni salvate sul server, in una finestrella. */
    mostraStorico: function () {
      window.NavidaSync.storico(function (lista) {
        if (!lista.length) {
          window.NavidaRender.toast('Ancora nessuna versione salvata.');
          return;
        }
        var righe = lista.slice(0, 10).map(function (v, i) {
          var d = new Date(v.quando);
          var q = isNaN(d) ? String(v.quando)
            : d.toLocaleDateString('it-IT') + ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
          return (i + 1) + ') ' + q + (v.autore ? ' — ' + v.autore : '');
        });
        var scelta = prompt(
          'Versioni salvate sul server:\n\n' + righe.join('\n') +
          '\n\nScrivi il numero della versione da ripristinare (o annulla).'
        );
        var n = parseInt(scelta, 10);
        if (!n || n < 1 || n > lista.length) return;
        window.NavidaSync.riprendi(lista[n - 1].id, S, function () {
          window.NavidaApp.render();
          Editor.paint();
          window.NavidaRender.toast('Versione ripristinata.');
        });
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
          if (!varianteVisibile(n.getAttribute('data-varname'))) return;
          n.classList.add('is-pickable');
          n.addEventListener('click', function (e) {
            e.preventDefault(); e.stopPropagation();
            S.picked = n.getAttribute('data-varname');
            /* Su telefono l'elemento scelto riapre la pagina dei comandi,
               dove stanno le sue varianti. */
            if (Editor.mobile()) Editor.apertoMobile = true;
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
