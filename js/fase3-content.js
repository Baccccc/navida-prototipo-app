/* ==========================================================================
   NAVIDA — Contenuti Fase 3
   File separato dal questionario: mantiene leggero e ordinato il prototipo.
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

  screens: [
    {
      id: 'dashboard',
      chapter: 'fase3',
      type: 'dashboardHome',
      fullBleed: true,
      greeting: 'Bentornato',
      name: 'Marco Bacchin',
      monthlyTitle: 'Obiettivo mensile',
      monthlyBody: 'Continua, così stai andando alla grande! 🎉',
      activeTitle: 'Corsi attivi',
      eventTitle: 'Prossimo evento',

      /* --- Versione "Da flusso" (FigJam 3.1) ---------------------------
         La dashboard come la descrive il flusso: linea di carriera
         compressa in alto, descrizione dello step di adesso con i suoi
         obiettivi, "In primo piano" e le due scorciatoie.
         Gli step non stanno qui: arrivano dalla schermata "percorso",
         cosi' esiste un elenco solo da tenere aggiornato. */
      lineaTitolo: 'La tua linea di carriera',
      lineaEstendi: 'Apri la versione estesa',
      stepOcchiello: 'Lo step di adesso',
      stepDescrizione: 'Dalle pratiche di tutti i giorni passi ai numeri: impari a leggere un bilancio e a usare gli strumenti che ti chiederanno nel prossimo ruolo.',
      stepObiettivi: [
        'Chiudere un corso di contabilità di base',
        'Usare Excel a livello avanzato ogni giorno',
        'Affiancare per tre mesi chi prepara il bilancio'
      ],
      primoPianoTitolo: 'In primo piano',
      scorciatoie: [
        { icona: 'graduation-cap', tono: 'violet', etichetta: 'Formazione', nota: 'I corsi collegati allo step' },
        { icona: 'briefcase-business', tono: 'blue', etichetta: 'Lavoro', nota: 'Offerte e tirocini dello step' }
      ]
    },
    {
      id: 'notifiche',
      chapter: 'fase3',
      type: 'dashboardNotifications',
      fullBleed: true,
      title: 'Notifiche',
      items: [
        { icon: 'target', tone: 'violet', title: 'Obiettivo raggiunto', text: 'Hai completato un traguardo: ottimo lavoro! Festeggia questo progresso della tua carriera.', time: '2h ago' },
        { icon: 'clock', tone: 'purple', title: 'Promemoria pratica', text: 'Non dimenticare la sessione di pratica settimanale.', time: '2h ago' },
        { icon: 'circle-dollar-sign', tone: 'blue', title: 'Nuova offerta', text: 'Ottieni 30% di sconto passando al piano premium.', time: '2h ago' },
        { icon: 'circle-check', tone: 'orange', title: 'Report annuale', text: 'Il tuo report annuale è pronto: visualizza i tuoi progressi e i risultati ottenuti.', time: '2h ago' },
        { icon: 'clock', tone: 'purple', title: 'Promemoria pratica', text: 'Non dimenticare la sessione di pratica settimanale per rafforzare le tue competenze.', time: '2h ago' },
        { icon: 'circle-dollar-sign', tone: 'blue', title: 'Nuova offerta', text: 'Scopri la nuova offerta, ottieni 30% di sconto passando al piano premium.', time: '2h ago' },
        { icon: 'user', tone: 'mint', title: 'Aggiornamento profilo', text: 'Aggiungi le ultime competenze per ricevere suggerimenti più precisi.', time: '1g ago' }
      ]
    },
    {
      id: 'percorso',
      chapter: 'fase3',
      type: 'careerPath',
      fullBleed: true,
      title: 'Il tuo percorso',
      intro: 'Ogni step ti avvicina al lavoro dei sogni. Tieni duro! 💪',
      steps: [
        { label: 'Step 1', role: 'Impiegato amministrativo', duration: '6 mesi', state: 'done' },
        { label: 'Step 2', role: 'Analista amministrativo contabile', duration: '12 mesi', state: 'active' },
        { label: 'Step 3', role: 'Coordinatore della segreteria amministrativa', duration: '3 anni', state: 'todo' },
        { label: 'Step 4', role: 'Specialista in procedure e compliance', duration: '3 anni', state: 'todo' },
        { label: 'Step 5', role: 'Responsabile dei processi amministrativi digitali', duration: '', state: 'goal' }
      ]
    },
    {
      id: 'catalogo',
      chapter: 'fase3',
      type: 'careerCatalog',
      fullBleed: true,
      role: 'Impiegato amministrativo',
      roleDescription: 'La tua mansione prevede che ti occupi di gestire pratiche contabili e amministrative e di supportare i flussi di documentazione aziendale.',
      groups: [
        { title: 'Preferiti', items: ['figma', 'project'] },
        { title: 'Consigliati per te', items: ['ux', 'excel'] },
        { title: 'In evidenza', items: ['rivoluzione', 'public'] },
        { title: 'Altre opportunità', items: ['figma', 'project'] }
      ]
    },
    {
      id: 'dettaglio',
      chapter: 'fase3',
      type: 'careerDetail',
      fullBleed: true,
      provider: 'Coursera',
      rating: '4.7',
      title: 'Fondamenti ux ui design',
      priceLabel: 'Prova gratuita di 7 giorni',
      price: '€39.99',
      priceSuffix: '/mese',
      cta: 'Inizia ora',
      pointsTitle: 'Punti chiave',
      points: [
        'Padroneggia Figma e Sketch',
        'Strategie UX con AI',
        'Progetti pratici reali',
        'Testing e iterazione',
        'Supporto della community'
      ],

      /* --- Attività dello step (FigJam 3.1.2) --------------------------
         Ogni attività porta il suo tag: obbligatoria o facoltativa.
         Basta cambiare "obbligatoria" per far cambiare l'etichetta. */
      attivitaTitolo: 'Attività dello step',
      attivita: [
        { nome: 'Formazione 1 · Contabilità di base', dati: 'Corso online · 12 ore', obbligatoria: true },
        { nome: 'Formazione 2 · Excel avanzato', dati: 'Corso online · 6 ore', obbligatoria: true },
        { nome: 'Tirocinio in studio amministrativo', dati: 'In presenza · 3 mesi', obbligatoria: false }
      ]
    },
    {
      id: 'filtri',
      chapter: 'fase3',
      type: 'careerFilters',
      fullBleed: true,
      title: 'Filtri'
    },
    {
      id: 'impostazioni',
      chapter: 'fase3',
      type: 'careerSettings',
      fullBleed: true,
      title: 'Impostazioni contenuto',
      subtitle: 'Personalizza la tua esperienza'
    },

    /* ================================================================
       LE DUE SEZIONI ANCORA DA COSTRUIRE (FigJam 3.2 e 3.3)
       ----------------------------------------------------------------
       Sono le altre due voci della barra in basso. Finche' non esistono
       davvero mostrano uno stato "in arrivo" con le parole del flusso:
       meglio dire cosa ci sara' che aprire una pagina vuota.
       ================================================================ */
    {
      id: 'mappa',
      chapter: 'fase3',
      type: 'sezioneInArrivo',
      fullBleed: true,
      title: 'Mappa',
      posa: 'indicare',
      titoloInArrivo: 'La mappa sta arrivando',
      testoInArrivo: 'Qui trovi tutte le opportunità geolocalizzate e filtrabili, step per step del tuo percorso.',
      voci: [
        { icona: 'graduation-cap', tono: 'violet', etichetta: 'Formazione', nota: 'Scuole e corsi vicino a te' },
        { icona: 'briefcase-business', tono: 'blue', etichetta: 'Lavoro', nota: 'Offerte e tirocini sul territorio' },
        { icona: 'calendar', tono: 'purple', etichetta: 'Eventi', nota: 'Incontri e fiere in programma' },
        { icona: 'zap', tono: 'orange', etichetta: 'Workshop', nota: 'Laboratori pratici, mezza giornata' }
      ],
      azione: 'Torna alla dashboard'
    },
    {
      id: 'consulenza',
      chapter: 'fase3',
      type: 'sezioneInArrivo',
      fullBleed: true,
      title: 'Consulenza',
      posa: 'stretta-mano',
      titoloInArrivo: 'La consulenza sta arrivando',
      testoInArrivo: 'Incontri in persona, divisi per tematica: scegli chi ti serve e prenoti dall’app.',
      voci: [
        { icona: 'circle-dollar-sign', tono: 'mint', etichetta: 'Commercialista', nota: 'Contratti, partita IVA, tasse' },
        { icona: 'heart', tono: 'purple', etichetta: 'Psicologo', nota: 'Come stai mentre cambi lavoro' },
        { icona: 'target', tono: 'violet', etichetta: 'Coaching', nota: 'Obiettivi, colloqui, tempi' },
        { icona: 'heart-handshake', tono: 'blue', etichetta: 'Affiancamento', nota: 'Qualcuno accanto nei primi mesi' }
      ],
      azione: 'Torna alla dashboard'
    },
    {
      id: 'profilo',
      chapter: 'fase4',
      type: 'profileHome',
      fullBleed: true,
      title: 'Profilo',
      name: 'Marco Bacchin',
      email: 'bacchin.marco03@gmail.com',
      phone: '+39 123405687',
      address: 'Via Puzza 31, Albignasego (PD)',
      occupation: 'Ingegnere strutturale'
    },
    {
      id: 'fotoProfilo',
      chapter: 'fase4',
      type: 'profilePhoto',
      fullBleed: true,
      title: 'Foto profilo'
    },
    {
      id: 'modificaProfilo',
      chapter: 'fase4',
      type: 'profileEdit',
      fullBleed: true,
      title: 'Modifica profilo'
    },
    {
      id: 'profiloProfessionale',
      chapter: 'fase4',
      type: 'profileCareer',
      fullBleed: true,
      title: 'Profilo professionale'
    },
    {
      id: 'preferenzeProfilo',
      chapter: 'fase4',
      type: 'profilePreferences',
      fullBleed: true,
      title: 'Preferenze'
    },
    {
      id: 'logoutProfilo',
      chapter: 'fase4',
      type: 'profileLogout',
      fullBleed: true,
      title: 'Sei sicuro di voler uscire?'
    }
  ]
};
