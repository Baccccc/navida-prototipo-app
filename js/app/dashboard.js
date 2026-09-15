/* ==========================================================================
   NAVIDA — Dashboard (3 versioni)
   ==========================================================================
   La prima schermata dell'app. Risponde a tre domande, in quest'ordine:

     1. A che step sono della linea di carriera?   (card compatta, tocco → percorso)
     2. Che cosa devo ottenere in questo step?      (obiettivo e descrizione)
     3. Che cosa faccio adesso per andare avanti?   (In primo piano)

   e in fondo i due pulsanti Formazione e Lavoro, che aprono le opportunità
   per lo step in cui sei (e per arrivare al prossimo).

   La linea di carriera NON mostra percentuali: si vede solo a che tappa sei.

   Le tre versioni (pannello "Versione" della barra di modifica):
     base   Essenziale      card dello step, obiettivo, elenco, due pulsanti
     eroe   Card eroe       sfumatura di marca, mascotte, carosello, tessere
     mossa  Prossima mossa  un solo compito da fare adesso, elenco diviso per tipo

   Parametri di prova nell'indirizzo:
     &attuale=3        finge di essere allo step 3 (da 1), per vedere gli altri casi
     &filtro=eventi    versione "mossa": apre la scheda Eventi (fare | eventi | notizie)
     &foglio=notizia   apre subito il pannello della notizia

   Stile: css/app/dashboard.css (prefisso nv-dash-).
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV, h = NV.h, icon = NV.icon, ICO = NV.ICO;

  window.NAVIDA_PAGE_VARIANTS = window.NAVIDA_PAGE_VARIANTS || {};
  window.NAVIDA_PAGE_VARIANTS.dashboard = {
    etichetta: 'Versione della dashboard',
    predefinita: 'base',
    options: [
      { value: 'base', label: 'Essenziale' },
      { value: 'eroe', label: 'Card eroe' },
      { value: 'mossa', label: 'Prossima mossa' }
    ]
  };

  /* La posa della mascotte cambia con lo step: studia, lavora, decolla. */
  var POSE_STEP = ['laureato', 'laptop-seduto', 'computer', 'razzo', 'trofeo'];

  /* ==================================================================
     PROVE E DATI DI COMODO
     ================================================================== */

  function paramProva(nome) {
    try { return new URLSearchParams(window.location.search).get(nome); } catch (e) { return null; }
  }

  /** Lo step in cui sei. Con &attuale=N si finge di essere allo step N. */
  function indiceAttuale() {
    var n = parseInt(paramProva('attuale'), 10);
    if (!isNaN(n)) return Math.max(0, Math.min(NV.steps().length - 1, n - 1));
    return NV.stepAttuale();
  }

  /* Lo stato di una tappa si ricava dalla posizione: cosi' anche con
     &attuale=3 la linea resta coerente, senza toccare i dati. */
  function statoTappa(i, attuale, totali) {
    if (i < attuale) return 'fatto';
    if (i === attuale) return 'attuale';
    if (i === totali - 1) return 'traguardo';
    return 'da-fare';
  }

  function vaiPercorso() { NV.vai('percorso'); }

  function apriStepAttuale(attuale) {
    return function () { NV.apriStep(attuale); };
  }

  /* I due pulsanti parlano dello step in cui sei: se prima hai curiosato
     in un altro step, il contesto torna qui prima di aprire la scheda. */
  function vaiAmbito(nome, attuale) {
    return function () {
      NV.contesto().step = attuale;
      NV.apriAmbito(nome);
    };
  }

  function quanteOpportunita(nome, attuale) {
    return NV.opportunitaPer({ ambito: nome, step: attuale }).length;
  }

  /** "1 proposta", "16 proposte" */
  function proposte(n) { return n + (n === 1 ? ' proposta' : ' proposte'); }

  /** I compiti non ancora fatti: prima quelli in corso, poi gli obbligatori. */
  function compitiAperti(s) {
    function peso(c) { return (c.stato === 'in-corso' ? 0 : 2) + (c.obbligatoria ? 0 : 1); }
    return (s.compiti || [])
      .filter(function (c) { return c.stato !== 'fatto'; })
      .sort(function (a, b) { return peso(a) - peso(b); });
  }

  /* ==================================================================
     IN PRIMO PIANO — una voce sola per compiti, opportunità e notizie
     ------------------------------------------------------------------
     Ogni voce diventa lo stesso oggetto, cosi' le tre versioni la
     possono disegnare come riga, scheda o voce di elenco.
     ================================================================== */

  function apriNotizia(nz) {
    NV.apriFoglio({
      titolo: nz.titolo,
      sottotitolo: [nz.fonte, nz.quando].filter(Boolean).join(' · '),
      contenuto: [h('p', { class: 'nv-body nv-dash-notizia', text: nz.testo })],
      azioni: [NV.pulsante('Ho capito', { variante: 'secondario', onclick: NV.chiudiFoglio })]
    });
  }

  function voce(item) {
    if (!item) return null;

    if (item.tipo === 'compito') {
      var c = NV.compito(item.id);
      if (!c) return null;
      var cat = NV.categoria(c.categoria);
      var stato = NV.STATI_COMPITO[c.stato] || NV.STATI_COMPITO['da-fare'];
      return {
        tipo: 'compito', id: c.id, gruppo: 'fare',
        etichetta: item.etichetta || stato.etichetta,
        titolo: c.titolo,
        icona: cat.icona, tono: cat.tono,
        /* lo stato sta gia' nell'etichetta: qui la nota o la durata */
        dati: [c.nota || c.durata].filter(Boolean),
        compito: c,
        apri: function () { NV.apriCompito(c.id); }
      };
    }

    if (item.tipo === 'opportunita') {
      var o = NV.opportunita(item.id);
      if (!o) return null;
      var co = NV.categoria(o.categoria);
      var evento = o.categoria === 'eventi' || o.categoria === 'workshop';
      var dati;
      if (o.data) dati = [o.data.giorno + ' ' + o.data.mese.toLowerCase() + ', ' + o.data.ora, o.distanza || o.modalita];
      else if (o.categoria === 'lavoro') dati = [o.prezzo, o.distanza || o.modalita];
      else dati = [o.modalita, o.durata];
      return {
        tipo: 'opportunita', id: o.id, gruppo: evento ? 'eventi' : 'fare',
        etichetta: item.etichetta || co.singolare,
        titolo: o.nome,
        icona: co.icona, tono: co.tono,
        dati: dati.filter(Boolean),
        voto: o.categoria !== 'lavoro' ? o.rating : null,
        opp: o,
        apri: function () { NV.apriScheda(o.id); }
      };
    }

    if (item.tipo === 'notizia') {
      var nz = NV.dati.notizie && NV.dati.notizie[item.id];
      if (!nz) return null;
      return {
        tipo: 'notizia', id: item.id, gruppo: 'notizie',
        etichetta: item.etichetta || 'Notizia',
        titolo: nz.titolo,
        icona: nz.icona || 'newspaper', tono: nz.tono || 3,
        dati: [nz.fonte, nz.quando].filter(Boolean),
        notizia: nz,
        apri: function () { apriNotizia(nz); }
      };
    }
    return null;
  }

  /* Per lo step vero si usa l'elenco scritto in dati.js. Per le prove
     (&attuale=N) l'elenco si ricava dai compiti e dalle opportunità
     di quello step, cosi' resta sempre coerente. */
  function elementiPrimoPiano(attuale) {
    if (attuale === NV.stepAttuale()) {
      return (NV.dati.primoPiano || []).map(voce).filter(Boolean);
    }
    var s = NV.step(attuale);
    var lista = compitiAperti(s).slice(0, 2).map(function (c, i) {
      return voce({ tipo: 'compito', id: c.id, etichetta: i === 0 ? 'Da fare adesso' : null });
    });
    NV.opportunitaPer({ step: attuale }).slice(0, 3).forEach(function (o) {
      lista.push(voce({ tipo: 'opportunita', id: o.id }));
    });
    return lista.filter(Boolean);
  }

  /** Il compito da fare adesso: quello "in primo piano", o il primo aperto. */
  function prossimaMossa(attuale) {
    if (attuale === NV.stepAttuale()) {
      var p = (NV.dati.primoPiano || []).filter(function (x) { return x.tipo === 'compito'; })[0];
      if (p && NV.compito(p.id)) return { compito: NV.compito(p.id), etichetta: p.etichetta };
    }
    var c = compitiAperti(NV.step(attuale))[0];
    return c ? { compito: c, etichetta: 'Da fare adesso' } : null;
  }

  /* ==================================================================
     PEZZI COMUNI
     ================================================================== */

  /** Pulsante tondo da 44 con la freccia (regola 8 del kit maturo). */
  function freccia(classe) {
    return h('span', { class: 'nv-dash-freccia' + (classe ? ' ' + classe : ''), 'aria-hidden': 'true' }, [
      icon('arrow-right', ICO.MD)
    ]);
  }

  /**
   * Il tracciato della linea di carriera: una tappa per step, unite da un
   * tratto. Fatte = spunta, attuale = numero con l'alone, traguardo = coppa.
   * Nessuna percentuale.
   */
  function tracciato(attuale, classe) {
    var lista = NV.steps();
    var n = lista.length;
    var figli = [];
    lista.forEach(function (s, i) {
      var stato = statoTappa(i, attuale, n);
      if (i > 0) figli.push(h('span', { class: 'nv-dash-tratto' + (i <= attuale ? ' is-fatto' : '') }));
      var dentro;
      if (stato === 'fatto') dentro = icon('check', ICO.SM);
      else if (i === n - 1) dentro = icon('trophy', ICO.SM);
      else dentro = h('span', { text: String(i + 1) });
      figli.push(h('span', { class: 'nv-dash-tappa is-' + stato }, [dentro]));
    });
    return h('span', {
      class: 'nv-dash-traccia' + (classe ? ' ' + classe : ''),
      role: 'img',
      'aria-label': 'Step ' + (attuale + 1) + ' di ' + n + ': ' + lista[attuale].titolo
    }, figli);
  }

  /* Sotto il tracciato: "Sei qui" sotto la tappa attuale e il nome del
     traguardo sotto la coppa (se c'e' spazio per tutti e due). */
  function noteTracciato(attuale, classe) {
    var n = NV.steps().length;
    var cls = 'nv-dash-traccia__nota is-attuale';
    var stile = null;
    if (attuale === 0) cls += ' is-inizio';
    else if (attuale === n - 1) cls += ' is-fine';
    else stile = '--pos:' + (attuale / (n - 1));
    return h('span', { class: 'nv-dash-traccia__note' + (classe ? ' ' + classe : ''), 'aria-hidden': 'true' }, [
      h('span', { class: cls, style: stile, text: attuale === n - 1 ? 'Traguardo' : 'Sei qui' }),
      attuale <= n - 3 ? h('span', { class: 'nv-dash-traccia__nota is-fine', text: NV.dati.percorso.obiettivo }) : null
    ]);
  }

  /** "2 di 6 compiti fatti" con la barretta (questa si', e' dei compiti). */
  function compitiFatti(conto, linkTesto, classe) {
    return h('span', { class: 'nv-dash-compiti' + (classe ? ' ' + classe : '') }, [
      h('span', { class: 'nv-dash-compiti__riga' }, [
        h('span', { class: 'nv-dash-compiti__conto' }, [
          h('strong', { text: conto.fatti + ' di ' + conto.totali }),
          h('span', { text: ' compiti fatti' })
        ]),
        linkTesto ? h('span', { class: 'nv-dash-compiti__link' }, [h('span', { text: linkTesto }), icon('chevron-right', ICO.SM)]) : null
      ]),
      NV.avanzamento(conto.fatti, conto.totali)
    ]);
  }

  /** Giorno e mese di un evento, come un foglietto di calendario. */
  function riquadroData(d) {
    return h('span', { class: 'nv-dash-data', 'aria-hidden': 'true' }, [
      h('strong', { text: d.giorno }),
      h('small', { text: d.mese })
    ]);
  }

  /** La riga dei dati piccoli: "Online · 8 settimane  ★ 4,7" */
  function datiVoce(v, classe) {
    return h('span', { class: 'nv-dash-dati' + (classe ? ' ' + classe : '') }, [
      v.dati.length ? h('span', { text: v.dati.join(' · ') }) : null,
      v.voto ? NV.stelle(v.voto) : null
    ]);
  }

  function titoloSezione(screen, chiave, testo) {
    return NV.testo(screen, chiave, testo, 'h2', 'nv-section__title');
  }

  function saluto(screen, classe) {
    return h('h1', { class: classe }, [
      NV.testo(screen, 'saluto', 'Ciao'),
      ' ' + NV.dati.utente.nome
    ]);
  }

  /* ==================================================================
     VERSIONE 1 — ESSENZIALE
     Card compatta dello step, obiettivo della fase, elenco di righe
     chiare, due pulsanti grandi affiancati.
     ================================================================== */

  function cardStepBase(screen, attuale) {
    var lista = NV.steps();
    var s = lista[attuale];
    return h('button', {
      class: 'nv-dash-step nv-press',
      type: 'button',
      onclick: vaiPercorso,
      'aria-label': 'Apri la linea di carriera. Sei allo step ' + (attuale + 1) + ' di ' + lista.length + ', ' + s.titolo
    }, [
      h('span', { class: 'nv-dash-step__head' }, [
        h('span', { class: 'nv-dash-step__copy' }, [
          NV.testo(screen, 'occhielloLinea', 'La tua linea di carriera', 'span', 'nv-eyebrow'),
          h('strong', { class: 'nv-dash-step__num', text: 'Step ' + (attuale + 1) + ' di ' + lista.length }),
          h('span', { class: 'nv-dash-step__nome', text: s.titolo })
        ]),
        freccia()
      ]),
      h('span', { class: 'nv-dash-step__traccia' }, [
        tracciato(attuale),
        noteTracciato(attuale)
      ])
    ]);
  }

  function bloccoAdessoBase(screen, attuale) {
    var s = NV.step(attuale);
    return h('section', { class: 'nv-section nv-dash-adesso' }, [
      h('div', { class: 'nv-section__head' }, [
        titoloSezione(screen, 'titoloAdesso', 'Lo step di adesso'),
        /* "Formazione · 3 anni"; sul traguardo tipo e durata coincidono, basta una volta */
        h('span', { class: 'nv-dash-adesso__meta' }, [
          icon(s.icona, ICO.SM),
          h('span', { text: (s.durata && s.durata !== s.tipo ? [s.tipo, s.durata] : [s.tipo]).join(' · ') })
        ])
      ]),
      h('button', { class: 'nv-dash-adesso__tile nv-press', type: 'button', onclick: apriStepAttuale(attuale) }, [
        h('span', { class: 'nv-dash-adesso__blocco' }, [
          NV.testo(screen, 'occhielloObiettivo', 'Obiettivo della fase', 'span', 'nv-eyebrow'),
          h('span', { class: 'nv-dash-obiettivo', text: s.obiettivo })
        ]),
        h('span', { class: 'nv-body nv-dash-adesso__desc', text: s.descrizione }),
        compitiFatti(NV.conteggio(s), 'Vedi i compiti')
      ])
    ]);
  }

  function rigaBase(v) {
    return h('button', { class: 'nv-row nv-press nv-dash-riga', type: 'button', onclick: v.apri }, [
      v.opp && v.opp.data ? riquadroData(v.opp.data) : NV.icoChip(v.icona, v.tono),
      h('span', { class: 'nv-row__copy' }, [
        h('span', { class: 'nv-dash-riga__etichetta' + (v.tipo === 'compito' ? ' is-main' : ''), text: v.etichetta }),
        h('span', { class: 'nv-row__title nv-dash-riga__titolo', text: v.titolo }),
        datiVoce(v)
      ]),
      h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.MD)])
    ]);
  }

  function ambitiBase(screen, attuale) {
    var A = NV.dati.ambiti;
    return h('section', { class: 'nv-section nv-dash-ambiti' }, [
      h('div', { class: 'nv-dash-ambiti__head' }, [
        titoloSezione(screen, 'titoloAmbiti', 'Opportunità per te'),
        NV.testo(screen, 'notaAmbiti', 'Scelte per lo step in cui sei e per arrivare al prossimo.', 'p', 'nv-dash-nota')
      ]),
      h('div', { class: 'nv-btns nv-dash-ambiti__btns' }, [
        NV.pulsante(A.formazione.titolo, { icona: A.formazione.icona, onclick: vaiAmbito('formazione', attuale) }),
        NV.pulsante(A.lavoro.titolo, { variante: 'nero', icona: A.lavoro.icona, onclick: vaiAmbito('lavoro', attuale) })
      ])
    ]);
  }

  function versioneBase(screen, attuale) {
    return [
      saluto(screen, 'nv-title nv-title--md nv-dash-saluto'),
      cardStepBase(screen, attuale),
      bloccoAdessoBase(screen, attuale),
      h('section', { class: 'nv-section' }, [
        h('div', { class: 'nv-section__head' }, [titoloSezione(screen, 'titoloPrimoPiano', 'In primo piano')]),
        h('div', { class: 'nv-list' }, elementiPrimoPiano(attuale).map(rigaBase))
      ]),
      ambitiBase(screen, attuale)
    ];
  }

  /* ==================================================================
     VERSIONE 2 — CARD EROE
     La sfumatura di marca sulla cosa piu' importante (dove sei), la
     mascotte che ti spiega l'obiettivo, le proposte da sfogliare e due
     tessere alte per Formazione e Lavoro.
     ================================================================== */

  function eroeStep(screen, attuale) {
    var lista = NV.steps();
    var s = lista[attuale];
    var P = NV.dati.percorso;
    return h('button', {
      class: 'nv-hero nv-press nv-dash-eroe',
      type: 'button',
      onclick: vaiPercorso,
      'aria-label': 'Apri la linea di carriera. Sei allo step ' + (attuale + 1) + ' di ' + lista.length + ', ' + s.titolo
    }, [
      h('span', { class: 'nv-dash-eroe__head' }, [
        h('span', { class: 'nv-dash-eroe__saluto' }, [
          NV.testo(screen, 'saluto', 'Ciao'),
          ' ' + NV.dati.utente.nome + ', ',
          NV.testo(screen, 'seiAllo', 'sei allo')
        ]),
        freccia('nv-dash-freccia--chiara')
      ]),
      h('span', { class: 'nv-dash-eroe__num' }, [
        h('strong', { text: 'Step ' + (attuale + 1) }),
        h('span', { text: ' di ' + lista.length })
      ]),
      h('span', { class: 'nv-dash-eroe__nome', text: s.titolo }),
      tracciato(attuale, 'nv-dash-traccia--chiara'),
      h('span', { class: 'nv-dash-eroe__piede' }, [
        icon('trophy', ICO.SM),
        h('span', { class: 'nv-dash-eroe__meta' }, [
          NV.testo(screen, 'traguardo', 'Traguardo'),
          ': ',
          h('strong', { text: P.obiettivo })
        ]),
        P.durataTotale ? h('span', { class: 'nv-dash-eroe__durata', text: P.durataTotale }) : null
      ])
    ]);
  }

  function fumettoEroe(screen, attuale) {
    var s = NV.step(attuale);
    return h('section', { class: 'nv-dash-fumetto' }, [
      h('div', { class: 'nv-dash-fumetto__riga' }, [
        NV.mascotte(POSE_STEP[attuale] || 'indicare', 'nv-dash-fumetto__mascotte'),
        h('div', { class: 'nv-dash-fumetto__nuvola' }, [
          NV.testo(screen, 'occhielloObiettivo', 'Obiettivo della fase', 'span', 'nv-eyebrow'),
          h('p', { class: 'nv-dash-fumetto__obiettivo', text: s.obiettivo })
        ])
      ]),
      h('button', { class: 'nv-dash-fumetto__corpo nv-press', type: 'button', onclick: apriStepAttuale(attuale) }, [
        h('span', { class: 'nv-body', text: s.descrizione }),
        compitiFatti(NV.conteggio(s), 'Scopri lo step')
      ])
    ]);
  }

  function schedaEroe(v) {
    return h('button', { class: 'nv-dash-scheda nv-press', type: 'button', onclick: v.apri }, [
      h('span', { class: 'nv-dash-scheda__top' }, [
        v.opp && v.opp.data ? riquadroData(v.opp.data) : NV.icoChip(v.icona, v.tono),
        v.tipo === 'compito' ? NV.tag(v.compito.obbligatoria) : null
      ]),
      h('span', { class: 'nv-dash-scheda__etichetta' + (v.tipo === 'compito' ? ' is-main' : ''), text: v.etichetta }),
      h('span', { class: 'nv-dash-scheda__titolo', text: v.titolo }),
      datiVoce(v, 'nv-dash-scheda__dati')
    ]);
  }

  function tesseraEroe(nome, attuale) {
    var a = NV.dati.ambiti[nome];
    return h('button', {
      class: 'nv-dash-tessera nv-dash-tessera--' + nome + ' nv-press',
      type: 'button',
      onclick: vaiAmbito(nome, attuale)
    }, [
      h('span', { class: 'nv-dash-tessera__top' }, [
        NV.icoChip(a.icona, nome === 'lavoro' ? 3 : 1, true),
        freccia('nv-dash-freccia--bianca')
      ]),
      h('span', { class: 'nv-dash-tessera__copy' }, [
        h('strong', { text: a.titolo }),
        h('span', { text: proposte(quanteOpportunita(nome, attuale)) })
      ])
    ]);
  }

  function versioneEroe(screen, attuale) {
    return [
      eroeStep(screen, attuale),
      fumettoEroe(screen, attuale),
      h('section', { class: 'nv-section' }, [
        h('div', { class: 'nv-section__head' }, [titoloSezione(screen, 'titoloPrimoPiano', 'In primo piano')]),
        h('div', { class: 'nv-dash-carosello' }, elementiPrimoPiano(attuale).map(schedaEroe))
      ]),
      h('section', { class: 'nv-section' }, [
        h('div', { class: 'nv-dash-ambiti__head' }, [
          titoloSezione(screen, 'titoloAmbiti', 'Opportunità per te'),
          NV.testo(screen, 'notaAmbiti', 'Scelte per lo step in cui sei e per arrivare al prossimo.', 'p', 'nv-dash-nota')
        ]),
        h('div', { class: 'nv-dash-tessere' }, [tesseraEroe('formazione', attuale), tesseraEroe('lavoro', attuale)])
      ])
    ];
  }

  /* ==================================================================
     VERSIONE 3 — PROSSIMA MOSSA
     In cima una striscia compatta con lo step, poi un solo compito da
     fare adesso con la sua azione. "In primo piano" e' diviso per tipo.
     ================================================================== */

  function strisciaMossa(screen, attuale) {
    var lista = NV.steps();
    var s = lista[attuale];
    var conto = NV.conteggio(s);
    return h('button', {
      class: 'nv-dash-striscia nv-press',
      type: 'button',
      onclick: vaiPercorso,
      'aria-label': 'Apri la linea di carriera. Sei allo step ' + (attuale + 1) + ' di ' + lista.length + ', ' + s.titolo
    }, [
      h('span', { class: 'nv-dash-striscia__riga' }, [
        h('span', { class: 'nv-dash-striscia__testo' }, [
          h('strong', { text: 'Step ' + (attuale + 1) + ' di ' + lista.length }),
          h('span', { text: s.titolo })
        ]),
        h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.MD)])
      ]),
      h('span', { class: 'nv-dash-segmenti', 'aria-hidden': 'true' }, lista.map(function (x, i) {
        var stato = statoTappa(i, attuale, lista.length);
        return h('span', { class: 'nv-dash-segmento is-' + stato });
      }).concat([h('span', { class: 'nv-dash-segmenti__coppa' }, [icon('trophy', ICO.SM)])])),
      /* L'obiettivo della fase sta qui dentro, in piccolo: in questa
         versione il posto grande e' della prossima mossa. */
      h('span', { class: 'nv-dash-striscia__obiettivo' }, [
        NV.testo(screen, 'occhielloObiettivo', 'Obiettivo della fase', 'span', 'nv-dash-riga__etichetta'),
        h('span', { class: 'nv-dash-striscia__frase', text: s.obiettivo })
      ]),
      h('span', { class: 'nv-dash-striscia__piede' }, [
        icon('list-checks', ICO.SM),
        h('span', {}, [h('strong', { text: conto.fatti + ' di ' + conto.totali }), ' compiti fatti in questo step'])
      ])
    ]);
  }

  /** La prima frase di un testo: basta per capire, senza tagliare a meta'. */
  function primaFrase(t) {
    var m = String(t || '').match(/^.*?[.!?](\s|$)/);
    return m ? m[0].trim() : t;
  }

  function cardMossa(screen, attuale) {
    var m = prossimaMossa(attuale);
    if (!m) return null;
    var c = m.compito;
    var cat = NV.categoria(c.categoria);
    var quante = NV.opportunitaPer({ compito: c.id }).length;
    var azione = quante
      ? 'Vedi ' + quante + ' ' + (quante === 1 ? cat.singolare : cat.etichetta).toLowerCase()
      : 'Apri il compito';
    return h('section', { class: 'nv-dash-mossa' }, [
      NV.testo(screen, 'titoloMossa', 'La tua prossima mossa', 'h1', 'nv-title nv-title--md'),
      h('div', { class: 'nv-dash-mossa__card' }, [
        h('div', { class: 'nv-dash-mossa__top' }, [
          NV.icoChip(cat.icona, cat.tono, true),
          h('div', { class: 'nv-dash-mossa__tags' }, [
            c.stato === 'in-corso' ? NV.etichetta('In corso', 'main') : null,
            NV.tag(c.obbligatoria)
          ])
        ]),
        h('h2', { class: 'nv-dash-mossa__titolo', text: c.titolo }),
        c.nota ? h('p', { class: 'nv-dash-mossa__nota' }, [icon('calendar-days', ICO.SM), h('span', { text: c.nota })]) : null,
        h('p', { class: 'nv-dash-mossa__desc', text: primaFrase(c.descrizione) }),
        NV.pulsante(azione, { iconaDopo: 'arrow-right', onclick: function () { NV.apriCompito(c.id); } }),
        h('button', { class: 'nv-link nv-dash-mossa__link', type: 'button', onclick: apriStepAttuale(attuale) }, [
          NV.testo(screen, 'linkStep', 'Tutti i compiti dello step'),
          icon('chevron-right', ICO.SM)
        ])
      ])
    ]);
  }

  /* I tre gruppi dell'interruttore. "Da fare" = compiti ancora aperti e
     proposte per farli; "Eventi" = workshop ed eventi dello step;
     "Notizie" = le notizie. Il compito della prossima mossa non si ripete. */
  function gruppiMossa(attuale, escluso) {
    var voci = elementiPrimoPiano(attuale);
    var visti = {};
    voci.forEach(function (v) { visti[v.tipo + ':' + v.id] = true; });

    var compiti = voci.filter(function (v) { return v.tipo === 'compito'; });
    compitiAperti(NV.step(attuale)).forEach(function (c) {
      if (visti['compito:' + c.id]) return;
      visti['compito:' + c.id] = true;
      compiti.push(voce({ tipo: 'compito', id: c.id }));
    });
    compiti = compiti.filter(function (v) { return v && v.id !== escluso; });
    var fare = compiti.concat(voci.filter(function (v) { return v.tipo === 'opportunita' && v.gruppo === 'fare'; }));

    var eventi = voci.filter(function (v) { return v.gruppo === 'eventi'; });
    NV.opportunitaPer({ step: attuale }).forEach(function (o) {
      if ((o.categoria === 'eventi' || o.categoria === 'workshop') && !visti['opportunita:' + o.id]) {
        visti['opportunita:' + o.id] = true;
        eventi.push(voce({ tipo: 'opportunita', id: o.id, etichetta: 'Evento per il tuo step' }));
      }
    });

    var notizie = voci.filter(function (v) { return v.gruppo === 'notizie'; });
    Object.keys(NV.dati.notizie || {}).forEach(function (id) {
      if (!visti['notizia:' + id]) notizie.push(voce({ tipo: 'notizia', id: id }));
    });

    return { fare: fare, eventi: eventi.filter(Boolean), notizie: notizie.filter(Boolean) };
  }

  function voceMossa(v) {
    var compito = v.tipo === 'compito';
    return h('button', { class: 'nv-dash-voce nv-press', type: 'button', onclick: v.apri }, [
      v.opp && v.opp.data ? riquadroData(v.opp.data) : NV.icoChip(v.icona, v.tono),
      h('span', { class: 'nv-row__copy' }, [
        compito
          ? h('span', { class: 'nv-dash-voce__tags' }, [
              NV.tag(v.compito.obbligatoria),
              v.compito.stato === 'in-corso' ? NV.etichetta('In corso', 'main') : null
            ])
          : h('span', { class: 'nv-dash-riga__etichetta', text: v.etichetta }),
        h('span', { class: 'nv-dash-voce__titolo', text: v.titolo }),
        /* nella scheda "Da fare" lo stato si legge gia': resta la durata */
        datiVoce(compito ? { dati: [v.compito.nota || v.compito.durata] } : v)
      ]),
      h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.MD)])
    ]);
  }

  function elencoMossa(voci, gruppo) {
    if (!voci.length) {
      var testi = {
        fare: 'Hai già fatto tutto quello che serve in questo step.',
        eventi: 'Per ora non ci sono eventi per questo step.',
        notizie: 'Nessuna notizia nuova, per ora.'
      };
      return h('div', { class: 'nv-dash-vuoto' }, [
        NV.mascotte(gruppo === 'fare' ? 'festeggiare' : 'dormire', 'nv-dash-vuoto__mascotte'),
        h('p', { text: testi[gruppo] })
      ]);
    }
    return h('div', { class: 'nv-dash-gruppo' }, voci.map(voceMossa));
  }

  function primoPianoMossa(screen, attuale, escluso) {
    var gruppi = gruppiMossa(attuale, escluso);
    var etichette = { fare: 'Da fare', eventi: 'Eventi', notizie: 'Notizie' };
    var iniziale = paramProva('filtro');
    if (!gruppi[iniziale]) iniziale = 'fare';

    var contenuto = h('div', { class: 'nv-dash-schede__contenuto' });

    /* Cambiando scheda si ridisegna solo l'elenco: la pagina non salta. */
    function disegna(valore) {
      var opzioni = Object.keys(etichette).map(function (k) {
        return { value: k, label: etichette[k] + ' ' + gruppi[k].length };
      });
      contenuto.replaceChildren(
        NV.segmenti(opzioni, valore, disegna, 'nv-seg--piena nv-dash-seg'),
        elencoMossa(gruppi[valore], valore)
      );
    }
    disegna(iniziale);

    return h('section', { class: 'nv-section nv-dash-schede' }, [
      h('div', { class: 'nv-section__head' }, [titoloSezione(screen, 'titoloPrimoPiano', 'In primo piano')]),
      contenuto
    ]);
  }

  function ambitiMossa(screen, attuale) {
    function bottone(nome) {
      var a = NV.dati.ambiti[nome];
      var b = NV.pulsante(a.titolo, { variante: 'soft', icona: a.icona, onclick: vaiAmbito(nome, attuale), classe: 'nv-dash-ambito' });
      b.appendChild(h('span', { class: 'nv-dash-conta', 'aria-label': proposte(quanteOpportunita(nome, attuale)), text: String(quanteOpportunita(nome, attuale)) }));
      return b;
    }
    return h('section', { class: 'nv-section nv-dash-ambiti' }, [
      h('div', { class: 'nv-dash-ambiti__head' }, [
        titoloSezione(screen, 'titoloAmbiti', 'Opportunità per te'),
        NV.testo(screen, 'notaAmbiti', 'Scelte per lo step in cui sei e per arrivare al prossimo.', 'p', 'nv-dash-nota')
      ]),
      h('div', { class: 'nv-btns' }, [bottone('formazione'), bottone('lavoro')])
    ]);
  }

  function versioneMossa(screen, attuale) {
    var m = prossimaMossa(attuale);
    return [
      strisciaMossa(screen, attuale),
      cardMossa(screen, attuale),
      primoPianoMossa(screen, attuale, m ? m.compito.id : null),
      ambitiMossa(screen, attuale)
    ];
  }

  /* ==================================================================
     LA SCHERMATA
     ================================================================== */

  window.NavidaRender.screens.nvDashboard = function (screen) {
    var v = NV.variante(screen.id) || 'base';
    var attuale = indiceAttuale();

    var corpo;
    if (v === 'eroe') corpo = versioneEroe(screen, attuale);
    else if (v === 'mossa') corpo = versioneMossa(screen, attuale);
    else corpo = versioneBase(screen, attuale);

    if (paramProva('foglio') === 'notizia') {
      setTimeout(function () {
        var id = Object.keys(NV.dati.notizie || {})[0];
        if (id) apriNotizia(NV.dati.notizie[id]);
      }, 0);
    }

    return [
      NV.pagina('nv-dash nv-dash--' + v, [NV.barraHome()].concat(corpo)),
      NV.navBasso('dashboard')
    ];
  };
})();
