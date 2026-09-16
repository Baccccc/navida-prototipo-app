/* ==========================================================================
   NAVIDA — Scheda attività
   ==========================================================================
   L'elenco delle opportunità per un compito: "Prendi un diploma in design"
   mostra tutte le scuole dove prenderlo, "Segui un corso di AI" tutti i
   corsi. La stessa schermata si apre dai due pulsanti della dashboard
   (Formazione e Lavoro): lì mostra un ambito invece di un compito.

   Ordine: prima le sponsorizzate (sempre con l'etichetta "Sponsorizzato"),
   poi dalla più adatta alla meno adatta. L'ordine lo decide
   NV.opportunitaPer; qui si può solo chiedere "più vicine" o "voto".

   L'interruttore Elenco | Mappa apre la schermata Mappa con lo stesso
   filtro: se stai guardando le scuole, la mappa mostra le scuole.

   Una versione sola, a copertine (scelta di Bac il 2026-09-16):
     - la testata del compito sta in una card, sempre con la sfumatura
       di marca (mai la scritta "La tua prossima mossa")
     - ogni opportunita': foto, logo, ente e nome, dove (solo la citta'
       oppure "Da remoto"), durata, voto e il prezzo in evidenza in fondo
     - niente frase "perche' te la consigliamo" nella scheda: la
       descrizione sta solo nella scheda info

   Parametri di prova nell'indirizzo (valgono al primo disegno):
     &compito=diploma | ai | workshop | casestudy (nessuna opzione)
     &ambito=formazione | lavoro
     &categoria=corsi          pastiglia di categoria scelta
     &modalita=online | presenza    &distanza=10 | 50    &gratis=1
     &ordina=vicine | voto     &cerca=figma
     &foglio=filtri | ordina   apre subito il pannello
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV;
  if (!NV) return;
  var h = NV.h, icon = NV.icon, ICO = NV.ICO;

  /* ==================================================================
     STATO DEI FILTRI
     ------------------------------------------------------------------
     Resta in memoria finché guardi lo stesso compito: se apri una scheda
     e torni indietro, ritrovi i filtri come li avevi lasciati. Cambiando
     compito si riparte puliti.
     ================================================================== */
  var PREDEFINITI = {
    categoria: 'tutte',
    modalita: 'tutte',
    distanza: 'tutte',
    gratis: false,
    ordina: 'adatte',
    cerca: ''
  };

  var stato = null;
  var parametriLetti = false;

  function statoPer(chiave) {
    if (stato && stato.chiave === chiave) return stato;
    stato = Object.assign({ chiave: chiave, foglio: null }, PREDEFINITI);

    /* i parametri di prova valgono solo la prima volta */
    if (!parametriLetti) {
      parametriLetti = true;
      try {
        var qs = new URLSearchParams(window.location.search);
        if (qs.get('screen') === 'attivita') {
          if (qs.get('categoria')) stato.categoria = qs.get('categoria');
          if (qs.get('modalita')) stato.modalita = qs.get('modalita');
          if (qs.get('distanza')) stato.distanza = qs.get('distanza');
          if (qs.get('gratis')) stato.gratis = true;
          if (qs.get('ordina')) stato.ordina = qs.get('ordina');
          if (qs.get('cerca')) stato.cerca = qs.get('cerca');
          if (qs.get('foglio')) stato.foglio = qs.get('foglio');
        }
      } catch (e) {}
    }
    return stato;
  }

  /* ==================================================================
     CONTESTO: un compito oppure un ambito
     ================================================================== */
  function leggiContesto() {
    var ctx = NV.contesto();
    var trovato = ctx.compito ? NV.cercaCompito(ctx.compito) : null;

    if (trovato && !ctx.ambito) {
      return {
        modo: 'compito',
        chiave: 'compito:' + trovato.compito.id,
        compito: trovato.compito,
        step: trovato.step,
        stepIndice: trovato.stepIndice,
        titolo: trovato.compito.titolo,
        descrizione: trovato.compito.descrizione,
        tutte: NV.opportunitaPer({ compito: trovato.compito.id }),
        ripiego: 'step'
      };
    }

    /* senza un compito valido si ripiega sulla Formazione */
    var nome = NV.dati.ambiti[ctx.ambito] ? ctx.ambito : 'formazione';
    var ambito = NV.dati.ambiti[nome];
    var i = ctx.step == null ? NV.stepAttuale() : ctx.step;
    return {
      modo: 'ambito',
      chiave: 'ambito:' + nome + ':' + i,
      nomeAmbito: nome,
      ambito: ambito,
      step: NV.step(i),
      stepIndice: i,
      titolo: ambito.titolo,
      descrizione: ambito.descrizione,
      tutte: NV.opportunitaPer({ ambito: nome, step: i }),
      ripiego: 'dashboard'
    };
  }

  /* ==================================================================
     LETTURA DEI DATI DI UN'OPPORTUNITÀ
     ================================================================== */

  /** "2,4 km" -> 2.4. Online e libri non hanno distanza: null. */
  function km(o) {
    if (!o.distanza) return null;
    var n = parseFloat(String(o.distanza).replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function eLibro(o) { return o.categoria === 'libri' || o.modalita === 'Libro'; }
  function eGratis(o) { return /gratis/i.test(o.prezzo || ''); }

  /** Dove si fa: solo la città, oppure Da remoto, oppure Libro. */
  function luogo(o) {
    if (eLibro(o)) return { icona: 'book-open', testo: 'Libro' };
    if (o.modalita === 'Online' || !o.citta) return { icona: 'globe', testo: 'Da remoto' };
    return { icona: 'map-pin', testo: o.citta };
  }

  /** Solo la prima parte della durata: "6 mesi, 10 ore a settimana" -> "6 mesi". */
  function durataBreve(o) { return String(o.durata || '').split(',')[0]; }

  /** Quando: la data per gli eventi, la durata per tutto il resto. */
  function quando(o) {
    if (o.data) {
      return { icona: 'calendar', testo: o.data.giorno + ' ' + String(o.data.mese).toLowerCase() + ', ' + o.data.ora };
    }
    if (!o.durata) return null;
    return { icona: eLibro(o) ? 'file-text' : 'clock', testo: durataBreve(o) };
  }

  /**
   * Il prezzo diviso in tre pezzi, per dare peso solo alla cifra:
   *   "€ 6.900 / anno"        -> ""          "€ 6.900"  "/ anno"
   *   "da € 900 / anno"       -> "da"        "€ 900"    "/ anno"
   *   "Rimborso € 800 / mese" -> "Rimborso"  "€ 800"    "/ mese"
   *   "Gratis, finanziato"    -> ""          "Gratis"   "finanziato"
   */
  function prezzoParti(p) {
    p = String(p || '').trim();
    if (!p) return null;
    if (/^gratis/i.test(p)) {
      return { prima: '', cifra: 'Gratis', dopo: p.replace(/^gratis[,\s]*/i, '') };
    }
    var m = p.match(/^(.*?)(€\s?[\d.,]+)\s*(.*)$/);
    if (!m) return { prima: '', cifra: p, dopo: '' };
    return { prima: m[1].trim(), cifra: m[2], dopo: m[3].trim() };
  }

  function categoriePresenti(lista) {
    return Object.keys(NV.dati.categorie).filter(function (c) {
      return lista.some(function (o) { return o.categoria === c; });
    });
  }

  /* "5 scuole", "1 corso", "3 opzioni" quando le categorie sono miste */
  var PLURALI = {
    scuole: ['scuola', 'scuole'],
    corsi: ['corso', 'corsi'],
    lavoro: ['offerta', 'offerte'],
    workshop: ['workshop', 'workshop'],
    eventi: ['evento', 'eventi'],
    libri: ['libro', 'libri']
  };
  function conto(lista, n) {
    n = n == null ? lista.length : n;
    var cats = categoriePresenti(lista);
    var parole = cats.length === 1 && PLURALI[cats[0]] ? PLURALI[cats[0]] : ['opzione', 'opzioni'];
    return n + ' ' + (n === 1 ? parole[0] : parole[1]);
  }

  function normalizza(t) {
    /* toglie gli accenti: "attività" si trova anche scrivendo "attivita" */
    return String(t || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  }

  /* ==================================================================
     FILTRI E ORDINE
     ================================================================== */
  function filtra(lista, s, senzaCategoria) {
    var cerca = normalizza(s.cerca).trim();
    return lista.filter(function (o) {
      if (!senzaCategoria && s.categoria !== 'tutte' && o.categoria !== s.categoria) return false;
      /* l'ibrido vale sia in presenza sia online; il libro si legge da casa */
      if (s.modalita === 'presenza' && !(o.modalita === 'In presenza' || o.modalita === 'Ibrido')) return false;
      if (s.modalita === 'online' && !(o.modalita === 'Online' || o.modalita === 'Ibrido' || eLibro(o))) return false;
      if (s.distanza !== 'tutte') {
        var d = km(o);
        if (d != null && d > Number(s.distanza)) return false;
      }
      if (s.gratis && !eGratis(o)) return false;
      if (cerca) {
        var dove = normalizza([o.nome, o.ente, o.citta, NV.categoria(o.categoria).etichetta].join(' '));
        if (dove.indexOf(cerca) === -1) return false;
      }
      return true;
    });
  }

  var ORDINI = [
    { value: 'adatte', label: 'Più adatte a te', sub: 'In base al tuo profilo e a come impari', icona: 'sparkles' },
    { value: 'vicine', label: 'Più vicine', sub: 'Dalla più vicina a casa tua, poi le online', icona: 'navigation' },
    { value: 'voto', label: 'Voto più alto', sub: 'In base alle recensioni di chi c’è stato', icona: 'star' }
  ];
  function ordine(valore) {
    for (var i = 0; i < ORDINI.length; i++) if (ORDINI[i].value === valore) return ORDINI[i];
    return ORDINI[0];
  }

  /** "Più adatte" è già l'ordine dei dati. Le sponsorizzate restano sempre in cima. */
  function ordina(lista, criterio) {
    if (criterio !== 'vicine' && criterio !== 'voto') return lista;
    return lista.slice().sort(function (a, b) {
      if (!!a.sponsorizzato !== !!b.sponsorizzato) return a.sponsorizzato ? -1 : 1;
      if (criterio === 'vicine') {
        var da = km(a), db = km(b);
        if (da == null && db == null) return (b.affinita || 0) - (a.affinita || 0);
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      }
      return (b.rating || 0) - (a.rating || 0) || (b.affinita || 0) - (a.affinita || 0);
    });
  }

  function quantiFiltri(s) {
    return (s.modalita !== 'tutte' ? 1 : 0) + (s.distanza !== 'tutte' ? 1 : 0) + (s.gratis ? 1 : 0);
  }

  /** La più adatta fra quelle che vedi (se ce n'è più di una). */
  function piuAdatta(lista) {
    if (lista.length < 2) return null;
    return lista.reduce(function (m, o) { return (o.affinita || 0) > (m.affinita || 0) ? o : m; }, lista[0]);
  }

  /* ==================================================================
     PEZZI COMUNI
     ================================================================== */

  /** Etichette di una scheda: la più adatta, sponsorizzato, già fatto. */
  function etichette(o, migliore, corta) {
    var out = [];
    if (migliore) out.push(NV.etichetta(corta ? 'La più adatta' : 'La più adatta a te', 'main', 'sparkles'));
    if (o.sponsorizzato) out.push(NV.sponsor());
    if (o.completato) out.push(NV.etichetta('Completato', 'ok', 'circle-check'));
    if (o.letto) out.push(NV.etichetta('Già letto', 'ok', 'circle-check'));
    return out;
  }

  function apri(o) { return function () { NV.apriScheda(o.id); }; }

  /* ==================================================================
     LA SCHEDA · copertina, logo, dati e prezzo
     ================================================================== */
  function pastiglia(nomeIcona, testo, classe) {
    return h('span', { class: 'nv-att-pill' + (classe ? ' ' + classe : '') }, [
      nomeIcona ? icon(nomeIcona, ICO.SM) : null,
      h('span', { text: testo })
    ]);
  }

  function prezzo(o) {
    var pp = prezzoParti(o.prezzo);
    if (!pp) return null;
    return h('p', { class: 'nv-att-prezzo' + (pp.cifra === 'Gratis' ? ' is-gratis' : '') }, [
      pp.prima ? h('span', { class: 'nv-att-prezzo__prima', text: pp.prima }) : null,
      h('strong', { text: pp.cifra }),
      pp.dopo ? h('span', { text: pp.dopo }) : null
    ]);
  }

  function schedaCopertina(o, migliore) {
    var cat = NV.categoria(o.categoria);
    var tags = etichette(o, migliore, true);
    var dove = luogo(o);
    var q = quando(o);

    var pills = [pastiglia(dove.icona, dove.testo)];
    if (q) pills.push(pastiglia(q.icona, q.testo));

    /* tre disposizioni dei pianeti, sempre la stessa per la stessa scheda:
       cosi' cinque scuole di fila non sembrano cinque copie */
    var somma = 0;
    String(o.id).split('').forEach(function (ch) { somma += ch.charCodeAt(0); });
    var disegno = ' nv-att-cover--' + (somma % 3 + 1);

    return h('button', { class: 'nv-att-cop nv-press', type: 'button', onclick: apri(o) }, [
      h('div', { class: 'nv-att-cover nv-tono-' + (cat.tono || 1) + (o.immagine ? ' has-foto' : disegno) }, [
        o.immagine ? h('img', { src: o.immagine, alt: '', loading: 'lazy' }) : null,
        h('div', { class: 'nv-att-cover__su' }, [
          o.data
            ? h('span', { class: 'nv-att-data' }, [h('strong', { text: o.data.giorno }), h('span', { text: o.data.mese })])
            : h('span', { class: 'nv-att-cover__cat' }, [icon(cat.icona, ICO.SM), h('span', { text: cat.singolare })]),
          o.affinita != null ? h('span', { class: 'nv-att-match', title: 'Quanto è adatta a te' }, [
            h('strong', { text: o.affinita + '%' }),
            h('span', { text: 'per te' })
          ]) : null
        ])
      ]),
      h('div', { class: 'nv-att-cop__corpo' }, [
        h('div', { class: 'nv-att-cop__testa' }, [
          h('span', { class: 'nv-att-cop__logo' }, [NV.logo(o)]),
          tags.length ? h('div', { class: 'nv-att-tags' }, tags) : null
        ]),
        h('div', { class: 'nv-att-cop__copy' }, [
          h('span', { class: 'nv-att-cop__ente', text: o.ente }),
          h('strong', { class: 'nv-att-cop__nome', text: o.nome })
        ]),
        h('div', { class: 'nv-att-pills' }, pills),
        /* il prezzo e' il dato che si confronta: in fondo, grande, col voto accanto */
        h('div', { class: 'nv-att-cop__piede' }, [
          prezzo(o),
          o.rating ? NV.stelle(o.rating, o.recensioni) : null
        ])
      ])
    ]);
  }

  /* ==================================================================
     TESTATA: da dove vieni e che cosa stai guardando
     ================================================================== */
  function testata(info) {
    /* la testata e' sempre sfumata: le etichette sono bianche velate, come nella dashboard */
    var tags = [];
    if (info.modo === 'compito') {
      var c = info.compito;
      tags.push(NV.etichetta(c.obbligatoria ? 'Necessaria' : 'Facoltativa', 'chiara'));
      var st = NV.STATI_COMPITO[c.stato];
      if (st) tags.push(NV.etichetta(st.etichetta, 'chiara', st.icona));
      if (c.durata) tags.push(NV.etichetta(c.durata, 'chiara', 'clock'));
    } else {
      tags.push(NV.etichetta('Per lo step ' + (info.stepIndice + 1) + ' e il prossimo', 'chiara', 'route'));
    }

    return h('div', { class: 'nv-att-testa nv-hero' }, [
      h('span', { class: 'nv-eyebrow', text: 'Step ' + (info.stepIndice + 1) + ' · ' + info.step.titolo }),
      h('h1', { class: 'nv-title nv-title--md', text: info.titolo }),
      h('div', { class: 'nv-att-tags nv-att-testa__tags' }, tags),
      h('p', { class: 'nv-body nv-att-descr', text: info.descrizione }),
      info.modo === 'compito' && info.compito.nota
        ? h('p', { class: 'nv-att-nota' }, [icon('calendar', ICO.SM), h('span', { text: info.compito.nota })])
        : null
    ]);
  }

  /* ==================================================================
     CONTROLLI: Elenco | Mappa, Filtri, categorie, ordine
     ================================================================== */
  function vaiAllaMappa(info, s) {
    var categoria = s.categoria;
    /* se le opzioni sono tutte di un tipo, la mappa si apre già su quel tipo */
    if (categoria === 'tutte') {
      var cats = categoriePresenti(info.tutte);
      if (cats.length === 1) categoria = cats[0];
    }
    NV.apriMappa({
      categoria: categoria,
      compito: info.modo === 'compito' ? info.compito.id : null,
      ambito: info.modo === 'ambito' ? info.nomeAmbito : null,
      cerca: s.cerca || ''
    });
  }

  function interruttoreVista(info, s, classe) {
    return NV.segmenti([
      { value: 'elenco', label: 'Elenco', icona: 'list' },
      { value: 'mappa', label: 'Mappa', icona: 'map' }
    ], 'elenco', function (valore) {
      if (valore === 'mappa') vaiAllaMappa(info, s);
    }, 'nv-att-seg' + (classe ? ' ' + classe : ''));
  }

  /** Pulsante Filtri. tondo = solo icona, per le righe strette. */
  function bottoneFiltri(s, onclick, tondo) {
    var n = quantiFiltri(s);
    return h('button', {
      class: 'nv-att-filtri' + (tondo ? ' nv-att-filtri--tondo' : '') + (n ? ' is-attivo' : ''),
      type: 'button',
      'aria-label': n ? 'Filtri, ' + n + ' attivi' : 'Filtri',
      title: 'Filtri',
      onclick: onclick
    }, [
      icon('sliders-horizontal', tondo ? ICO.MD : ICO.SM),
      tondo ? null : h('span', { text: 'Filtri' }),
      n ? h('span', { class: 'nv-att-filtri__n', text: String(n) }) : null
    ]);
  }

  function filaCategorie(info, s, ridisegna, prima) {
    var cats = categoriePresenti(info.tutte);
    var senzaCategoria = filtra(info.tutte, s, true);
    var chips = (prima || []).slice();
    if (cats.length > 1) {
      chips.push(NV.chip('Tutte', {
        attivo: s.categoria === 'tutte',
        conteggio: senzaCategoria.length,
        onclick: function () { s.categoria = 'tutte'; ridisegna(); }
      }));
      cats.forEach(function (c) {
        var cat = NV.categoria(c);
        var n = senzaCategoria.filter(function (o) { return o.categoria === c; }).length;
        var chip = NV.chip(cat.etichetta, {
          attivo: s.categoria === c,
          icona: cat.icona,
          conteggio: n,
          onclick: function () { s.categoria = c; ridisegna(); }
        });
        if (!n) chip.classList.add('is-vuota');
        chips.push(chip);
      });
    }
    return chips.length ? NV.filaChip(chips, 'nv-att-chips') : null;
  }

  /** I filtri accesi, uno per pastiglia: si tolgono con un tocco. */
  function filtriAttivi(s, ridisegna, azzera) {
    var voci = [];
    function voce(testo, togli) {
      voci.push(h('button', {
        class: 'nv-att-attivo',
        type: 'button',
        'aria-label': 'Togli il filtro ' + testo,
        onclick: function () { togli(); ridisegna(); }
      }, [h('span', { text: testo }), icon('x', ICO.SM)]));
    }
    if (s.modalita === 'presenza') voce('In presenza', function () { s.modalita = 'tutte'; });
    if (s.modalita === 'online') voce('Online', function () { s.modalita = 'tutte'; });
    if (s.distanza !== 'tutte') voce('Entro ' + s.distanza + ' km', function () { s.distanza = 'tutte'; });
    if (s.gratis) voce('Solo gratis', function () { s.gratis = false; });
    if (!voci.length) return null;
    if (voci.length > 1) {
      voci.push(h('button', { class: 'nv-link nv-att-azzera', type: 'button', onclick: azzera }, [h('span', { text: 'Azzera' })]));
    }
    return h('div', { class: 'nv-att-attivi' }, voci);
  }

  /**
   * "5 scuole · ordinate per te"  [Più adatte a te]
   * extra: un pulsante in più a destra (i Filtri tondi della versione copertine);
   * in quel caso la coda "ordinate per te" si toglie, perché non ci starebbe.
   */
  function riepilogo(visibili, s, onOrdina, extra) {
    var ordinaBtn = h('button', { class: 'nv-att-ordina', type: 'button', onclick: onOrdina, 'aria-label': 'Ordina: ' + ordine(s.ordina).label }, [
      icon('arrow-up-down', ICO.SM),
      h('span', { text: ordine(s.ordina).label })
    ]);
    return h('div', { class: 'nv-att-riepilogo' }, [
      h('p', { class: 'nv-att-conto', 'aria-live': 'polite' }, [
        h('strong', { text: conto(visibili) }),
        !extra && s.ordina === 'adatte' ? h('span', { text: ' · ordinate per te' }) : null
      ]),
      extra ? h('div', { class: 'nv-att-riepilogo__azioni' }, [ordinaBtn, extra]) : ordinaBtn
    ]);
  }

  /* ==================================================================
     PANNELLI: Filtri e Ordina
     ================================================================== */
  function apriFiltri(info, s, ridisegna, azzera) {
    var bozza = { modalita: s.modalita, distanza: s.distanza, gratis: s.gratis };

    var mostra = NV.pulsante('Mostra', {
      onclick: function () {
        Object.assign(s, bozza);
        NV.chiudiFoglio();
        ridisegna();
      }
    });
    var scrittaMostra = mostra.querySelector('span');

    function aggiornaConto() {
      var lista = filtra(info.tutte, Object.assign({}, s, bozza));
      scrittaMostra.textContent = lista.length ? 'Mostra ' + conto(lista) : 'Nessun risultato';
      mostra.disabled = !lista.length;
    }

    function scelte(titolo, chiave, opzioni) {
      var bottoni = opzioni.map(function (op) {
        return NV.chip(op.label, {
          attivo: bozza[chiave] === op.value,
          icona: op.icona,
          onclick: function () {
            bozza[chiave] = op.value;
            bottoni.forEach(function (b, i) {
              var on = opzioni[i].value === op.value;
              b.classList.toggle('is-attivo', on);
              b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            aggiornaConto();
          }
        });
      });
      return h('div', { class: 'nv-att-foglio__gruppo' }, [
        h('h3', { class: 'nv-att-foglio__titolo', text: titolo }),
        h('div', { class: 'nv-att-scelte', role: 'group', 'aria-label': titolo }, bottoni)
      ]);
    }

    var conDistanza = info.tutte.some(function (o) { return km(o) != null; });
    var gratuite = info.tutte.filter(eGratis).length;

    var contenuto = [
      scelte('Modalità', 'modalita', [
        { value: 'tutte', label: 'Tutte' },
        { value: 'presenza', label: 'In presenza', icona: 'map-pin' },
        { value: 'online', label: 'Online', icona: 'globe' }
      ]),
      conDistanza ? scelte('Distanza da casa', 'distanza', [
        { value: 'tutte', label: 'Qualsiasi' },
        { value: '10', label: 'Entro 10 km' },
        { value: '50', label: 'Entro 50 km' }
      ]) : null,
      h('div', { class: 'nv-att-foglio__gruppo' }, [
        h('h3', { class: 'nv-att-foglio__titolo', text: 'Prezzo' }),
        h('div', { class: 'nv-att-foglio__riga' }, [
          h('div', { class: 'nv-att-foglio__copy' }, [
            h('strong', { text: 'Solo gratis' }),
            h('span', { text: gratuite ? conto(info.tutte.filter(eGratis)) + ' senza costi' : 'Qui non ce ne sono di gratis' })
          ]),
          NV.interruttore(bozza.gratis, function (acceso) { bozza.gratis = acceso; aggiornaConto(); }, 'Solo gratis')
        ])
      ])
    ];

    aggiornaConto();
    NV.apriFoglio({
      titolo: 'Filtri',
      sottotitolo: 'Scegli cosa vedere tra ' + conto(info.tutte),
      contenuto: contenuto,
      azioni: [
        NV.pulsante('Azzera', { variante: 'secondario', onclick: function () { NV.chiudiFoglio(); azzera(); } }),
        mostra
      ],
      classe: 'nv-att-foglio'
    });
  }

  function apriOrdina(s, ridisegna) {
    var voci = ORDINI.map(function (op) {
      var on = s.ordina === op.value;
      return h('button', {
        class: 'nv-att-voce' + (on ? ' is-attiva' : ''),
        type: 'button',
        'aria-pressed': on ? 'true' : 'false',
        onclick: function () {
          s.ordina = op.value;
          NV.chiudiFoglio();
          ridisegna();
        }
      }, [
        NV.icoChip(op.icona, on ? 1 : 'neutro'),
        h('span', { class: 'nv-att-voce__copy' }, [
          h('strong', { text: op.label }),
          h('span', { text: op.sub })
        ]),
        on ? h('span', { class: 'nv-att-voce__spunta' }, [icon('check', ICO.MD)]) : null
      ]);
    });
    NV.apriFoglio({
      titolo: 'Ordina per',
      contenuto: [
        h('div', { class: 'nv-att-voci' }, voci),
        h('p', { class: 'nv-att-trasparenza' }, [
          icon('info', ICO.SM),
          h('span', { text: 'Le opzioni sponsorizzate restano in cima e hanno sempre l’etichetta “Sponsorizzato”. Non cambiano quanto sono adatte a te.' })
        ])
      ],
      classe: 'nv-att-foglio'
    });
  }

  /* ==================================================================
     STATI VUOTI
     ================================================================== */
  function vuotoFiltri(screen, info, s, azzera) {
    var dove = info.modo === 'compito' ? 'per questo compito' : 'in questa sezione';
    var testo = s.cerca
      ? 'Non troviamo “' + s.cerca + '”. Prova un’altra parola o togli i filtri: ' + dove + ' ci sono ' + conto(info.tutte) + '.'
      : 'Prova a togliere qualche filtro: ' + dove + ' ci sono ' + conto(info.tutte) + '.';
    return h('div', { class: 'nv-att-vuoto' }, [
      NV.mascotte('lente-ingrandimento', 'nv-att-vuoto__mascotte'),
      NV.testo(screen, 'vuotoTitolo', 'Nessuna opzione con questi filtri', 'h2', 'nv-att-vuoto__titolo'),
      h('p', { class: 'nv-att-vuoto__testo', text: testo }),
      h('div', { class: 'nv-att-vuoto__azioni' }, [
        NV.pulsante('Togli i filtri', { icona: 'rotate-ccw', onclick: azzera })
      ])
    ]);
  }

  function vuotoNessuna(screen) {
    return h('div', { class: 'nv-att-vuoto' }, [
      NV.mascotte('clessidra', 'nv-att-vuoto__mascotte'),
      NV.testo(screen, 'nessunaTitolo', 'Stiamo cercando le opzioni giuste', 'h2', 'nv-att-vuoto__titolo'),
      NV.testo(screen, 'nessunaTesto', 'Per questo compito non abbiamo ancora scuole, corsi o eventi da proporti. Ti avvisiamo appena arrivano.', 'p', 'nv-att-vuoto__testo'),
      h('div', { class: 'nv-att-vuoto__azioni' }, [
        NV.pulsante('Avvisami', { icona: 'bell', onclick: function () { NV.avviso('Ti avvisiamo appena arrivano nuove opzioni'); } }),
        NV.pulsante('Chiedi a un consulente', { variante: 'secondario', onclick: function () { NV.vai('consulenza'); } })
      ])
    ]);
  }

  /* ==================================================================
     LA SCHERMATA
     ================================================================== */
  window.NavidaRender.screens.nvAttivita = function (screen) {
    var info = leggiContesto();
    var s = statoPer(info.chiave);
    if (s.categoria !== 'tutte' && categoriePresenti(info.tutte).indexOf(s.categoria) === -1) s.categoria = 'tutte';

    var campo = null;
    var corpo = h('div', { class: 'nv-att-corpo' });

    function azzera() {
      Object.assign(s, { categoria: 'tutte', modalita: 'tutte', distanza: 'tutte', gratis: false, cerca: '' });
      if (campo) campo.value = '';
      ridisegna();
    }
    function suFiltri() { apriFiltri(info, s, ridisegna, azzera); }
    function suOrdina() { apriOrdina(s, ridisegna); }

    /* Si ridisegna solo il corpo: la pagina non scorre in cima, la barra
       di ricerca non perde il cursore, la fila delle pastiglie resta dov'è. */
    function ridisegna() {
      var fila = corpo.querySelector('.nv-att-chips');
      var scorrimento = fila ? fila.scrollLeft : 0;
      corpo.innerHTML = '';
      costruisci().forEach(function (n) { if (n) corpo.appendChild(n); });
      var nuova = corpo.querySelector('.nv-att-chips');
      if (nuova) nuova.scrollLeft = scorrimento;
    }

    function costruisci() {
      if (!info.tutte.length) return [vuotoNessuna(screen)];

      var visibili = ordina(filtra(info.tutte, s), s.ordina);
      var migliore = piuAdatta(visibili);
      var parti = [];

      /* Elenco | Mappa a tutta larghezza; i Filtri scendono accanto all'ordine */
      parti.push(interruttoreVista(info, s, 'nv-seg--piena'));
      parti.push(filaCategorie(info, s, ridisegna));

      parti.push(filtriAttivi(s, ridisegna, azzera));

      if (!visibili.length) {
        parti.push(vuotoFiltri(screen, info, s, azzera));
        return parti;
      }

      parti.push(riepilogo(visibili, s, suOrdina, bottoneFiltri(s, suFiltri, true)));
      parti.push(h('div', { class: 'nv-att-lista' }, visibili.map(function (o) {
        return schedaCopertina(o, o === migliore);
      })));
      return parti;
    }

    /* la ricerca serve quando l'elenco è lungo (Formazione) */
    var ricerca = null;
    if (info.tutte.length > 6) {
      campo = h('input', {
        type: 'search',
        placeholder: 'Cerca tra ' + conto(info.tutte),
        'aria-label': 'Cerca un’opzione',
        enterkeyhint: 'search'
      });
      campo.value = s.cerca || '';
      campo.addEventListener('input', function () { s.cerca = campo.value; ridisegna(); });
      ricerca = h('label', { class: 'search nv-att-cerca' }, [
        h('span', { class: 'search__icon' }, [icon('search', ICO.SM)]),
        campo
      ]);
    }

    ridisegna();

    /* pannello aperto dall'indirizzo di prova: dopo che la schermata c'è */
    if (s.foglio) {
      var quale = s.foglio;
      s.foglio = null;
      setTimeout(function () {
        if (quale === 'ordina') suOrdina();
        else if (info.tutte.length) suFiltri();
      }, 0);
    }

    return [
      NV.pagina('nv-att', [
        NV.barra({ indietro: info.ripiego }),
        testata(info),
        ricerca,
        corpo
      ])
    ];
  };
})();
