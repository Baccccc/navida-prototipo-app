/* ==========================================================================
   NAVIDA — Schermate dell'app (Fase 3 e 4)
   ==========================================================================
   L'ordine dell'array e' l'ordine delle schermate (frecce e "Vai a").
   I dati di esempio (percorso, opportunità, curriculum...) stanno in
   js/app/dati.js. Ogni schermata si disegna nel suo file in js/app/.

     dashboard        js/app/dashboard.js    1 versione
     percorso         js/app/percorso.js     3 versioni (anche l'anteprima nel questionario)
     step             js/app/step.js         3 versioni
     attivita         js/app/attivita.js     1 versione (copertine)
     scheda           js/app/scheda.js       3 versioni
     mappa            js/app/mappa.js
     consulenza, notifiche, profilo e sotto-pagine   js/app/profilo.js
   ========================================================================== */

window.NAVIDA_CONTENT = {
  app: {
    nome: 'Navida',
    payoff: 'Il tuo assistente personale per la crescita lavorativa.'
  },

  ui: {
    continua: 'Continua',
    indietro: 'Indietro'
  },

  /* Freccia sinistra sulla prima schermata: torna alla linea di carriera
     alla fine del questionario. */
  indietroHref: 'index.html?screen=preview',

  screens: [
    /* --- FASE 3 · DASHBOARD E PERCORSO ------------------------------- */
    { id: 'dashboard', chapter: 'fase3', type: 'nvDashboard', fullBleed: true, title: 'Dashboard' },
    { id: 'percorso',  chapter: 'fase3', type: 'nvPercorso',  fullBleed: true, title: 'La tua linea di carriera' },
    { id: 'step',      chapter: 'fase3', type: 'nvStep',      fullBleed: true, title: 'Dettaglio dello step' },
    { id: 'attivita',  chapter: 'fase3', type: 'nvAttivita',  fullBleed: true, title: 'Scheda attività' },
    { id: 'scheda',    chapter: 'fase3', type: 'nvScheda',    fullBleed: true, title: 'Scheda info' },
    { id: 'mappa',     chapter: 'fase3', type: 'nvMappa',     fullBleed: true, title: 'Mappa' },

    /* Consulenza: resta "in arrivo", come prima. */
    {
      id: 'consulenza',
      chapter: 'fase3',
      type: 'nvInArrivo',
      fullBleed: true,
      title: 'Consulenza',
      posa: 'stretta-mano',
      titoloInArrivo: 'La consulenza sta arrivando',
      testoInArrivo: 'Incontri in persona, divisi per tematica: scegli chi ti serve e prenoti dall’app.',
      voci: [
        { icona: 'circle-dollar-sign', tono: 3, etichetta: 'Commercialista', nota: 'Contratti, partita IVA, tasse' },
        { icona: 'heart', tono: 2, etichetta: 'Psicologo del lavoro', nota: 'Come stai mentre cambi lavoro' },
        { icona: 'target', tono: 1, etichetta: 'Coaching', nota: 'Obiettivi, colloqui, tempi' },
        { icona: 'heart-handshake', tono: 5, etichetta: 'Affiancamento', nota: 'Qualcuno accanto nei primi mesi' }
      ],
      azione: 'Torna alla dashboard'
    },

    { id: 'notifiche', chapter: 'fase3', type: 'nvNotifiche', fullBleed: true, title: 'Notifiche' },

    /* --- FASE 4 · PROFILO -------------------------------------------- */
    { id: 'profilo',         chapter: 'fase4', type: 'nvProfilo',         fullBleed: true, title: 'Profilo' },
    { id: 'modificaProfilo', chapter: 'fase4', type: 'nvModificaProfilo', fullBleed: true, title: 'Modifica profilo' },
    { id: 'fotoProfilo',     chapter: 'fase4', type: 'nvFotoProfilo',     fullBleed: true, title: 'Foto profilo' },
    { id: 'curriculum',      chapter: 'fase4', type: 'nvCurriculum',      fullBleed: true, title: 'Curriculum' },
    { id: 'preferenze',      chapter: 'fase4', type: 'nvPreferenze',      fullBleed: true, title: 'Preferenze' },
    { id: 'logout',          chapter: 'fase4', type: 'nvLogout',          fullBleed: true, title: 'Vuoi uscire?' }
  ]
};
