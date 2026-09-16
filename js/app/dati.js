/* ==========================================================================
   NAVIDA — Dati di esempio dell'app (Fase 3 e 4)
   ==========================================================================
   Un elenco solo, letto da tutte le schermate: dashboard, linea di carriera,
   dettaglio dello step, scheda attività, scheda info, mappa e profilo.
   Se cambi qui un titolo, cambia ovunque.

   Il profilo di esempio: Marco vuole diventare UX/AI Designer ed è allo
   step 1 di 5, "Studente di AI Design".

   ATTENZIONE: prezzi, voti, recensioni, distanze e contatti sono INVENTATI.
   Servono solo a far sembrare vero il prototipo. Le aziende e le sedi con
   nomi di fantasia (Studio Lumen, Officina Digitale, ...) non esistono.

   COME E' FATTO
   - utente         chi usa l'app
   - percorso       la linea di carriera: 5 step, ognuno con i suoi compiti
   - categorie      scuole, corsi, lavoro, workshop, eventi, libri
   - ambiti         i due pulsanti della dashboard: Formazione e Lavoro
   - opportunita    tutte le schede (scuole, corsi, eventi, libri, offerte)
   - primoPiano     cosa mostra la dashboard in "In primo piano"
   - mappa          il centro della mappa e dove si trova l'utente
   - curriculum     la sezione "Curriculum" del profilo
   - preferenze     i valori iniziali della pagina Preferenze
   - notifiche      l'elenco della campanella
   ========================================================================== */

window.NAVIDA_DATI = {

  /* ======================================================================
     UTENTE
     ====================================================================== */
  utente: {
    nome: 'Marco',
    cognome: 'Bacchin',
    /* foto profilo: vuota = icona persona in tutta l'app */
    avatar: '',
    email: 'bacchin.marco03@gmail.com',
    telefono: '+39 345 123 4567',
    nascita: '12 marzo 2003',
    genere: 'Uomo',
    citta: 'Padova',
    indirizzo: 'Via Belzoni 31, Padova',
    occupazione: 'Studente',
    titoloStudio: 'Diploma di liceo artistico',
    obiettivo: 'UX/AI Designer',
    testFatto: '12 settembre 2026',
    /* quanto è completo il profilo, da 0 a 100 */
    completezza: 70
  },

  /* ======================================================================
     LINEA DI CARRIERA
     ----------------------------------------------------------------------
     stato di uno step:   fatto | attuale | da-fare | traguardo
     stato di un compito: fatto | in-corso | da-fare
     "attuale" è l'indice (da 0) dello step in cui si trova l'utente.
     ====================================================================== */
  percorso: {
    obiettivo: 'UX/AI Designer',
    partenza: 'Diploma di liceo artistico',
    attuale: 0,
    durataTotale: 'circa 7 anni',
    /* quante persone con un profilo simile hanno fatto questo percorso */
    personeSimili: 1240,

    steps: [
      {
        id: 's1',
        titolo: 'Studente di AI Design',
        breve: 'Studente',
        tipo: 'Formazione',
        icona: 'graduation-cap',
        durata: '3 anni',
        stato: 'attuale',
        obiettivo: 'Costruire le basi del design e imparare a progettare con l’intelligenza artificiale.',
        descrizione: 'È lo step delle fondamenta. Studi il metodo del design, impari gli strumenti che userai ogni giorno e inizi a raccogliere i primi progetti da mostrare.',
        competenze: ['Figma', 'Ricerca utente', 'Prototipazione', 'Basi di AI generativa'],
        stipendio: '',
        compiti: [
          {
            id: 'diploma',
            titolo: 'Prendi un diploma in design',
            breve: 'Diploma in design',
            obbligatoria: true,
            stato: 'in-corso',
            categoria: 'scuole',
            durata: '2-3 anni',
            nota: 'Iscrizioni aperte fino al 30 settembre',
            descrizione: 'Un diploma accademico, un ITS o una laurea triennale in design ti danno il metodo e ti aprono le porte degli studi. Ti abbiamo messo in cima le scuole più pratiche, perché impari meglio facendo.'
          },
          {
            id: 'figma',
            titolo: 'Impara Figma e la prototipazione',
            breve: 'Figma e prototipi',
            obbligatoria: true,
            stato: 'fatto',
            categoria: 'corsi',
            durata: '1-6 mesi',
            descrizione: 'Figma è lo strumento che usano quasi tutti gli studi. Serve per disegnare le schermate e trasformarle in prototipi che si possono provare.'
          },
          {
            id: 'ai',
            titolo: 'Segui un corso di AI per designer',
            breve: 'Corso di AI',
            obbligatoria: true,
            stato: 'da-fare',
            categoria: 'corsi',
            durata: '1-2 mesi',
            descrizione: 'Impari a usare l’AI generativa nel lavoro di tutti i giorni: ricerca, idee, prototipi veloci. È la competenza che distingue un UX/AI Designer.'
          },
          {
            id: 'portfolio',
            titolo: 'Costruisci un portfolio con 3 progetti',
            breve: 'Portfolio',
            obbligatoria: true,
            stato: 'da-fare',
            categoria: 'workshop',
            durata: '3-6 mesi',
            descrizione: 'Il portfolio conta più del titolo di studio. Tre progetti raccontati bene, dal problema alla soluzione, bastano per il primo tirocinio.'
          },
          {
            id: 'workshop',
            titolo: 'Partecipa a un workshop o a un evento di design',
            breve: 'Workshop ed eventi',
            obbligatoria: false,
            stato: 'da-fare',
            categoria: 'eventi',
            durata: 'Mezza giornata',
            descrizione: 'Ti fa conoscere persone del settore e ti tiene aggiornato. Spesso è da un evento che arriva il primo contatto per un tirocinio.'
          },
          {
            id: 'libri',
            titolo: 'Leggi due libri sulla progettazione',
            breve: 'Due libri',
            obbligatoria: false,
            stato: 'fatto',
            categoria: 'libri',
            durata: '1 mese',
            descrizione: 'Due classici che spiegano perché alcune cose sono facili da usare e altre no. Si leggono in fretta e restano per sempre.'
          }
        ]
      },
      {
        id: 's2',
        titolo: 'Tirocinante UX/UI in uno studio',
        breve: 'Tirocinio',
        tipo: 'Esperienza',
        icona: 'building-2',
        durata: '6 mesi',
        stato: 'da-fare',
        obiettivo: 'Lavorare su progetti veri, accanto a designer esperti.',
        descrizione: 'Passi dalla scuola al lavoro. In uno studio vedi come nasce un progetto per un cliente vero e impari a lavorare in squadra.',
        competenze: ['Lavoro in team', 'Interviste utente', 'Design system', 'Presentare le idee'],
        stipendio: 'Rimborso € 600-800 / mese',
        compiti: [
          { id: 'tirocinio', titolo: 'Fai 6 mesi di tirocinio in uno studio di design', breve: 'Tirocinio', obbligatoria: true, stato: 'da-fare', categoria: 'lavoro', durata: '6 mesi', descrizione: 'Cerca uno studio che lavori su prodotti digitali. Meglio uno piccolo dove fai un po’ di tutto che uno grande dove guardi e basta.' },
          { id: 'casestudy', titolo: 'Porta un progetto reale dall’idea al lancio', breve: 'Progetto reale', obbligatoria: true, stato: 'da-fare', categoria: 'workshop', durata: '3 mesi', descrizione: 'Segui un progetto dall’inizio alla fine e raccontalo nel portfolio come caso studio.' },
          { id: 'interviste', titolo: 'Conduci 5 interviste con utenti veri', breve: 'Interviste', obbligatoria: true, stato: 'da-fare', categoria: 'corsi', durata: '1 mese', descrizione: 'Parlare con le persone che useranno il prodotto è la base della UX. Impari a fare domande senza suggerire le risposte.' },
          { id: 'community', titolo: 'Entra in una community di designer', breve: 'Community', obbligatoria: false, stato: 'da-fare', categoria: 'eventi', durata: 'Sempre', descrizione: 'Meetup, gruppi online, eventi: ti aiutano a crescere e a trovare il prossimo lavoro.' }
        ]
      },
      {
        id: 's3',
        titolo: 'Junior UX/UI Designer',
        breve: 'Junior',
        tipo: 'Lavoro',
        icona: 'briefcase-business',
        durata: '2 anni',
        stato: 'da-fare',
        obiettivo: 'Il primo contratto vero: progettare interfacce in autonomia.',
        descrizione: 'Lavori in un team di prodotto o in un’agenzia. Ti affidano parti di progetto e cresci a ogni consegna.',
        competenze: ['Design system', 'Accessibilità', 'Test di usabilità', 'Collaborare con gli sviluppatori'],
        stipendio: 'RAL € 24-28 mila',
        compiti: [
          { id: 'lavoroJunior', titolo: 'Trova un lavoro da Junior UX/UI Designer', breve: 'Primo lavoro', obbligatoria: true, stato: 'da-fare', categoria: 'lavoro', durata: '2-4 mesi di ricerca', descrizione: 'Con tirocinio e portfolio sei pronto. Punta su aziende che hanno un team di design interno.' },
          { id: 'designSystem', titolo: 'Impara a lavorare con un design system', breve: 'Design system', obbligatoria: true, stato: 'da-fare', categoria: 'corsi', durata: '2 mesi', descrizione: 'Componenti, regole e varianti: è così che si progettano prodotti grandi senza perdere la coerenza.' },
          { id: 'certUx', titolo: 'Ottieni una certificazione UX riconosciuta', breve: 'Certificazione', obbligatoria: false, stato: 'da-fare', categoria: 'corsi', durata: '3-6 mesi', descrizione: 'Non è necessaria, ma aiuta a farsi notare nei colloqui con le aziende più grandi.' },
          { id: 'inglese', titolo: 'Porta l’inglese al livello C1', breve: 'Inglese C1', obbligatoria: false, stato: 'da-fare', categoria: 'corsi', durata: '6 mesi', descrizione: 'Documentazione, strumenti e team internazionali: l’inglese ti apre molte più porte.' }
        ]
      },
      {
        id: 's4',
        titolo: 'UX Designer',
        breve: 'UX Designer',
        tipo: 'Lavoro',
        icona: 'layers',
        durata: '2 anni',
        stato: 'da-fare',
        obiettivo: 'Guidare progetti interi e iniziare a portare l’AI nei prodotti.',
        descrizione: 'Hai più responsabilità: segui un’area del prodotto, decidi con il team cosa progettare e porti le prime funzioni basate sull’AI.',
        competenze: ['Strategia di prodotto', 'AI nei prodotti', 'Facilitare workshop', 'Mentoring'],
        stipendio: 'RAL € 32-40 mila',
        compiti: [
          { id: 'progettiAi', titolo: 'Guida un progetto con funzioni di AI', breve: 'Progetto AI', obbligatoria: true, stato: 'da-fare', categoria: 'lavoro', durata: '6-12 mesi', descrizione: 'Assistenti, suggerimenti, ricerca intelligente: progettare con l’AI ha regole nuove e poche persone le conoscono.' },
          { id: 'master', titolo: 'Frequenta un master in AI & Interaction Design', breve: 'Master', obbligatoria: false, stato: 'da-fare', categoria: 'scuole', durata: '1 anno', descrizione: 'Un master serale o nel weekend ti dà basi più solide su AI ed etica dei dati.' },
          { id: 'talk', titolo: 'Racconta un tuo progetto a un evento', breve: 'Talk', obbligatoria: false, stato: 'da-fare', categoria: 'eventi', durata: '1 giorno', descrizione: 'Parlare in pubblico ti fa conoscere e ti obbliga a mettere in ordine quello che sai.' }
        ]
      },
      {
        id: 's5',
        titolo: 'UX/AI Designer',
        breve: 'Traguardo',
        tipo: 'Traguardo',
        icona: 'trophy',
        durata: 'Traguardo',
        stato: 'traguardo',
        obiettivo: 'Progettare prodotti in cui persone e intelligenza artificiale lavorano insieme.',
        descrizione: 'Il lavoro che hai scelto. Progetti esperienze basate sull’AI: decidi cosa fa la macchina, cosa fa la persona e come si capiscono.',
        competenze: ['Progettare con l’AI', 'Etica e fiducia', 'Prototipi con modelli AI', 'Guidare il team'],
        stipendio: 'RAL € 42-55 mila',
        compiti: [
          { id: 'ruoloFinale', titolo: 'Candidati come UX/AI Designer', breve: 'Candidatura', obbligatoria: true, stato: 'da-fare', categoria: 'lavoro', durata: '1-3 mesi', descrizione: 'Con i progetti AI nel portfolio puoi puntare ai ruoli specializzati.' },
          { id: 'portfolioAi', titolo: 'Aggiorna il portfolio con casi AI', breve: 'Portfolio AI', obbligatoria: true, stato: 'da-fare', categoria: 'workshop', durata: '2 mesi', descrizione: 'Mostra come hai progettato funzioni AI: problema, rischi, scelte e risultati.' }
        ]
      }
    ]
  },

  /* ======================================================================
     CATEGORIE DELLE OPPORTUNITÀ
     tono = coppia colore 1-5 (vedi --tema-N-* in css/tokens.css)
     ====================================================================== */
  categorie: {
    scuole:   { etichetta: 'Scuole',   singolare: 'Scuola',   icona: 'graduation-cap',     tono: 1 },
    corsi:    { etichetta: 'Corsi',    singolare: 'Corso',    icona: 'book-open',          tono: 2 },
    lavoro:   { etichetta: 'Lavoro',   singolare: 'Offerta',  icona: 'briefcase-business', tono: 3 },
    workshop: { etichetta: 'Workshop', singolare: 'Workshop', icona: 'zap',                tono: 5 },
    eventi:   { etichetta: 'Eventi',   singolare: 'Evento',   icona: 'calendar-days',      tono: 5 },
    libri:    { etichetta: 'Libri',    singolare: 'Libro',    icona: 'book',               tono: 4 }
  },

  /* I due pulsanti in fondo alla dashboard */
  ambiti: {
    formazione: {
      titolo: 'Formazione',
      sottotitolo: 'Scuole, corsi ed eventi per il tuo step',
      icona: 'graduation-cap',
      descrizione: 'Tutto quello che ti serve per imparare in questo step: scuole, corsi, workshop, eventi e libri, ordinati in base a te.',
      categorie: ['scuole', 'corsi', 'workshop', 'eventi', 'libri']
    },
    lavoro: {
      titolo: 'Lavoro',
      sottotitolo: 'Offerte e tirocini adatti a te',
      icona: 'briefcase-business',
      descrizione: 'Offerte, tirocini e collaborazioni compatibili con lo step in cui sei e con quello che viene dopo.',
      categorie: ['lavoro']
    }
  },

  /* ======================================================================
     OPPORTUNITÀ
     ----------------------------------------------------------------------
     Campi comuni:
       categoria    chiave di "categorie"
       compiti      id dei compiti a cui serve
       nome         titolo della scheda (il corso, il libro, l'offerta)
       ente         chi lo offre (scuola, piattaforma, azienda, autore)
       sigla, tono  il logo di ripiego: lettere su fondo colorato
       logo         immagine del logo (se c'è, prende il posto della sigla)
       immagine     foto di copertina (se c'è)
       citta, indirizzo, distanza, pos {x,y}  pos in % sulla mappa; null = fuori mappa o online
       modalita     In presenza | Online | Ibrido
       durata, prezzo, inizio, lingua, certificazione
       rating, recensioni
       affinita     quanto è adatta all'utente, da 0 a 100 (serve a ordinare)
       perche       la frase "perché te la consigliamo"
       percheLungo  lo stesso perché, spiegato in due o tre frasi (scheda info)
       sponsorizzato  true = in cima con l'etichetta "Sponsorizzato"
     Campi facoltativi, per la scheda info:
       descrizione, punti, programma, docenti, recensioniLista, galleria, contatti
     ====================================================================== */
  opportunita: {

    /* --- SCUOLE ------------------------------------------------------- */
    its: {
      categoria: 'scuole', compiti: ['diploma'],
      nome: 'ITS in UX/UI Design',
      ente: 'Accademia Digitale Nordest',
      sigla: 'AD', tono: 2,
      immagine: 'assets/opportunita/foto/its.jpg', logo: 'assets/opportunita/loghi/accademia-digitale-nordest.svg',
      citta: 'Padova', indirizzo: 'Via Venezia 59, Padova', distanza: '3,1 km', pos: { x: 72, y: 34 },
      modalita: 'In presenza', durata: '2 anni', prezzo: 'Gratis, finanziato', inizio: 'Ottobre 2026', lingua: 'Italiano',
      certificazione: 'Diploma di tecnico superiore (V livello EQF)',
      rating: 4.6, recensioni: 128, affinita: 93,
      perche: 'Due anni, tanta pratica e 800 ore di stage in azienda',
      percheLungo: 'Nel test hai detto che impari meglio facendo e che vuoi lavorare presto. Qui metà del percorso è stage in azienda e il corso è gratis, a 3 km da casa tua. Dà meno teoria di un diploma accademico, ma in due anni ti porta al primo lavoro.',
      sponsorizzato: true,
      descrizione: 'Un corso post diploma di due anni pensato con le aziende del territorio. Metà del tempo lo passi in aula, l’altra metà in stage.',
      punti: ['800 ore di stage in azienda', 'Docenti che lavorano negli studi', 'Classi da 25 persone', '9 studenti su 10 lavorano entro un anno'],
      contatti: { sito: 'accademiadigitale.example', email: 'orientamento@accademiadigitale.example', telefono: '049 123 4567' }
    },
    sid: {
      categoria: 'scuole', compiti: ['diploma'],
      nome: 'Diploma in Interaction Design',
      ente: 'SID · Scuola Italiana Design',
      sigla: 'SID', tono: 1,
      immagine: 'assets/opportunita/foto/sid.jpg', logo: 'assets/opportunita/loghi/sid-scuola-italiana-design.svg',
      citta: 'Padova', indirizzo: 'Via Tommaseo 67, Padova', distanza: '2,4 km', pos: { x: 58, y: 44 },
      modalita: 'In presenza', durata: '3 anni', prezzo: '€ 6.900 / anno', inizio: 'Ottobre 2026', lingua: 'Italiano',
      certificazione: 'Diploma accademico di I livello',
      rating: 4.8, recensioni: 214, affinita: 96,
      perche: 'Didattica a progetto: impari facendo, come preferisci tu',
      percheLungo: 'Nel test hai detto che impari meglio lavorando su progetti concreti e che ti interessano le interfacce e l’AI. Qui si studia così dal primo anno, con aziende vere, e dal secondo anno scegli l’indirizzo in UX e AI: la stessa direzione del tuo obiettivo. Il liceo artistico ti ha già dato le basi visive che servono, e la sede è a 2,4 km da casa tua.',
      sponsorizzato: false,
      descrizione: 'Tre anni per diventare designer di prodotti digitali. Si lavora per progetti, spesso con aziende vere, e dal secondo anno si sceglie l’indirizzo in UX e AI.',
      punti: ['Progetti con aziende vere dal primo anno', 'Indirizzo in UX e AI dal secondo anno', 'Laboratori sempre aperti', 'Stage finale garantito'],
      programma: [
        { titolo: 'Fondamenti di design e comunicazione visiva', durata: '1° anno' },
        { titolo: 'Interfacce, prototipi e ricerca con gli utenti', durata: '2° anno' },
        { titolo: 'Progettare con l’intelligenza artificiale', durata: '2° anno' },
        { titolo: 'Progetto finale con un’azienda e stage', durata: '3° anno' }
      ],
      docenti: [
        { nome: 'Giulia Ferraro', ruolo: 'Head of Design, studio di prodotto' },
        { nome: 'Luca Marin', ruolo: 'UX Researcher' }
      ],
      recensioniLista: [
        { nome: 'Sara T.', voto: 5, testo: 'Dal primo anno lavori su progetti veri. Il portfolio me lo sono costruito qui.', quando: '2 mesi fa' },
        { nome: 'Davide R.', voto: 5, testo: 'Docenti che fanno questo lavoro tutti i giorni. Si sente la differenza.', quando: '5 mesi fa' },
        { nome: 'Elena B.', voto: 4, testo: 'Molto impegnativa ma ne vale la pena. Laboratori sempre aperti.', quando: '1 anno fa' }
      ],
      galleria: ['assets/opportunita/foto/workshopAi.jpg', 'assets/opportunita/foto/designSystemCorso.jpg', 'assets/opportunita/foto/naba.jpg'],
      contatti: { sito: 'scuolaitalianadesign.example', email: 'info@sid.example', telefono: '049 765 4321' }
    },
    iuav: {
      categoria: 'scuole', compiti: ['diploma'],
      nome: 'Laurea triennale in Design',
      ente: 'Università Iuav di Venezia',
      sigla: 'IUAV', tono: 3,
      immagine: 'assets/opportunita/foto/iuav.jpg', logo: 'assets/opportunita/loghi/iuav.svg',
      citta: 'Venezia', indirizzo: 'Santa Croce 191, Venezia', distanza: '38 km', pos: null,
      modalita: 'In presenza', durata: '3 anni', prezzo: 'da € 900 / anno', inizio: 'Ottobre 2026', lingua: 'Italiano',
      certificazione: 'Laurea triennale',
      rating: 4.5, recensioni: 356, affinita: 84,
      perche: 'Ottima base teorica, ma meno pratica di quello che cerchi',
      percheLungo: 'Il titolo è tra i più riconosciuti in Italia e costa poco. Però le lezioni sono soprattutto teoriche, e nel test hai detto che preferisci fare pratica. In più ogni giorno devi andare e tornare da Venezia.',
      sponsorizzato: false,
      contatti: { sito: 'iuav.example', email: 'orientamento@iuav.example', telefono: '041 000 0000' }
    },
    ied: {
      categoria: 'scuole', compiti: ['diploma'],
      nome: 'Diploma in Digital Design',
      ente: 'IED · Istituto Europeo di Design',
      sigla: 'IED', tono: 5,
      immagine: 'assets/opportunita/foto/ied.jpg', logo: 'assets/opportunita/loghi/ied.svg',
      citta: 'Milano', indirizzo: 'Via Sciesa 4, Milano', distanza: '240 km', pos: null,
      modalita: 'In presenza', durata: '3 anni', prezzo: '€ 13.500 / anno', inizio: 'Ottobre 2026', lingua: 'Italiano o inglese',
      certificazione: 'Diploma accademico di I livello',
      rating: 4.4, recensioni: 502, affinita: 79,
      perche: 'Molto pratica, ma lontana da casa e costosa',
      percheLungo: 'Il metodo è molto pratico, come piace a te, e il corso punta sul digitale. Pesano però la distanza, perché devi trasferirti a Milano, e il costo: quasi il doppio delle scuole vicino a te.',
      sponsorizzato: false,
      contatti: { sito: 'ied.example', email: 'info@ied.example', telefono: '02 000 0000' }
    },
    naba: {
      categoria: 'scuole', compiti: ['diploma'],
      nome: 'Diploma in Design della comunicazione',
      ente: 'NABA · Nuova Accademia di Belle Arti',
      sigla: 'NABA', tono: 4,
      immagine: 'assets/opportunita/foto/naba.jpg', logo: 'assets/opportunita/loghi/naba.svg',
      citta: 'Milano', indirizzo: 'Via Darwin 20, Milano', distanza: '241 km', pos: null,
      modalita: 'In presenza', durata: '3 anni', prezzo: '€ 12.800 / anno', inizio: 'Ottobre 2026', lingua: 'Italiano o inglese',
      certificazione: 'Diploma accademico di I livello',
      rating: 4.3, recensioni: 311, affinita: 72,
      perche: 'Più orientata alla grafica che alle interfacce',
      percheLungo: 'È una scuola pratica e seria, ma il corso è pensato per la grafica più che per le interfacce. Per diventare UX/AI Designer dovresti aggiungere molti corsi dopo. Anche qui devi trasferirti a Milano.',
      sponsorizzato: false,
      contatti: { sito: 'naba.example', email: 'info@naba.example', telefono: '02 000 0001' }
    },
    masterAi: {
      categoria: 'scuole', compiti: ['master'],
      nome: 'Master in AI & Interaction Design',
      ente: 'Accademia Digitale Nordest',
      sigla: 'AD', tono: 2,
      immagine: 'assets/opportunita/foto/masterAi.jpg', logo: 'assets/opportunita/loghi/accademia-digitale-nordest.svg',
      citta: 'Padova', indirizzo: 'Via Venezia 59, Padova', distanza: '3,1 km', pos: { x: 72, y: 34 },
      modalita: 'Ibrido', durata: '1 anno, nel weekend', prezzo: '€ 5.400', inizio: 'Febbraio 2027', lingua: 'Italiano',
      certificazione: 'Master di I livello',
      rating: 4.7, recensioni: 64, affinita: 91,
      perche: 'Si fa lavorando: lezioni il venerdì sera e il sabato',
      percheLungo: 'Unisce le due cose del tuo obiettivo: interfacce e intelligenza artificiale. Le lezioni sono il venerdì sera e il sabato, così puoi già lavorare. Ti conviene più avanti, quando hai finito il diploma.',
      sponsorizzato: false
    },

    /* --- CORSI -------------------------------------------------------- */
    googleux: {
      categoria: 'corsi', compiti: ['figma', 'certUx'],
      nome: 'Google UX Design',
      ente: 'Coursera · Google',
      sigla: 'G', tono: 3,
      immagine: 'assets/opportunita/foto/googleux.jpg', logo: 'assets/opportunita/loghi/google.svg',
      citta: '', indirizzo: '', distanza: '', pos: null,
      modalita: 'Online', durata: '6 mesi, 10 ore a settimana', prezzo: '€ 39 / mese', inizio: 'Quando vuoi', lingua: 'Inglese, sottotitoli in italiano',
      certificazione: 'Certificato professionale',
      rating: 4.8, recensioni: 88000, affinita: 92,
      perche: 'Il certificato più richiesto negli annunci per junior',
      percheLungo: 'È il certificato che compare più spesso negli annunci per UX designer junior. Lo segui online ai tuoi tempi, quindi va d’accordo con la scuola. Alla fine hai tre progetti veri da mettere nel portfolio.',
      sponsorizzato: false,
      completato: true,
      livello: 'Principiante',
      studenti: '1,2 mln',
      descrizione: 'Un percorso completo, dalla ricerca con gli utenti al prototipo finale in Figma. Alla fine hai tre progetti pronti per il portfolio e un certificato riconosciuto dalle aziende.',
      punti: ['Ricerca con gli utenti', 'Wireframe e prototipi in Figma', 'Test di usabilità', 'Tre progetti per il portfolio', 'Certificato riconosciuto dalle aziende'],
      programma: [
        { titolo: 'Le basi della UX', durata: '4 settimane' },
        { titolo: 'Ricerca e analisi degli utenti', durata: '5 settimane' },
        { titolo: 'Wireframe e prototipi', durata: '6 settimane' },
        { titolo: 'Interfacce in Figma', durata: '5 settimane' },
        { titolo: 'Test e iterazione', durata: '4 settimane' }
      ],
      docenti: [
        { nome: 'Maria Rossi', ruolo: 'Senior UX Designer, Google' }
      ],
      recensioniLista: [
        { nome: 'Giulia V.', voto: 5, testo: 'Chiaro e pratico. Le cose imparate le ho usate subito nel mio primo stage.', quando: '3 settimane fa' },
        { nome: 'Alessandro R.', voto: 4, testo: 'Tanti esempi reali. Un po’ lungo, ma il certificato aiuta davvero.', quando: '2 mesi fa' },
        { nome: 'Sara F.', voto: 5, testo: 'Perfetto per partire da zero. I tre progetti finali valgono il prezzo.', quando: '4 mesi fa' }
      ],
      galleria: ['assets/opportunita/foto/portfolioCorso.jpg', 'assets/opportunita/foto/aiLab.jpg', 'assets/opportunita/foto/designSystemCorso.jpg'],
      contatti: { sito: 'coursera.example/google-ux', email: '', telefono: '' }
    },
    figmaAula: {
      categoria: 'corsi', compiti: ['figma'],
      nome: 'Figma da zero, in aula',
      ente: 'SID · Scuola Italiana Design',
      sigla: 'SID', tono: 1,
      immagine: 'assets/opportunita/foto/figmaAula.jpg', logo: 'assets/opportunita/loghi/sid-scuola-italiana-design.svg',
      citta: 'Padova', indirizzo: 'Via Tommaseo 67, Padova', distanza: '2,4 km', pos: { x: 60, y: 47 },
      modalita: 'In presenza', durata: '4 sabati', prezzo: '€ 290', inizio: '4 ottobre 2026', lingua: 'Italiano',
      certificazione: 'Attestato di frequenza',
      rating: 4.9, recensioni: 87, affinita: 88,
      perche: 'In aula, con un docente accanto: ideale se parti da zero',
      percheLungo: 'Figma è lo strumento che userai ogni giorno da designer. In quattro sabati impari le basi con un docente accanto che ti corregge subito, come preferisci tu. La sede è a 2,4 km da casa tua.',
      sponsorizzato: false
    },
    aiDesigner: {
      categoria: 'corsi', compiti: ['ai'],
      nome: 'AI for Designers',
      ente: 'Interaction Design Foundation',
      sigla: 'IxDF', tono: 2,
      immagine: 'assets/opportunita/foto/aiDesigner.jpg', logo: 'assets/opportunita/loghi/interaction-design-foundation.svg',
      citta: '', indirizzo: '', distanza: '', pos: null,
      modalita: 'Online', durata: '8 settimane', prezzo: '€ 16 / mese', inizio: 'Quando vuoi', lingua: 'Inglese',
      certificazione: 'Certificato del corso',
      rating: 4.7, recensioni: 5400, affinita: 95,
      perche: 'Il corso di AI più completo pensato per chi fa design',
      percheLungo: 'Nel tuo obiettivo c’è l’AI, e questo corso è pensato proprio per chi progetta interfacce. Parte dalle basi e arriva a un progetto finale. È online e costa poco al mese, quindi lo segui quando vuoi.',
      sponsorizzato: false,
      livello: 'Principiante',
      studenti: '38 mila',
      descrizione: 'Come si progetta con l’AI e come si progettano prodotti che usano l’AI. Esempi pratici, esercizi guidati e un progetto finale.',
      punti: ['Cosa sa fare davvero l’AI generativa', 'Prompt per ricerca e idee', 'Progettare assistenti e suggerimenti', 'Fiducia, errori ed etica'],
      programma: [
        { titolo: 'Che cos’è l’AI generativa', durata: '1 settimana' },
        { titolo: 'L’AI nel processo di design', durata: '2 settimane' },
        { titolo: 'Progettare prodotti con l’AI', durata: '3 settimane' },
        { titolo: 'Etica, fiducia e progetto finale', durata: '2 settimane' }
      ],
      contatti: { sito: 'interaction-design.example', email: '', telefono: '' }
    },
    promptUx: {
      categoria: 'corsi', compiti: ['ai'],
      nome: 'Progettare con l’AI generativa',
      ente: 'Domestika',
      sigla: 'D', tono: 5,
      immagine: 'assets/opportunita/foto/promptUx.jpg', logo: 'assets/opportunita/loghi/domestika.png',
      citta: '', indirizzo: '', distanza: '', pos: null,
      modalita: 'Online', durata: '5 ore', prezzo: '€ 12,90', inizio: 'Quando vuoi', lingua: 'Italiano',
      certificazione: 'Attestato',
      rating: 4.6, recensioni: 2100, affinita: 83,
      perche: 'Breve e in italiano: buono per iniziare questa settimana',
      percheLungo: 'Sono solo 5 ore, in italiano, e costa meno di una pizza. È un buon modo per capire subito se l’AI generativa ti piace, prima di un corso più lungo.',
      sponsorizzato: false
    },
    aiLab: {
      categoria: 'corsi', compiti: ['ai'],
      nome: 'AI Design Lab, corso serale',
      ente: 'Officina Digitale Padova',
      sigla: 'OD', tono: 4,
      immagine: 'assets/opportunita/foto/aiLab.jpg', logo: 'assets/opportunita/loghi/officina-digitale-padova.svg',
      citta: 'Padova', indirizzo: 'Via Savonarola 99, Padova', distanza: '1,2 km', pos: { x: 34, y: 40 },
      modalita: 'In presenza', durata: '10 serate', prezzo: '€ 450', inizio: '20 ottobre 2026', lingua: 'Italiano',
      certificazione: 'Attestato di frequenza',
      rating: 4.7, recensioni: 42, affinita: 86,
      perche: 'Di sera: si concilia con la scuola',
      percheLungo: 'Le lezioni sono di sera, quindi non tolgono tempo alla scuola. Si lavora in aula su esercizi pratici, con altre persone della tua città. La sede è a 1,2 km da casa tua.',
      sponsorizzato: false
    },
    portfolioCorso: {
      categoria: 'corsi', compiti: ['portfolio'],
      nome: 'Il portfolio UX che ti fa assumere',
      ente: 'Udemy',
      sigla: 'U', tono: 2,
      immagine: 'assets/opportunita/foto/portfolioCorso.jpg', logo: 'assets/opportunita/loghi/udemy.svg',
      citta: '', indirizzo: '', distanza: '', pos: null,
      modalita: 'Online', durata: '3 ore', prezzo: '€ 19,99', inizio: 'Quando vuoi', lingua: 'Italiano',
      certificazione: 'Attestato',
      rating: 4.5, recensioni: 3900, affinita: 87,
      perche: 'Ti mostra come raccontare un progetto dal problema alla soluzione',
      percheLungo: 'Il portfolio è quello che le aziende guardano per primo. Questo corso ti insegna a raccontare un progetto dal problema alla soluzione, con esempi di portfolio che hanno funzionato. Bastano tre ore.',
      sponsorizzato: false
    },
    designSystemCorso: {
      categoria: 'corsi', compiti: ['designSystem'],
      nome: 'Design system in Figma',
      ente: 'Domestika',
      sigla: 'D', tono: 5,
      immagine: 'assets/opportunita/foto/designSystemCorso.jpg', logo: 'assets/opportunita/loghi/domestika.png',
      citta: '', indirizzo: '', distanza: '', pos: null,
      modalita: 'Online', durata: '8 ore', prezzo: '€ 14,90', inizio: 'Quando vuoi', lingua: 'Italiano',
      rating: 4.7, recensioni: 1300, affinita: 85,
      perche: 'Pratico, con un file Figma da usare subito',
      percheLungo: 'I design system sono richiesti in quasi tutti gli studi di prodotto. Il corso è pratico e ti lascia un file Figma pronto da riusare nei tuoi progetti.',
      sponsorizzato: false
    },

    /* --- WORKSHOP ED EVENTI ------------------------------------------- */
    workshopAi: {
      categoria: 'workshop', compiti: ['workshop', 'ai', 'portfolio'],
      nome: 'Workshop: prototipare con l’AI',
      ente: 'Officina Digitale Padova',
      sigla: 'OD', tono: 4,
      immagine: 'assets/opportunita/foto/workshopAi.jpg', logo: 'assets/opportunita/loghi/officina-digitale-padova.svg',
      citta: 'Padova', indirizzo: 'Via Savonarola 99, Padova', distanza: '1,2 km', pos: { x: 31, y: 43 },
      modalita: 'In presenza', durata: '3 ore', prezzo: 'Gratis', inizio: 'Mercoledì 15 ottobre · 18:30', lingua: 'Italiano',
      data: { giorno: '15', mese: 'OTT', ora: '18:30' },
      posti: '12 posti rimasti',
      partecipanti: 98,
      rating: 4.8, recensioni: 36, affinita: 94,
      perche: 'Vicino a te e gratis: porti a casa un prototipo per il portfolio',
      percheLungo: 'È a 1,2 km da casa tua, è gratis e dura una sera. Lavori a coppie e alla fine hai un prototipo da mettere nel portfolio. È anche un modo per conoscere i designer della tua zona.',
      sponsorizzato: false,
      descrizione: 'Tre ore pratiche: parti da un’idea e arrivi a un prototipo cliccabile usando strumenti di AI generativa. Porta il tuo portatile.',
      punti: ['Dall’idea al prototipo in 3 ore', 'Strumenti AI gratuiti', 'Lavoro a coppie', 'Aperitivo finale con i designer della zona'],
      programma: [
        { titolo: 'Accoglienza e presentazioni', durata: '18:30' },
        { titolo: 'Dall’idea al flusso, con l’AI', durata: '18:45' },
        { titolo: 'Prototipo cliccabile a coppie', durata: '19:30' },
        { titolo: 'Presentazioni e aperitivo', durata: '21:00' }
      ],
      docenti: [{ nome: 'Chiara Doni', ruolo: 'Product Designer, Studio Lumen' }],
      contatti: { sito: 'officinadigitale.example/workshop', email: 'eventi@officinadigitale.example', telefono: '049 222 3344' }
    },
    portfolioDay: {
      categoria: 'eventi', compiti: ['portfolio', 'workshop', 'community'],
      nome: 'Portfolio Review Day',
      ente: 'Meetup UX Padova',
      sigla: 'UX', tono: 1,
      immagine: 'assets/opportunita/foto/portfolioDay.jpg', logo: 'assets/opportunita/loghi/meetup.png',
      citta: 'Padova', indirizzo: 'Piazza dei Signori 1, Padova', distanza: '0,9 km', pos: { x: 45, y: 30 },
      modalita: 'In presenza', durata: 'Mattina', prezzo: 'Gratis', inizio: 'Domenica 26 ottobre · 10:00', lingua: 'Italiano',
      data: { giorno: '26', mese: 'OTT', ora: '10:00' },
      posti: 'Prenotazione necessaria',
      partecipanti: 64,
      rating: 4.9, recensioni: 21, affinita: 90,
      perche: 'Designer esperti guardano il tuo portfolio e ti danno consigli',
      percheLungo: 'Designer che lavorano negli studi guardano il tuo portfolio e ti dicono cosa migliorare. Un parere esperto adesso ti fa risparmiare mesi di tentativi. È gratis e in centro a Padova.',
      sponsorizzato: false
    },
    festival: {
      categoria: 'eventi', compiti: ['workshop', 'community', 'talk'],
      nome: 'Festival del Design Digitale',
      ente: 'Padova Congressi',
      sigla: 'FDD', tono: 3,
      immagine: 'assets/opportunita/foto/festival.jpg', logo: 'assets/opportunita/loghi/padova-congressi.png',
      citta: 'Padova', indirizzo: 'Via Tommaseo 59, Padova', distanza: '2,2 km', pos: { x: 64, y: 58 },
      modalita: 'In presenza', durata: '3 giorni', prezzo: '€ 15', inizio: '8-10 novembre 2026', lingua: 'Italiano e inglese',
      data: { giorno: '8', mese: 'NOV', ora: '9:30' },
      partecipanti: 2300,
      rating: 4.6, recensioni: 180, affinita: 81,
      perche: 'Talk, studi e aziende: il posto giusto per farti conoscere',
      percheLungo: 'In tre giorni incontri studi, aziende e designer da tutta Italia. È il posto giusto per capire come lavorano e per farti conoscere. Il biglietto costa solo 15 €.',
      sponsorizzato: false
    },

    /* --- LIBRI -------------------------------------------------------- */
    caffettiera: {
      categoria: 'libri', compiti: ['libri'],
      nome: 'La caffettiera del masochista',
      ente: 'Donald A. Norman · Giunti',
      sigla: 'DN', tono: 4,
      immagine: 'assets/opportunita/foto/caffettiera.jpg', logo: 'assets/opportunita/loghi/giunti.png',
      citta: '', indirizzo: '', distanza: '', pos: null,
      modalita: 'Libro', durata: '320 pagine', prezzo: '€ 16', inizio: '', lingua: 'Italiano',
      rating: 4.6, recensioni: 2800, affinita: 90,
      perche: 'Il classico che spiega perché alcuni oggetti sono facili da usare',
      percheLungo: 'È il libro da cui partono quasi tutti i designer. Spiega con esempi di tutti i giorni perché alcuni oggetti sono facili da usare e altri no. Si legge bene anche se parti da zero.',
      sponsorizzato: false,
      letto: true,
      descrizione: 'Perché certe porte si spingono quando andrebbero tirate? Norman spiega con esempi di tutti i giorni i principi del buon design.',
      contatti: { sito: 'giunti.example', email: '', telefono: '' }
    },
    dontthink: {
      categoria: 'libri', compiti: ['libri'],
      nome: 'Don’t Make Me Think',
      ente: 'Steve Krug · New Riders',
      sigla: 'SK', tono: 5,
      immagine: 'assets/opportunita/foto/dontthink.jpg', logo: 'assets/opportunita/loghi/pearson.svg',
      citta: '', indirizzo: '', distanza: '', pos: null,
      modalita: 'Libro', durata: '216 pagine', prezzo: '€ 28', inizio: '', lingua: 'Inglese',
      rating: 4.7, recensioni: 5100, affinita: 88,
      perche: 'Si legge in un weekend ed è pieno di esempi sul web',
      percheLungo: 'È corto, pieno di immagini e si legge in un weekend. Ti insegna a guardare un sito con gli occhi di chi lo usa. È in inglese, ma semplice.',
      sponsorizzato: false,
      letto: true
    },

    /* --- LAVORO ------------------------------------------------------- */
    freelance: {
      categoria: 'lavoro', compiti: [],
      nome: 'Grafiche per i social, collaborazione',
      ente: 'Libreria Il Portico',
      sigla: 'IP', tono: 4,
      immagine: 'assets/opportunita/foto/freelance.jpg', logo: 'assets/opportunita/loghi/libreria-il-portico.svg',
      citta: 'Padova', indirizzo: 'Via Roma 12, Padova', distanza: '0,6 km', pos: { x: 49, y: 50 },
      modalita: 'Ibrido', durata: '5 ore a settimana', prezzo: '€ 15 / ora', inizio: 'Subito', lingua: 'Italiano',
      contratto: 'Collaborazione occasionale',
      pubblicato: '2 giorni fa',
      rating: 4.4, recensioni: 12, affinita: 89,
      perche: 'Poche ore, compatibili con lo studio: il tuo primo lavoro da designer',
      percheLungo: 'Sono poche ore a settimana e puoi lavorare anche da casa, quindi va d’accordo con la scuola. Sarebbe il tuo primo lavoro da designer: un cliente vero da mettere nel curriculum.',
      sponsorizzato: false,
      adatto: 'Compatibile con lo studio'
    },
    partFrame: {
      categoria: 'lavoro', compiti: ['lavoroJunior'],
      nome: 'Junior UI Designer part-time',
      ente: 'Agenzia Frame',
      sigla: 'F', tono: 1,
      immagine: 'assets/opportunita/foto/partFrame.jpg', logo: 'assets/opportunita/loghi/agenzia-frame.svg',
      citta: 'Padova', indirizzo: 'Corso Milano 20, Padova', distanza: '1,5 km', pos: { x: 26, y: 56 },
      modalita: 'Ibrido', durata: 'Part-time, 20 ore', prezzo: '€ 12.000 / anno', inizio: 'Novembre 2026', lingua: 'Italiano',
      contratto: 'Apprendistato',
      pubblicato: '5 giorni fa',
      rating: 4.2, recensioni: 18, affinita: 82,
      perche: 'Part-time: puoi farlo mentre finisci gli studi',
      percheLungo: 'Sono 20 ore a settimana, quindi puoi farlo mentre finisci gli studi. Lavori su interfacce vere accanto a designer esperti. L’agenzia è a 1,5 km da casa tua.',
      sponsorizzato: false,
      adatto: 'Compatibile con lo studio'
    },
    tirLumen: {
      categoria: 'lavoro', compiti: ['tirocinio'],
      nome: 'Tirocinio UX/UI Designer',
      ente: 'Studio Lumen',
      sigla: 'L', tono: 2,
      immagine: 'assets/opportunita/foto/tirLumen.jpg', logo: 'assets/opportunita/loghi/studio-lumen.svg',
      citta: 'Padova', indirizzo: 'Via Niccolò Tommaseo 12, Padova', distanza: '2,0 km', pos: { x: 55, y: 64 },
      modalita: 'In presenza', durata: '6 mesi', prezzo: 'Rimborso € 800 / mese', inizio: 'Gennaio 2027', lingua: 'Italiano',
      contratto: 'Tirocinio extracurricolare',
      pubblicato: '3 giorni fa',
      rating: 4.7, recensioni: 23, affinita: 91,
      perche: 'Uno studio piccolo dove segui i progetti dall’inizio alla fine',
      percheLungo: 'In uno studio piccolo segui i progetti dall’inizio alla fine, non solo un pezzo. Hai un senior che ti affianca e c’è la possibilità di essere assunto. Ti conviene allo step 2 del tuo percorso.',
      sponsorizzato: false,
      adatto: 'Per lo step 2',
      descrizione: 'Studio Lumen progetta app e servizi digitali per aziende del Nordest. Cerchiamo una persona curiosa che voglia imparare il mestiere su progetti veri.',
      punti: ['Affiancamento con un senior', 'Progetti per clienti veri', 'Possibilità di assunzione', 'Buoni pasto'],
      contatti: { sito: 'studiolumen.example/lavora-con-noi', email: 'jobs@studiolumen.example', telefono: '049 555 1122' }
    },
    stagePixel: {
      categoria: 'lavoro', compiti: ['tirocinio'],
      nome: 'Stage Product Designer',
      ente: 'Pixel Nord',
      sigla: 'PN', tono: 3,
      immagine: 'assets/opportunita/foto/stagePixel.jpg', logo: 'assets/opportunita/loghi/pixel-nord.svg',
      citta: 'Vicenza', indirizzo: 'Viale Mazzini 5, Vicenza', distanza: '33 km', pos: null,
      modalita: 'Ibrido', durata: '6 mesi', prezzo: 'Rimborso € 600 / mese', inizio: 'Febbraio 2027', lingua: 'Italiano e inglese',
      contratto: 'Tirocinio extracurricolare',
      pubblicato: '1 settimana fa',
      rating: 4.3, recensioni: 31, affinita: 80,
      perche: 'Azienda di prodotto con un team di design interno',
      percheLungo: 'Pixel Nord fa prodotti suoi e ha un team di design interno: impari come si cura un prodotto nel tempo. È a Vicenza, ma puoi lavorare anche da casa. Ti conviene allo step 2 del tuo percorso.',
      sponsorizzato: false,
      adatto: 'Per lo step 2'
    }
  },

  /* ======================================================================
     IN PRIMO PIANO (dashboard)
     tipo: compito | opportunita | notizia
     ====================================================================== */
  primoPiano: [
    { tipo: 'compito', id: 'diploma', etichetta: 'Da fare adesso' },
    { tipo: 'opportunita', id: 'workshopAi', etichetta: 'Evento vicino a te' },
    { tipo: 'opportunita', id: 'aiDesigner', etichetta: 'Corso consigliato' },
    { tipo: 'notizia', id: 'notiziaAi', etichetta: 'Notizia' },
    { tipo: 'opportunita', id: 'freelance', etichetta: 'Lavoro compatibile con lo studio' }
  ],

  notizie: {
    notiziaAi: {
      titolo: 'Le aziende cercano designer che sappiano usare l’AI',
      testo: 'Negli annunci per designer la parola “AI” compare tre volte più spesso rispetto a un anno fa.',
      fonte: 'Osservatorio Navida',
      quando: '2 giorni fa',
      icona: 'newspaper',
      tono: 3
    }
  },

  /* ======================================================================
     MAPPA
     Una pianta disegnata di Padova: le posizioni sono in % (x da sinistra,
     y dall'alto). Le opportunità con pos null non stanno sulla mappa.
     ====================================================================== */
  mappa: {
    citta: 'Padova',
    tu: { x: 47, y: 47 },
    raggio: '5 km'
  },

  /* ======================================================================
     CURRICULUM (profilo)
     ====================================================================== */
  curriculum: {
    titoloStudio: 'Diploma di liceo artistico',
    formazione: [
      { titolo: 'Diploma in Interaction Design', ente: 'SID · Scuola Italiana Design', periodo: '2025 – in corso', nota: '2° anno' },
      { titolo: 'Diploma di liceo artistico, indirizzo grafica', ente: 'Liceo artistico, Padova', periodo: '2017 – 2022', nota: 'Voto 88/100' }
    ],
    certificazioni: [
      { titolo: 'Google UX Design', ente: 'Coursera', periodo: 'Maggio 2026' },
      { titolo: 'Inglese B2 (First)', ente: 'Cambridge English', periodo: 'Giugno 2022' }
    ],
    esperienze: [
      { titolo: 'Grafico per eventi, volontario', ente: 'Associazione Culturale Pavanella', periodo: '2023 – oggi', nota: 'Locandine e post per i social' },
      { titolo: 'Commesso part-time', ente: 'Libreria Il Portico', periodo: '2022 – 2024', nota: 'Vendita e allestimento vetrine' }
    ],
    competenze: ['Figma', 'Adobe Illustrator', 'Prototipazione', 'Ricerca utente', 'HTML e CSS di base'],
    softSkill: ['Empatia', 'Curiosità', 'Lavoro in squadra', 'Problem solving', 'Comunicazione'],
    lingue: [
      { lingua: 'Italiano', livello: 'Madrelingua' },
      { lingua: 'Inglese', livello: 'B2' }
    ],
    cvCaricato: null,
    portfolio: null
  },

  /* ======================================================================
     PREFERENZE (valori iniziali)
     ====================================================================== */
  preferenze: {
    tema: 'sistema',              /* chiaro | scuro | sistema */
    notifichePush: true,
    notificheEmail: true,
    promemoria: true,
    nuoveOpportunita: true,
    riepilogoSettimanale: false,
    lingua: 'Italiano',
    dimensioneTesto: 'normale',   /* piccolo | normale | grande */
    riduciAnimazioni: false,
    altoContrasto: false,
    profiloVisibileAziende: false,
    posizione: true
  },

  /* ======================================================================
     NOTIFICHE (campanella)
     ====================================================================== */
  notifiche: [
    { icona: 'calendar-days', tono: 5, titolo: 'Il workshop è tra 3 giorni', testo: 'Prototipare con l’AI, mercoledì alle 18:30. Restano 12 posti.', quando: '2 ore fa', nuova: true },
    { icona: 'circle-check', tono: 1, titolo: 'Compito completato', testo: 'Hai segnato “Impara Figma e la prototipazione” come fatto. Sei a 2 compiti su 6.', quando: 'Ieri', nuova: true },
    { icona: 'graduation-cap', tono: 1, titolo: 'Iscrizioni in scadenza', testo: 'Le iscrizioni al Diploma in Interaction Design chiudono il 30 settembre.', quando: '2 giorni fa', nuova: false },
    { icona: 'briefcase-business', tono: 3, titolo: 'Nuova offerta per te', testo: 'Libreria Il Portico cerca qualcuno per le grafiche dei social. Compatibile con lo studio.', quando: '3 giorni fa', nuova: false },
    { icona: 'user', tono: 2, titolo: 'Completa il curriculum', testo: 'Aggiungi il portfolio: ricevi suggerimenti più precisi.', quando: '1 settimana fa', nuova: false }
  ]
};
