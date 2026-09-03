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

window.NAVIDA_PAGE_VARIANTS.dashboard = {
  etichetta: 'Stato della Home',
  predefinita: 'attiva',
  options: [
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
