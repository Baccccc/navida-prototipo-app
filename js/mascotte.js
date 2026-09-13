/* ==========================================================================
   NAVIDA — Mascotte (astronauta)
   ==========================================================================
   Le illustrazioni stanno in  assets/  con il nome  mascotte-<posa>.png
   Le pose disponibili sono elencate in POSE qui sotto.

   Per aggiungerne una nuova:
     1. Metti il PNG in assets/ come  mascotte-<nome>.png
     2. Aggiungi <nome> a POSE
     3. Aggiungi l'etichetta in LABEL e la proporzione (larghezza/altezza)
        in RATIO
     4. Aggiungi la voce anche in js/variants.js -> mascotte.options

   Funziona anche con .svg o .webp: cambia l'estensione in FORMATO qui sotto.

   Finche' il file non c'e', viene disegnato un segnaposto grigio con il nome
   della posa, cosi' e' evidente che manca l'asset (invece di mostrare un
   disegno sbagliato).
   ========================================================================== */

(function () {
  'use strict';

  var CARTELLA = 'assets/';
  var FORMATO = '.png';

  var POSE = [
    'salutare', 'indicare', 'saltare', 'tablet',
    'computer', 'ok', 'leggere', 'matita',
    'calcolare', 'volare', 'zaino', 'stretta-mano',
    'aiuto', 'allarme', 'braccia-incrociate', 'caffe-relax',
    'camminare-e-salutare', 'clessidra', 'coriandoli', 'cronometro-corsa',
    'cuffia-2', 'cuffie', 'cyber-security', 'dormire',
    'festeggiare', 'foto', 'freddo', 'freddo-braccia-incrociate',
    'giardinaggio', 'jetpack', 'laptop-sdraiato', 'laptop-seduto',
    'laureato', 'lente-ingrandimento', 'mappa', 'mappa-2',
    'meccanico', 'meditazione', 'megafono', 'non-so',
    'pace-e-cuore', 'palloncini', 'pensare', 'pianeta-palloncino',
    'pioggia-ombrello', 'pizza', 'pregare', 'prendere-la-stella',
    'razzo', 'regalo', 'reggere-pianeta', 'relax-sedia',
    'skateboard', 'snack-su-saturno', 'supereroe', 'toccare-la-luna',
    'trofeo'
  ];

  /* etichette per la barra di modifica */
  var LABEL = {
    'salutare':                  'Salutare',
    'indicare':                  'Indice',
    'saltare':                   'Saltare',
    'tablet':                    'Tablet',
    'computer':                  'Computer',
    'ok':                        'OK',
    'leggere':                   'Leggere',
    'matita':                    'Matita',
    'calcolare':                 'Calcolare',
    'volare':                    'Volare',
    'zaino':                     'Zaino strumenti',
    'stretta-mano':              'Stringere la mano',
    'aiuto':                     'Aiuto',
    'allarme':                   'Allarme',
    'braccia-incrociate':        'Braccia incrociate',
    'caffe-relax':               'Caffe relax',
    'camminare-e-salutare':      'Camminare e salutare',
    'clessidra':                 'Clessidra',
    'coriandoli':                'Coriandoli',
    'cronometro-corsa':          'Cronometro corsa',
    'cuffia-2':                  'Cuffia 2',
    'cuffie':                    'Cuffie',
    'cyber-security':            'Cyber Security',
    'dormire':                   'Dormire',
    'festeggiare':               'Festeggiare',
    'foto':                      'Foto',
    'freddo':                    'Freddo',
    'freddo-braccia-incrociate': 'Freddo braccia incrociate',
    'giardinaggio':              'Giardinaggio',
    'jetpack':                   'Jetpack',
    'laptop-sdraiato':           'Laptop sdraiato',
    'laptop-seduto':             'Laptop seduto',
    'laureato':                  'Laureato',
    'lente-ingrandimento':       'Lente ingrandimento',
    'mappa':                     'Mappa',
    'mappa-2':                   'Mappa 2',
    'meccanico':                 'Meccanico',
    'meditazione':               'Meditazione',
    'megafono':                  'Megafono',
    'non-so':                    'Non so',
    'pace-e-cuore':              'Pace e cuore',
    'palloncini':                'Palloncini',
    'pensare':                   'Pensare',
    'pianeta-palloncino':        'Pianeta palloncino',
    'pioggia-ombrello':          'Pioggia ombrello',
    'pizza':                     'Pizza',
    'pregare':                   'Pregare',
    'prendere-la-stella':        'Prendere la stella',
    'razzo':                     'Razzo',
    'regalo':                    'Regalo',
    'reggere-pianeta':           'Reggere pianeta',
    'relax-sedia':               'Relax sedia',
    'skateboard':                'Skateboard',
    'snack-su-saturno':          'Snack su Saturno',
    'supereroe':                 'Supereroe',
    'toccare-la-luna':           'Toccare la luna',
    'trofeo':                    'Trofeo'
  };

  /* proporzioni reali dei file in assets/ */
  var RATIO = {
    'salutare':                  0.7386,
    'indicare':                  0.7091,
    'saltare':                   0.6682,
    'tablet':                    0.6000,
    'computer':                  0.7659,
    'ok':                        0.6205,
    'leggere':                   0.6205,
    'matita':                    0.8682,
    'calcolare':                 0.4318,
    'volare':                    0.6045,
    'zaino':                     0.7159,
    'stretta-mano':              1.1364,
    'aiuto':                     1.1333,
    'allarme':                   0.9241,
    'braccia-incrociate':        0.9002,
    'caffe-relax':               1.2628,
    'camminare-e-salutare':      0.7500,
    'clessidra':                 0.9525,
    'coriandoli':                0.6667,
    'cronometro-corsa':          0.9139,
    'cuffia-2':                  0.8003,
    'cuffie':                    0.6667,
    'cyber-security':            0.6667,
    'dormire':                   0.9139,
    'festeggiare':               0.7412,
    'foto':                      0.9624,
    'freddo':                    0.6667,
    'freddo-braccia-incrociate': 0.6667,
    'giardinaggio':              0.9367,
    'jetpack':                   0.5388,
    'laptop-sdraiato':           1.2253,
    'laptop-seduto':             0.8239,
    'laureato':                  0.6667,
    'lente-ingrandimento':       0.9278,
    'mappa':                     0.6667,
    'mappa-2':                   0.9525,
    'meccanico':                 0.9139,
    'meditazione':               0.9352,
    'megafono':                  0.9139,
    'non-so':                    0.8937,
    'pace-e-cuore':              0.8519,
    'palloncini':                0.7828,
    'pensare':                   0.7796,
    'pianeta-palloncino':        0.6201,
    'pioggia-ombrello':          0.6667,
    'pizza':                     0.8787,
    'pregare':                   0.9002,
    'prendere-la-stella':        0.8062,
    'razzo':                     0.7013,
    'regalo':                    0.9624,
    'reggere-pianeta':           0.6982,
    'relax-sedia':               0.6950,
    'skateboard':                0.9221,
    'snack-su-saturno':          0.7154,
    'supereroe':                 1.0598,
    'toccare-la-luna':           0.8819,
    'trofeo':                    0.6667
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
