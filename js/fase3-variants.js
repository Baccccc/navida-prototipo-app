/* Versioni della linea di carriera presenti nella pagina Figma dedicata. */
window.NAVIDA_PAGE_VARIANTS.percorso = {
  etichetta: 'Versione della linea di carriera',
  predefinita: 'lista',
  options: [
    { value: 'lista', label: 'Lista step' },
    { value: 'serpentina', label: 'Serpentina' },
    { value: 'outline', label: 'Serpentina outline' },
    { value: 'attiva', label: 'Serpentina attiva' }
  ]
};

/* Versioni della dashboard.
   "Da flusso" e' quella descritta nel FigJam (3.1): linea di carriera
   compressa senza percentuale, step di adesso con obiettivi, "In primo
   piano" e le scorciatoie Formazione / Lavoro. E' la predefinita; le
   altre due restano selezionabili dal pannello Versione. */
window.NAVIDA_PAGE_VARIANTS.dashboard = {
  etichetta: 'Versione della Home',
  predefinita: 'flusso',
  options: [
    { value: 'flusso', label: 'Da flusso' },
    { value: 'attiva', label: 'Con percorso' },
    { value: 'vuota', label: 'Primo accesso' }
  ]
};

window.NAVIDA_PAGE_VARIANTS.notifiche = {
  etichetta: 'Stato delle notifiche',
  predefinita: 'attive',
  options: [
    { value: 'attive', label: 'Con notifiche' },
    { value: 'vuote', label: 'Stato vuoto' }
  ]
};
