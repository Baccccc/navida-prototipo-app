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
      eventTitle: 'Prossimo evento'
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
    {
      id: 'profilo',
      chapter: 'fase4',
      type: 'profileHome',
      fullBleed: true,
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
