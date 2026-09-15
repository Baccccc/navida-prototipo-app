/* ==========================================================================
   NAVIDA — Profilo, notifiche e consulenza
   ==========================================================================
   Schermate di questo file:

     profilo          nvProfilo          identità, percorso, curriculum, dati, impostazioni
     modificaProfilo  nvModificaProfilo  modulo con i dati anagrafici
     fotoProfilo      nvFotoProfilo      il profilo con sopra il pannello "Foto profilo"
     curriculum       nvCurriculum       il CV in versione app + genera, carica, portfolio
     preferenze       nvPreferenze       aspetto, notifiche, lingua, accessibilità, privacy
     logout           nvLogout           il profilo con sopra la conferma di uscita
     notifiche        nvNotifiche        la campanella, divisa in Nuove e Precedenti
     consulenza       nvInArrivo         "la consulenza sta arrivando"

   Stile: css/app/profilo.css (prefissi nv-pro-, nv-cv-, nv-pref-, nv-noti-, nv-soon-).

   Il prototipo non salva niente: foto, preferenze e notifiche lette cambiano
   solo in memoria (NV.dati), cosi' si vede l'effetto finche' non ricarichi.

   Parametri di prova nell'indirizzo:
     ?screen=curriculum&foglio=cv        apre l'anteprima del CV
     ?screen=curriculum&foglio=letto     apre il risultato del CV caricato
     ?screen=curriculum&foglio=aggiungi  apre il modulo "Aggiungi esperienza"
     ?screen=curriculum&foglio=link      apre il modulo del link al portfolio
     ?screen=preferenze&foglio=lingua    apre la scelta della lingua
     ?screen=preferenze&foglio=elimina   apre la conferma "Elimina account"
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV, h = NV.h, icon = NV.icon, ICO = NV.ICO;
  var D = NV.dati;
  var U = D.utente;
  var screens = window.NavidaRender.screens;

  /* Disegni Lucide che mancano nella base. */
  NV.icone({
    'check-check': '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
    'circle-dollar-sign': '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
    'accessibility': '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
    'a-large-small': '<path d="M21 14h-5"/><path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16"/><path d="M4.5 13h6"/><path d="m3 16 4.5-9 4.5 9"/>',
    'file-down': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>',
    'bell-ring': '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M22 8c0-2.3-.8-4.3-2-6"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/>'
  });

  /* L'avatar di partenza: "Rimuovi foto" torna a questo. */
  var AVATAR_PREDEFINITO = U.avatar;

  /* Le mascotte che si possono scegliere come avatar. */
  var AVATAR_MASCOTTE = [
    'laptop-seduto', 'salutare', 'computer', 'laureato', 'razzo',
    'ok', 'leggere', 'pensare', 'skateboard', 'cuffie'
  ];

  /* Versione mostrata in fondo al profilo e nelle preferenze. */
  var VERSIONE = '0.3 · prototipo';

  /* ==================================================================
     PEZZI COMUNI DI QUESTO FILE
     ================================================================== */

  function nomeCompleto() { return [U.nome, U.cognome].filter(Boolean).join(' '); }

  function schermataDa(id) {
    var lista = (window.NAVIDA_CONTENT && window.NAVIDA_CONTENT.screens) || [];
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return { id: id, title: '' };
  }

  /* Parametro "foglio" dall'indirizzo: vale solo per la schermata aperta
     dall'indirizzo, e una volta sola. */
  var foglioDaIndirizzo = (function () {
    try {
      var qs = new URLSearchParams(window.location.search);
      return { screen: qs.get('screen'), foglio: qs.get('foglio') };
    } catch (e) { return {}; }
  })();

  /** Il foglio da aprire subito: dall'indirizzo o da NV.vai(id, { proFoglio }). */
  function foglioIniziale(id) {
    var ctx = NV.contesto();
    if (ctx.proFoglio && ctx.proFoglio.screen === id) {
      var f = ctx.proFoglio.foglio;
      ctx.proFoglio = null;
      return f;
    }
    if (foglioDaIndirizzo.screen === id && foglioDaIndirizzo.foglio) {
      var g = foglioDaIndirizzo.foglio;
      foglioDaIndirizzo.foglio = null;
      return g;
    }
    return null;
  }

  /** Avatar tondo. opts: dim (px), anello (0-100), camera (fn) */
  function avatar(opts) {
    opts = opts || {};
    var foto = h('img', { class: 'nv-pro-avatar__img', src: U.avatar, alt: '' });
    var box = h('div', {
      class: 'nv-pro-avatar' + (opts.anello != null ? ' nv-pro-avatar--anello' : '') + (opts.classe ? ' ' + opts.classe : ''),
      style: (opts.anello != null ? '--nv-pro-anello:' + opts.anello + '%;' : '')
    }, [
      h('span', { class: 'nv-pro-avatar__foto' }, [foto]),
      opts.camera ? h('button', {
        class: 'nv-pro-avatar__camera',
        type: 'button',
        'aria-label': 'Cambia la foto profilo',
        onclick: opts.camera
      }, [h('span', { class: 'nv-pro-avatar__cameraIco' }, [icon('camera', ICO.SM)])]) : null
    ]);
    return box;
  }

  /**
   * Riga di un elenco raggruppato.
   *   icona, titolo, sotto, valore (testo a destra), destra (nodo a destra),
   *   chev (freccina), onclick, rischio (rosso), conteggio (pallino col numero)
   * Se a destra c'e' un interruttore, tutta la riga lo accende.
   */
  function voce(o) {
    var interno = [
      o.icona ? h('span', { class: 'nv-pro-voce__ico' }, [icon(o.icona, ICO.MD)]) : null,
      h('span', { class: 'nv-pro-voce__copy' }, [
        h('span', { class: 'nv-pro-voce__titolo', text: o.titolo }),
        o.sotto ? h('span', { class: 'nv-pro-voce__sotto', text: o.sotto }) : null
      ]),
      o.conteggio ? h('span', { class: 'nv-pro-voce__n', text: String(o.conteggio) }) : null,
      o.valore ? h('span', { class: 'nv-pro-voce__valore', text: o.valore }) : null,
      o.destra || null,
      o.chev ? h('span', { class: 'nv-pro-voce__chev' }, [icon(o.chev === true ? 'chevron-right' : o.chev, ICO.SM)]) : null
    ];
    var classe = 'nv-pro-voce' + (o.rischio ? ' nv-pro-voce--rischio' : '') + (o.sotto ? ' nv-pro-voce--due' : '') + (o.classe ? ' ' + o.classe : '');
    if (o.destra && o.destra.classList && o.destra.classList.contains('nv-switch')) {
      return h('div', {
        class: classe + ' nv-press',
        onclick: function () { o.destra.click(); }
      }, interno);
    }
    if (o.onclick) return h('button', { class: classe + ' nv-press', type: 'button', onclick: o.onclick }, interno);
    return h('div', { class: classe }, interno);
  }

  /** Scheda bianca che tiene insieme piu' righe, divise da un filo. */
  function gruppo(righe, classe) {
    return h('div', { class: 'nv-pro-gruppo' + (classe ? ' ' + classe : '') }, righe);
  }

  /** Pastiglia che non si tocca (competenze, soft skill). */
  function pastiglia(testo, tipo) {
    return h('span', { class: 'nv-pro-pill' + (tipo ? ' nv-pro-pill--' + tipo : ''), text: testo });
  }

  /** Titoletto piccolo dentro un gruppo o un modulo. */
  function titoletto(testo, extra) {
    return h('div', { class: 'nv-pro-titoletto' }, [h('h2', { text: testo }), extra || null]);
  }

  /** Pulsante rosso per le azioni che tolgono (esci, elimina). */
  function pulsanteRischio(label, onclick, iconaNome) {
    return NV.pulsante(label, { icona: iconaNome, onclick: onclick, classe: 'nv-pro-btn--rischio' });
  }

  /**
   * Velo con pannello, disegnato insieme alla schermata (non dopo).
   * Serve a Foto profilo ed Esci, che sono schermate a se'.
   */
  function veloSchermata(pannello, centrato, chiudi) {
    var velo = h('div', { class: 'nv-scrim' + (centrato ? ' nv-scrim--centro' : '') }, [pannello]);
    velo.addEventListener('click', function (e) { if (e.target === velo) chiudi(); });
    return velo;
  }

  function chiudiSopraProfilo() { NV.indietro('profilo'); }

  /* ==================================================================
     PROFILO
     ================================================================== */

  function profiloIdentita(screen) {
    return h('section', { class: 'nv-pro-id' }, [
      h('div', { class: 'nv-pro-id__riga' }, [
        avatar({ anello: U.completezza, camera: function () { NV.vai('fotoProfilo'); } }),
        NV.pulsante('Modifica', {
          variante: 'secondario',
          icona: 'pencil-line',
          piccolo: true,
          classe: 'nv-btn--hug nv-pro-id__modifica',
          onclick: function () { NV.vai('modificaProfilo'); }
        })
      ]),
      h('div', { class: 'nv-pro-id__testi' }, [
        h('h1', { class: 'nv-title', text: nomeCompleto() }),
        h('p', { class: 'nv-pro-id__meta' }, [
          h('span', { text: U.occupazione }),
          h('span', { class: 'nv-pro-id__punto', 'aria-hidden': 'true' }),
          h('span', { text: U.citta })
        ])
      ]),
      h('button', {
        class: 'nv-pro-completa nv-press',
        type: 'button',
        onclick: function () { NV.vai('curriculum'); }
      }, [
        h('span', { class: 'nv-pro-completa__testi' }, [
          h('span', { class: 'nv-pro-completa__titolo' }, [
            h('strong', { text: 'Profilo completo al ' + U.completezza + '%' })
          ]),
          NV.testo(screen, 'completaNota', 'Aggiungi il portfolio: i suggerimenti diventano più precisi.', 'span', 'nv-pro-completa__nota'),
          NV.avanzamento(U.completezza, 100)
        ]),
        h('span', { class: 'nv-pro-tondo' }, [icon('chevron-right', ICO.MD)])
      ])
    ]);
  }

  function profiloPercorso(screen) {
    var steps = NV.steps();
    var attuale = NV.stepAttuale();
    var step = steps[attuale] || steps[0];

    var tacche = h('div', { class: 'nv-pro-tacche', 'aria-hidden': 'true' }, steps.map(function (s, i) {
      return h('span', { class: 'nv-pro-tacca' + (i < attuale ? ' is-fatta' : '') + (i === attuale ? ' is-attuale' : '') });
    }));

    var hero = h('button', {
      class: 'nv-hero nv-pro-meta nv-press',
      type: 'button',
      onclick: function () { NV.vai('percorso'); }
    }, [
      h('span', { class: 'nv-pro-meta__cima' }, [
        h('span', { class: 'nv-pro-meta__occhiello', text: 'Il tuo obiettivo' }),
        h('span', { class: 'nv-pro-meta__vai' }, [icon('arrow-up-right', ICO.MD)])
      ]),
      h('span', { class: 'nv-pro-meta__titolo', text: D.percorso.obiettivo || U.obiettivo }),
      tacche,
      h('span', { class: 'nv-pro-meta__step' }, [
        h('strong', { text: 'Step ' + (attuale + 1) + ' di ' + steps.length }),
        h('span', { text: step.titolo })
      ])
    ]);

    function tessera(icona, tono, titolo, nota, onclick) {
      return h('button', { class: 'nv-pro-tessera nv-press', type: 'button', onclick: onclick }, [
        NV.icoChip(icona, tono),
        h('span', { class: 'nv-pro-tessera__titolo', text: titolo }),
        h('span', { class: 'nv-pro-tessera__nota', text: nota })
      ]);
    }

    return NV.sezione('Il tuo percorso', [
      hero,
      h('div', { class: 'nv-pro-tessere' }, [
        tessera('rotate-ccw', 1, 'Rifai il test', 'Ultimo il ' + U.testFatto, function () {
          window.location.href = 'index.html?screen=introQuestionario';
        }),
        tessera('target', 2, 'Cambia il lavoro dei sogni', 'Ora: ' + (D.percorso.obiettivo || U.obiettivo), function () {
          window.location.href = 'index.html?screen=lavoroSogni';
        })
      ])
    ]);
  }

  function profiloCurriculum() {
    var cv = D.curriculum;
    var competenze = (cv.competenze || []).concat(cv.softSkill || []);
    var visibili = competenze.slice(0, 3);
    var altre = competenze.length - visibili.length;

    function numero(n, etichetta) {
      return h('div', { class: 'nv-pro-numero' }, [
        h('strong', { text: String(n) }),
        h('span', { text: etichetta })
      ]);
    }

    return NV.sezione('Curriculum', [
      h('div', { class: 'nv-pro-cvbox' }, [
        h('button', {
          class: 'nv-pro-cvbox__cima nv-press',
          type: 'button',
          onclick: function () { NV.vai('curriculum'); }
        }, [
          h('div', { class: 'nv-pro-numeri' }, [
            numero((cv.formazione || []).length, 'Formazione'),
            numero((cv.esperienze || []).length, 'Esperienze'),
            numero((cv.certificazioni || []).length, 'Certificati')
          ]),
          h('div', { class: 'nv-pro-pills' }, visibili.map(function (c) { return pastiglia(c); })
            .concat(altre > 0 ? [pastiglia('+' + altre, 'altre')] : []))
        ]),
        gruppo([
          voce({ icona: 'sparkles', titolo: 'Genera il tuo CV', sotto: 'Pronto da scaricare in PDF', chev: true, onclick: function () {
            NV.vai('curriculum', { proFoglio: { screen: 'curriculum', foglio: 'cv' } });
          } }),
          voce({ icona: 'file-up', titolo: 'Carica CV o portfolio', sotto: 'Compiliamo noi i campi', chev: true, onclick: function () {
            NV.vai('curriculum');
          } })
        ], 'nv-pro-gruppo--dentro')
      ])
    ], { azione: { label: 'Apri', onclick: function () { NV.vai('curriculum'); } } });
  }

  function profiloDati() {
    function dato(icona, etichetta, valore) {
      return h('div', { class: 'nv-pro-dato' }, [
        h('span', { class: 'nv-pro-dato__ico' }, [icon(icona, ICO.MD)]),
        h('span', { class: 'nv-pro-dato__copy' }, [
          h('small', { text: etichetta }),
          h('strong', { text: valore || '—' })
        ])
      ]);
    }
    return NV.sezione('Dati personali', [
      gruppo([
        dato('mail', 'Email', U.email),
        dato('phone', 'Telefono', U.telefono),
        dato('calendar', 'Data di nascita', U.nascita),
        dato('map-pin', 'Residenza', U.indirizzo),
        dato('briefcase-business', 'Occupazione', U.occupazione),
        dato('graduation-cap', 'Titolo di studio', U.titoloStudio)
      ], 'nv-pro-gruppo--dati')
    ], { azione: { label: 'Modifica', onclick: function () { NV.vai('modificaProfilo'); } } });
  }

  function profiloImpostazioni() {
    var nuove = (D.notifiche || []).filter(function (n) { return n.nuova; }).length;
    return NV.sezione('Impostazioni', [
      gruppo([
        voce({ icona: 'sliders-horizontal', titolo: 'Preferenze', sotto: 'Tema, notifiche, accessibilità', chev: true, onclick: function () { NV.vai('preferenze'); } }),
        voce({ icona: 'bell', titolo: 'Notifiche', conteggio: nuove || null, chev: true, onclick: function () { NV.vai('notifiche'); } }),
        voce({ icona: 'shield-check', titolo: 'Privacy e dati', chev: true, onclick: function () { NV.vai('preferenze'); } }),
        voce({ icona: 'circle-help', titolo: 'Aiuto e assistenza', chev: true, onclick: function () { NV.avviso('Nel prototipo l’assistenza non è attiva'); } })
      ]),
      gruppo([
        voce({ icona: 'log-out', titolo: 'Esci', rischio: true, onclick: function () { NV.vai('logout'); } })
      ])
    ]);
  }

  screens.nvProfilo = function (screen) {
    return [
      NV.pagina('nv-pro', [
        NV.barra({
          indietro: 'dashboard',
          azioni: [NV.iconBtn('settings', 'Preferenze', function () { NV.vai('preferenze'); })]
        }),
        profiloIdentita(screen),
        profiloPercorso(screen),
        profiloCurriculum(),
        profiloDati(),
        profiloImpostazioni(),
        h('p', { class: 'nv-pro-versione' }, [
          h('span', { class: 'nv-pro-versione__logo', text: 'navida' }),
          h('span', { text: 'Versione ' + VERSIONE })
        ])
      ])
    ];
  };

  /* ==================================================================
     FOTO PROFILO
     ------------------------------------------------------------------
     E' una schermata a se' (serve al "Vai a"), ma si vede come un
     pannello sopra il profilo. Scegliere una mascotte cambia l'avatar
     subito, senza ridisegnare: il pannello non deve "rimbalzare".
     ================================================================== */
  screens.nvFotoProfilo = function (screen) {
    var sotto = screens.nvProfilo(schermataDa('profilo'));

    var anteprima = h('img', { class: 'nv-pro-avatar__img', src: U.avatar, alt: '' });
    var griglia;

    function aggiornaAvatar(src, messaggio) {
      U.avatar = src;
      anteprima.src = src;
      /* anche l'avatar del profilo sotto al velo */
      var dietro = document.querySelectorAll('#app .nv-pro-id .nv-pro-avatar__img');
      Array.prototype.forEach.call(dietro, function (img) { img.src = src; });
      Array.prototype.forEach.call(griglia.children, function (b) {
        var on = b.getAttribute('data-src') === src;
        b.classList.toggle('is-scelto', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (messaggio) NV.avviso(messaggio);
    }

    griglia = h('div', { class: 'nv-pro-avatars', role: 'group', 'aria-label': 'Avatar Navida' }, AVATAR_MASCOTTE.map(function (posa) {
      var src = 'assets/mascotte-' + posa + '.png';
      var on = src === U.avatar;
      return h('button', {
        class: 'nv-pro-avatars__voce' + (on ? ' is-scelto' : ''),
        type: 'button',
        'data-src': src,
        'aria-pressed': on ? 'true' : 'false',
        'aria-label': 'Usa la mascotte ' + ((window.NavidaMascotte && window.NavidaMascotte.label[posa]) || posa),
        onclick: function () { aggiornaAvatar(src); }
      }, [h('img', { src: src, alt: '' })]);
    }));

    var pannello = h('div', { class: 'nv-sheet nv-pro-foto', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Foto profilo' }, [
      h('span', { class: 'nv-sheet__maniglia', 'aria-hidden': 'true' }),
      h('div', { class: 'nv-sheet__head' }, [
        h('div', {}, [
          NV.testo(screen, 'title', 'Foto profilo', 'h2'),
          NV.testo(screen, 'sottotitolo', 'Una foto o un astronauta: scegli come ti vedono.', 'p')
        ]),
        NV.iconBtn('x', 'Chiudi', chiudiSopraProfilo)
      ]),
      h('div', { class: 'nv-sheet__body' }, [
        h('div', { class: 'nv-pro-foto__cima' }, [
          h('div', { class: 'nv-pro-avatar nv-pro-foto__anteprima' }, [
            h('span', { class: 'nv-pro-avatar__foto' }, [anteprima])
          ]),
          h('div', { class: 'nv-pro-foto__azioni' }, [
            NV.pulsante('Scatta una foto', { variante: 'soft', icona: 'camera', piccolo: true, onclick: function () {
              NV.avviso('Nel prototipo la fotocamera non si apre');
            } }),
            NV.pulsante('Dalla galleria', { variante: 'secondario', icona: 'image', piccolo: true, onclick: function () {
              NV.avviso('Nel prototipo la galleria non si apre');
            } })
          ])
        ]),
        h('div', { class: 'nv-pro-foto__blocco' }, [
          titoletto('Oppure scegli un astronauta'),
          griglia
        ]),
        h('button', {
          class: 'nv-pro-foto__rimuovi',
          type: 'button',
          onclick: function () {
            if (U.avatar === AVATAR_PREDEFINITO) NV.avviso('Stai già usando l’immagine predefinita');
            else aggiornaAvatar(AVATAR_PREDEFINITO, 'Foto rimossa: torna l’immagine predefinita');
          }
        }, [icon('trash-2', ICO.MD), h('span', { text: 'Rimuovi la foto' })])
      ]),
      h('div', { class: 'nv-sheet__azioni' }, [
        NV.pulsante('Fatto', { onclick: chiudiSopraProfilo })
      ])
    ]);

    sotto.push(veloSchermata(pannello, false, chiudiSopraProfilo));
    return sotto;
  };

  /* ==================================================================
     ESCI
     ================================================================== */
  screens.nvLogout = function (screen) {
    var sotto = screens.nvProfilo(schermataDa('profilo'));

    var pannello = h('div', { class: 'nv-sheet nv-pro-esci', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': 'Vuoi uscire?' }, [
      NV.mascotte('salutare', 'nv-pro-esci__mascotte'),
      h('div', { class: 'nv-pro-esci__testi' }, [
        NV.testo(screen, 'title', 'Vuoi uscire?', 'h2', 'nv-pro-esci__titolo'),
        NV.testo(screen, 'testo', 'Il tuo percorso resta salvato. Per rientrare ti basta la tua email.', 'p', 'nv-pro-esci__testo')
      ]),
      h('div', { class: 'nv-pro-esci__azioni' }, [
        pulsanteRischio('Esci', function () { window.location.href = 'index.html'; }),
        NV.pulsante('Annulla', { variante: 'secondario', onclick: chiudiSopraProfilo })
      ])
    ]);

    sotto.push(veloSchermata(pannello, true, chiudiSopraProfilo));
    return sotto;
  };

  /* ==================================================================
     MODIFICA PROFILO
     ================================================================== */

  /** Campo del modulo, lo stesso del questionario (.field). */
  function campo(nome, etichetta, valore, opts) {
    opts = opts || {};
    return h('label', { class: 'field nv-pro-campo' + (opts.classe ? ' ' + opts.classe : '') }, [
      h('span', { class: 'field__label', text: etichetta }),
      h('input', {
        class: 'field__input',
        name: nome,
        type: opts.tipo || 'text',
        value: valore || '',
        placeholder: opts.segnaposto || null,
        autocomplete: opts.autocomplete || 'off',
        inputmode: opts.inputmode || null
      })
    ]);
  }

  /* Il CAP non e' fra i dati: si ricava dalla citta' di esempio. */
  function capDaIndirizzo() { return /padova/i.test(U.citta || '') ? '35121' : ''; }

  screens.nvModificaProfilo = function (screen) {
    var genere = U.genere || '';
    var filaGenere;

    function disegnaGenere() {
      var nuova = h('div', { class: 'nv-pro-scelte', role: 'radiogroup', 'aria-label': 'Genere' },
        ['Uomo', 'Donna', 'Non binario', 'Preferisco non dirlo'].map(function (g) {
          var on = g === genere;
          return h('button', {
            class: 'nv-chip' + (on ? ' is-attivo' : ''),
            type: 'button',
            role: 'radio',
            'aria-checked': on ? 'true' : 'false',
            onclick: function () { genere = g; disegnaGenere(); }
          }, [h('span', { text: g })]);
        }));
      if (filaGenere && filaGenere.parentNode) filaGenere.parentNode.replaceChild(nuova, filaGenere);
      filaGenere = nuova;
      return nuova;
    }

    var modulo = h('form', {
      class: 'nv-pro-modulo',
      novalidate: true,
      onsubmit: function (e) {
        e.preventDefault();
        var fd = new FormData(modulo);
        ['nome', 'cognome', 'nascita', 'email', 'telefono', 'citta', 'occupazione', 'titoloStudio'].forEach(function (k) {
          var v = String(fd.get(k) || '').trim();
          if (v) U[k] = v;
        });
        var via = String(fd.get('via') || '').trim();
        if (via) U.indirizzo = via + (U.citta && via.indexOf(U.citta) === -1 ? ', ' + U.citta : '');
        U.genere = genere;
        /* prima si torna al profilo (si ridisegna subito), poi l'avviso:
           al contrario l'avviso sparirebbe con la pagina vecchia */
        NV.indietro('profilo');
        NV.avviso('Modifiche salvate');
      }
    }, [
      h('fieldset', { class: 'nv-pro-blocco' }, [
        h('legend', { class: 'nv-pro-blocco__titolo', text: 'Dati personali' }),
        h('div', { class: 'nv-pro-due' }, [
          campo('nome', 'Nome', U.nome, { autocomplete: 'given-name' }),
          campo('cognome', 'Cognome', U.cognome, { autocomplete: 'family-name' })
        ]),
        campo('nascita', 'Data di nascita', U.nascita, { segnaposto: 'gg mese aaaa' }),
        h('div', { class: 'field nv-pro-campo' }, [
          h('span', { class: 'field__label', text: 'Genere' }),
          disegnaGenere()
        ])
      ]),
      h('fieldset', { class: 'nv-pro-blocco' }, [
        h('legend', { class: 'nv-pro-blocco__titolo', text: 'Contatti' }),
        campo('email', 'Email', U.email, { tipo: 'email', autocomplete: 'email', inputmode: 'email' }),
        campo('telefono', 'Telefono', U.telefono, { tipo: 'tel', autocomplete: 'tel', inputmode: 'tel' })
      ]),
      h('fieldset', { class: 'nv-pro-blocco' }, [
        h('legend', { class: 'nv-pro-blocco__titolo', text: 'Residenza' }),
        campo('via', 'Indirizzo', (U.indirizzo || '').split(',')[0], { autocomplete: 'street-address' }),
        h('div', { class: 'nv-pro-due nv-pro-due--cap' }, [
          campo('citta', 'Città', U.citta, { autocomplete: 'address-level2' }),
          campo('cap', 'CAP', capDaIndirizzo(), { inputmode: 'numeric', autocomplete: 'postal-code' })
        ]),
        h('p', { class: 'nv-pro-nota' }, [
          icon('map-pin', ICO.SM),
          h('span', { text: 'Ci serve per mostrarti scuole, corsi e lavori vicino a te.' })
        ])
      ]),
      h('fieldset', { class: 'nv-pro-blocco' }, [
        h('legend', { class: 'nv-pro-blocco__titolo', text: 'Studio e lavoro' }),
        campo('occupazione', 'Occupazione attuale', U.occupazione),
        campo('titoloStudio', 'Titolo di studio più alto', U.titoloStudio)
      ])
    ]);

    return [
      NV.pagina('nv-pro nv-pro-modifica', [
        NV.barra({ indietro: 'profilo' }),
        NV.intestazione(screen, {
          titolo: 'Modifica profilo',
          sottotitolo: 'Tieni aggiornati i tuoi dati: servono a trovare le opportunità giuste.'
        }),
        h('div', { class: 'nv-pro-fotoriga' }, [
          avatar({ classe: 'nv-pro-avatar--sm' }),
          h('div', { class: 'nv-pro-fotoriga__testi' }, [
            h('strong', { text: 'Foto profilo' }),
            h('span', { text: 'La vedono solo le aziende a cui ti candidi.' })
          ]),
          NV.pulsante('Cambia', { variante: 'soft', piccolo: true, classe: 'nv-btn--hug', onclick: function () { NV.vai('fotoProfilo'); } })
        ]),
        modulo
      ]),
      h('div', { class: 'nv-pro-piede' }, [
        NV.pulsante('Salva le modifiche', { icona: 'check', onclick: function () {
          if (modulo.requestSubmit) modulo.requestSubmit();
          else modulo.dispatchEvent(new Event('submit', { cancelable: true }));
        } })
      ])
    ];
  };

  /* ==================================================================
     CURRICULUM
     ------------------------------------------------------------------
     In cima le tre azioni (genera, carica il CV, portfolio), sotto il CV
     in versione app. Tutto e' finto ma credibile: aggiungere una voce o
     "applicare" un CV caricato cambia i dati in memoria e ridisegna.
     ================================================================== */

  var CV_TIPI = {
    formazione:     { titolo: 'Formazione',            singolare: 'formazione' },
    /* "Esperienze lavorative" non ci sta in una riga accanto ad "Aggiungi" */
    esperienze:     { titolo: 'Esperienze',            singolare: 'esperienza' },
    certificazioni: { titolo: 'Certificazioni',        singolare: 'certificazione' },
    competenze:     { titolo: 'Competenze',            singolare: 'competenza' },
    softSkill:      { titolo: 'Soft skill',            singolare: 'soft skill' },
    lingue:         { titolo: 'Lingue',                singolare: 'lingua' }
  };

  var LIVELLI = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  var LIVELLI_NOME = { A1: 'Base', A2: 'Elementare', B1: 'Intermedio', B2: 'Intermedio superiore', C1: 'Avanzato', C2: 'Padronanza' };

  /* Cosa "trova" il prototipo quando carichi un CV. Inventato. */
  var CV_LETTO = {
    file: 'CV_Marco_Bacchin.pdf',
    pagine: 2,
    trovati: [
      { tipo: 'esperienze', etichetta: 'Esperienza', testo: 'Stage di grafica · Tipografia Veneta', valore: { titolo: 'Stage di grafica', ente: 'Tipografia Veneta', periodo: 'Estate 2021', nota: 'Impaginazione di cataloghi' } },
      { tipo: 'certificazioni', etichetta: 'Certificazione', testo: 'ECDL Full Standard', valore: { titolo: 'ECDL Full Standard', ente: 'AICA', periodo: 'Aprile 2020' } },
      { tipo: 'competenze', etichetta: 'Competenza', testo: 'Adobe Photoshop', valore: 'Adobe Photoshop' },
      { tipo: 'competenze', etichetta: 'Competenza', testo: 'Canva', valore: 'Canva' },
      { tipo: 'lingue', etichetta: 'Lingua', testo: 'Spagnolo · A2', valore: { lingua: 'Spagnolo', livello: 'A2' } }
    ]
  };

  var MODELLI_CV = [
    { value: 'essenziale', label: 'Essenziale' },
    { value: 'moderno', label: 'Moderno' },
    { value: 'creativo', label: 'Creativo' }
  ];

  /** Ridisegna la schermata tenendo il punto in cui eri e senza animazione. */
  function ridisegna(dopo) {
    var p = document.querySelector('#app .nv-page');
    var y = p ? p.scrollTop : 0;
    window.NavidaApp.render();
    var s = document.querySelector('#app .screen');
    if (s) s.style.animation = 'none';
    var q = document.querySelector('#app .nv-page');
    if (q) q.scrollTop = y;
    if (dopo) dopo();
  }

  function giaPresente(lista, valore) {
    var chiave = String(typeof valore === 'string' ? valore : (valore.titolo || valore.lingua)).toLowerCase();
    return lista.some(function (x) {
      return String(typeof x === 'string' ? x : (x.titolo || x.lingua)).toLowerCase() === chiave;
    });
  }

  /* --- pezzi della pagina --------------------------------------------- */

  function cvSezione(tipo, figli, conteggio) {
    var t = CV_TIPI[tipo];
    return h('section', { class: 'nv-section nv-cv-sezione' }, [
      h('div', { class: 'nv-section__head nv-cv-sezione__head' }, [
        h('h2', { class: 'nv-section__title' }, [
          h('span', { text: t.titolo }),
          conteggio ? h('span', { class: 'nv-cv-conta', text: String(conteggio) }) : null
        ]),
        h('button', {
          class: 'nv-cv-aggiungi',
          type: 'button',
          'aria-label': 'Aggiungi ' + t.singolare,
          onclick: function () { foglioAggiungi(tipo); }
        }, [icon('plus', ICO.SM), h('span', { text: 'Aggiungi' })])
      ])
    ].concat(figli));
  }

  function cvVuoto(testo) {
    return h('p', { class: 'nv-cv-vuoto', text: testo });
  }

  /** Studi ed esperienze: una linea del tempo, la voce in corso in blu. */
  function cvLinea(voci, vuoto) {
    if (!voci || !voci.length) return cvVuoto(vuoto);
    return h('ol', { class: 'nv-cv-linea' }, voci.map(function (v) {
      var inCorso = /in corso|oggi/i.test(v.periodo || '');
      return h('li', { class: 'nv-cv-linea__voce' + (inCorso ? ' is-in-corso' : '') }, [
        h('span', { class: 'nv-cv-linea__punto', 'aria-hidden': 'true' }),
        h('div', { class: 'nv-cv-linea__copy' }, [
          h('div', { class: 'nv-cv-linea__cima' }, [
            h('strong', { text: v.titolo }),
            inCorso ? h('span', { class: 'nv-tag nv-tag--obbligatoria', text: 'In corso' }) : null
          ]),
          v.ente ? h('span', { class: 'nv-cv-linea__ente', text: v.ente }) : null,
          h('span', { class: 'nv-cv-linea__periodo', text: [v.periodo, v.nota].filter(Boolean).join(' · ') })
        ])
      ]);
    }));
  }

  function cvPastiglie(tipo, lista, suggerite) {
    var fila = h('div', { class: 'nv-pro-pills' }, lista.map(function (c) {
      return pastiglia(c, tipo === 'softSkill' ? 'soft' : null);
    }));
    var parti = [lista.length ? fila : cvVuoto('Ancora niente: aggiungi la prima.')];

    if (suggerite && suggerite.length) {
      var filaSugg = h('div', { class: 'nv-pro-pills' });
      var blocco = h('div', { class: 'nv-cv-sugg' }, [
        h('span', { class: 'nv-cv-sugg__titolo' }, [
          icon('sparkles', ICO.SM),
          h('span', { text: 'Utili per diventare ' + (D.percorso.obiettivo || U.obiettivo) })
        ]),
        filaSugg
      ]);
      suggerite.forEach(function (s) {
        var b = h('button', {
          class: 'nv-cv-sugg__voce',
          type: 'button',
          'aria-label': 'Aggiungi ' + s,
          onclick: function () {
            lista.push(s);
            fila.appendChild(pastiglia(s));
            b.remove();
            if (!filaSugg.children.length) blocco.remove();
            NV.avviso('“' + s + '” aggiunta alle competenze');
          }
        }, [icon('plus', ICO.SM), h('span', { text: s })]);
        filaSugg.appendChild(b);
      });
      parti.push(blocco);
    }
    return h('div', { class: 'nv-cv-scheda nv-cv-scheda--pills' }, parti);
  }

  function cvLingue(lista) {
    if (!lista.length) return cvVuoto('Aggiungi le lingue che conosci.');
    return gruppo(lista.map(function (l) {
      var madre = /madre/i.test(l.livello);
      var n = madre ? LIVELLI.length : LIVELLI.indexOf(l.livello) + 1;
      var metro = h('span', { class: 'nv-cv-livello', 'aria-hidden': 'true' }, LIVELLI.map(function (x, i) {
        return h('span', { class: i < n ? 'is-pieno' : null });
      }));
      return voce({
        titolo: l.lingua,
        sotto: madre ? 'Madrelingua' : l.livello + ' · ' + (LIVELLI_NOME[l.livello] || ''),
        destra: metro
      });
    }), 'nv-cv-lingue');
  }

  /** Le competenze del proprio step (e del prossimo) che mancano ancora. */
  function competenzeSuggerite() {
    var cv = D.curriculum;
    var i = NV.stepAttuale();
    var da = [];
    [NV.steps()[i], NV.steps()[i + 1]].forEach(function (s) { if (s) da = da.concat(s.competenze || []); });
    return da.filter(function (c) {
      return !giaPresente(cv.competenze, c) && !giaPresente(cv.softSkill, c);
    }).slice(0, 3);
  }

  function cvGenera() {
    return h('button', { class: 'nv-hero nv-cv-genera nv-press', type: 'button', onclick: foglioCv }, [
      h('span', { class: 'nv-cv-genera__copy' }, [
        h('span', { class: 'nv-cv-genera__occhiello' }, [icon('sparkles', ICO.SM), h('span', { text: 'Pronto in un minuto' })]),
        h('span', { class: 'nv-cv-genera__titolo', text: 'Genera il tuo CV' }),
        h('span', { class: 'nv-cv-genera__testo', text: 'Scegli un modello. Al resto pensiamo noi, con i dati di questa pagina.' }),
        h('span', { class: 'nv-cv-genera__cta' }, [h('span', { text: 'Crea il CV' }), icon('arrow-right', ICO.SM)])
      ]),
      /* il foglio disegnato: una carta con righe, non un'icona */
      h('span', { class: 'nv-cv-genera__carta', 'aria-hidden': 'true' }, [
        h('span', { class: 'nv-cv-genera__tondo' }),
        h('i', { class: 'is-forte' }), h('i', { class: 'is-corta' }),
        h('i', { class: 'is-sep' }),
        h('i'), h('i'), h('i', { class: 'is-corta' }),
        h('i', { class: 'is-sep' }),
        h('i'), h('i', { class: 'is-corta' })
      ])
    ]);
  }

  function cvCarica() {
    var cv = D.curriculum;
    if (cv.cvCaricato) {
      return h('div', { class: 'nv-cv-file' }, [
        NV.icoChip('file-text', 'ok'),
        h('div', { class: 'nv-cv-file__copy' }, [
          h('strong', { text: cv.cvCaricato.nome }),
          h('span', { text: 'Caricato ' + cv.cvCaricato.quando + ' · dati applicati' })
        ]),
        NV.pulsante('Sostituisci', { variante: 'secondario', piccolo: true, classe: 'nv-btn--hug', onclick: simulaCaricamento })
      ]);
    }
    return h('button', { class: 'nv-cv-drop nv-press', type: 'button', onclick: simulaCaricamento }, [
      h('span', { class: 'nv-cv-drop__ico' }, [icon('file-up', ICO.LG)]),
      h('span', { class: 'nv-cv-drop__copy' }, [
        h('span', { class: 'nv-cv-drop__titolo', text: 'Hai già un CV? Caricalo' }),
        h('span', { class: 'nv-cv-drop__testo', text: 'Lo leggiamo e compiliamo noi i campi. Tu controlli e confermi.' }),
        h('span', { class: 'nv-cv-drop__meta' }, [
          h('span', { class: 'nv-cv-drop__scegli', text: 'Scegli il file' }),
          h('span', { text: 'PDF o Word · max 5 MB' })
        ])
      ])
    ]);
  }

  function cvPortfolio() {
    var p = D.curriculum.portfolio;
    return h('div', { class: 'nv-card nv-cv-port' }, [
      h('div', { class: 'nv-cv-port__cima' }, [
        NV.icoChip('folder-up', 2),
        h('div', { class: 'nv-cv-port__copy' }, [
          h('strong', { text: 'Portfolio' }),
          h('span', { text: p ? p.valore : 'Pesa più del titolo di studio: bastano 3 progetti.' })
        ]),
        p ? NV.etichetta('Aggiunto', 'ok', 'check') : NV.etichetta('Manca', 'neutra')
      ]),
      h('div', { class: 'nv-btns' }, [
        NV.pulsante('Carica PDF', { variante: 'soft', icona: 'file-up', piccolo: true, onclick: function () {
          D.curriculum.portfolio = { tipo: 'pdf', valore: 'Portfolio_Marco_Bacchin.pdf' };
          ridisegna(function () { NV.avviso('Portfolio caricato (finto, nel prototipo)'); });
        } }),
        NV.pulsante(p && p.tipo === 'link' ? 'Cambia link' : 'Aggiungi link', { variante: 'secondario', icona: 'link', piccolo: true, onclick: foglioLink })
      ])
    ]);
  }

  /* --- pannelli --------------------------------------------------------- */

  function foglioCv() {
    var cv = D.curriculum;
    var modello = 'moderno';

    function blocco(titolo, riga) {
      return h('div', { class: 'nv-cv-carta__blocco' }, [
        h('small', { text: titolo }),
        h('span', { text: riga }),
        h('i'), h('i', { class: 'is-corta' })
      ]);
    }

    var carta = h('div', { class: 'nv-cv-carta nv-cv-carta--' + modello }, [
      h('div', { class: 'nv-cv-carta__testa' }, [
        h('img', { class: 'nv-cv-carta__foto', src: U.avatar, alt: '' }),
        h('div', { class: 'nv-cv-carta__nome' }, [
          h('strong', { text: nomeCompleto() }),
          h('span', { text: (D.percorso.obiettivo || U.obiettivo) + ' · ' + U.citta })
        ])
      ]),
      h('div', { class: 'nv-cv-carta__corpo' }, [
        blocco('Formazione', (cv.formazione[0] || {}).titolo || '—'),
        blocco('Esperienze', (cv.esperienze[0] || {}).titolo || '—'),
        blocco('Competenze', cv.competenze.slice(0, 3).join(' · '))
      ])
    ]);

    var scelte = h('div', { class: 'nv-cv-modelli', role: 'radiogroup', 'aria-label': 'Modello del CV' });
    MODELLI_CV.forEach(function (m) {
      var on = m.value === modello;
      scelte.appendChild(h('button', {
        class: 'nv-cv-modello' + (on ? ' is-scelto' : ''),
        type: 'button',
        role: 'radio',
        'aria-checked': on ? 'true' : 'false',
        'data-v': m.value,
        onclick: function () {
          modello = m.value;
          carta.className = 'nv-cv-carta nv-cv-carta--' + modello;
          Array.prototype.forEach.call(scelte.children, function (b) {
            var si = b.getAttribute('data-v') === modello;
            b.classList.toggle('is-scelto', si);
            b.setAttribute('aria-checked', si ? 'true' : 'false');
          });
        }
      }, [
        h('span', { class: 'nv-cv-mini nv-cv-mini--' + m.value, 'aria-hidden': 'true' }, [h('i'), h('i'), h('i'), h('i')]),
        h('span', { class: 'nv-cv-modello__nome', text: m.label })
      ]));
    });

    NV.apriFoglio({
      titolo: 'Il tuo CV',
      sottotitolo: 'Anteprima con i dati del tuo curriculum',
      classe: 'nv-cv-foglio',
      contenuto: [
        carta,
        h('div', { class: 'nv-pro-foto__blocco' }, [titoletto('Modello'), scelte])
      ],
      azioni: [
        NV.pulsante('Condividi', { variante: 'secondario', icona: 'share-2', onclick: function () { NV.avviso('Nel prototipo non si condivide'); } }),
        NV.pulsante('Scarica PDF', { icona: 'file-down', onclick: function () { NV.avviso('Nel prototipo il PDF non si scarica'); } })
      ]
    });
  }

  function simulaCaricamento() {
    NV.apriFoglio({
      titolo: 'Sto leggendo il tuo CV',
      sottotitolo: CV_LETTO.file,
      classe: 'nv-cv-lettura',
      contenuto: [
        h('div', { class: 'nv-cv-lettura__corpo' }, [
          NV.mascotte('lente-ingrandimento', 'nv-cv-lettura__mascotte'),
          h('p', { text: 'Cerco studi, esperienze, competenze e lingue.' }),
          h('div', { class: 'nv-progress nv-cv-lettura__barra' }, [h('span', { class: 'nv-progress__fill' })])
        ])
      ]
    });
    setTimeout(function () {
      if (document.querySelector('#app .nv-cv-lettura')) foglioLetto(true);
    }, 1800);
  }

  function foglioLetto(senzaAnimazione) {
    var scelti = CV_LETTO.trovati.map(function () { return true; });
    var righe = CV_LETTO.trovati.map(function (t, i) {
      return voce({
        titolo: t.testo,
        sotto: t.etichetta,
        destra: NV.interruttore(true, function (on) { scelti[i] = on; }, 'Aggiungi ' + t.testo)
      });
    });

    function applica() {
      var cv = D.curriculum;
      var aggiunti = 0;
      CV_LETTO.trovati.forEach(function (t, i) {
        if (!scelti[i] || giaPresente(cv[t.tipo], t.valore)) return;
        cv[t.tipo].push(t.valore);
        aggiunti++;
      });
      cv.cvCaricato = { nome: CV_LETTO.file, quando: 'oggi' };
      if (aggiunti) U.completezza = Math.min(95, U.completezza + 10);
      NV.chiudiFoglio();
      ridisegna(function () {
        NV.avviso(aggiunti ? aggiunti + ' informazioni aggiunte al curriculum' : 'Nessuna informazione nuova da aggiungere');
      });
    }

    NV.apriFoglio({
      titolo: 'Abbiamo letto il tuo CV',
      sottotitolo: CV_LETTO.file + ' · ' + CV_LETTO.pagine + ' pagine',
      classe: 'nv-cv-letto' + (senzaAnimazione ? ' nv-cv-senzaanim' : ''),
      contenuto: [
        h('div', { class: 'nv-cv-esito' }, [
          icon('circle-check', ICO.MD),
          h('span', { text: CV_LETTO.trovati.length + ' informazioni nuove. Spegni quelle che non vuoi aggiungere.' })
        ]),
        gruppo(righe, 'nv-cv-trovati')
      ],
      azioni: [
        NV.pulsante('Annulla', { variante: 'secondario', onclick: NV.chiudiFoglio }),
        NV.pulsante('Applica', { icona: 'check', onclick: applica })
      ]
    });
  }

  function foglioLink() {
    var p = D.curriculum.portfolio;
    var riga = campo('link', 'Indirizzo del portfolio', p && p.tipo === 'link' ? p.valore : '', {
      tipo: 'url', segnaposto: 'behance.net/marcobacchin', inputmode: 'url'
    });
    NV.apriFoglio({
      titolo: 'Link al portfolio',
      sottotitolo: 'Behance, Dribbble, un sito tuo o una cartella condivisa.',
      contenuto: [
        riga,
        h('p', { class: 'nv-pro-nota' }, [
          icon('eye', ICO.SM),
          h('span', { text: 'Lo vedono le aziende solo se il tuo profilo è visibile.' })
        ])
      ],
      azioni: [
        NV.pulsante('Salva il link', { onclick: function () {
          var v = riga.querySelector('input').value.trim();
          if (!v) { NV.avviso('Incolla prima il link'); return; }
          D.curriculum.portfolio = { tipo: 'link', valore: v.replace(/^https?:\/\//, '') };
          NV.chiudiFoglio();
          ridisegna(function () { NV.avviso('Link al portfolio salvato'); });
        } })
      ]
    });
  }

  function foglioAggiungi(tipo) {
    var t = CV_TIPI[tipo];
    var livello = 'B1';
    var campi;

    if (tipo === 'competenze' || tipo === 'softSkill') {
      var soft = tipo === 'softSkill';
      campi = [campo('titolo', soft ? 'Soft skill' : 'Competenza', '', { segnaposto: soft ? 'Es. Organizzazione' : 'Es. Adobe XD' })];
    } else if (tipo === 'lingue') {
      var filaLivelli;
      var disegnaLivelli = function () {
        var nuova = h('div', { class: 'nv-pro-scelte', role: 'radiogroup', 'aria-label': 'Livello' }, LIVELLI.concat(['Madrelingua']).map(function (l) {
          var on = l === livello;
          return h('button', {
            class: 'nv-chip' + (on ? ' is-attivo' : ''),
            type: 'button', role: 'radio', 'aria-checked': on ? 'true' : 'false',
            onclick: function () { livello = l; disegnaLivelli(); }
          }, [h('span', { text: l })]);
        }));
        if (filaLivelli && filaLivelli.parentNode) filaLivelli.parentNode.replaceChild(nuova, filaLivelli);
        filaLivelli = nuova;
        return nuova;
      };
      campi = [
        campo('titolo', 'Lingua', '', { segnaposto: 'Es. Spagnolo' }),
        h('div', { class: 'field nv-pro-campo' }, [h('span', { class: 'field__label', text: 'Livello' }), disegnaLivelli()])
      ];
    } else if (tipo === 'certificazioni') {
      campi = [
        campo('titolo', 'Nome del certificato', '', { segnaposto: 'Es. Google UX Design' }),
        campo('ente', 'Chi l’ha rilasciato', '', { segnaposto: 'Es. Coursera' }),
        campo('periodo', 'Data', '', { segnaposto: 'Es. Maggio 2026' })
      ];
    } else {
      var esp = tipo === 'esperienze';
      campi = [
        campo('titolo', esp ? 'Ruolo' : 'Titolo o corso', '', { segnaposto: esp ? 'Es. Grafico junior' : 'Es. Laurea in Design' }),
        campo('ente', esp ? 'Azienda o associazione' : 'Scuola o università', '', { segnaposto: esp ? 'Es. Studio Lumen' : 'Es. Università di Padova' }),
        h('div', { class: 'nv-pro-due' }, [
          campo('dal', 'Dal', '', { segnaposto: '2024', inputmode: 'numeric' }),
          campo('al', 'Al', '', { segnaposto: 'In corso' })
        ])
      ];
      if (esp) {
        campi.push(h('label', { class: 'field nv-pro-campo' }, [
          h('span', { class: 'field__label', text: 'Cosa facevi' }),
          h('textarea', { class: 'field__input', name: 'nota', rows: '3', placeholder: 'Due righe bastano' })
        ]));
      }
    }

    var modulo = h('form', { class: 'nv-cv-modulo', novalidate: true, onsubmit: function (e) { e.preventDefault(); salva(); } }, campi);

    function salva() {
      var fd = new FormData(modulo);
      var val = function (k) { return String(fd.get(k) || '').trim(); };
      var titolo = val('titolo');
      if (!titolo) { NV.avviso('Scrivi almeno il primo campo'); return; }
      var cv = D.curriculum;
      if (tipo === 'competenze' || tipo === 'softSkill') cv[tipo].push(titolo);
      else if (tipo === 'lingue') cv.lingue.push({ lingua: titolo, livello: livello });
      else if (tipo === 'certificazioni') cv.certificazioni.unshift({ titolo: titolo, ente: val('ente'), periodo: val('periodo') });
      else cv[tipo].unshift({ titolo: titolo, ente: val('ente'), periodo: [val('dal'), val('al')].filter(Boolean).join(' – '), nota: val('nota') });
      NV.chiudiFoglio();
      ridisegna(function () { NV.avviso('Aggiunto: ' + titolo); });
    }

    NV.apriFoglio({
      titolo: 'Aggiungi ' + t.singolare,
      classe: 'nv-cv-aggiungiFoglio',
      contenuto: [modulo],
      azioni: [NV.pulsante('Salva', { icona: 'check', onclick: salva })]
    });
  }

  /* --- la pagina --------------------------------------------------------- */

  screens.nvCurriculum = function (screen) {
    var cv = D.curriculum;

    var foglio = foglioIniziale('curriculum');
    if (foglio) {
      setTimeout(function () {
        if (foglio === 'cv') foglioCv();
        else if (foglio === 'letto') foglioLetto(false);
        else if (foglio === 'lettura') simulaCaricamento();
        else if (foglio === 'aggiungi') foglioAggiungi('esperienze');
        else if (foglio === 'link') foglioLink();
      }, 0);
    }

    return [
      NV.pagina('nv-pro nv-cv', [
        NV.barra({ indietro: 'profilo' }),
        NV.intestazione(screen, {
          titolo: 'Curriculum',
          sottotitolo: 'Tutto quello che sai fare, in un posto solo. Ci serve per consigliarti le opportunità giuste.'
        }),
        cvGenera(),
        h('div', { class: 'nv-cv-carica' }, [cvCarica(), cvPortfolio()]),
        cvSezione('formazione', [
          h('div', { class: 'nv-cv-scheda' }, [
            h('div', { class: 'nv-cv-studio' }, [
              h('span', { class: 'nv-cv-studio__ico' }, [icon('graduation-cap', ICO.MD)]),
              h('span', { class: 'nv-cv-studio__copy' }, [
                h('small', { text: 'Titolo di studio più alto' }),
                h('strong', { text: cv.titoloStudio || U.titoloStudio })
              ])
            ]),
            cvLinea(cv.formazione, 'Aggiungi scuole, corsi e università.')
          ])
        ], cv.formazione.length),
        cvSezione('esperienze', [
          h('div', { class: 'nv-cv-scheda' }, [cvLinea(cv.esperienze, 'Anche volontariato e lavoretti contano.')])
        ], cv.esperienze.length),
        cvSezione('certificazioni', [
          cv.certificazioni.length
            ? gruppo(cv.certificazioni.map(function (c) {
                return voce({ icona: 'award', titolo: c.titolo, sotto: [c.ente, c.periodo].filter(Boolean).join(' · ') });
              }))
            : cvVuoto('Corsi con attestato, certificati di lingua, patentini.')
        ], cv.certificazioni.length),
        cvSezione('competenze', [cvPastiglie('competenze', cv.competenze, competenzeSuggerite())], cv.competenze.length),
        cvSezione('softSkill', [cvPastiglie('softSkill', cv.softSkill)], cv.softSkill.length),
        cvSezione('lingue', [cvLingue(cv.lingue)], cv.lingue.length)
      ])
    ];
  };

  /* ==================================================================
     PREFERENZE
     ------------------------------------------------------------------
     Si salvano da sole: ogni tocco cambia NV.dati.preferenze e la nota
     sotto al titolo dice "Salvato" per un attimo. Niente ridisegni: la
     pagina e' lunga e non deve tornare in cima.
     ================================================================== */

  var LINGUE_APP = ['Italiano', 'English', 'Español', 'Français', 'Deutsch'];
  var notaSalvataggio = null;

  function salvato(messaggio) {
    if (notaSalvataggio) {
      var n = notaSalvataggio;
      n.classList.add('is-fresco');
      n.lastChild.textContent = 'Salvato';
      clearTimeout(n._timer);
      n._timer = setTimeout(function () {
        n.classList.remove('is-fresco');
        n.lastChild.textContent = 'Le modifiche si salvano da sole';
      }, 1400);
    }
    if (messaggio) NV.avviso(messaggio);
  }

  /** NV.segmenti che si ridisegna da solo quando scegli. */
  function segmentiVivi(opzioni, valore, onchange, classe) {
    var nodo;
    function disegna(v) {
      var nuovo = NV.segmenti(opzioni, v, function (scelto) {
        disegna(scelto);
        if (onchange) onchange(scelto);
      }, classe);
      if (nodo && nodo.parentNode) nodo.parentNode.replaceChild(nuovo, nodo);
      nodo = nuovo;
      return nuovo;
    }
    return disegna(valore);
  }

  function prefInterruttore(chiave, icona, titolo, sotto, dopo) {
    var P = D.preferenze;
    return voce({
      icona: icona,
      titolo: titolo,
      sotto: sotto,
      destra: NV.interruttore(!!P[chiave], function (on) {
        P[chiave] = on;
        salvato();
        if (dopo) dopo(on);
      }, titolo)
    });
  }

  function prefBlocco(titolo, figli, nota) {
    return h('section', { class: 'nv-pref-blocco' }, [
      h('h2', { class: 'nv-pref-etichetta', text: titolo })
    ].concat(figli).concat(nota ? [h('p', { class: 'nv-pref-nota', text: nota })] : []));
  }

  /** Blocco con titolo e un interruttore a voci sotto (tema, testo). */
  function prefScelta(icona, titolo, sotto, controllo, extra) {
    return h('div', { class: 'nv-pref-scelta' }, [
      h('div', { class: 'nv-pref-scelta__cima' }, [
        h('span', { class: 'nv-pro-voce__ico' }, [icon(icona, ICO.MD)]),
        h('span', { class: 'nv-pro-voce__copy' }, [
          h('span', { class: 'nv-pro-voce__titolo', text: titolo }),
          sotto ? h('span', { class: 'nv-pro-voce__sotto', text: sotto }) : null
        ])
      ]),
      controllo,
      extra || null
    ]);
  }

  function foglioLingua() {
    var P = D.preferenze;
    NV.apriFoglio({
      titolo: 'Lingua dell’app',
      sottotitolo: 'Cambia i testi, i menu e le email.',
      contenuto: [
        gruppo(LINGUE_APP.map(function (l) {
          var on = l === P.lingua;
          return voce({
            titolo: l,
            classe: on ? 'is-scelta' : '',
            destra: on ? h('span', { class: 'nv-pref-spunta' }, [icon('check', ICO.MD)]) : null,
            onclick: function () {
              P.lingua = l;
              var val = document.querySelector('#app .nv-pref-lingua .nv-pro-voce__valore');
              if (val) val.textContent = l;
              NV.chiudiFoglio();
              salvato(l === 'Italiano' ? null : 'Nel prototipo i testi restano in italiano');
            }
          });
        }), 'nv-pref-lingue')
      ]
    });
  }

  function foglioElimina() {
    NV.apriFoglio({
      titolo: 'Eliminare l’account?',
      sottotitolo: 'Perdi per sempre profilo, curriculum e percorso. Non si può annullare.',
      centrato: true,
      classe: 'nv-pref-eliminaFoglio',
      azioni: [
        NV.pulsante('Annulla', { variante: 'secondario', onclick: NV.chiudiFoglio }),
        pulsanteRischio('Elimina', function () {
          NV.chiudiFoglio();
          NV.avviso('Nel prototipo non si elimina niente');
        })
      ]
    });
  }

  screens.nvPreferenze = function (screen) {
    var P = D.preferenze;

    var foglio = foglioIniziale('preferenze');
    if (foglio) {
      setTimeout(function () {
        if (foglio === 'lingua') foglioLingua();
        else if (foglio === 'elimina') foglioElimina();
      }, 0);
    }

    notaSalvataggio = h('p', { class: 'nv-pref-salva', role: 'status' }, [
      icon('check', ICO.SM),
      h('span', { text: 'Le modifiche si salvano da sole' })
    ]);
    var testa = NV.intestazione(screen, { titolo: 'Preferenze' });
    testa.appendChild(notaSalvataggio);

    /* --- notifiche: se spegni tutti i canali, i temi si spengono --- */
    var temi = gruppo([
      prefInterruttore('promemoria', 'clock', 'Promemoria dei compiti', 'Scadenze e iscrizioni che si avvicinano'),
      prefInterruttore('nuoveOpportunita', 'sparkles', 'Nuove opportunità per te', 'Corsi, eventi e lavori adatti al tuo step'),
      prefInterruttore('riepilogoSettimanale', 'calendar-days', 'Riepilogo settimanale', 'Ogni lunedì, i tuoi progressi in breve')
    ], 'nv-pref-temi');
    function aggiornaTemi() {
      temi.classList.toggle('is-spento', !P.notifichePush && !P.notificheEmail);
    }
    aggiornaTemi();

    /* --- anteprima della dimensione del testo --- */
    var anteprimaTesto = h('p', { class: 'nv-pref-anteprima nv-pref-anteprima--' + P.dimensioneTesto, text: 'Così leggerai i testi di Navida.' });

    return [
      NV.pagina('nv-pro nv-pref', [
        NV.barra({ indietro: 'profilo' }),
        testa,

        prefBlocco('Aspetto', [
          gruppo([
            /* senza icone: tre voci con icona non ci stanno in 300px */
            prefScelta('palette', 'Tema', 'Automatico segue le impostazioni del telefono.', segmentiVivi([
              { value: 'chiaro', label: 'Chiaro' },
              { value: 'scuro', label: 'Scuro' },
              { value: 'sistema', label: 'Automatico' }
            ], P.tema, function (v) {
              P.tema = v;
              salvato(v === 'scuro' ? 'Il tema scuro arriva con la prossima versione' : null);
            }, 'nv-seg--piena'))
          ])
        ]),

        prefBlocco('Notifiche', [
          gruppo([
            prefInterruttore('notifichePush', 'bell-ring', 'Notifiche sul telefono', 'Ti avvisiamo quando succede qualcosa', aggiornaTemi),
            prefInterruttore('notificheEmail', 'mail', 'Email', U.email, aggiornaTemi)
          ]),
          h('h3', { class: 'nv-pref-sottoetichetta', text: 'Cosa vuoi ricevere' }),
          temi
        ]),

        prefBlocco('Lingua e regione', [
          gruppo([
            voce({ icona: 'globe', titolo: 'Lingua dell’app', valore: P.lingua, chev: true, classe: 'nv-pref-lingua', onclick: foglioLingua }),
            voce({ icona: 'map-pin', titolo: 'Zona di ricerca', valore: D.mappa.citta + ' · ' + D.mappa.raggio, chev: true, onclick: function () { NV.apriMappa(); } })
          ])
        ]),

        prefBlocco('Accessibilità', [
          gruppo([
            prefScelta('a-large-small', 'Dimensione del testo', null, segmentiVivi([
              { value: 'piccolo', label: 'Piccolo' },
              { value: 'normale', label: 'Normale' },
              { value: 'grande', label: 'Grande' }
            ], P.dimensioneTesto, function (v) {
              P.dimensioneTesto = v;
              anteprimaTesto.className = 'nv-pref-anteprima nv-pref-anteprima--' + v;
              salvato();
            }, 'nv-seg--piena'), anteprimaTesto),
            prefInterruttore('riduciAnimazioni', 'pause', 'Riduci le animazioni', 'Meno movimento fra una pagina e l’altra'),
            prefInterruttore('altoContrasto', 'contrast', 'Alto contrasto', 'Testi più scuri e contorni più netti')
          ])
        ]),

        prefBlocco('Privacy e dati', [
          gruppo([
            prefInterruttore('profiloVisibileAziende', 'eye', 'Profilo visibile alle aziende', 'Le aziende compatibili possono trovarti e scriverti'),
            prefInterruttore('posizione', 'locate-fixed', 'Usa la mia posizione', 'Per mostrarti i posti vicino a te')
          ]),
          gruppo([
            voce({ icona: 'download', titolo: 'Scarica i miei dati', chev: true, onclick: function () {
              NV.avviso('Ti mandiamo i tuoi dati via email entro 48 ore');
            } }),
            voce({ icona: 'shield-check', titolo: 'Informativa privacy', chev: 'external-link', onclick: function () {
              NV.avviso('Nel prototipo l’informativa non si apre');
            } }),
            voce({ icona: 'file-text', titolo: 'Termini di servizio', chev: 'external-link', onclick: function () {
              NV.avviso('Nel prototipo i termini non si aprono');
            } })
          ])
        ]),

        prefBlocco('Aiuto e info', [
          gruppo([
            voce({ icona: 'circle-help', titolo: 'Centro assistenza', chev: true, onclick: function () { NV.avviso('Nel prototipo l’assistenza non è attiva'); } }),
            voce({ icona: 'message-circle', titolo: 'Scrivici', sotto: 'Rispondiamo entro un giorno', chev: true, onclick: function () { NV.avviso('Nel prototipo i messaggi non partono'); } }),
            voce({ icona: 'info', titolo: 'Versione dell’app', valore: VERSIONE })
          ])
        ]),

        h('div', { class: 'nv-pref-fondo' }, [
          h('button', { class: 'nv-pref-elimina', type: 'button', onclick: foglioElimina }, [
            icon('trash-2', ICO.MD),
            h('span', { text: 'Elimina account' })
          ]),
          h('p', { class: 'nv-pref-nota', text: 'Cancella per sempre profilo, curriculum e percorso.' })
        ])
      ])
    ];
  };

  /* ==================================================================
     NOTIFICHE
     ================================================================== */

  /* Dove porta ogni notifica. I dati non lo dicono: si aggiunge qui in
     memoria, senza toccare i campi che ci sono gia'. */
  (function collegaNotifiche() {
    var mete = [
      { se: /workshop/i,    azione: 'Vedi il workshop',   apri: function () { NV.apriScheda('workshopAi'); } },
      { se: /completato/i,  azione: 'Vedi lo step',       apri: function () { NV.apriStep(NV.stepAttuale()); } },
      { se: /iscrizioni/i,  azione: 'Vedi le scuole',     apri: function () { NV.apriCompito('diploma'); } },
      { se: /offerta/i,     azione: 'Vedi l’offerta',     apri: function () { NV.apriScheda('freelance'); } },
      { se: /curriculum/i,  azione: 'Apri il curriculum', apri: function () { NV.vai('curriculum'); } }
    ];
    /* prova: ?screen=notifiche&lette=1 mostra lo stato "Sei in pari" */
    var tutteLette = false;
    try { tutteLette = new URLSearchParams(window.location.search).get('lette') === '1'; } catch (e) {}
    (D.notifiche || []).forEach(function (n) {
      if (tutteLette) n.nuova = false;
      if (n.apri) return;
      for (var i = 0; i < mete.length; i++) {
        if (mete[i].se.test(n.titolo)) {
          n.apri = mete[i].apri;
          if (!n.azione) n.azione = mete[i].azione;
          break;
        }
      }
    });
  })();

  function notifica(n) {
    return h('button', {
      class: 'nv-noti nv-press' + (n.nuova ? ' is-nuova' : ''),
      type: 'button',
      onclick: function () {
        n.nuova = false;
        if (n.apri) n.apri();
        else ridisegna();
      }
    }, [
      NV.icoChip(n.icona, n.tono),
      h('span', { class: 'nv-noti__copy' }, [
        h('span', { class: 'nv-noti__cima' }, [
          h('strong', { class: 'nv-noti__titolo', text: n.titolo }),
          h('span', { class: 'nv-noti__quando', text: n.quando })
        ]),
        h('span', { class: 'nv-noti__testo', text: n.testo }),
        n.nuova && n.azione ? h('span', { class: 'nv-noti__azione' }, [
          h('span', { text: n.azione }), icon('chevron-right', ICO.SM)
        ]) : null
      ]),
      n.nuova ? h('span', { class: 'nv-noti__pallino', role: 'img', 'aria-label': 'Non letta' }) : null
    ]);
  }

  function gruppoNotifiche(titolo, lista) {
    return h('section', { class: 'nv-noti-gruppo' }, [
      h('h2', { class: 'nv-pref-etichetta' }, [
        h('span', { text: titolo }),
        h('span', { class: 'nv-noti-gruppo__n', text: ' · ' + lista.length })
      ]),
      h('div', { class: 'nv-noti-lista' }, lista.map(notifica))
    ]);
  }

  screens.nvNotifiche = function (screen) {
    var lista = D.notifiche || [];
    var ctx = NV.contesto();
    var filtro = ctx.notiFiltro === 'nuove' ? 'nuove' : 'tutte';
    var nuove = lista.filter(function (n) { return n.nuova; });
    var vecchie = lista.filter(function (n) { return !n.nuova; });

    function segnaTutte() {
      if (!nuove.length) { NV.avviso('Sei già in pari'); return; }
      lista.forEach(function (n) { n.nuova = false; });
      ridisegna(function () { NV.avviso('Tutte segnate come lette'); });
    }

    var testa = NV.intestazione(screen, { titolo: 'Notifiche' });
    testa.appendChild(h('p', {
      class: 'nv-lead',
      text: nuove.length === 1 ? 'Hai 1 notifica nuova' : nuove.length ? 'Hai ' + nuove.length + ' notifiche nuove' : 'Nessuna notifica nuova'
    }));

    var corpo = [];
    if (!lista.length) {
      corpo.push(h('div', { class: 'nv-noti-vuoto' }, [
        NV.mascotte('dormire', 'nv-noti-vuoto__mascotte'),
        h('strong', { text: 'Nessuna notifica' }),
        h('p', { text: 'Qui trovi scadenze, nuove opportunità e progressi del tuo percorso.' })
      ]));
    } else {
      if (nuove.length) corpo.push(gruppoNotifiche('Nuove', nuove));
      else {
        corpo.push(h('div', { class: 'nv-noti-pari' }, [
          NV.mascotte('ok', 'nv-noti-pari__mascotte'),
          h('div', { class: 'nv-noti-pari__copy' }, [
            h('strong', { text: 'Sei in pari' }),
            h('span', { text: 'Nessuna notifica nuova. Quando arriva qualcosa te lo diciamo noi.' })
          ])
        ]));
      }
      if (filtro === 'tutte' && vecchie.length) corpo.push(gruppoNotifiche('Precedenti', vecchie));
    }

    return [
      NV.pagina('nv-pro nv-noti-pagina', [
        NV.barra({
          indietro: 'dashboard',
          azioni: [NV.iconBtn('check-check', 'Segna tutte come lette', segnaTutte, nuove.length ? '' : 'nv-noti-fatto')]
        }),
        testa,
        lista.length ? NV.filaChip([
          NV.chip('Tutte', { attivo: filtro === 'tutte', conteggio: lista.length, onclick: function () { NV.aggiorna({ notiFiltro: 'tutte' }); } }),
          NV.chip('Non lette', { attivo: filtro === 'nuove', conteggio: nuove.length, onclick: function () { NV.aggiorna({ notiFiltro: 'nuove' }); } })
        ]) : null
      ].concat(corpo).concat([
        h('button', { class: 'nv-link nv-noti-gestisci', type: 'button', onclick: function () { NV.vai('preferenze'); } }, [
          icon('settings', ICO.SM), h('span', { text: 'Scegli quali notifiche ricevere' })
        ])
      ]))
    ];
  };

  /* ==================================================================
     CONSULENZA (in arrivo)
     Stessi contenuti di prima (js/fase3-content.js), vestito nuovo.
     ================================================================== */
  screens.nvInArrivo = function (screen) {
    var voci = screen.voci || [];
    return [
      NV.pagina('nv-soon', [
        NV.barraHome(),
        h('div', { class: 'nv-soon-scena' }, [
          h('span', { class: 'nv-soon-scena__tag' }, [icon('clock', ICO.SM), h('span', { text: 'In arrivo' })]),
          NV.mascotte(screen.posa || 'stretta-mano', 'nv-soon-scena__mascotte')
        ]),
        h('div', { class: 'nv-head' }, [
          NV.testo(screen, 'titoloInArrivo', screen.titoloInArrivo || screen.title, 'h1', 'nv-title'),
          screen.testoInArrivo ? NV.testo(screen, 'testoInArrivo', screen.testoInArrivo, 'p', 'nv-lead') : null
        ]),
        voci.length ? NV.sezione('Chi potrai incontrare', [
          h('div', { class: 'nv-pro-gruppo nv-soon-voci' }, voci.map(function (v, i) {
            return h('div', { class: 'nv-soon-voce' }, [
              NV.icoChip(v.icona, v.tono),
              h('span', { class: 'nv-pro-voce__copy' }, [
                NV.testo(screen, 'voce' + i + 'Etichetta', v.etichetta, 'span', 'nv-pro-voce__titolo'),
                v.nota ? NV.testo(screen, 'voce' + i + 'Nota', v.nota, 'span', 'nv-pro-voce__sotto') : null
              ])
            ]);
          }))
        ]) : null,
        NV.pulsante(screen.azione || 'Torna alla dashboard', {
          variante: 'secondario',
          onclick: function () { NV.vaiTab('dashboard'); }
        })
      ]),
      NV.navBasso('consulenza')
    ];
  };
})();
