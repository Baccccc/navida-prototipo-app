/* ==========================================================================
   NAVIDA — Mascotte (astronauta)
   ==========================================================================
   Le illustrazioni vere vanno messe in  assets/  con questi nomi esatti:

       assets/mascotte-salutare.png
       assets/mascotte-tablet.png
       assets/mascotte-saltare.png
       assets/mascotte-indicare.png
       assets/mascotte-computer.png

   Come esportarle da Figma (30 secondi):
     1. File "Prototipo interattivo Navida" -> pagina "Schermate statiche"
     2. Sezione UI kit -> component set "Mascotte" (5 varianti)
     3. Seleziona tutte e 5 le varianti
     4. Pannello destro -> Export -> PNG -> 2x -> Export
     5. Rinomina i file come sopra e mettili nella cartella assets/

   Funziona anche con .svg o .webp: cambia l'estensione in FORMATO qui sotto.

   Finché i file non ci sono, viene disegnato un segnaposto grigio con il nome
   della posa, così è evidente che manca l'asset (invece di mostrare un
   disegno sbagliato).
   ========================================================================== */

(function () {
  'use strict';

  var CARTELLA = 'assets/';
  var FORMATO = '.png';

  var POSE = [
    'salutare', 'indicare', 'saltare', 'tablet', 'computer', 'ok',
    'leggere', 'matita', 'calcolare', 'volare', 'zaino', 'stretta-mano'
  ];

  /* etichette per la barra di modifica */
  var LABEL = {
    'salutare': 'Saluta',
    'indicare': 'Indica',
    'saltare': 'Salta',
    'tablet': 'Tablet',
    'computer': 'Computer',
    'ok': 'Pollice su',
    'leggere': 'Legge',
    'matita': 'Matita',
    'calcolare': 'Calcola',
    'volare': 'Vola',
    'zaino': 'Zaino strumenti',
    'stretta-mano': 'Stretta di mano'
  };

  /* proporzioni reali dei file in assets/ */
  var RATIO = {
    'salutare': 0.7379,
    'indicare': 0.7094,
    'saltare': 0.6691,
    'tablet': 0.6007,
    'computer': 0.7650,
    'ok': 0.6213,
    'leggere': 0.6194,
    'matita': 0.8681,
    'calcolare': 0.4324,
    'volare': 0.6041,
    'zaino': 0.7152,
    'stretta-mano': 1.1362
  };

  var disponibili = {};   // posa -> true/false, riempito al volo

  function url(posa) {
    return CARTELLA + 'mascotte-' + posa + FORMATO;
  }

  /** Segnaposto mostrato quando il file non c'è. */
  function segnaposto(posa) {
    return '' +
      '<svg viewBox="0 0 122 169" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mascotte mancante">' +
        '<rect x="1" y="1" width="120" height="167" rx="12" fill="#f1f0f8" stroke="#cbc7e0" stroke-width="1.5" stroke-dasharray="5 4"/>' +
        '<circle cx="61" cy="66" r="26" fill="#e3e3f9"/>' +
        '<circle cx="61" cy="66" r="18" fill="#cbc7e0"/>' +
        '<text x="61" y="118" text-anchor="middle" font-family="Atkinson Hyperlegible Next, sans-serif" font-size="11" font-weight="600" fill="#8d87ad">mascotte</text>' +
        '<text x="61" y="133" text-anchor="middle" font-family="Atkinson Hyperlegible Next, sans-serif" font-size="10" fill="#a9a4c2">' + posa + '</text>' +
        '<text x="61" y="150" text-anchor="middle" font-family="Atkinson Hyperlegible Next, sans-serif" font-size="8" fill="#b8b4cc">manca il file</text>' +
      '</svg>';
  }

  /**
   * Restituisce un elemento pronto da inserire.
   * Prova a caricare il PNG; se non c'è, sostituisce col segnaposto.
   */
  function elemento(posa) {
    posa = POSE.indexOf(posa) === -1 ? 'indicare' : posa;

    var box = document.createElement('div');
    box.style.width = '100%';
    box.style.height = '100%';

    if (disponibili[posa] === false) {
      box.innerHTML = segnaposto(posa);
      return box;
    }

    var img = document.createElement('img');
    img.alt = 'Astronauta Navida';
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = url(posa);
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';

    img.addEventListener('load', function () { disponibili[posa] = true; });
    img.addEventListener('error', function () {
      disponibili[posa] = false;
      box.innerHTML = segnaposto(posa);
    });

    box.appendChild(img);
    return box;
  }

  /** Versione stringa, per i punti in cui serve HTML e non un nodo. */
  function html(posa) {
    posa = POSE.indexOf(posa) === -1 ? 'indicare' : posa;
    if (disponibili[posa] === false) return segnaposto(posa);
    return '<img src="' + url(posa) + '" alt="Astronauta Navida" ' +
           'style="width:100%;height:100%;object-fit:contain;display:block" ' +
           'onerror="this.parentNode.innerHTML=window.NavidaMascotte.segnaposto(\'' + posa + '\')">';
  }

  window.NavidaMascotte = {
    pose: html,          // compatibilità con il codice esistente
    elemento: elemento,
    segnaposto: segnaposto,
    ratio: RATIO,
    label: LABEL,
    lista: POSE
  };
})();
