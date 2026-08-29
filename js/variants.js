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
    predefinita: 'titolo',
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

  /* Mascotte (astronauta) — 12 pose reali in assets/ */
  mascotte: {
    etichetta: 'Mascotte',
    attr: 'data-variant',
    predefinita: 'auto',
    options: [
      { value: 'auto',         label: 'Come da progetto' },
      { value: 'salutare',     label: 'Saluta' },
      { value: 'indicare',     label: 'Indica' },
      { value: 'saltare',      label: 'Salta' },
      { value: 'tablet',       label: 'Tablet' },
      { value: 'computer',     label: 'Computer' },
      { value: 'ok',           label: 'Pollice su' },
      { value: 'leggere',      label: 'Legge' },
      { value: 'matita',       label: 'Matita' },
      { value: 'calcolare',    label: 'Calcola' },
      { value: 'volare',       label: 'Vola' },
      { value: 'zaino',        label: 'Zaino strumenti' },
      { value: 'stretta-mano', label: 'Stretta di mano' },
      { value: 'nascosta',     label: 'Nascosta' }
    ]
  },

  /* Card dei consigli nella prima proiezione */
  tips: {
    etichetta: 'Stile consigli',
    attr: 'data-variant',
    predefinita: 'default',
    options: [
      { value: 'default', label: 'Card' },
      { value: 'plain',   label: 'Righe divise' },
      { value: 'accent',  label: 'Colorate' }
    ]
  },

  /* Linea di carriera */
  path: {
    etichetta: 'Stile linea di carriera',
    attr: 'data-variant',
    predefinita: 'serpentina',
    options: [
      { value: 'serpentina', label: 'Serpentina animata' },
      { value: 'filo',       label: 'Filo con tappa in rilievo' },
      { value: 'curva',      label: 'Curva oggi → obiettivo' },
      { value: 'default',    label: 'Timeline (vecchia)' },
      { value: 'card',       label: 'Card (vecchia)' },
      { value: 'compact',    label: 'Compatta (vecchia)' }
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
  registrazione: {
    etichetta: 'Versione della schermata di accesso',
    predefinita: 'essenziale',
    options: [
      { value: 'essenziale', label: 'Essenziale' },
      { value: 'compatta',   label: 'Compatta' },
      { value: 'centrata',   label: 'Centrata' },
      { value: 'social',     label: 'Social first' },
      { value: 'copertina',  label: 'Con copertina' },
      { value: 'pagina',     label: 'Pagina semplice' },
      { value: 'sheet',      label: 'Bottom sheet' },
      { value: 'popup',      label: 'Popup centrato' },
      { value: 'header',     label: 'Sheet header viola' }
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
     quello delle schermate di domanda. Le prime tre versioni rispondono
     a questo; le ultime due restano per confronto. */
  previsione: {
    etichetta: 'Versione della prima proiezione',
    predefinita: 'voce',
    options: [
      { value: 'voce',     label: 'Navida ti parla' },
      { value: 'verdetto', label: 'Verdetto grande' },
      { value: 'prova',    label: 'Verdetto con prova' },
      { value: 'tips',     label: 'Tre consigli (vecchia)' },
      { value: 'single',   label: 'Messaggio unico (vecchia)' }
    ]
  }
};
