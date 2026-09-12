/* ==========================================================================
   NAVIDA — Rendering Fase 3
   Estende il renderer comune senza duplicare cornice, editor o sincronizzazione.
   ========================================================================== */

(function () {
  'use strict';

  var S = window.NavidaState;
  var R = window.NavidaRender;
  var h = R.h;
  var icon = R.icon;
  var Screens = R.screens;

  /* ==================================================================
     LE TRE MISURE DELLE ICONE
     Non se ne usano altre. Vedi DESIGN-SYSTEM.md.
     ================================================================== */
  var ICO_SM = 16;   /* dentro una riga di testo: meta dati, freccine */
  var ICO_MD = 20;   /* dentro un quadratino colorato o una riga elenco */
  var ICO_LG = 24;   /* pulsanti della barra in alto e di quella in basso */
  var ICO_VUOTO = 32;  /* solo per il disegno grande degli stati vuoti */
  var ICO_VUOTO_XL = 48;

  /* ==================================================================
     ICONE CHE MANCAVANO
     ------------------------------------------------------------------
     js/icons.js contiene le icone del questionario. Le schermate della
     Fase 3 e 4 ne usano altre trenta: senza queste il prototipo le
     lascia vuote quando non c'e' rete (il CDN Lucide non risponde) e si
     vedono dei buchi bianchi al posto dell'icona.
     Stessa forma di icons.js: disegno Lucide su griglia 24x24, tratto 2,
     colore ereditato da currentColor. Aggiungiamo solo cio' che manca,
     senza mai sovrascrivere un'icona gia' presente.
     ================================================================== */
  var ICONE_FASE3 = {
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'award': '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    'bell': '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'briefcase-business': '<path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'circle': '<circle cx="12" cy="12" r="10"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'circle-dollar-sign': '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
    'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'file-user': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="12" cy="15" r="2"/><path d="M15.5 20a3.5 3.5 0 0 0-7 0"/>',
    'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    'folder-up': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M12 10v6"/><path d="m9 13 3-3 3 3"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'heart-handshake': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>',
    'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    'map': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    'pencil-line': '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/>',
    'person-standing': '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>',
    'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'save': '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'settings-2': '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
    'star': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    'video': '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'
  };

  if (window.NAVIDA_ICONS) {
    Object.keys(ICONE_FASE3).forEach(function (nome) {
      if (!window.NAVIDA_ICONS[nome]) window.NAVIDA_ICONS[nome] = ICONE_FASE3[nome];
    });
  }

  /* Riga "icona + testo" usata nei meta dati (partecipanti, durata...). */
  function meta(nomeIcona, testo) {
    return h('span', {}, [icon(nomeIcona, ICO_SM), ' ' + testo]);
  }

  function text(screen, key, fallback, tag, cls) {
    return h(tag || 'span', {
      class: cls || '',
      'data-editable': screen.id + '.' + key,
      text: S.text(screen.id + '.' + key, fallback)
    });
  }

  function go(id) {
    return function () { window.NavidaApp.goTo(id); };
  }

  function topBar(screen, opts) {
    opts = opts || {};
    return h('div', { class: 'f3-topbar' }, [
      opts.back ? h('button', { class: 'f3-iconbtn', 'aria-label': 'Indietro', onclick: go(opts.back) }, [icon('chevron-left', ICO_LG)]) :
        h('button', { class: 'f3-avatar', 'aria-label': 'Apri il profilo', onclick: go('profilo') }, [h('img', { src: profileData().avatar, alt: '' })]),
      opts.identity ? h('div', { class: 'f3-identity' }, [
        text(screen, 'greeting', screen.greeting || 'Bentornato', 'span', 'f3-kicker'),
        text(screen, 'name', screen.name || 'Marco Bacchin', 'strong', 'f3-name')
      ]) : h('div', { class: 'f3-topbar__spacer' }),
      opts.bell === false ? null : h('button', { class: 'f3-iconbtn f3-bell', 'aria-label': 'Notifiche', onclick: go('notifiche') }, [icon('bell', ICO_LG), h('span', { class: 'f3-dot' })])
    ].filter(Boolean));
  }

  /* ==================================================================
     BARRA DI NAVIGAZIONE IN BASSO
     ------------------------------------------------------------------
     Tre voci, quelle del flusso: Dashboard · Mappa · Consulenza.
     Notifiche e profilo NON stanno qui: si aprono dalla barra in alto
     (campanella e avatar), come dice il flusso.

     Icona da 24 sopra ed etichetta corta sotto, la voce in cui ti trovi
     in colore brand. Percorso e catalogo sono di secondo livello: la
     barra c'e' lo stesso (ci si arriva dalla dashboard e da li' si deve
     poter tornare), ma nessuna voce risulta attiva.

     Non e' dentro alla pagina ma le sta accanto: la schermata (.screen)
     e' gia' una colonna flessibile, cosi' la pagina scorre e la barra
     resta ferma in fondo senza coprire l'ultimo contenuto.
     ================================================================== */
  var VOCI_NAV = [
    { id: 'dashboard', icona: 'house', label: 'Dashboard' },
    { id: 'mappa', icona: 'map', label: 'Mappa' },
    { id: 'consulenza', icona: 'users', label: 'Consulenza' }
  ];

  function bottomNav(attivo) {
    return h('nav', { class: 'f3-nav', 'aria-label': 'Sezioni principali' }, VOCI_NAV.map(function (voce) {
      var corrente = voce.id === attivo;
      return h('button', {
        class: 'f3-navBtn' + (corrente ? ' is-active' : ''),
        'aria-current': corrente ? 'page' : null,
        onclick: corrente ? null : go(voce.id)
      }, [icon(voce.icona, ICO_LG), h('span', { text: voce.label })]);
    }));
  }

  /* ==================================================================
     POP UP SOPRA LA SCHERMATA DA CUI SI ARRIVA
     ------------------------------------------------------------------
     "Filtri" e "Impostazioni contenuto" restano due voci dell'elenco
     schermate (servono al pannello "Vai a" e ai link diretti), ma non
     sono pagine a se': disegnano il velo scuro sopra la schermata da cui
     sono state aperte, come fa il login a popup in js/render.js.
     Si restituiscono piu' livelli: prima la schermata sotto, resa
     inerte, poi il velo con la card sopra.
     ================================================================== */
  function schermata(id) {
    var lista = (window.NAVIDA_CONTENT && window.NAVIDA_CONTENT.screens) || [];
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  function overlaySu(idSottostante, velo) {
    var frag = document.createDocumentFragment();
    var sotto = schermata(idSottostante);
    var renderer = sotto && Screens[sotto.type];
    if (renderer) {
      var strato = h('div', { class: 'f3-sotto', 'aria-hidden': 'true' });
      var out = renderer(sotto);
      if (Array.isArray(out)) out.forEach(function (n) { if (n) strato.appendChild(n); });
      else if (out) strato.appendChild(out);
      /* niente testi modificabili in doppia copia e niente click che passano */
      strato.querySelectorAll('[data-editable]').forEach(function (n) { n.removeAttribute('data-editable'); });
      frag.appendChild(strato);
    }
    frag.appendChild(velo);
    return frag;
  }

  /* Il velo: cliccandolo si torna alla schermata sotto. */
  function velo(idRitorno, classe, card) {
    return h('div', {
      class: 'f3-overlay' + (classe ? ' ' + classe : ''),
      onclick: function (e) { if (e.target === e.currentTarget) window.NavidaApp.goTo(idRitorno); }
    }, [card]);
  }

  function stat(iconName, tone, label, value) {
    return h('div', { class: 'f3-stat' }, [
      h('span', { class: 'f3-stat__icon f3-tone--' + tone }, [icon(iconName, ICO_MD)]),
      h('span', { class: 'f3-stat__label', text: label }),
      h('strong', { class: 'f3-stat__value', text: value })
    ]);
  }

  function courseLogo(kind) {
    if (kind === 'rivoluzione' || kind === 'public') {
      return h('div', { class: 'f3-courseLogo f3-courseLogo--sponsor' }, [
        h('img', { src: 'assets/fase3/catalog-sponsor.png', alt: 'Rivoluzione Umana' })
      ]);
    }
    return h('div', { class: 'f3-courseLogo' }, [
      h('img', { src: 'assets/fase3/catalog-course.png', alt: 'Coursera' })
    ]);
  }

  function courseData(kind) {
    var map = {
      figma: { provider: 'Coursera', title: 'Figma 101', rating: '4.7', meta: 'Corso online · 6 ore', price: '€22.99' },
      project: { provider: 'Coursera', title: 'Corso Project Management Base', rating: '4.5', meta: 'Corso online · 6 ore', price: '€44.99' },
      ux: { provider: 'Coursera', title: 'Fondamenti ux ui design', rating: '4.7', meta: 'Corso online · 6 ore', price: '€54.99' },
      excel: { provider: 'Coursera', title: 'Excel avanzato per amministrativi', rating: '4.5', meta: 'Corso online · 6 ore', price: '€39.99' },
      rivoluzione: { provider: 'Rivoluzione Umana', title: 'Consulenza di carriera', rating: '4.2', meta: 'Consulenza · 60m', price: '1 gratuita', sponsor: true },
      public: { provider: 'Rivoluzione Umana', title: 'Corso public speaking', rating: '4.1', meta: 'Corso remoto · 120m', price: 'Gratuito', sponsor: true }
    };
    return map[kind];
  }

  function courseCard(screen, kind, index, compact) {
    var d = courseData(kind);
    return h('button', { class: 'f3-course' + (compact ? ' f3-course--compact' : ''), onclick: go('dettaglio') }, [
      courseLogo(kind),
      h('span', { class: 'f3-course__body' }, [
        h('span', { class: 'f3-course__provider', text: d.provider }),
        text(screen, 'course.' + index + '.title', d.title, 'strong', 'f3-course__title'),
        h('span', { class: 'f3-course__rating' }, [icon('star', ICO_SM), h('span', { text: d.rating }), h('small', { text: d.sponsor ? '(2k)' : '(125k)' })]),
        h('span', { class: 'f3-course__meta', text: d.meta }),
        h('span', { class: 'f3-course__price', text: d.price })
      ]),
      d.sponsor ? h('span', { class: 'f3-sponsored', text: 'Sponsor' }) : null,
      h('span', { class: 'f3-course__link' }, ['Dettagli ', icon('chevron-right', ICO_SM)])
    ].filter(Boolean));
  }

  /* La scheda del prossimo evento: la usano sia la Home "Con percorso"
     sia "In primo piano" della versione da flusso. */
  function eventCard(screen) {
    return h('button', { class: 'f3-event', onclick: go('dettaglio') }, [
      h('div', { class: 'f3-date' }, [h('strong', { text: '15' }), h('span', { text: 'MAR' })]),
      h('div', { class: 'f3-event__copy' }, [
        h('small', { text: 'Scuola Italiana Design' }),
        h('strong', { text: 'Workshop di introduzione all’AI generativa' }),
        meta('users', '98 partecipanti'),
        h('span', {}, [icon('calendar', ICO_SM), ' Evento', icon('clock', ICO_SM), ' 120m']),
        h('em', { text: 'EVENTO' })
      ]),
      h('span', { class: 'f3-course__link' }, ['Dettagli ', icon('chevron-right', ICO_SM)])
    ]);
  }

  /* ==================================================================
     LINEA DI CARRIERA COMPRESSA (FigJam 3.1)
     ------------------------------------------------------------------
     Gli step in orizzontale, 1-2-3-4-5. L'avanzamento si legge dal
     disegno — pallini pieni e tratte piene fino a dove sei arrivato —
     e non da un numero: il flusso esclude la percentuale in modo
     esplicito ("no percentuale").
     Gli step non sono scritti qui: sono quelli della schermata
     "percorso", cosi' resta un elenco solo da tenere aggiornato e i tre
     stati (fatto / adesso / da fare) sono gli stessi della versione
     estesa.
     ================================================================== */
  function passiPercorso() {
    var percorso = schermata('percorso');
    return (percorso && percorso.steps) || [];
  }

  function indiceAttivo(passi) {
    var attivo = 0;
    passi.forEach(function (passo, i) { if (passo.state === 'active') attivo = i; });
    return attivo;
  }

  function lineaCompressa(passi, attivo) {
    return h('ol', { class: 'f3-linea', 'aria-label': 'Avanzamento del percorso' }, passi.map(function (passo, i) {
      var stato = passo.state === 'done' ? 'fatto' : passo.state === 'active' ? 'adesso' : 'dafare';
      /* dentro al pallino: la spunta di chi ha finito, la coppa del
         traguardo, niente per gli step ancora da fare */
      var dentro = passo.state === 'done' ? icon('check', ICO_SM)
        : passo.state === 'goal' ? icon('award', ICO_SM) : null;
      return h('li', {
        class: 'f3-linea__passo is-' + stato + (i <= attivo ? ' is-piena' : ''),
        title: passo.role,
        'aria-label': (passo.label || 'Step ' + (i + 1)) + (passo.role ? ' · ' + passo.role : '')
      }, [
        h('span', { class: 'f3-linea__pallino' }, dentro ? [dentro] : []),
        h('span', { class: 'f3-linea__num', text: String(i + 1) })
      ]);
    }));
  }

  /* Descrizione dello step di adesso, con i suoi obiettivi.
     Il titolo arriva dallo step della schermata "percorso": se il team
     lo riscrive da qui, vale solo per la dashboard. */
  function stepAdesso(screen, passi, attivo) {
    var passo = passi[attivo] || {};
    return h('section', { class: 'f3-stepNow' }, [
      h('div', { class: 'f3-stepNow__head' }, [
        h('span', { class: 'f3-stepNow__badge', text: passo.label || 'Step ' + (attivo + 1) }),
        text(screen, 'stepOcchiello', screen.stepOcchiello, 'small', '')
      ]),
      text(screen, 'stepTitolo', passo.role || '', 'h2', ''),
      text(screen, 'stepDescrizione', screen.stepDescrizione, 'p', ''),
      h('ul', { class: 'f3-stepGoals' }, (screen.stepObiettivi || []).map(function (obiettivo, i) {
        return h('li', {}, [
          h('span', {}, [icon('check', ICO_SM)]),
          text(screen, 'obiettivo.' + i, obiettivo, 'span', '')
        ]);
      }))
    ]);
  }

  /* Le due scorciatoie del flusso: [Formazione] e [Lavoro]. */
  function scorciatoie(screen) {
    return h('div', { class: 'f3-scorciatoie' }, (screen.scorciatoie || []).map(function (voce, i) {
      return h('button', { class: 'f3-scorciatoia', onclick: go('catalogo') }, [
        h('span', { class: 'f3-scorciatoia__icon f3-tone--' + voce.tono }, [icon(voce.icona, ICO_MD)]),
        text(screen, 'scorciatoia.' + i + '.etichetta', voce.etichetta, 'strong', ''),
        text(screen, 'scorciatoia.' + i + '.nota', voce.nota, 'small', '')
      ]);
    }));
  }

  Screens.dashboardHome = function (screen) {
    var variante = S.pageVariant(screen.id, 'flusso');

    if (variante === 'vuota') {
      return [h('div', { class: 'f3-page f3-home f3-home--empty' }, [
        topBar(screen, { identity: true }),
        h('div', { class: 'f3-stats' }, [
          stat('book-open', 'neutral', 'In corso', '0'),
          stat('award', 'neutral', 'Completati', '0'),
          stat('trending-up', 'neutral', 'Ore totali', '0h')
        ]),
        h('section', { class: 'f3-emptyStart' }, [
          h('span', { class: 'f3-emptyStart__icon' }, [icon('rocket', ICO_VUOTO)]),
          text(screen, 'emptyTitle', 'Il tuo percorso inizia ora', 'h1', ''),
          text(screen, 'emptyBody', 'Scegli un elemento dal catalogo per iniziare a costruire le tue competenze', 'p', ''),
          h('button', { onclick: go('catalogo') }, [icon('search', ICO_MD), ' Esplora i contenuti'])
        ]),
        h('section', { class: 'f3-mood' }, [
          h('h2', { text: 'Mood tracker' }),
          h('div', { class: 'f3-mood__card' }, [h('p', { text: 'Come ti senti oggi?' }), h('div', {}, ['😔', '🙁', '😐', '🙂', '😁'].map(function (m) { return h('button', { text: m }); }))])
        ]),
        h('section', { class: 'f3-startHere' }, [
          h('h2', { text: 'Inizia da qui' }),
          h('button', { onclick: go('percorso') }, [h('span', {}, [icon('zap', ICO_MD)]), h('div', {}, [h('strong', { text: 'Esplora il percorso di carriera' }), h('small', { text: 'Scopri dove puoi migliorare' })]), icon('chevron-right', ICO_SM)])
        ])
      ]), bottomNav('dashboard')];
    }
    if (variante === 'attiva') {
      return [h('div', { class: 'f3-page f3-home' }, [
        topBar(screen, { identity: true }),
        h('div', { class: 'f3-stats' }, [
          stat('book-open', 'violet', 'In corso', '1'),
          stat('award', 'mint', 'Completati', '12'),
          stat('trending-up', 'orange', 'Ore totali', '48h')
        ]),
        h('button', { class: 'f3-goal', onclick: go('percorso') }, [
          h('div', { class: 'f3-goal__copy' }, [
            text(screen, 'monthlyTitle', screen.monthlyTitle, 'h2', ''),
            text(screen, 'monthlyBody', screen.monthlyBody, 'p', ''),
            h('div', { class: 'f3-goal__meta' }, [
              meta('target', '3/4 corsi'),
              meta('clock', '18h/20h')
            ])
          ]),
          h('div', { class: 'f3-ring', 'aria-label': '75 per cento' }, [h('strong', { text: '75%' })])
        ]),
        h('section', { class: 'f3-section' }, [
          h('div', { class: 'f3-section__head' }, [
            text(screen, 'activeTitle', screen.activeTitle, 'h2', ''),
            h('button', { onclick: go('catalogo') }, ['Vedi tutti ', icon('chevron-right', ICO_SM)])
          ]),
          courseCard(screen, 'ux', 0)
        ]),
        h('section', { class: 'f3-section' }, [
          h('div', { class: 'f3-section__head' }, [text(screen, 'eventTitle', screen.eventTitle, 'h2', '')]),
          eventCard(screen)
        ])
      ]), bottomNav('dashboard')];
    }

    /* --- "Da flusso": la dashboard come la descrive il FigJam (3.1) ---
       Nell'ordine del flusso: linea compressa, pulsante per estenderla,
       step di adesso con obiettivi, "In primo piano", scorciatoie. */
    var passi = passiPercorso();
    var attivo = indiceAttivo(passi);

    return [h('div', { class: 'f3-page f3-home f3-home--flusso' }, [
      topBar(screen, { identity: true }),
      h('section', { class: 'f3-section f3-lineaCard' }, [
        h('div', { class: 'f3-section__head' }, [
          text(screen, 'lineaTitolo', screen.lineaTitolo, 'h2', '')
        ]),
        lineaCompressa(passi, attivo),
        h('button', { class: 'f3-btnOutline f3-lineaEstendi', onclick: go('percorso') }, [
          text(screen, 'lineaEstendi', screen.lineaEstendi, 'span', ''),
          icon('chevron-right', ICO_SM)
        ])
      ]),
      stepAdesso(screen, passi, attivo),
      h('section', { class: 'f3-section' }, [
        h('div', { class: 'f3-section__head' }, [
          text(screen, 'primoPianoTitolo', screen.primoPianoTitolo, 'h2', ''),
          h('button', { onclick: go('catalogo') }, ['Vedi tutti ', icon('chevron-right', ICO_SM)])
        ]),
        h('div', { class: 'f3-primoPiano' }, [
          courseCard(screen, 'excel', 'flusso.0'),
          eventCard(screen)
        ])
      ]),
      scorciatoie(screen)
    ]), bottomNav('dashboard')];
  };

  /* ==================================================================
     MAPPA E CONSULENZA (FigJam 3.2 e 3.3)
     ------------------------------------------------------------------
     Le due sezioni non esistono ancora. Invece di lasciare due voci
     della barra che non portano da nessuna parte, mostrano uno stato
     "in arrivo" con le parole del flusso: si capisce cosa ci sara' e
     si torna alla dashboard con un tocco.
     Stesso vestito degli altri stati vuoti (f3-emptyStart).
     ================================================================== */
  Screens.sezioneInArrivo = function (screen) {
    var mascotte = h('div', { class: 'f3-soon__mascotte', 'aria-hidden': 'true' });
    if (window.NavidaMascotte) mascotte.appendChild(window.NavidaMascotte.elemento(screen.posa));

    return [h('div', { class: 'f3-page f3-soonPage' }, [
      topBar(screen, {}),
      text(screen, 'title', screen.title, 'h1', 'f3-pageTitle'),
      h('section', { class: 'f3-emptyStart f3-soon' }, [
        mascotte,
        text(screen, 'titoloInArrivo', screen.titoloInArrivo, 'h2', ''),
        text(screen, 'testoInArrivo', screen.testoInArrivo, 'p', ''),
        h('button', { onclick: go('dashboard') }, [icon('house', ICO_MD), text(screen, 'azione', screen.azione, 'span', '')])
      ]),
      h('ul', { class: 'f3-soonList' }, (screen.voci || []).map(function (voce, i) {
        return h('li', {}, [
          h('span', { class: 'f3-soonList__icon f3-tone--' + voce.tono }, [icon(voce.icona, ICO_MD)]),
          h('span', { class: 'f3-soonList__copy' }, [
            text(screen, 'voce.' + i + '.etichetta', voce.etichetta, 'strong', ''),
            text(screen, 'voce.' + i + '.nota', voce.nota, 'small', '')
          ])
        ]);
      }))
    ]), bottomNav(screen.id)];
  };

  Screens.dashboardNotifications = function (screen) {
    if (S.pageVariant(screen.id, 'attive') === 'vuote') {
      return h('div', { class: 'f3-page f3-notifications f3-notifications--empty' }, [
        topBar(screen, { back: 'dashboard', bell: false }),
        text(screen, 'title', screen.title, 'h1', 'f3-pageTitle'),
        h('section', { class: 'f3-emptyNotifications' }, [
          h('span', { class: 'f3-emptyNotifications__icon' }, [icon('bell', ICO_VUOTO_XL)]),
          text(screen, 'emptyTitle', 'Nessuna notifica', 'h2', ''),
          text(screen, 'emptyBody', 'Le tue notifiche appariranno qui. Ti aggiorneremo su corsi, progressi e novità.', 'p', '')
        ])
      ]);
    }
    return h('div', { class: 'f3-page f3-notifications' }, [
      topBar(screen, { back: 'dashboard', bell: false }),
      text(screen, 'title', screen.title, 'h1', 'f3-pageTitle'),
      h('div', { class: 'f3-notificationList' }, screen.items.map(function (item, i) {
        return h('article', { class: 'f3-notification' }, [
          h('span', { class: 'f3-notification__icon f3-tone--' + item.tone }, [icon(item.icon, ICO_MD)]),
          h('div', { class: 'f3-notification__copy' }, [
            text(screen, 'item.' + i + '.title', item.title, 'h2', ''),
            text(screen, 'item.' + i + '.text', item.text, 'p', '')
          ]),
          h('time', { text: item.time })
        ]);
      }))
    ]);
  };

  function pathList(screen) {
    return h('div', { class: 'f3-pathList' }, screen.steps.map(function (step, i) {
      return h('button', { class: 'f3-pathCard is-' + step.state, onclick: step.state === 'active' ? go('catalogo') : null }, [
        h('span', { class: 'f3-pathState' }, [step.state === 'done' ? icon('check', ICO_MD) : step.state === 'goal' ? icon('award', ICO_MD) : null]),
        h('span', { class: 'f3-pathCard__copy' }, [
          h('small', { text: step.label }),
          text(screen, 'step.' + i + '.role', step.role, 'strong', ''),
          step.duration ? h('span', {}, [icon('clock', ICO_SM), ' ' + step.duration]) : null
        ]),
        icon('chevron-right', ICO_MD)
      ].filter(Boolean));
    }));
  }

  /* Le versioni con la linea usano lo stesso modulo del questionario
     (js/percorso.js): una sola anatomia, la linea disegnata sui pallini
     veri e nessuna altezza fissa. Prima qui c'era un disegno a parte che
     mostrava due tappe su cinque e non aveva nemmeno un CSS. */
  var LINEA_DI = { serpentina: 'serpentina', outline: 'filo', attiva: 'filo' };

  function pathCurve(screen, variant) {
    var box = h('div', { class: 'f3-percorso f3-percorso--' + variant });

    if (!window.NavidaPercorso) return pathList(screen);

    var attiva = 0;
    screen.steps.forEach(function (st, i) {
      if (st.state === 'active') attiva = i;
    });

    var linea = window.NavidaPercorso.disegna(screen.steps.map(function (st) {
      return { nome: st.role, durata: st.duration };
    }), { variante: LINEA_DI[variant] || 'serpentina', attiva: attiva });

    /* le tappe restano toccabili come le card della versione a elenco */
    Array.prototype.forEach.call(linea.querySelectorAll('.perc__tappa'), function (riga) {
      riga.setAttribute('role', 'button');
      riga.setAttribute('tabindex', '0');
      riga.addEventListener('click', go('catalogo'));
    });

    box.appendChild(linea);
    return box;
  }

  Screens.careerPath = function (screen) {
    var variant = S.pageVariant(screen.id, 'lista');
    var children = [variant === 'lista' ? topBar(screen, { back: 'dashboard', bell: false }) : topBar(screen, { identity: true })];
    children.push(text(screen, 'title', screen.title, 'h1', 'f3-pageTitle'));
    if (variant === 'lista') {
      children.push(h('section', { class: 'f3-pathSummary' }, [
        h('div', {}, [text(screen, 'summaryTitle', 'Il tuo percorso', 'h2', ''), text(screen, 'intro', screen.intro, 'p', ''), h('span', {}, [icon('circle-check', ICO_SM), ' 1 completato', icon('circle', ICO_SM), ' 4 da fare'])]),
        h('div', { class: 'f3-ring f3-ring--small' }, [h('strong', { text: '20%' })])
      ]));
      children.push(pathList(screen));
    } else {
      children.push(pathCurve(screen, variant));
    }
    return [h('div', { class: 'f3-page f3-path f3-path--' + variant }, children), bottomNav('percorso')];
  };

  Screens.careerCatalog = function (screen) {
    var idx = 0;
    return [h('div', { class: 'f3-page f3-catalog' }, [
      topBar(screen, { back: 'percorso', bell: false }),
      h('section', { class: 'f3-roleCard' }, [
        text(screen, 'role', screen.role, 'h1', ''),
        text(screen, 'roleDescription', screen.roleDescription, 'p', ''),
        h('div', {}, [meta('zap', '28 opportunità'), meta('star', '2 consigliati')])
      ]),
      h('div', { class: 'f3-filterbar' }, [
        ['Tutti', 'Formazione', 'Contenuti', 'Eventi'].map(function (label, i) { return h('button', { class: i === 0 ? 'is-active' : '', text: label }); }),
        h('button', { class: 'f3-filterBtn', 'aria-label': 'Apri filtri', onclick: go('filtri') }, [icon('sliders-horizontal', ICO_MD)])
      ].flat()),
      h('div', { class: 'f3-catalogGroups' }, screen.groups.map(function (group) {
        return h('section', { class: 'f3-catalogGroup' }, [
          h('div', { class: 'f3-catalogGroup__title' }, [h('h2', { text: group.title }), h('span', { text: group.items.length })]),
          h('div', { class: 'f3-catalogGroup__items' }, group.items.map(function (kind) { return courseCard(screen, kind, idx++, true); }))
        ]);
      }))
    ]), bottomNav('catalogo')];
  };

  /* ==================================================================
     ATTIVITA' DELLO STEP, CON IL TAG (FigJam 3.1.2)
     ------------------------------------------------------------------
     Ogni attivita' porta un'etichetta piccola: obbligatoria oppure
     facoltativa. Stessa taglia di "EVENTO" e di "Sponsor".
     ================================================================== */
  function tagAttivita(obbligatoria) {
    return h('em', {
      class: 'f3-tag' + (obbligatoria ? ' f3-tag--obbligatoria' : ''),
      text: obbligatoria ? 'Obbligatoria' : 'Facoltativa'
    });
  }

  function elencoAttivita(screen) {
    if (!screen.attivita || !screen.attivita.length) return null;
    return h('section', { class: 'f3-attivita' }, [
      text(screen, 'attivitaTitolo', screen.attivitaTitolo, 'h2', ''),
      h('ul', {}, screen.attivita.map(function (voce, i) {
        return h('li', {}, [
          h('span', { class: 'f3-attivita__copy' }, [
            text(screen, 'attivita.' + i + '.nome', voce.nome, 'strong', ''),
            h('span', { text: voce.dati })
          ]),
          tagAttivita(voce.obbligatoria)
        ]);
      }))
    ]);
  }

  Screens.careerDetail = function (screen) {
    return h('div', { class: 'f3-page f3-detail' }, [
      h('header', { class: 'f3-detailHero' }, [
        h('img', { src: 'assets/fase3/detail-hero.png', alt: '' }),
        h('div', { class: 'f3-detailHero__shade' }),
        h('button', { class: 'f3-detailBack', 'aria-label': 'Indietro', onclick: go('catalogo') }, [icon('arrow-left', ICO_LG)]),
        h('button', { class: 'f3-detailSettings', 'aria-label': 'Impostazioni contenuto', onclick: go('impostazioni') }, [icon('settings', ICO_LG)]),
        h('div', { class: 'f3-detailHero__copy' }, [
          h('div', { class: 'f3-detailBadges' }, [h('span', { text: screen.provider }), h('span', {}, [icon('star', ICO_SM), ' ' + screen.rating])]),
          text(screen, 'title', screen.title, 'h1', ''),
          h('div', { class: 'f3-detailMeta' }, [meta('video', 'Online'), meta('clock', '56 ore'), meta('users', '125k+')])
        ])
      ]),
      h('div', { class: 'f3-detailBody' }, [
        h('div', { class: 'f3-detailStats' }, [
          stat('trending-up', 'violet', 'Livello', 'Intermedio'),
          stat('award', 'violet', 'Certificato', 'Incluso'),
          stat('users', 'violet', 'Studenti', '125k+')
        ]),
        h('section', { class: 'f3-priceCard' }, [
          h('div', {}, [text(screen, 'priceLabel', screen.priceLabel, 'span', ''), h('p', {}, [text(screen, 'price', screen.price, 'strong', ''), text(screen, 'priceSuffix', screen.priceSuffix, 'small', '')])]),
          h('button', { onclick: function () { R.toast('Iscrizione simulata nel prototipo.'); } }, [text(screen, 'cta', screen.cta, 'span', '')])
        ]),
        h('section', { class: 'f3-keypoints' }, [
          text(screen, 'pointsTitle', screen.pointsTitle, 'h2', ''),
          h('ul', {}, screen.points.map(function (point, i) { return h('li', {}, [h('span', {}, [icon('check', ICO_SM)]), text(screen, 'point.' + i, point, 'span', '')]); }))
        ]),
        elencoAttivita(screen),
        h('div', { class: 'f3-gallery' }, [
          h('img', { src: 'assets/fase3/detail-gallery-1.png', alt: '' }),
          h('img', { src: 'assets/fase3/detail-gallery-2.png', alt: '' }),
          h('img', { src: 'assets/fase3/detail-gallery-3.png', alt: '' })
        ])
      ])
    ]);
  };

  function chipGroup(title, values) {
    return h('fieldset', { class: 'f3-chipGroup' }, [
      h('legend', { text: title }),
      h('div', {}, values.map(function (label) {
        return h('button', { type: 'button', text: label, onclick: function (e) { e.currentTarget.classList.toggle('is-selected'); } });
      }))
    ]);
  }

  Screens.careerFilters = function (screen) {
    return overlaySu('catalogo', velo('catalogo', 'f3-overlay--sheet', h('section', { class: 'f3-filterModal' }, [
        h('div', { class: 'f3-sheetHandle' }),
        h('div', { class: 'f3-modalHead' }, [text(screen, 'title', screen.title, 'h1', ''), h('button', { 'aria-label': 'Chiudi', onclick: go('catalogo') }, [icon('x', ICO_LG)])]),
        chipGroup('Categoria', ['Formazione', 'Contenuti', 'Eventi', 'Consulenza']),
        chipGroup('Sottocategoria', ['Podcast', 'Soft skill', 'Volontariato', 'Networking', 'Progetti', 'Risorse', 'Supporto RU', 'Mentor', 'Libri']),
        chipGroup('Formato', ['Online', 'Da remoto', 'In presenza', 'Articoli', 'Podcast', 'Video']),
        chipGroup('Durata', ['›5h', '5–24h', '1–5g', '5g–30g', '1–6 mesi', '6–12 mesi']),
        chipGroup('Prezzo', ['Gratuito', '€0–€25', '€25–€50', '€50–€100', '€100–€250', '€250+']),
        h('div', { class: 'f3-modalActions' }, [
          h('button', { class: 'f3-btnOutline', onclick: function () { document.querySelectorAll('.f3-chipGroup .is-selected').forEach(function (n) { n.classList.remove('is-selected'); }); } }, ['Resetta']),
          h('button', { class: 'f3-btnPrimary', onclick: go('catalogo') }, ['Applica filtri'])
        ])
      ])));
  };

  function settingsRow(iconName, title, body, tone, trailing) {
    return h('button', { class: 'f3-settingRow' }, [
      h('span', { class: 'f3-settingRow__icon f3-tone--' + tone }, [icon(iconName, ICO_MD)]),
      h('span', { class: 'f3-settingRow__copy' }, [h('strong', { text: title }), h('small', { text: body })]),
      trailing === 'toggle' ? h('span', { class: 'f3-toggle', onclick: function (e) { e.stopPropagation(); e.currentTarget.classList.toggle('is-on'); } }, [h('i')]) : null
    ].filter(Boolean));
  }

  Screens.careerSettings = function (screen) {
    return overlaySu('dettaglio', velo('dettaglio', 'f3-overlay--sheet', h('section', { class: 'f3-settingsSheet' }, [
        h('div', { class: 'f3-sheetHandle' }),
        h('div', { class: 'f3-modalHead' }, [
          h('div', {}, [text(screen, 'title', screen.title, 'h1', ''), text(screen, 'subtitle', screen.subtitle, 'p', '')]),
          h('button', { 'aria-label': 'Chiudi', onclick: go('dettaglio') }, [icon('x', ICO_LG)])
        ]),
        settingsRow('check', 'Segna come completato', 'Aggiungi ai corsi completati', 'mint', 'toggle'),
        h('h2', { class: 'f3-settingsLabel', text: 'GESTIONE' }),
        settingsRow('share-2', 'Condividi', 'Invia a un amico o sui social', 'violet'),
        settingsRow('heart', 'Aggiungi ai preferiti', 'Salva per dopo', 'neutral'),
        settingsRow('eye-off', 'Nascondi elemento', 'Non mostrare più nei suggerimenti', 'neutral'),
        h('h2', { class: 'f3-settingsLabel', text: 'SUPPORTO' }),
        settingsRow('circle-help', 'Contatta supporto', 'Hai bisogno di aiuto?', 'neutral'),
        settingsRow('flag', 'Segnala problema', 'Contenuto non appropriato o errori', 'danger')
      ])));
  };

  /* ==================================================================
     FASE 4 — PROFILO UTENTE
     ================================================================== */

  var PROFILE_KEY = 'navida-profile-v1';
  var PROFILE_DEFAULTS = {
    firstName: 'Marco', lastName: 'Bacchin', email: 'bacchin.marco03@gmail.com',
    phone: '+39 123405687', address: 'Via Puzza 31', city: 'Albignasego',
    province: 'PD', cap: '35020', occupation: 'Ingegnere strutturale',
    avatar: 'assets/mascotte-salutare.png',
    preferences: { push: true, email: true, sms: false, courses: true, weekly: true, content: true, dark: false, language: 'Italiano', visibility: 'Solo aziende compatibili' }
  };

  function profileData() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; } catch (e) {}
    var data = Object.assign({}, PROFILE_DEFAULTS, saved);
    data.preferences = Object.assign({}, PROFILE_DEFAULTS.preferences, saved.preferences || {});
    if (document.body) document.body.classList.toggle('p4-dark', !!data.preferences.dark);
    return data;
  }

  function saveProfile(data) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function profileHeader(title, back) {
    return h('header', { class: 'p4-header' }, [
      h('button', { class: 'p4-iconbtn', 'aria-label': 'Indietro', onclick: go(back || 'profilo') }, [icon('arrow-left', ICO_LG)]),
      h('h1', { text: title }),
      h('span', { class: 'p4-header__space' })
    ]);
  }

  function profileAvatar(editable) {
    var data = profileData();
    return h('button', { class: 'p4-avatar' + (editable ? ' is-editable' : ''), 'aria-label': editable ? 'Cambia foto profilo' : 'Foto profilo', onclick: editable ? go('fotoProfilo') : null }, [
      h('span', { class: 'p4-avatar__image' }, [h('img', { src: data.avatar, alt: '' })]),
      editable ? h('span', { class: 'p4-avatar__camera' }, [icon('camera', ICO_MD)]) : null
    ].filter(Boolean));
  }

  function infoField(label, value) {
    return h('div', { class: 'p4-infoField' }, [h('strong', { text: label }), h('span', { text: value })]);
  }

  function menuRow(iconName, label, action, danger) {
    return h('button', { class: 'p4-menuRow' + (danger ? ' is-danger' : ''), onclick: action }, [icon(iconName, ICO_MD), h('span', { text: label }), icon('chevron-right', ICO_SM)]);
  }

  /* Il profilo si apre dall'avatar nella barra in alto (cosi' dice il
     flusso), quindi non e' una voce della barra in basso: da qui si
     torna indietro con la freccia, come nelle altre pagine di secondo
     livello. */
  Screens.profileHome = function (screen) {
    var d = profileData();
    return h('div', { class: 'p4-page p4-home' }, [
      profileHeader((screen && screen.title) || 'Profilo', 'dashboard'),
      h('div', { class: 'p4-profileHero' }, [profileAvatar(true), h('h1', { text: d.firstName + ' ' + d.lastName })]),
      h('section', { class: 'p4-section' }, [
        h('h2', { text: 'Anagrafica' }),
        h('div', { class: 'p4-card p4-infoCard' }, [
          infoField('Mail', d.email), infoField('Telefono', d.phone),
          infoField('Residenza', [d.address, d.city + ' (' + d.province + ')'].filter(Boolean).join(', ')),
          infoField('Occupazione attuale', d.occupation)
        ])
      ]),
      h('section', { class: 'p4-section' }, [
        h('h2', { text: 'Impostazioni' }),
        h('div', { class: 'p4-menuList' }, [
          menuRow('person-standing', 'Modifica profilo', go('modificaProfilo')),
          menuRow('pencil-line', 'Ripeti il questionario', function () { window.location.href = 'index.html?screen=introQuestionario'; }),
          menuRow('briefcase-business', 'Cambia lavoro dei sogni', function () { window.location.href = 'index.html?screen=lavoroSogni'; }),
          menuRow('file-user', 'Profilo professionale', go('profiloProfessionale')),
          menuRow('settings-2', 'Preferenze', go('preferenzeProfilo')),
          menuRow('log-out', 'Log out', go('logoutProfilo'), true)
        ])
      ])
    ]);
  };

  function photoChoice(iconName, title, body, action, danger) {
    return h('button', { class: 'p4-photoChoice' + (danger ? ' is-danger' : ''), onclick: action }, [
      icon(iconName, ICO_MD), h('span', {}, [h('strong', { text: title }), h('small', { text: body })])
    ]);
  }

  function chooseImage(capture) {
    var input = h('input', { type: 'file', accept: 'image/*', class: 'p4-fileInput' });
    if (capture) input.setAttribute('capture', 'user');
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { var d = profileData(); d.avatar = reader.result; saveProfile(d); window.NavidaApp.goTo('profilo'); };
      reader.readAsDataURL(file);
    });
    document.body.appendChild(input); input.click();
    setTimeout(function () { if (input.parentNode) input.parentNode.removeChild(input); }, 60000);
  }

  function chooseDocument(message, accept) {
    var input = h('input', { type: 'file', accept: accept || '.pdf,.doc,.docx,image/*', class: 'p4-fileInput' });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) R.toast(message + ': ' + input.files[0].name);
    });
    document.body.appendChild(input); input.click();
    setTimeout(function () { if (input.parentNode) input.parentNode.removeChild(input); }, 60000);
  }

  Screens.profilePhoto = function (screen) {
    return overlaySu('profilo', velo('profilo', 'p4-overlay', h('section', { class: 'p4-photoModal' }, [
        h('div', { class: 'p4-modalHead' }, [h('h1', { text: screen.title }), h('button', { 'aria-label': 'Chiudi', onclick: go('profilo') }, [icon('x', ICO_LG)])]),
        profileAvatar(false), h('p', { class: 'p4-photoHint', text: 'Aggiorna la tua foto profilo' }),
        h('div', { class: 'p4-photoChoices' }, [
          photoChoice('camera', 'Scatta una foto', 'Usa la fotocamera', function () { chooseImage(true); }),
          photoChoice('image', 'Scegli dalla galleria', 'Seleziona un’immagine', function () { chooseImage(false); }),
          photoChoice('sparkles', 'Scegli tra i nostri avatar', 'Seleziona una mascotte', function () {
            var d = profileData();
            var avatars = ['assets/mascotte-salutare.png', 'assets/mascotte-computer.png', 'assets/mascotte-indicare.png', 'assets/mascotte-ok.png'];
            d.avatar = avatars[(avatars.indexOf(d.avatar) + 1) % avatars.length]; saveProfile(d); window.NavidaApp.render();
          }),
          photoChoice('trash-2', 'Rimuovi foto', 'Usa immagine predefinita', function () { var d = profileData(); d.avatar = PROFILE_DEFAULTS.avatar; saveProfile(d); window.NavidaApp.goTo('profilo'); }, true)
        ])
      ])));
  };

  function formField(name, label, value, type, extra) {
    return h('label', { class: 'p4-field' + (extra || '') }, [h('span', { text: label }), h('input', { name: name, type: type || 'text', value: value || '', autocomplete: 'off' })]);
  }

  Screens.profileEdit = function (screen) {
    var d = profileData();
    var form = h('form', { class: 'p4-form', onsubmit: function (e) {
      e.preventDefault(); var fd = new FormData(e.currentTarget);
      ['firstName','lastName','email','phone','address','city','province','cap','occupation'].forEach(function (key) { d[key] = String(fd.get(key) || '').trim(); });
      saveProfile(d); R.toast('Profilo aggiornato'); window.NavidaApp.goTo('profilo');
    } }, [
      h('section', {}, [h('h2', { text: 'Dati personali' }), formField('firstName', 'Nome', d.firstName), formField('lastName', 'Cognome', d.lastName)]),
      h('section', {}, [h('h2', { text: 'Contatti' }), formField('email', 'Email', d.email, 'email'), formField('phone', 'Telefono', d.phone, 'tel')]),
      h('section', {}, [h('h2', { text: 'Residenza' }), formField('address', 'Indirizzo', d.address), formField('city', 'Città', d.city), h('div', { class: 'p4-fieldRow' }, [formField('province', 'Provincia', d.province), formField('cap', 'CAP', d.cap)])]),
      h('section', {}, [h('h2', { text: 'Professione' }), formField('occupation', 'Occupazione attuale', d.occupation)]),
      h('div', { class: 'p4-formSpacer' }),
      h('button', { type: 'submit', class: 'p4-save' }, [icon('save', ICO_MD), 'Salva le modifiche'])
    ]);
    return h('div', { class: 'p4-page p4-edit' }, [profileHeader(screen.title), form]);
  };

  function careerBlock(iconName, title, items) {
    return h('section', { class: 'p4-careerBlock' }, [
      h('div', { class: 'p4-careerBlock__head' }, [h('span', {}, [icon(iconName, ICO_MD), h('h2', { text: title })]), h('button', { 'aria-label': 'Aggiungi ' + title, onclick: function () { R.toast('Aggiunta simulata nel prototipo.'); } }, [icon('plus', ICO_MD)])]),
      h('div', { class: 'p4-card p4-careerItems' }, items.map(function (item) { return h('div', {}, [h('strong', { text: item.title }), h('span', { text: item.meta })]); }))
    ]);
  }

  Screens.profileCareer = function (screen) {
    return h('div', { class: 'p4-page p4-career' }, [
      profileHeader(screen.title),
      h('div', { class: 'p4-scroll' }, [
        h('p', { class: 'p4-intro', text: 'Tutto ciò che racconta il tuo percorso, pronto per creare un CV su misura.' }),
        careerBlock('graduation-cap', 'Formazione', [{ title: 'Laurea magistrale in Ingegneria civile', meta: 'Università di Padova · 2021' }]),
        careerBlock('badge-check', 'Certificazioni', [{ title: 'Sicurezza nei cantieri', meta: 'Aggiornata nel 2025' }]),
        careerBlock('briefcase-business', 'Esperienze lavorative', [{ title: 'Ingegnere strutturale', meta: 'Studio tecnico · 2022–oggi' }]),
        careerBlock('wrench', 'Competenze', [{ title: 'Calcolo strutturale · AutoCAD · Revit', meta: '3 competenze' }]),
        careerBlock('heart-handshake', 'Soft skills', [{ title: 'Problem solving · Precisione · Collaborazione', meta: '3 competenze' }]),
        h('section', { class: 'p4-section p4-careerActions' }, [h('h2', { text: 'Strumenti' }),
          menuRow('file-text', 'Genera il tuo CV', function () { R.toast('Generatore CV simulato nel prototipo.'); }),
          menuRow('upload', 'Carica un CV e compila il profilo', function () { chooseDocument('CV caricato', '.pdf,.doc,.docx'); }),
          menuRow('folder-up', 'Carica il portfolio', function () { chooseDocument('Portfolio caricato'); })
        ])
      ])
    ]);
  };

  function togglePreference(data, key, iconName, title, body) {
    return h('button', { class: 'p4-prefRow', onclick: function (e) {
      data.preferences[key] = !data.preferences[key]; saveProfile(data); e.currentTarget.querySelector('.p4-toggle').classList.toggle('is-on', data.preferences[key]);
      if (key === 'dark') document.body.classList.toggle('p4-dark', data.preferences[key]);
    } }, [h('span', { class: 'p4-prefIcon' }, [icon(iconName, ICO_MD)]), h('span', { class: 'p4-prefCopy' }, [h('strong', { text: title }), h('small', { text: body })]), h('span', { class: 'p4-toggle' + (data.preferences[key] ? ' is-on' : '') }, [h('i')])]);
  }

  function prefSection(title, rows) { return h('section', { class: 'p4-prefSection' }, [h('h2', { text: title }), h('div', { class: 'p4-prefList' }, rows)]); }

  Screens.profilePreferences = function (screen) {
    var d = profileData();
    function selectRow(iconName, title, key, options) {
      var select = h('select', { 'aria-label': title, onchange: function (e) { d.preferences[key] = e.target.value; saveProfile(d); } }, options.map(function (v) { return h('option', { value: v, text: v, selected: d.preferences[key] === v }); }));
      return h('div', { class: 'p4-selectRow' }, [h('div', {}, [h('span', { class: 'p4-prefIcon' }, [icon(iconName, ICO_MD)]), h('strong', { text: title })]), select]);
    }
    return h('div', { class: 'p4-page p4-preferences' }, [profileHeader(screen.title), h('div', { class: 'p4-scroll' }, [
      prefSection('Notifiche', [togglePreference(d,'push','bell','Notifiche push','Ricevi notifiche sul tuo dispositivo'), togglePreference(d,'email','mail','Notifiche email','Ricevi aggiornamenti via email'), togglePreference(d,'sms','message-square','Notifiche SMS','Ricevi messaggi importanti via SMS')]),
      prefSection('Promemoria e Aggiornamenti', [togglePreference(d,'courses','bell','Promemoria corsi','Ricorda i corsi in programma'), togglePreference(d,'weekly','mail','Riepilogo settimanale','Ricevi un riepilogo dei tuoi progressi'), togglePreference(d,'content','bell','Nuovi contenuti','Notifica quando ci sono nuovi corsi')]),
      prefSection('Aspetto', [togglePreference(d,'dark','moon','Modalità scura','Usa tema scuro per l’interfaccia')]),
      prefSection('Lingua e Regione', [selectRow('globe', 'Lingua dell’app', 'language', ['Italiano','English'])]),
      prefSection('Privacy', [selectRow('lock', 'Visibilità profilo', 'visibility', ['Solo aziende compatibili','Tutte le aziende','Profilo privato'])]),
      h('p', { class: 'p4-autosave', text: 'Le modifiche vengono salvate automaticamente' })
    ])]);
  };

  Screens.profileLogout = function (screen) {
    return overlaySu('profilo', velo('profilo', 'p4-overlay', h('section', { class: 'p4-confirm' }, [
      h('h1', { text: screen.title }), h('div', {}, [h('button', { class: 'p4-cancel', onclick: go('profilo'), text: 'Annulla' }), h('button', { class: 'p4-danger', onclick: function () { window.location.href = 'index.html'; }, text: 'Esci' })])
    ])));
  };
})();
