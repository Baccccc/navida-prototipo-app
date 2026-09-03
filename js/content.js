/* ==========================================================================
   NAVIDA — Contenuti del prototipo
   ==========================================================================
   QUESTO È IL FILE DA MODIFICARE PER CAMBIARE I TESTI.

   Regole di scrittura (dai reference: YAZIO, Headspace, Flo)
   ----------------------------------------------------------
   - Titolo: massimo 6-7 parole. Diretto, in seconda persona.
   - Sottotitolo: UNA riga sola, e solo se serve davvero.
     Di solito è un'istruzione: "Scegli tutte le risposte che vuoi".
   - Niente paragrafi lunghi sulle schermate di domanda.
   - Sulle schede informative: 2-3 righe, non di più.

   TIPI DI SCHERMATA
   -----------------
   hero        apertura a tutto schermo
   info        scheda informativa: mascotte + titolo + testo + CTA
   single      scelta singola (avanza al tap)
   singleCta   scelta singola con pulsante Continua
   singleInfo  scelta singola, l'opzione scelta mostra una riga di info
   singleText  scelta singola, alcune opzioni aprono un campo di testo
   multi       scelta multipla con checkbox
   text        risposta a testo libero
   textSuggest testo libero con suggerimenti
   rank        ordinamento per trascinamento
   form        più campi nella stessa schermata
   loading     attesa animata
   result      risultato (prima proiezione)
   login       registrazione / accesso (3 varianti)
   otp         codice di verifica via email
   preview     anteprima della linea di carriera

   CAMPI UTILI
   -----------
   listStyle: 'grid'   mostra le risposte come card con icona
   options[].ico       nome icona Lucide (solo con listStyle 'grid')
   options[].chip      etichetta a destra, es. "Coming soon"
   options[].disabled  risposta non selezionabile

   FORMATTAZIONE DEI TESTI (schermate "info")
   -----------------------------------------
   body        \n manda a capo (il testo va a capo davvero)
   lista       elenco puntato con spunta:  ['riga', 'riga']
   listaNum    elenco numerato 1. 2. 3. con attacco in grassetto:
                 [{ forte: 'Fai il test.', testo: 'L’abbiamo costruito con…' }]
   paragrafi   paragrafi con attacco in grassetto (stessa forma di listaNum)
   Nota: forte e testo restano modificabili uno per uno dal pannello Testi.
   ========================================================================== */

window.NAVIDA_CONTENT = {

  app: {
    nome: 'Navida',
    payoff: 'Il tuo assistente personale per la crescita lavorativa.'
  },

  ui: {
    continua: 'Continua',
    indietro: 'Indietro',
    salta: 'Salta',
    iniziaTest: 'Inizia il test',
    hoGiaAccount: 'Ho già un account',
    oppure: 'oppure',
    conGoogle: 'Continua con Google',
    conApple: 'Continua con Apple',
    email: 'Email',
    inserisciEmail: 'Inserisci la tua email',
    legale: 'Continuando accetti i Termini e la Privacy Policy',
    scriviQui: 'Scrivi qui…',
    cercaProfessione: 'Cerca una professione…',
    nessunRisultato: 'Nessun risultato. Puoi scrivere liberamente.',
    ordinaHint: 'Trascina tutta la card. Per scorrere usa la fascia a destra.',
    ordinaHintPodio: 'Tocca le risposte per riempire le posizioni, dalla prima all’ultima.',
    ordinaHintTocca: 'Tocca in ordine di importanza. Tocca di nuovo per togliere.',
    sceltaMultiplaHint: 'Scegli tutte le risposte che vuoi'
  },

  /* ======================================================================
     FLUSSO — l'ordine di questo array è l'ordine delle schermate
     ====================================================================== */
  screens: [

    /* ---------- INTRO ---------------------------------------------- */
    {
      id: 'splash',
      chapter: 'intro',
      type: 'splash',
      mascotte: 'volare',
      title: 'Navida',
      durata: 2000
    },

    {
      id: 'welcome',
      chapter: 'intro',
      type: 'hero',
      mascotte: 'salutare',
      eyebrow: 'Benvenuto su',
      title: 'Navida',
      body: 'Scopri dove puoi arrivare.',
      cta: 'Cominciamo',
      footerLink: 'Ho già un account',
      footerTarget: 'registrazione'
    },

    {
      id: 'userType',
      mascotte: 'indicare',
      chapter: 'intro',
      type: 'single',
      title: 'Cosa stai cercando?',
      listStyle: 'grid',
      options: [
        { label: 'Lavoro', ico: 'briefcase' },
        { label: 'Volontariato', ico: 'heart', chip: 'Coming soon', disabled: true },
        { label: 'Mentoring', ico: 'graduation-cap', chip: 'Coming soon', disabled: true }
      ]
    },

    {
      id: 'ob1',
      chapter: 'intro',
      type: 'info',
      mascotte: 'stretta-mano',
      obStep: 1,
      title: 'Ciao, siamo Navida',
      body: 'Uno spazio sicuro per capire davvero dove vuoi arrivare.\nNon siamo l’ennesima app di ricerca di lavoro: costruiamo su di te un percorso di carriera e ti guidiamo, tappa dopo tappa, fino al lavoro dei tuoi sogni.',
      cta: 'Continua'
    },
    {
      id: 'ob2',
      chapter: 'intro',
      type: 'info',
      mascotte: 'tablet',
      obStep: 2,
      title: 'Come funziona?',
      listaNum: [
        { forte: 'Rispondi a qualche domanda.', testo: 'Poche e veloci, senza registrarti: avrai già una prima direzione.' },
        { forte: 'Fai il test.', testo: 'L’abbiamo costruito insieme a psicologi del lavoro.' },
        { forte: 'Il nostro algoritmo lavora per te.', testo: 'Ha imparato da migliaia di percorsi di carriera veri, e su quelli costruisce il tuo.' }
      ],
      cta: 'Continua'
    },
    {
      id: 'ob3',
      chapter: 'intro',
      type: 'info',
      /* niente mascotte: qui l'illustrazione e' il percorso che si disegna.
         Risponde al commento "va messa l'animazione della linea di carriera". */
      obStep: 3,
      title: 'Da dove sei a dove vuoi arrivare',
      body: 'Ti mostriamo il percorso, tappa dopo tappa.',
      percorso: [
        { nome: 'Oggi' },
        { nome: 'Formazione' },
        { nome: 'Esperienza' },
        { nome: 'Il lavoro che sogni' }
      ],
      percorsoAttiva: 0,
      cta: 'Continua'
    },
    {
      id: 'ob4',
      chapter: 'intro',
      type: 'info',
      mascotte: 'ok',
      obStep: 4,
      title: 'Quanto costa?',
      paragrafi: [
        { forte: 'Navida è gratis e senza pubblicità.', testo: 'Il test, la costruzione del tuo percorso e tutte le opportunità che trovi lungo le tappe non si pagano.' },
        { forte: 'A pagamento c’è solo la consulenza.', testo: 'Se a un certo punto vuoi parlare con qualcuno — un coach, uno psicologo del lavoro, un commercialista — lo trovi nell’area Consulenza.' }
      ],
      cta: 'Iniziamo'
    },

    /* ---------- 1C · SCOPERTA (prima della registrazione) ----------- */
    {
      id: 'nome',
      chapter: 'scoperta',
      type: 'text',
      title: 'Prima di tutto, qual è il tuo nome?',
      placeholder: 'Il tuo nome',
      field: 'nome',
      cta: 'Continua'
    },
    {
      id: 'saluto',
      chapter: 'scoperta',
      type: 'info',
      mascotte: 'salutare',
      title: 'Piacere, {nome}!',
      body: 'Iniziamo con genere ed età. Ci servono per confrontare il tuo percorso con quelli di chi è partito da una situazione simile alla tua.',
      cta: 'Continua'
    },
    {
      id: 'genere',
      chapter: 'scoperta',
      type: 'single',
      title: 'Come ti identifichi?',
      field: 'genere',
      options: [
        { label: 'Donna' },
        { label: 'Uomo' },
        { label: 'Non binario' },
        { label: 'Preferisco non dirlo' }
      ]
    },
    {
      id: 'eta',
      chapter: 'scoperta',
      type: 'text',
      inputMode: 'numeric',
      title: 'Quanti anni hai?',
      placeholder: 'Età',
      field: 'eta',
      cta: 'Continua'
    },

    /* 1C.2 · Intro alle domande — testo nuovo (FigJam v2) */
    {
      id: 'introDomande',
      chapter: 'scoperta',
      type: 'info',
      mascotte: 'calcolare',
      title: 'Ci siamo!',
      body: 'Ora ti facciamo qualche domanda, non per capire chi sei, ma chi puoi diventare.',
      cta: 'Continua'
    },

    {
      id: 'perche',
      mascotte: 'indicare',
      chapter: 'scoperta',
      type: 'single',
      field: 'motivazione',
      title: 'Cosa ti ha portato qui?',
      options: [
        { label: 'Mi sento bloccato e non so che direzione prendere' },
        { label: 'Lavoro, ma non mi riconosco in quello che faccio' },
        { label: 'Mi chiedo se ha senso continuare così' },
        { label: 'Non cerco un nuovo lavoro, ma un nuovo modo di viverlo' },
        { label: 'Non lo so, so solo che voglio cambiare qualcosa' }
      ]
    },

    {
      id: 'obiettivo',
      mascotte: 'indicare',
      chapter: 'scoperta',
      type: 'single',
      field: 'obiettivo',
      title: 'Cosa vuoi ottenere?',
      listStyle: 'grid',
      options: [
        { label: 'Cambiare lavoro', ico: 'repeat' },
        { label: 'Crescere dove sono', ico: 'trending-up' },
        { label: 'Capire il mio potenziale', ico: 'sparkles' }
      ]
    },

    /* 1C.5 · Intro dati specifici — testo nuovo (FigJam v2) */
    {
      id: 'datiSpecifici',
      chapter: 'scoperta',
      type: 'info',
      mascotte: 'matita',
      title: 'Sappiamo dove vuoi arrivare',
      body: 'Adesso ci serve sapere da dove parti.\nAncora poche domande e ti mostriamo che direzione può prendere il tuo percorso.',
      cta: 'Continua'
    },

    {
      id: 'titoloStudio',
      chapter: 'scoperta',
      type: 'singleText',
      field: 'titoloStudio',
      title: 'Il tuo ultimo titolo di studio',
      options: [
        { label: 'Nessuno' },
        { label: 'Licenza media' },
        { label: 'Qualifica professionale', allowText: true, textPlaceholder: 'In cosa?' },
        { label: 'Diploma', allowText: true, textPlaceholder: 'In cosa?' },
        { label: 'Laurea triennale', allowText: true, textPlaceholder: 'In cosa?' },
        { label: 'Laurea magistrale', allowText: true, textPlaceholder: 'In cosa?' }
      ],
      cta: 'Continua'
    },

    {
      id: 'specializzazioni',
      chapter: 'scoperta',
      type: 'singleText',
      field: 'specializzazione',
      title: 'Altre specializzazioni?',
      options: [
        { label: 'Nessuna' },
        { label: 'Post diploma ITS', allowText: true, textPlaceholder: 'Quale?' },
        { label: 'Altri corsi post diploma', allowText: true, textPlaceholder: 'Quale?' },
        { label: 'Master di I o II livello', allowText: true, textPlaceholder: 'Quale?' },
        { label: 'Specializzazione post lauream', allowText: true, textPlaceholder: 'Quale?' }
      ],
      cta: 'Continua'
    },

    {
      id: 'situazione',
      mascotte: 'indicare',
      chapter: 'scoperta',
      type: 'single',
      field: 'situazione',
      title: 'Al momento sei…',
      listStyle: 'grid',
      options: [
        { label: 'In cerca del primo lavoro', value: 'primo', ico: 'compass' },
        { label: 'Disoccupato', value: 'disoccupato', ico: 'pause' },
        { label: 'Occupato', value: 'occupato', ico: 'briefcase' }
      ]
    },

    {
      id: 'ultimaPosizione',
      chapter: 'scoperta',
      type: 'text',
      field: 'ultimaPosizione',
      title: 'Il tuo ultimo ruolo',
      placeholder: 'Es. Impiegato amministrativo',
      cta: 'Continua',
      skipIf: { field: 'situazione', equals: 'primo' }
    },

    /* ---------- MOMENTO WOW (da rifare) ---------------------------- */
    {
      id: 'tuoMomento',
      chapter: 'scoperta',
      type: 'info',
      /* passaggio di incoraggiamento prima della domanda sul sogno.
         L'animazione si sceglie tra le varianti della schermata. */
      mascotte: 'saltare',
      title: 'Ora tocca a te',
      body: 'Dimentica cosa sai fare. Pensa a cosa vorresti fare.',
      cta: 'Ci sono'
    },

    {
      id: 'lavoroSogni',
      chapter: 'scoperta',
      type: 'dream',
      field: 'lavoroSogni',
      wow: true,
      frase: 'Qual è il lavoro che sogni?',
      descrizione: 'Scrivi di getto cosa ti piacerebbe diventare nella vita.',
      placeholder: 'Scrivi qui',
      cta: 'Continua'
    },

    {
      id: 'elaborazione',
      chapter: 'scoperta',
      type: 'circles',
      wow: true,
      noProgress: true
    },

    {
      id: 'previsione',
      chapter: 'scoperta',
      type: 'result',
      wow: true,
      title: 'Questa è la prima previsione del tuo percorso',
      body: '',
      tips: [
        {
          title: 'Decidi se restare o cambiare',
          description: 'Valuta se nella tua azienda esistono percorsi per diventare {lavoroSogni}. Se non li trovi, guarda fuori.'
        },
        {
          title: 'Potenzia le competenze chiave',
          description: 'Individua le skill fondamentali e inizia a formarti, anche con corsi brevi e certificazioni.'
        },
        {
          title: 'Crea esperienze rilevanti',
          description: 'Cerca progetti o collaborazioni dove applicarle. Documenta i risultati: saranno la tua carta vincente.'
        }
      ],
      ctaPrimaria: 'Completa la profilazione',
      ctaPrimariaNota: 'Per una proiezione più accurata',
      ctaSecondaria: 'Continua a giocare'
    },

    /* ---------- REGISTRAZIONE / ACCESSO ---------------------------- */
    {
      id: 'registrazione',
      chapter: 'auth',
      type: 'login',
      variante: 'sheet',
      title: 'Benvenuto',
      body: 'Accedi o registrati per continuare.',
      titleC: 'Benvenuto',
      bodyC: 'Scegli come vuoi accedere',
      cta: 'Continua'
    },

    {
      id: 'otp',
      chapter: 'auth',
      type: 'otp',
      title: 'Controlla la tua email',
      body: 'Abbiamo inviato un codice a {email}',
      reinvia: 'Invia un nuovo codice',
      scadenza: 'Il codice scade tra 10 minuti',
      cta: 'Continua',
      codice: '12345'
    },

    /* ---------- FASE 2 · QUESTIONARIO ------------------------------ */
    {
      id: 'introQuestionario',
      chapter: 'test',
      type: 'info',
      mascotte: 'leggere',
      noProgress: true,
      title: 'Prima di iniziare',
      lista: [
        'Questo test dura circa 8 minuti.',
        'Non ci sono risposte giuste o sbagliate.',
        'Rispondi di pancia, senza pensarci troppo.'
      ],
      body: '',
      cta: 'Continua'
    },
    {
      id: 'ctaTest',
      chapter: 'test',
      type: 'info',
      mascotte: 'ok',
      noProgress: true,
      title: 'Sei pronto?',
      body: '',
      cta: 'Inizia il test'
    },

    /* --- Blocco 01 · Anagrafica e lavoro --- */
    {
      id: 'b1_pausa',
      chapter: 'test',
      type: 'info',
      blocco: 1,
      mascotte: 'matita',
      eyebrow: 'Blocco 1 di 3',
      title: 'Partiamo dalle basi',
      body: 'Ti chiediamo i dati anagrafici, il settore in cui vorresti lavorare e il livello che immagini per te.',
      cta: 'Continua'
    },
    {
      id: 'b1_anagrafica',
      chapter: 'test',
      type: 'form',
      blocco: 1,
      title: 'Parlaci di te',
      fields: [
        { key: 'nome', label: 'Nome', placeholder: 'Nome' },
        { key: 'cognome', label: 'Cognome', placeholder: 'Cognome' },
        { key: 'eta', label: 'Età', placeholder: 'Età', inputMode: 'numeric' },
        { key: 'citta', label: 'Dove vivi', placeholder: 'Città' },
        { key: 'suDiTe', label: 'Vuoi dirci altro su di te?', placeholder: 'Facoltativo', multiline: true, optional: true }
      ],
      cta: 'Continua'
    },
    {
      id: 'b1_categoria',
      chapter: 'test',
      type: 'multi',
      blocco: 1,
      field: 'categoria',
      searchable: true,
      title: 'In che settore vorresti lavorare?',
      optionsFrom: 'professioni',
      cta: 'Continua'
    },
    {
      id: 'b1_mansione',
      chapter: 'test',
      type: 'multi',
      blocco: 1,
      field: 'mansioni',
      searchable: true,
      title: 'Quale ruolo ti piacerebbe?',
      body: 'Puoi sceglierne più di uno.',
      optionsFrom: 'mansioni',
      cta: 'Continua'
    },
    {
      id: 'b1_livello',
      chapter: 'test',
      type: 'singleInfo',
      blocco: 1,
      field: 'livello',
      title: 'Che livello immagini per te?',
      body: 'Scegli quello a cui aspiri.',
      options: [
        { label: 'Livello base', info: 'Ruoli operativi, con supervisione.' },
        { label: 'Livello intermedio', info: 'Autonomia e competenze specialistiche.' },
        { label: 'Livello avanzato', info: 'Responsabilità su progetti o persone.' },
        { label: 'Livello dirigenziale', info: 'Guida di aree aziendali e decisioni strategiche.' },
        { label: 'Libera professione', info: 'Lavoro in proprio, clienti e obiettivi tuoi.' }
      ],
      cta: 'Continua'
    },

    /* --- Blocco 02 · Aspettative e motivazione --- */
    {
      id: 'b2_pausa',
      chapter: 'test',
      type: 'info',
      blocco: 2,
      mascotte: 'computer',
      eyebrow: 'Blocco 2 di 3',
      title: 'Cosa conta per te',
      body: 'Parliamo di aspettative: cosa cerchi in un lavoro, cosa ti preoccupa e quali valori vuoi trovare in azienda.',
      cta: 'Continua'
    },
    {
      id: 'b2_comeFunziona',
      chapter: 'test',
      type: 'rankIntro',
      blocco: 2,
      title: 'Ora si trascina',
      body: 'Nelle prossime domande metti in ordine le risposte: in alto quella che conta di più.',
      demo: ['Stipendio', 'Flessibilità', 'Crescita'],
      cta: 'Ho capito'
    },
    {
      id: 'b2_rank1',
      chapter: 'test',
      type: 'rank',
      blocco: 2,
      field: 'rankSicurezza',
      eyebrow: 'Sicurezza e stabilità',
      title: 'Cosa conta di più per te?',
      options: [
        { label: 'Stipendio' },
        { label: 'Stabilità' },
        { label: 'Contratto da dipendente' },
        { label: 'Welfare aziendale' },
        { label: 'Restare a lungo nella stessa azienda' },
        { label: 'Vicinanza casa-lavoro' }
      ],
      cta: 'Continua'
    },
    {
      id: 'b2_rank2',
      chapter: 'test',
      type: 'rank',
      blocco: 2,
      field: 'rankFlessibilita',
      eyebrow: 'Flessibilità e autonomia',
      title: 'Cosa conta di più per te?',
      options: [
        { label: 'Flessibilità di orario' },
        { label: 'Lavoro da remoto' },
        { label: 'Cambiare spesso per crescere' },
        { label: 'Lavorare in proprio' },
        { label: 'Lavorare per obiettivi, con calma' },
        { label: 'Stare a contatto con le persone' }
      ],
      cta: 'Continua'
    },
    {
      id: 'b2_rank3',
      chapter: 'test',
      type: 'rank',
      blocco: 2,
      field: 'rankCrescita',
      eyebrow: 'Crescita e realizzazione',
      title: 'Cosa conta di più per te?',
      options: [
        { label: 'Crescere di ruolo negli anni' },
        { label: 'Specializzarmi sempre di più' },
        { label: 'Lavorare in gruppo' },
        { label: 'Un lavoro stimolante e competitivo' },
        { label: 'Un lavoro pratico e manuale' },
        { label: 'Un lavoro intellettuale' }
      ],
      cta: 'Continua'
    },
    {
      id: 'b2_paure',
      chapter: 'test',
      type: 'multi',
      blocco: 2,
      field: 'paure',
      title: 'Cosa ti preoccupa di più?',
      options: [
        { label: 'Uno stipendio troppo basso' },
        { label: 'Non riuscire a fare carriera' },
        { label: 'Pressioni e obiettivi troppo alti' },
        { label: 'Competizione fra colleghi' },
        { label: 'Non trovare un lavoro stabile' },
        { label: 'Perdere il lavoro' },
        { label: 'Lo stress e la tensione continua' },
        { label: 'Non avere abbastanza competenze' },
        { label: 'Non avere equilibrio con la vita privata' },
        { label: 'Non poter lavorare da casa' },
        { label: 'Non andare d’accordo con capi e colleghi' },
        { label: 'Non essere autonomo' }
      ],
      cta: 'Continua'
    },
    {
      id: 'b2_valori',
      chapter: 'test',
      type: 'multi',
      blocco: 2,
      field: 'valori',
      title: 'Cosa cerchi in un’azienda?',
      listStyle: 'grid',
      options: [
        { label: 'Integrità ed etica', ico: 'scale' },
        { label: 'Benessere dei dipendenti', ico: 'heart-pulse' },
        { label: 'Clima positivo', ico: 'sun' },
        { label: 'Collaborazione e fiducia', ico: 'users' },
        { label: 'Rispetto e inclusività', ico: 'smile' },
        { label: 'Innovazione', ico: 'lightbulb' },
        { label: 'Adattabilità', ico: 'shuffle' },
        { label: 'Sostenibilità', ico: 'leaf' },
        { label: 'Orientamento ai risultati', ico: 'target' },
        { label: 'Trasparenza', ico: 'eye' }
      ],
      cta: 'Continua'
    },
    {
      id: 'b2_trasferimento',
      mascotte: 'indicare',
      chapter: 'test',
      type: 'single',
      blocco: 2,
      field: 'trasferimento',
      title: 'Ti trasferiresti in un’altra città?',
      listStyle: 'grid',
      options: [
        { label: 'Sì, volentieri', ico: 'plane' },
        { label: 'Solo se ne vale la pena', ico: 'scale' },
        { label: 'Preferirei di no', ico: 'house' },
        { label: 'No', ico: 'x' }
      ]
    },
    {
      id: 'b2_sogno',
      chapter: 'test',
      type: 'text',
      blocco: 2,
      field: 'sognoGrande',
      multiline: true,
      title: 'Se non ci fossero limiti, cosa faresti?',
      placeholder: 'Scrivi liberamente…',
      cta: 'Continua'
    },

    /* --- Blocco 03 · Personalità e lavoro --- */
    {
      id: 'b3_pausa',
      chapter: 'test',
      type: 'info',
      blocco: 3,
      mascotte: 'zaino',
      eyebrow: 'Blocco 3 di 3',
      title: 'Come funzioni davvero',
      body: 'Sette domande sul tuo modo di stare con gli altri e di affrontare le situazioni. Rispondi di pancia.',
      cta: 'Continua'
    },
    {
      id: 'b3_q1',
      chapter: 'test',
      type: 'single',
      blocco: 3,
      field: 'p1',
      title: 'Quando ti relazioni con gli altri…',
      options: [
        { label: 'Li capisci al volo e cogli subito nuove opportunità' },
        { label: 'Sai interagire con persone molto diverse fra loro' },
        { label: 'Produrre idee e spunti è la tua inclinazione naturale' },
        { label: 'Sai far esprimere gli altri quando hanno qualcosa da dire' },
        { label: 'Ti senti soddisfatto quando porti a termine qualcosa' },
        { label: 'Accetti di essere impopolare, se porta a buoni risultati' },
        { label: 'Capisci subito cosa funziona e cosa no' },
        { label: 'Offri molte alternative, senza pregiudizi' }
      ]
    },
    {
      id: 'b3_q2',
      chapter: 'test',
      type: 'single',
      blocco: 3,
      field: 'p2',
      title: 'Davanti a un problema, può darsi che…',
      options: [
        { label: 'Non sei a tuo agio finché non hai una struttura chiara' },
        { label: 'Fai tuoi punti di vista poco condivisi dagli altri' },
        { label: 'Prima guardi come l’hanno risolto altri' },
        { label: 'Fatichi ad ascoltare gli altri senza una visione tua' },
        { label: 'Prendi in mano la situazione e ti imponi' },
        { label: 'Preferisci un confronto e un aiuto collaborativo' },
        { label: 'Ti perdi nella moltitudine di idee che ti vengono' },
        { label: 'Vuoi tutto sotto controllo, nei minimi dettagli' }
      ]
    },
    {
      id: 'b3_q3',
      chapter: 'test',
      type: 'single',
      blocco: 3,
      field: 'p3',
      title: 'Quando organizzi qualcosa in gruppo…',
      options: [
        { label: 'Sai influenzare gli altri senza forzarli' },
        { label: 'La tua attenzione previene errori e dimenticanze' },
        { label: 'Sei incline all’azione, per non perdere tempo' },
        { label: 'Porti sempre un contributo originale' },
        { label: 'Appoggi i suggerimenti che ritieni di valore' },
        { label: 'Cerchi spunti fuori dal gruppo' },
        { label: 'Hai un approccio distaccato e analitico' },
        { label: 'Sei affidabile nell’organizzare i processi' }
      ]
    },
    {
      id: 'b3_q4',
      chapter: 'test',
      type: 'single',
      blocco: 3,
      field: 'p4',
      title: 'Il tuo approccio con un gruppo',
      options: [
        { label: 'Ti interessa conoscere a fondo le persone' },
        { label: 'Non hai problemi ad appoggiare idee minoritarie' },
        { label: 'Sai argomentare contro le idee che ti sembrano sbagliate' },
        { label: 'Sei bravo a far funzionare le cose' },
        { label: 'Cerchi idee nuove, eviti l’ovvio' },
        { label: 'Perfezioni al massimo, non lasci nulla al caso' },
        { label: 'Cerchi contatti fuori dal gruppo, ti annoia la comfort zone' },
        { label: 'Valuti tutti i punti di vista, poi scegli con sicurezza' }
      ]
    },
    {
      id: 'b3_q5',
      chapter: 'test',
      type: 'single',
      blocco: 3,
      field: 'p5',
      title: 'Cosa ti darebbe soddisfazione al lavoro?',
      options: [
        { label: 'Analizzare le situazioni in modo oggettivo' },
        { label: 'Trovare soluzioni efficaci e concrete' },
        { label: 'Collaborare e avere buoni rapporti con i colleghi' },
        { label: 'Portare avanti iniziative in modo proattivo' },
        { label: 'Cogliere le novità e rompere gli schemi' },
        { label: 'Avere consenso su un piano in cui credi' },
        { label: 'Concentrarti a fondo su un compito' },
        { label: 'Mettere in campo creatività e immaginazione' }
      ]
    },
    {
      id: 'b3_q6',
      chapter: 'test',
      type: 'single',
      blocco: 3,
      field: 'p6',
      title: 'In un’emergenza fra sconosciuti, cosa fai?',
      options: [
        { label: 'Ti isoli per riflettere ed elaborare un piano' },
        { label: 'Individui le persone propositive e collabori' },
        { label: 'Identifichi priorità e tempi, e dai indicazioni' },
        { label: 'Controlli che non manchi nulla, e agisci in fretta' },
        { label: 'Mantieni lucidità e analizzi con calma' },
        { label: 'Punti all’obiettivo, nonostante la pressione' },
        { label: 'Prendi in mano la situazione se il gruppo è fermo' },
        { label: 'Stimoli nuove idee e punti di vista diversi' }
      ]
    },
    {
      id: 'b3_q7',
      chapter: 'test',
      type: 'single',
      blocco: 3,
      field: 'p7',
      title: 'Per cosa vieni criticato di più?',
      options: [
        { label: 'Non hai pazienza con chi ti ostacola' },
        { label: 'Sei troppo analitico, poco creativo' },
        { label: 'Il tuo perfezionismo rallenta i progressi' },
        { label: 'Ti annoi in fretta e cambi direzione' },
        { label: 'Sei reticente a iniziare senza tutti gli elementi' },
        { label: 'Non ti spieghi chiaramente, fai ragionamenti complessi' },
        { label: 'Pretendi cose che nemmeno tu hai mai fatto' },
        { label: 'Fatichi a prendere posizione se sei in minoranza' }
      ]
    },

    /* ---------- CHIUSURA ------------------------------------------- */
    {
      id: 'fineTest',
      chapter: 'test',
      type: 'loading',
      wow: false,
      noProgress: true,
      title: 'Il tuo percorso sta prendendo forma',
      body: 'Ogni risposta è un tassello della tua linea di carriera.',
      status: [
        'Mettiamo a fuoco il punto di partenza',
        'Colleghiamo le opportunità più adatte',
        'La tua rotta è quasi pronta'
      ],
      durata: 7200
    },

    {
      id: 'preview',
      chapter: 'auth',
      type: 'preview',
      title: 'La tua linea di carriera',
      body: 'Da dove sei oggi a {lavoroSogni}.',
      steps: [
        { nome: 'Fai il punto', ruolo: 'Assessment delle competenze', durata: '2 settimane', obiettivo: 'Capire da dove parti e cosa ti manca.' },
        { nome: 'Formazione base', ruolo: 'Corso introduttivo di settore', durata: '3 mesi', obiettivo: 'Costruire le fondamenta tecniche del ruolo.' },
        { nome: 'Specializzazione', ruolo: 'Percorso avanzato o master', durata: '6 mesi', obiettivo: 'La competenza che ti fa scegliere.' },
        { nome: 'Esperienza sul campo', ruolo: 'Tirocinio o primo incarico', durata: '6 mesi', obiettivo: 'Applicare quello che hai imparato.' },
        { nome: 'Il ruolo che sogni', ruolo: '{lavoroSogni}', durata: 'Traguardo', obiettivo: 'Ci sei arrivato.' }
      ],
      cta: 'Vai alla dashboard',
      ctaNota: 'Continua nella Fase 3',
      href: 'fase3.html'
    },

    {
      id: 'fine',
      chapter: 'auth',
      type: 'info',
      mascotte: 'stretta-mano',
      title: 'Fine del prototipo',
      body: 'Dashboard, mappa e consulenza fanno parte della Fase 3.',
      cta: 'Ricomincia'
    }
  ]
};
