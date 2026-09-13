/* ==========================================================================
   NAVIDA — Varianti di stile
   ==========================================================================
   Ogni gruppo qui sotto diventa una scelta nella barra di modifica, sotto
   "Elemento". Selezionando un elemento nella schermata compaiono solo le
   varianti del suo gruppo.

   Per aggiungerne una nuova basta aggiungere una voce a `options` e, se
   serve un aspetto diverso, una regola CSS in app.css che usi il selettore
   [data-variant="nomeVariante"].
   ========================================================================== */

window.NAVIDA_VARIANTS = {

  /* Lista delle risposte di una domanda */
  answerList: {
    etichetta: 'Stile lista risposte',
    attr: 'data-variant',
    predefinita: 'default',
    options: [
      { value: 'default',  label: 'Riquadri' },
      { value: 'grid',     label: 'Card con icone' },
      { value: 'riga',     label: 'Riga con icona' },
      { value: 'card',     label: 'Card' },
      { value: 'divided',  label: 'Righe divise' },
      { value: 'soft',     label: 'Morbido' },
      { value: 'pill',     label: 'Pillole' }
    ]
  },

  /* Come si disegnano le schermate di racconto (mascotte + testo).
     Nasce dal riferimento Duolingo portato dal team: fumetto sopra la
     mascotte per le frasi corte, mascotte sopra il testo per quelle
     lunghe, fumetto in riga con elenco a icone quando ci sono punti. */
  intro: {
    etichetta: 'Schermata di racconto',
    attr: 'data-variant',
    predefinita: 'auto',
    options: [
      { value: 'auto',     label: 'Automatica (consigliata)' },
      { value: 'fumetto',  label: 'Fumetto sopra la mascotte' },
      { value: 'sopra',    label: 'Mascotte sopra, testo sotto' },
      { value: 'elenco',   label: 'Fumetto in riga + elenco' },
      { value: 'classica', label: 'Classica (com’era prima)' }
    ]
  },

  /* Da che lato stanno spunta e maniglia */
  latoControlli: {
    etichetta: 'Lato di spunta e maniglia',
    attr: 'data-lato',
    predefinita: 'sinistra',
    options: [
      { value: 'sinistra', label: 'A sinistra' },
      { value: 'destra',   label: 'A destra' }
    ]
  },

  /* Chi fa la domanda */
  domanda: {
    etichetta: 'Come si presenta la domanda',
    attr: 'data-variant',
    predefinita: 'mascotte',
    options: [
      { value: 'titolo',   label: 'Titolo semplice' },
      { value: 'mascotte', label: 'Mascotte con fumetto' }
    ]
  },

  /* Barra di avanzamento */
  progress: {
    etichetta: 'Barra di avanzamento',
    attr: 'data-variant',
    predefinita: 'bar',
    options: [
      { value: 'bar',    label: 'Barra' },
      { value: 'dots',   label: 'Pallini' },
      { value: 'steps',  label: 'Segmenti' },
      { value: 'hidden', label: 'Nascosta' }
    ]
  },

  /* Titolo della schermata */
  title: {
    etichetta: 'Titolo',
    attr: 'data-variant',
    predefinita: 'center',
    options: [
      { value: 'center', label: 'Centrato' },
      { value: 'left',   label: 'Allineato a sinistra' },
      { value: 'lg',     label: 'Grande' }
    ]
  },

  /* Pulsante principale — stati presi dal component set "Button Primary" */
  cta: {
    etichetta: 'Pulsante',
    attr: 'data-variant',
    predefinita: 'solid',
    options: [
      { value: 'solid',       label: 'CTA' },
      { value: 'outline',     label: 'Outline' },
      { value: 'passivo',     label: 'Passivo' },
      { value: 'transparent', label: 'Trasparente' },
      { value: 'dark',        label: 'Scuro' },
      { value: 'soft',        label: 'Morbido' }
    ]
  },

  /* Mascotte (astronauta) — tutte le pose reali in assets/ */
  mascotte: {
    etichetta: 'Mascotte',
    attr: 'data-variant',
    predefinita: 'auto',
    options: [
      { value: 'auto', label: 'Come da progetto' },
      { value: 'salutare',                   label: 'Salutare' },
      { value: 'indicare',                   label: 'Indice' },
      { value: 'saltare',                    label: 'Saltare' },
      { value: 'tablet',                     label: 'Tablet' },
      { value: 'computer',                   label: 'Computer' },
      { value: 'ok',                         label: 'OK' },
      { value: 'leggere',                    label: 'Leggere' },
      { value: 'matita',                     label: 'Matita' },
      { value: 'calcolare',                  label: 'Calcolare' },
      { value: 'volare',                     label: 'Volare' },
      { value: 'zaino',                      label: 'Zaino strumenti' },
      { value: 'stretta-mano',               label: 'Stringere la mano' },
      { value: 'aiuto',                      label: 'Aiuto' },
      { value: 'allarme',                    label: 'Allarme' },
      { value: 'braccia-incrociate',         label: 'Braccia incrociate' },
      { value: 'caffe-relax',                label: 'Caffe relax' },
      { value: 'camminare-e-salutare',       label: 'Camminare e salutare' },
      { value: 'clessidra',                  label: 'Clessidra' },
      { value: 'coriandoli',                 label: 'Coriandoli' },
      { value: 'cronometro-corsa',           label: 'Cronometro corsa' },
      { value: 'cuffia-2',                   label: 'Cuffia 2' },
      { value: 'cuffie',                     label: 'Cuffie' },
      { value: 'cyber-security',             label: 'Cyber Security' },
      { value: 'dormire',                    label: 'Dormire' },
      { value: 'festeggiare',                label: 'Festeggiare' },
      { value: 'foto',                       label: 'Foto' },
      { value: 'freddo',                     label: 'Freddo' },
      { value: 'freddo-braccia-incrociate',  label: 'Freddo braccia incrociate' },
      { value: 'giardinaggio',               label: 'Giardinaggio' },
      { value: 'jetpack',                    label: 'Jetpack' },
      { value: 'laptop-sdraiato',            label: 'Laptop sdraiato' },
      { value: 'laptop-seduto',              label: 'Laptop seduto' },
      { value: 'laureato',                   label: 'Laureato' },
      { value: 'lente-ingrandimento',        label: 'Lente ingrandimento' },
      { value: 'mappa',                      label: 'Mappa' },
      { value: 'mappa-2',                    label: 'Mappa 2' },
      { value: 'meccanico',                  label: 'Meccanico' },
      { value: 'meditazione',                label: 'Meditazione' },
      { value: 'megafono',                   label: 'Megafono' },
      { value: 'non-so',                     label: 'Non so' },
      { value: 'pace-e-cuore',               label: 'Pace e cuore' },
      { value: 'palloncini',                 label: 'Palloncini' },
      { value: 'pensare',                    label: 'Pensare' },
      { value: 'pianeta-palloncino',         label: 'Pianeta palloncino' },
      { value: 'pioggia-ombrello',           label: 'Pioggia ombrello' },
      { value: 'pizza',                      label: 'Pizza' },
      { value: 'pregare',                    label: 'Pregare' },
      { value: 'prendere-la-stella',         label: 'Prendere la stella' },
      { value: 'razzo',                      label: 'Razzo' },
      { value: 'regalo',                     label: 'Regalo' },
      { value: 'reggere-pianeta',            label: 'Reggere pianeta' },
      { value: 'relax-sedia',                label: 'Relax sedia' },
      { value: 'skateboard',                 label: 'Skateboard' },
      { value: 'snack-su-saturno',           label: 'Snack su Saturno' },
      { value: 'supereroe',                  label: 'Supereroe' },
      { value: 'toccare-la-luna',            label: 'Toccare la luna' },
      { value: 'trofeo',                     label: 'Trofeo' },
      { value: 'nascosta', label: 'Nascosta' }
    ]
  },

  /* Linea di carriera.
     Qui ci sono solo le tre versioni che js/percorso.js sa davvero
     disegnare: le vecchie voci "default", "card" e "compact" non
     esistevano piu' nel codice e sceglierle non cambiava niente. */
  path: {
    etichetta: 'Stile linea di carriera',
    attr: 'data-variant',
    predefinita: 'serpentina',
    options: [
      { value: 'serpentina', label: 'Serpentina animata' },
      { value: 'filo',       label: 'Filo con tappa in rilievo' },
      { value: 'curva',      label: 'Curva oggi → obiettivo' }
    ]
  },

  /* Come si mette in ordine una classifica.
     Nasce dai due commenti su b2_rank1: da telefono non si trascinava,
     e il gesto sembrava uno scambio di campi invece di un riordino. */
  rank: {
    etichetta: 'Come si mette in ordine',
    attr: 'data-variant',
    predefinita: 'maniglia',
    options: [
      { value: 'maniglia', label: 'Trascina dalla maniglia' },
      { value: 'podio',    label: 'Podio da riempire' },
      { value: 'tocca',    label: 'Tocca in ordine' }
    ]
  }
};

/* ==========================================================================
   Varianti di PAGINA — versioni alternative della stessa schermata.
   ========================================================================== */

window.NAVIDA_PAGE_VARIANTS = {
  fineTest: {
    etichetta: 'Animazione di “Il tuo percorso sta prendendo forma”',
    /* E' un'attesa, non uno spettacolo: le due versioni nello spazio girano
       in loop finche' la risposta non e' pronta. "Step che si compongono"
       e' stata tolta da Bac. */
    predefinita: 'spazio',
    options: [
      { value: 'spazio', label: 'Navicella ferma, stelle che scorrono' },
      { value: 'tappe',  label: 'Navicella che passa 5 tappe' },
      { value: 'linea',  label: 'Linea che si disegna' }
    ]
  },
  preview: {
    etichetta: 'Versione di “La tua linea di carriera”',
    predefinita: 'serpentina',
    options: [
      { value: 'lista',       label: 'Lista Figma' },
      { value: 'serpentina', label: 'Serpentina' },
      { value: 'mappa',       label: 'Mappa + dettaglio' }
    ]
  },
  tuoMomento: {
    etichetta: 'Animazione di “Ora tocca a te”',
    predefinita: 'statica',
    options: [
      { value: 'statica',     label: 'Attuale, statica' },
      { value: 'accensione',  label: 'Accensione' },
      { value: 'orbita',      label: 'Orbita' },
      { value: 'portale',     label: 'Portale' }
    ]
  },
  /* Restano le tre versioni scelte dal team. In tutte la domanda e' un
     titolo vero: si legge con il lettore di schermo e si modifica dalla
     scheda "Testi". Le altre (orbite, costellazione, portale, tunnel,
     nebulosa, pensiero) sono state tolte dalla scelta. */
  lavoroSogni: {
    etichetta: 'Animazione del lavoro dei sogni',
    predefinita: 'targhetta',
    options: [
      { value: 'targhetta', label: 'Targhetta da lavoro' },
      { value: 'insegna',   label: 'Insegna al neon' },
      { value: 'orizzonte', label: 'Orizzonte all’alba' }
    ]
  },
  /* Restano solo due versioni. Le altre (centrata, social first,
     copertina, pagina semplice e le tre a popup) sono state tolte. */
  registrazione: {
    etichetta: 'Versione della schermata di accesso',
    predefinita: 'essenziale',
    options: [
      { value: 'essenziale', label: 'Essenziale · email' },
      { value: 'compatta',   label: 'Compatta · nome e cognome' }
    ]
  },
  welcome: {
    etichetta: 'Versione della schermata di apertura',
    predefinita: 'marchio',
    options: [
      { value: 'marchio',  label: 'Marchio e payoff' },
      { value: 'gradient', label: 'Alone lavanda' },
      { value: 'split',    label: 'Copertina + card' },
      { value: 'dark',     label: 'Notturna' },
      { value: 'grande',   label: 'Mascotte grande' }
    ]
  },
  splash: {
    etichetta: 'Versione dello splash',
    predefinita: 'pieno',
    options: [
      { value: 'pieno',  label: 'Colore pieno' },
      { value: 'chiaro', label: 'Chiaro' },
      { value: 'scuro',  label: 'Scuro' }
    ]
  },
  /* Il team ha chiesto un consiglio solo, e un codice visivo diverso da
     quello delle schermate di domanda. Bac ha tolto "Verdetto grande" e
     le due vecchie (tre consigli, messaggio unico). Il 13/09/2026 ha
     tolto anche "Navida ti parla". Una scelta salvata che punta a lei
     torna da sola alla versione predefinita. */
  previsione: {
    etichetta: 'Versione della prima proiezione',
    predefinita: 'prova',
    options: [
      { value: 'prova',  label: 'Verdetto con prova' },
      { value: 'scrive', label: 'Messaggio che si scrive' }
    ]
  }
};
