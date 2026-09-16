/* ==========================================================================
   NAVIDA — Base dell'app (Fase 3 e 4)
   ==========================================================================
   I pezzi comuni a tutte le schermate dell'app: navigazione fra le pagine,
   barra in alto, barra in basso, etichette, pastiglie, schede, pannelli che
   salgono dal basso. Le schermate stanno nei file vicini (dashboard.js,
   percorso.js, ...) e usano solo quello che c'è qui.

   Si usa con il prefisso NV:   NV.barraHome()   NV.tag(true)   NV.vai('step', { step: 0 })

   Stile: css/app/base.css. Linguaggio visivo: kit "Maturo" (vedi
   css/brand-maturo.css) portato sulle schermate dell'app.
   ========================================================================== */

(function () {
  'use strict';

  var S = window.NavidaState;
  var R = window.NavidaRender;
  var D = window.NAVIDA_DATI;
  var h = R.h;
  var icon = R.icon;

  /* Le tre misure delle icone. Non se ne usano altre (DESIGN-SYSTEM.md). */
  var ICO = { SM: 16, MD: 20, LG: 24 };

  /* ==================================================================
     ICONE
     ------------------------------------------------------------------
     Disegni Lucide (griglia 24, tratto 2) che mancano in js/icons.js.
     Si aggiungono solo se non ci sono gia'. Una schermata che ne vuole
     un'altra la aggiunge nel suo file con NV.icone({ nome: '<path .../>' }).
     ================================================================== */
  function icone(mappa) {
    if (!window.NAVIDA_ICONS) window.NAVIDA_ICONS = {};
    Object.keys(mappa).forEach(function (nome) {
      if (!window.NAVIDA_ICONS[nome]) window.NAVIDA_ICONS[nome] = mappa[nome];
    });
  }

  icone({
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    'award': '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    'bell': '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    'book': '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'bookmark': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    'briefcase-business': '<path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'calendar-days': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
    'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'contrast': '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/>',
    'ellipsis': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    'euro': '<path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'file-up': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/>',
    'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    'folder-up': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M12 10v6"/><path d="m9 13 3-3 3 3"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'heart-handshake': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>',
    'id-card': '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
    'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'languages': '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
    'laptop': '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'locate-fixed': '<line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    'map': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'minus': '<path d="M5 12h14"/>',
    'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    'navigation': '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    'newspaper': '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
    'pencil-line': '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/>',
    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'play': '<polygon points="6 3 20 12 6 21 6 3"/>',
    'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'route': '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    'save': '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
    'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'smartphone': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    'star': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    'thumbs-up': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    'ticket': '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    'timer': '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    'user-round': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    'video': '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>'
  });

  /* ==================================================================
     CONTESTO DI NAVIGAZIONE
     ------------------------------------------------------------------
     App.goTo(id) sa solo "quale schermata". Qui si ricorda anche "di che
     cosa": quale step, quale compito, quale scheda, che filtro sulla
     mappa. Resta nella sessione del browser, cosi' ricaricando la pagina
     si torna allo stesso punto.

       step         indice (da 0) dello step aperto
       compito      id del compito aperto nella scheda attività
       ambito       'formazione' | 'lavoro' (i due pulsanti della dashboard)
       opportunita  id della scheda info aperta
       mappa        { categoria, compito, ambito, cerca }
       storia       le schermate da cui si arriva, per la freccia indietro

     Per le prove si puo' forzare dall'indirizzo:
       ?screen=step&step=2
       ?screen=attivita&compito=diploma      ?screen=attivita&ambito=lavoro
       ?screen=scheda&opp=googleux
       ?screen=mappa&categoria=scuole&compito=diploma
     ================================================================== */
  var CHIAVE = 'navida-app-contesto';

  function contestoIniziale() {
    return {
      step: D.percorso.attuale,
      compito: 'diploma',
      ambito: null,
      opportunita: 'googleux',
      mappa: { categoria: 'tutte', compito: null, ambito: null, cerca: '' },
      storia: [],
      /* l'ultima voce toccata nella barra in basso */
      tab: 'dashboard'
    };
  }

  var ctx = (function () {
    var base = contestoIniziale();
    try {
      var raw = sessionStorage.getItem(CHIAVE);
      if (raw) {
        var letto = JSON.parse(raw);
        base = Object.assign(base, letto);
        base.mappa = Object.assign(contestoIniziale().mappa, letto.mappa || {});
        if (!Array.isArray(base.storia)) base.storia = [];
      }
    } catch (e) {}
    return base;
  })();

  function salva() {
    try { sessionStorage.setItem(CHIAVE, JSON.stringify(ctx)); } catch (e) {}
  }

  function unisci(params) {
    if (!params) return;
    Object.keys(params).forEach(function (k) {
      if (k === 'mappa') ctx.mappa = Object.assign({}, ctx.mappa, params.mappa);
      else ctx[k] = params[k];
    });
  }

  /* parametri di prova dall'indirizzo */
  try {
    var qs = new URLSearchParams(window.location.search);
    if (qs.get('step')) {
      var n = parseInt(qs.get('step'), 10) - 1;
      ctx.step = Math.max(0, Math.min(D.percorso.steps.length - 1, isNaN(n) ? 0 : n));
    }
    if (qs.get('compito')) {
      ctx.compito = qs.get('compito');
      ctx.ambito = null;
      var trovato = cercaCompito(ctx.compito);
      if (trovato && !qs.get('step')) ctx.step = trovato.stepIndice;
      if (qs.get('screen') === 'mappa') ctx.mappa.compito = ctx.compito;
    }
    if (qs.get('ambito')) { ctx.ambito = qs.get('ambito'); if (qs.get('screen') !== 'mappa') ctx.compito = null; }
    if (qs.get('opp')) ctx.opportunita = qs.get('opp');
    if (qs.get('categoria')) ctx.mappa.categoria = qs.get('categoria');
    if (qs.get('screen')) ctx.storia = [];
  } catch (e) {}

  function schermataCorrente() {
    var app = window.NavidaApp;
    var s = app && app.current && app.current();
    return s ? s.id : null;
  }

  /** Apre una schermata. params cambia il contesto prima di aprirla. */
  function vai(id, params) {
    var da = schermataCorrente();
    if (da && da !== id) {
      ctx.storia.push(da);
      if (ctx.storia.length > 30) ctx.storia.shift();
    }
    unisci(params);
    salva();
    window.NavidaApp.goTo(id);
  }

  /** Una delle tre voci della barra in basso: si riparte da capo. */
  function vaiTab(id) {
    ctx.storia = [];
    ctx.tab = id;
    if (id === 'mappa') ctx.mappa = contestoIniziale().mappa;
    salva();
    window.NavidaApp.goTo(id);
  }

  /** La freccia indietro: torna da dove sei arrivato. */
  function indietro(ripiego) {
    var id = ctx.storia.pop();
    salva();
    window.NavidaApp.goTo(id || ripiego || 'dashboard');
  }

  /** Cambia il contesto e ridisegna la schermata in cui sei. */
  function aggiorna(params) {
    unisci(params);
    salva();
    window.NavidaApp.render();
  }

  /* scorciatoie per i collegamenti che si usano sempre */
  function apriStep(i) { vai('step', { step: i }); }
  function apriCompito(id) {
    var t = cercaCompito(id);
    vai('attivita', { compito: id, ambito: null, step: t ? t.stepIndice : ctx.step });
  }
  /* Formazione / Lavoro: senza indice si parte dallo step in cui e' l'utente,
     non da quello che stava guardando. */
  function apriAmbito(nome, stepIndice) {
    vai('attivita', { ambito: nome, compito: null, step: stepIndice == null ? D.percorso.attuale : stepIndice });
  }
  function apriScheda(id) { vai('scheda', { opportunita: id }); }
  function apriMappa(filtro) {
    vai('mappa', { mappa: Object.assign({ categoria: 'tutte', compito: null, ambito: null, cerca: '' }, filtro || {}) });
  }

  /* ==================================================================
     DATI
     ================================================================== */
  function steps() { return D.percorso.steps; }
  function stepAttuale() { return D.percorso.attuale; }
  function step(i) { return D.percorso.steps[i == null ? ctx.step : i] || D.percorso.steps[0]; }

  function cercaCompito(id) {
    var lista = D.percorso.steps;
    for (var i = 0; i < lista.length; i++) {
      var compiti = lista[i].compiti || [];
      for (var j = 0; j < compiti.length; j++) {
        if (compiti[j].id === id) return { compito: compiti[j], step: lista[i], stepIndice: i };
      }
    }
    return null;
  }
  function compito(id) { var t = cercaCompito(id); return t ? t.compito : null; }

  /** I compiti ancora da fare di uno step: prima quelli in corso, poi le necessarie. */
  function compitiAperti(s) {
    function peso(c) { return (c.stato === 'in-corso' ? 0 : 2) + (c.obbligatoria ? 0 : 1); }
    return ((s && s.compiti) || [])
      .filter(function (c) { return c.stato !== 'fatto'; })
      .sort(function (a, b) { return peso(a) - peso(b); });
  }

  /**
   * "La tua prossima mossa": il compito in primo piano, o il primo aperto.
   * La usano la dashboard (la card sfumata) e la scheda attività (la testata
   * diventa sfumata quando stai guardando proprio quel compito).
   */
  function prossimaMossa(i) {
    if (i == null) i = stepAttuale();
    if (i === stepAttuale()) {
      var p = (D.primoPiano || []).filter(function (x) { return x.tipo === 'compito'; })[0];
      if (p && compito(p.id)) return { compito: compito(p.id), etichetta: p.etichetta };
    }
    var c = compitiAperti(step(i))[0];
    return c ? { compito: c, etichetta: 'Da fare adesso' } : null;
  }

  function opportunita(id) {
    var o = D.opportunita[id];
    if (!o) return null;
    o.id = id;
    return o;
  }
  function tutteLeOpportunita() { return Object.keys(D.opportunita).map(opportunita); }
  function categoria(id) { return D.categorie[id] || { etichetta: id, singolare: id, icona: 'circle', tono: 1 }; }

  /** Sponsorizzati in cima, poi dalla piu' adatta alla meno adatta. */
  function ordina(lista) {
    return lista.slice().sort(function (a, b) {
      if (!!a.sponsorizzato !== !!b.sponsorizzato) return a.sponsorizzato ? -1 : 1;
      return (b.affinita || 0) - (a.affinita || 0);
    });
  }

  /**
   * Le opportunità che servono.
   *   { compito: 'diploma' }       quelle di un compito
   *   { ambito: 'formazione' }     quelle di un ambito, per lo step aperto e il prossimo
   *   { categoria: 'scuole' }      solo una categoria ('tutte' = nessun filtro)
   *   { conPosizione: true }       solo quelle che stanno sulla mappa
   *   { step: 0 }                  quelle dei compiti di uno step (e del successivo)
   */
  function opportunitaPer(filtro) {
    filtro = filtro || {};
    var compitiAmmessi = null;
    if (filtro.ambito || filtro.step != null) {
      var da = filtro.step != null ? filtro.step : ctx.step;
      compitiAmmessi = [];
      [da, da + 1].forEach(function (i) {
        var s = D.percorso.steps[i];
        if (s) (s.compiti || []).forEach(function (c) { compitiAmmessi.push(c.id); });
      });
    }
    var lista = tutteLeOpportunita().filter(function (o) {
      var compiti = o.compiti || [];
      if (filtro.compito && compiti.indexOf(filtro.compito) === -1) return false;
      if (filtro.ambito) {
        var a = D.ambiti[filtro.ambito];
        if (a && a.categorie.indexOf(o.categoria) === -1) return false;
      }
      if (compitiAmmessi && compiti.length && !compiti.some(function (c) { return compitiAmmessi.indexOf(c) > -1; })) return false;
      if (filtro.categoria && filtro.categoria !== 'tutte' && o.categoria !== filtro.categoria) return false;
      if (filtro.conPosizione && !o.pos) return false;
      return true;
    });
    return ordina(lista);
  }

  /** Quanti compiti ha uno step e quanti ne sono fatti. */
  function conteggio(s) {
    var c = (s && s.compiti) || [];
    function conta(fn) { return c.filter(fn).length; }
    return {
      totali: c.length,
      fatti: conta(function (x) { return x.stato === 'fatto'; }),
      inCorso: conta(function (x) { return x.stato === 'in-corso'; }),
      obbligatorie: conta(function (x) { return x.obbligatoria; }),
      obbligatorieFatte: conta(function (x) { return x.obbligatoria && x.stato === 'fatto'; })
    };
  }

  var STATI_STEP = {
    'fatto':     { etichetta: 'Completato', icona: 'check' },
    'attuale':   { etichetta: 'Sei qui',    icona: 'navigation' },
    'da-fare':   { etichetta: 'Da fare',    icona: 'lock' },
    'traguardo': { etichetta: 'Traguardo',  icona: 'trophy' }
  };
  var STATI_COMPITO = {
    'fatto':    { etichetta: 'Fatto',    icona: 'circle-check' },
    'in-corso': { etichetta: 'In corso', icona: 'circle-dot' },
    'da-fare':  { etichetta: 'Da fare',  icona: 'circle' }
  };

  /* --- numeri all'italiana --------------------------------------------- */
  function voto(n) { return n == null ? '' : String(Number(n).toFixed(1)).replace('.', ','); }
  function numeroCorto(n) {
    if (n == null) return '';
    if (n >= 1000000) return String(Math.round(n / 100000) / 10).replace('.', ',') + ' mln';
    if (n >= 10000) return Math.round(n / 1000) + 'k';
    if (n >= 1000) return String(Math.round(n / 100) / 10).replace('.', ',') + 'k';
    return String(n);
  }

  /* ==================================================================
     TESTI MODIFICABILI
     Stessa regola del questionario: la barra di modifica li riscrive.
     ================================================================== */
  function testo(screen, chiave, ripiego, tag, classe) {
    return h(tag || 'span', {
      class: classe || null,
      'data-editable': screen.id + '.' + chiave,
      text: S.text(screen.id + '.' + chiave, ripiego)
    });
  }

  /** La versione scelta di una schermata (pannello Versione). */
  function variante(id) {
    return window.NavidaApp ? window.NavidaApp.variante(id) : '';
  }

  /* ==================================================================
     COMPONENTI
     ================================================================== */

  /** La pagina che scorre. Tutto il contenuto di una schermata sta qui. */
  function pagina(classe, figli) {
    return h('div', { class: 'nv-page' + (classe ? ' ' + classe : '') }, figli || []);
  }

  function iconBtn(nome, etichetta, onclick, classe) {
    return h('button', {
      class: 'nv-iconbtn' + (classe ? ' ' + classe : ''),
      type: 'button',
      'aria-label': etichetta,
      title: etichetta,
      onclick: onclick
    }, [icon(nome, ICO.LG)]);
  }

  function logotipo() {
    return h('span', { class: 'nv-logo', text: 'navida' });
  }

  function nuoveNotifiche() {
    return (D.notifiche || []).filter(function (n) { return n.nuova; }).length;
  }

  /**
   * Il contenuto del cerchio della foto profilo, uguale in tutta l'app.
   * Se l'utente ha scelto una foto (D.utente.avatar) si vede la foto,
   * altrimenti l'icona persona. Cambiare la foto dal profilo la cambia ovunque.
   *   dim   grandezza dell'icona (default ICO.MD)
   */
  function fotoProfilo(dim) {
    if (D.utente.avatar) return h('img', { class: 'nv-foto-profilo', src: D.utente.avatar, alt: '' });
    return h('span', { class: 'nv-foto-profilo nv-foto-profilo--icona', 'aria-hidden': 'true' }, [icon('user-round', dim || ICO.MD)]);
  }

  /**
   * Barra delle schermate principali, uguale ovunque: a sinistra il cerchio
   * con la foto profilo e "Ciao Nome" (tocco → profilo), a destra la campanella.
   *   screen   la schermata, per rendere modificabile "Ciao" (facoltativo)
   */
  function barraHome(opts) {
    opts = opts || {};
    var campanella = iconBtn('bell', 'Notifiche', function () { vai('notifiche'); }, 'nv-bell');
    if (nuoveNotifiche()) campanella.appendChild(h('span', { class: 'nv-dot', 'aria-hidden': 'true' }));
    var saluto = h('button', {
      class: 'nv-utente',
      type: 'button',
      'aria-label': 'Apri il profilo',
      onclick: function () { vai('profilo'); }
    }, [
      h('span', { class: 'nv-avatar' }, [fotoProfilo()]),
      h('span', { class: 'nv-utente__saluto' }, [
        opts.screen ? testo(opts.screen, 'saluto', 'Ciao') : 'Ciao',
        ' ' + D.utente.nome
      ])
    ]);
    return h('header', { class: 'nv-bar nv-bar--home' + (opts.classe ? ' ' + opts.classe : '') }, [
      saluto,
      h('div', { class: 'nv-bar__azioni' }, [campanella])
    ]);
  }

  /**
   * Barra delle pagine di secondo livello.
   *   indietro   schermata di ripiego se la storia e' vuota (false = niente freccia)
   *   titolo     testo corto al centro (facoltativo)
   *   azioni     pulsanti a destra, es. [NV.iconBtn('share-2', 'Condividi', fn)]
   *   sopraFoto  la barra galleggia sopra un'immagine a tutta larghezza
   */
  function barra(opts) {
    opts = opts || {};
    return h('header', { class: 'nv-bar' + (opts.sopraFoto ? ' nv-bar--foto' : '') + (opts.classe ? ' ' + opts.classe : '') }, [
      opts.indietro === false
        ? h('span', { class: 'nv-bar__vuoto' })
        : iconBtn('chevron-left', 'Indietro', function () { indietro(opts.indietro); }, 'nv-back'),
      opts.titolo
        ? h('span', { class: 'nv-bar__titolo', text: opts.titolo })
        : h('span', { class: 'nv-bar__spazio' }),
      h('div', { class: 'nv-bar__azioni' }, opts.azioni || [])
    ]);
  }

  /** Titolo grande di pagina, a sinistra, come nel questionario maturo. */
  function intestazione(screen, parti) {
    parti = parti || {};
    return h('div', { class: 'nv-head' }, [
      parti.occhiello ? testo(screen, 'occhiello', parti.occhiello, 'span', 'nv-eyebrow') : null,
      testo(screen, 'title', parti.titolo != null ? parti.titolo : screen.title, 'h1', 'nv-title'),
      parti.sottotitolo ? testo(screen, 'sottotitolo', parti.sottotitolo, 'p', 'nv-lead') : null
    ]);
  }

  var VOCI_NAV = [
    { id: 'dashboard', icona: 'house', label: 'Dashboard' },
    { id: 'mappa', icona: 'map', label: 'Mappa' },
    { id: 'consulenza', icona: 'users', label: 'Consulenza' }
  ];

  /**
   * Barra in basso. attivo = la voce accesa. Sulle tre schermate principali
   * la voce accesa non fa niente; sulle altre (step, scheda...) riporta
   * all'inizio di quella sezione.
   */
  function navBasso(attivo) {
    var qui = schermataCorrente();
    return h('nav', { class: 'nv-nav', 'aria-label': 'Sezioni principali' }, VOCI_NAV.map(function (v) {
      var on = v.id === attivo;
      var ferma = v.id === qui;
      return h('button', {
        class: 'nv-nav__voce' + (on ? ' is-attiva' : ''),
        type: 'button',
        'aria-current': ferma ? 'page' : null,
        onclick: ferma ? null : function () { vaiTab(v.id); }
      }, [
        h('span', { class: 'nv-nav__icona' }, [icon(v.icona, ICO.LG)]),
        h('span', { class: 'nv-nav__label', text: v.label })
      ]);
    }));
  }

  /**
   * La barra in basso sta su tutte le schermate dell'app (Fase 3 e 4),
   * non nel questionario. La chiama js/app.js dopo ogni schermata che non
   * l'ha gia' messa da sola. Si accende la sezione da cui sei partito.
   */
  function navPerSchermata(screen) {
    if (!screen || (screen.chapter !== 'fase3' && screen.chapter !== 'fase4')) return null;
    var attivo = VOCI_NAV.some(function (v) { return v.id === screen.id; }) ? screen.id : (ctx.tab || 'dashboard');
    return navBasso(attivo);
  }

  /** Blocco con titoletto e, a destra, un link "Vedi tutti". */
  function sezione(titolo, figli, opts) {
    opts = opts || {};
    return h('section', { class: 'nv-section' + (opts.classe ? ' ' + opts.classe : '') }, [
      h('div', { class: 'nv-section__head' }, [
        typeof titolo === 'string' ? h('h2', { class: 'nv-section__title', text: titolo }) : titolo,
        opts.azione ? h('button', { class: 'nv-link', type: 'button', onclick: opts.azione.onclick }, [
          h('span', { text: opts.azione.label }), icon('chevron-right', ICO.SM)
        ]) : null
      ])
    ].concat(figli || []));
  }

  /** Etichetta Necessaria / Facoltativa (nei dati il campo resta "obbligatoria"). */
  function tag(obbligatoria) {
    return h('span', {
      class: 'nv-tag ' + (obbligatoria ? 'nv-tag--obbligatoria' : 'nv-tag--facoltativa'),
      text: obbligatoria ? 'Necessaria' : 'Facoltativa'
    });
  }

  /** Etichetta generica. tipo: neutra | main | ok | sponsor | scura | chiara */
  function etichetta(testoEtichetta, tipo, nomeIcona) {
    return h('span', { class: 'nv-tag nv-tag--' + (tipo || 'neutra') }, [
      nomeIcona ? icon(nomeIcona, ICO.SM) : null,
      h('span', { text: testoEtichetta })
    ]);
  }

  function sponsor() { return etichetta('Sponsorizzato', 'sponsor'); }

  /** Pastiglia filtrabile. opts: attivo, icona, conteggio, onclick */
  function chip(label, opts) {
    opts = opts || {};
    return h('button', {
      class: 'nv-chip' + (opts.attivo ? ' is-attivo' : ''),
      type: 'button',
      'aria-pressed': opts.attivo ? 'true' : 'false',
      onclick: opts.onclick
    }, [
      opts.icona ? icon(opts.icona, ICO.SM) : null,
      h('span', { text: label }),
      opts.conteggio != null ? h('span', { class: 'nv-chip__n', text: String(opts.conteggio) }) : null
    ]);
  }

  /** Fila di pastiglie che scorre di lato. */
  function filaChip(chips, classe) {
    return h('div', { class: 'nv-chips' + (classe ? ' ' + classe : '') }, chips);
  }

  /**
   * Interruttore a due o tre voci (es. Elenco | Mappa).
   *   opzioni: [{ value, label, icona }]
   */
  function segmenti(opzioni, valore, onchange, classe) {
    return h('div', { class: 'nv-seg' + (classe ? ' ' + classe : ''), role: 'tablist' }, opzioni.map(function (o) {
      var on = o.value === valore;
      return h('button', {
        class: 'nv-seg__opt' + (on ? ' is-attivo' : ''),
        type: 'button',
        role: 'tab',
        'aria-selected': on ? 'true' : 'false',
        onclick: on ? null : function () { onchange(o.value); }
      }, [o.icona ? icon(o.icona, ICO.SM) : null, h('span', { text: o.label })]);
    }));
  }

  /** Interruttore sì/no (preferenze, impostazioni). */
  function interruttore(acceso, onchange, etichettaAccessibile) {
    var btn = h('button', {
      class: 'nv-switch',
      type: 'button',
      role: 'switch',
      'aria-checked': acceso ? 'true' : 'false',
      'aria-label': etichettaAccessibile || null
    });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var nuovo = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', nuovo ? 'true' : 'false');
      if (onchange) onchange(nuovo);
    });
    return btn;
  }

  /** Quadratino tondo colorato con dentro un'icona. tono 1-5, 'ok', 'neutro' */
  function icoChip(nome, tono, grande) {
    return h('span', { class: 'nv-icochip nv-tono-' + (tono || 1) + (grande ? ' nv-icochip--lg' : '') }, [
      icon(nome, grande ? ICO.LG : ICO.MD)
    ]);
  }

  /**
   * Logo di un ente. Con o.logo mostra l'immagine su fondo bianco; senza,
   * il ripiego: la sigla su fondo colorato. dim: sm | lg
   */
  function logo(o, dim) {
    var misura = dim ? ' nv-logo-ente--' + dim : '';
    if (o && o.logo) {
      return h('span', { class: 'nv-logo-ente nv-logo-ente--img' + misura, 'aria-hidden': 'true' }, [
        h('img', { src: o.logo, alt: '', loading: 'lazy' })
      ]);
    }
    return h('span', {
      class: 'nv-logo-ente nv-tono-' + ((o && o.tono) || 1) + misura,
      'aria-hidden': 'true',
      text: (o && o.sigla) || ((o && (o.ente || o.nome)) || '?').charAt(0)
    });
  }

  /** Stellina con voto e numero di recensioni: ★ 4,8 (214) */
  function stelle(valore, recensioni) {
    return h('span', { class: 'nv-rating' }, [
      icon('star', ICO.SM),
      h('strong', { text: voto(valore) }),
      recensioni != null ? h('span', { text: '(' + numeroCorto(recensioni) + ')' }) : null
    ]);
  }

  /** Icona piccola + testo: durata, luogo, prezzo. */
  function meta(nomeIcona, testoMeta) {
    return h('span', { class: 'nv-meta' }, [icon(nomeIcona, ICO.SM), h('span', { text: testoMeta })]);
  }

  /** Barretta di avanzamento dei compiti (non la linea di carriera). */
  function avanzamento(fatti, totali, chiara) {
    var p = totali ? Math.round(fatti / totali * 100) : 0;
    return h('div', {
      class: 'nv-progress' + (chiara ? ' nv-progress--chiara' : ''),
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': String(totali),
      'aria-valuenow': String(fatti)
    }, [h('span', { class: 'nv-progress__fill', style: 'width:' + p + '%' })]);
  }

  /**
   * Pulsante a pastiglia, lo stesso del questionario (.btn).
   *   variante: primario (predefinito) | secondario | nero | soft | outline | bianco
   *   icona, iconaDopo, piccolo, onclick, disabilitato, classe
   */
  function pulsante(label, opts) {
    opts = opts || {};
    var varianti = {
      secondario: ' btn--passivo',
      nero: ' nv-btn--nero',
      soft: ' btn--soft',
      outline: ' btn--outline',
      bianco: ' nv-btn--bianco'
    };
    return h('button', {
      class: 'btn nv-btn' + (varianti[opts.variante] || '') + (opts.piccolo ? ' nv-btn--sm' : '') + (opts.classe ? ' ' + opts.classe : ''),
      type: 'button',
      onclick: opts.onclick,
      disabled: opts.disabilitato ? true : null
    }, [
      opts.icona ? icon(opts.icona, ICO.MD) : null,
      h('span', { text: label }),
      opts.iconaDopo ? icon(opts.iconaDopo, ICO.MD) : null
    ]);
  }

  function mascotte(posa, classe) {
    var box = h('div', { class: 'nv-mascotte' + (classe ? ' ' + classe : ''), 'aria-hidden': 'true' });
    if (window.NavidaMascotte) box.appendChild(window.NavidaMascotte.elemento(posa));
    return box;
  }

  function schermo() { return document.querySelector('#app .screen'); }

  /** Messaggio breve che compare in basso e sparisce. */
  function avviso(messaggio) {
    var s = schermo();
    if (!s) return;
    var vecchio = s.querySelector('.nv-toast');
    if (vecchio) vecchio.remove();
    var t = h('div', { class: 'nv-toast', role: 'status', text: messaggio });
    s.appendChild(t);
    setTimeout(function () { t.classList.add('is-via'); }, 2200);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 2600);
  }

  /**
   * Pannello che sale dal basso sopra la schermata (o al centro).
   *   titolo, sottotitolo, contenuto: [nodi], azioni: [nodi], centrato, classe
   * Restituisce il velo; NV.chiudiFoglio() lo toglie.
   */
  function apriFoglio(opts) {
    opts = opts || {};
    chiudiFoglio();
    var s = schermo();
    if (!s) return null;
    var foglio = h('div', {
      class: 'nv-sheet' + (opts.classe ? ' ' + opts.classe : ''),
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': opts.titolo || null
    }, [
      h('span', { class: 'nv-sheet__maniglia', 'aria-hidden': 'true' }),
      opts.titolo ? h('div', { class: 'nv-sheet__head' }, [
        h('div', {}, [
          h('h2', { text: opts.titolo }),
          opts.sottotitolo ? h('p', { text: opts.sottotitolo }) : null
        ]),
        iconBtn('x', 'Chiudi', chiudiFoglio)
      ]) : null,
      h('div', { class: 'nv-sheet__body' }, opts.contenuto || []),
      opts.azioni ? h('div', { class: 'nv-sheet__azioni' }, opts.azioni) : null
    ]);
    var velo = h('div', { class: 'nv-scrim' + (opts.centrato ? ' nv-scrim--centro' : '') }, [foglio]);
    velo.addEventListener('click', function (e) { if (e.target === velo) chiudiFoglio(); });
    s.appendChild(velo);
    return velo;
  }

  function chiudiFoglio() {
    var v = document.querySelector('#app .nv-scrim');
    if (v) v.remove();
  }

  /* ==================================================================
     MODALITA' CATTURA
     ?cattura=1 nasconde barra di modifica e commenti e mette lo schermo
     del telefono a 393px, a sinistra. Serve alle schermate di prova.
     ================================================================== */
  try {
    if (new URLSearchParams(window.location.search).get('cattura')) {
      document.documentElement.classList.add('nv-cattura');
    }
  } catch (e) {}

  window.NV = {
    h: h,
    icon: icon,
    ICO: ICO,
    dati: D,
    icone: icone,

    /* navigazione */
    contesto: function () { return ctx; },
    vai: vai,
    vaiTab: vaiTab,
    indietro: indietro,
    aggiorna: aggiorna,
    apriStep: apriStep,
    apriCompito: apriCompito,
    apriAmbito: apriAmbito,
    apriScheda: apriScheda,
    apriMappa: apriMappa,

    /* dati */
    steps: steps,
    step: step,
    stepAttuale: stepAttuale,
    cercaCompito: cercaCompito,
    compito: compito,
    compitiAperti: compitiAperti,
    prossimaMossa: prossimaMossa,
    opportunita: opportunita,
    tutteLeOpportunita: tutteLeOpportunita,
    opportunitaPer: opportunitaPer,
    ordina: ordina,
    categoria: categoria,
    conteggio: conteggio,
    STATI_STEP: STATI_STEP,
    STATI_COMPITO: STATI_COMPITO,
    voto: voto,
    numeroCorto: numeroCorto,

    /* testi e versioni */
    testo: testo,
    variante: variante,

    /* componenti */
    pagina: pagina,
    barraHome: barraHome,
    fotoProfilo: fotoProfilo,
    barra: barra,
    intestazione: intestazione,
    navBasso: navBasso,
    navPerSchermata: navPerSchermata,
    iconBtn: iconBtn,
    logotipo: logotipo,
    sezione: sezione,
    tag: tag,
    etichetta: etichetta,
    sponsor: sponsor,
    chip: chip,
    filaChip: filaChip,
    segmenti: segmenti,
    interruttore: interruttore,
    icoChip: icoChip,
    logo: logo,
    stelle: stelle,
    meta: meta,
    avanzamento: avanzamento,
    pulsante: pulsante,
    mascotte: mascotte,
    avviso: avviso,
    apriFoglio: apriFoglio,
    chiudiFoglio: chiudiFoglio
  };
})();
