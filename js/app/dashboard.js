/* ==========================================================================
   NAVIDA — Dashboard
   ==========================================================================
   La prima schermata dell'app. Nasce dalle tre versioni di prova
   (Essenziale, Card eroe, Prossima mossa): Bac ha tenuto i pezzi migliori.

     barra        avatar e saluto a sinistra, campanella a destra
     promemoria   lo step in cui sei, piccolo: pallini, titolo, "Step n di x"
     mossa        LA COSA PIU' IMPORTANTE: il compito da fare adesso,
                  sulla sfumatura di marca
     in primo piano  diviso per tipo: Da fare | Eventi | Notizie
     opportunità  due tessere, Formazione e Lavoro

   Niente mascotte in questa schermata.

   Parametri di prova nell'indirizzo:
     &attuale=3        finge di essere allo step 3 (da 1), per vedere gli altri casi
     &filtro=eventi    apre la scheda Eventi (fare | eventi | notizie)
     &foglio=notizia   apre subito il pannello della notizia

   Stile: css/app/dashboard.css (prefisso nv-dash-).
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV, h = NV.h, icon = NV.icon, ICO = NV.ICO;

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
  function statoTappa(i, attuale) {
    if (i < attuale) return 'fatto';
    if (i === attuale) return 'attuale';
    return 'da-fare';
  }

  function vaiPercorso() { NV.vai('percorso'); }

  function apriStepAttuale(attuale) {
    return function () { NV.apriStep(attuale); };
  }

  /* Le tessere parlano dello step in cui sei: se prima hai curiosato
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

  /** I compiti non ancora fatti: prima quelli in corso, poi i necessari. */
  var compitiAperti = NV.compitiAperti;

  /* ==================================================================
     IN PRIMO PIANO — una voce sola per compiti, opportunità e notizie
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
  var prossimaMossa = NV.prossimaMossa;

  /* ==================================================================
     PEZZI COMUNI
     ================================================================== */

  /** Pulsante tondo da 44 con la freccia (regola 8 del kit maturo). */
  function freccia() {
    return h('span', { class: 'nv-dash-freccia', 'aria-hidden': 'true' }, [icon('arrow-right', ICO.MD)]);
  }

  /** Giorno e mese di un evento, come un foglietto di calendario. */
  function riquadroData(d) {
    return h('span', { class: 'nv-dash-data', 'aria-hidden': 'true' }, [
      h('strong', { text: d.giorno }),
      h('small', { text: d.mese })
    ]);
  }

  /** La riga dei dati piccoli: "Online · 8 settimane  ★ 4,7" */
  function datiVoce(v) {
    return h('span', { class: 'nv-dash-dati' }, [
      v.dati.length ? h('span', { text: v.dati.join(' · ') }) : null,
      v.voto ? NV.stelle(v.voto) : null
    ]);
  }

  function titoloSezione(screen, chiave, testo, tag) {
    return NV.testo(screen, chiave, testo, tag || 'h2', 'nv-section__title');
  }

  /* ==================================================================
     PROMEMORIA DELLO STEP
     Piccolo, in cima: titolo, "Step n di x" e i pallini. Tocco → percorso.
     ================================================================== */

  function promemoriaStep(attuale) {
    var lista = NV.steps();
    var s = lista[attuale];
    return h('button', {
      class: 'nv-dash-promemoria nv-press',
      type: 'button',
      onclick: vaiPercorso,
      'aria-label': 'Apri la linea di carriera. Sei allo step ' + (attuale + 1) + ' di ' + lista.length + ', ' + s.titolo
    }, [
      h('span', { class: 'nv-dash-promemoria__testo' }, [
        h('span', { class: 'nv-dash-promemoria__titolo', text: s.titolo }),
        h('span', { class: 'nv-dash-promemoria__num', text: 'Step ' + (attuale + 1) + ' di ' + lista.length })
      ]),
      h('span', { class: 'nv-dash-pallini', 'aria-hidden': 'true' }, lista.map(function (x, i) {
        return h('span', { class: 'nv-dash-pallino is-' + statoTappa(i, attuale) });
      })),
      h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.SM)])
    ]);
  }

  /* ==================================================================
     LA TUA PROSSIMA MOSSA — sulla sfumatura di marca
     ================================================================== */

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
      titoloSezione(screen, 'titoloMossa', 'La tua prossima mossa'),
      h('div', { class: 'nv-hero nv-dash-mossa__card' }, [
        h('div', { class: 'nv-dash-mossa__top' }, [
          NV.icoChip(cat.icona, cat.tono, true),
          h('div', { class: 'nv-dash-mossa__tags' }, [
            c.stato === 'in-corso' ? NV.etichetta('In corso', 'chiara') : null,
            NV.etichetta(c.obbligatoria ? 'Necessaria' : 'Facoltativa', 'chiara')
          ])
        ]),
        h('h3', { class: 'nv-dash-mossa__titolo', text: c.titolo }),
        c.nota ? h('p', { class: 'nv-dash-mossa__nota' }, [icon('calendar-days', ICO.SM), h('span', { text: c.nota })]) : null,
        h('p', { class: 'nv-dash-mossa__desc', text: primaFrase(c.descrizione) }),
        NV.pulsante(azione, { variante: 'bianco', iconaDopo: 'arrow-right', onclick: function () { NV.apriCompito(c.id); } }),
        h('button', { class: 'nv-link nv-dash-mossa__link', type: 'button', onclick: apriStepAttuale(attuale) }, [
          NV.testo(screen, 'linkStep', 'Tutti i compiti dello step'),
          icon('chevron-right', ICO.SM)
        ])
      ])
    ]);
  }

  /* ==================================================================
     IN PRIMO PIANO — diviso per tipo
     "Da fare" = compiti ancora aperti e proposte per farli;
     "Eventi" = workshop ed eventi dello step; "Notizie" = le notizie.
     Il compito della prossima mossa non si ripete.
     ================================================================== */

  function gruppiPrimoPiano(attuale, escluso) {
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

  function rigaPrimoPiano(v) {
    var compito = v.tipo === 'compito';
    return h('button', { class: 'nv-dash-voce nv-press', type: 'button', onclick: v.apri }, [
      v.opp && v.opp.data ? riquadroData(v.opp.data) : NV.icoChip(v.icona, v.tono),
      h('span', { class: 'nv-row__copy' }, [
        compito
          ? h('span', { class: 'nv-dash-voce__tags' }, [
              NV.tag(v.compito.obbligatoria),
              v.compito.stato === 'in-corso' ? NV.etichetta('In corso', 'main') : null
            ])
          : h('span', { class: 'nv-dash-voce__etichetta', text: v.etichetta }),
        h('span', { class: 'nv-dash-voce__titolo', text: v.titolo }),
        /* nella scheda "Da fare" lo stato si legge gia': resta la durata */
        datiVoce(compito ? { dati: [v.compito.nota || v.compito.durata].filter(Boolean) } : v)
      ]),
      h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.MD)])
    ]);
  }

  function elencoPrimoPiano(voci, gruppo) {
    if (!voci.length) {
      var vuoti = {
        fare: { icona: 'sparkles', testo: 'Hai già fatto tutto quello che serve in questo step.' },
        eventi: { icona: 'calendar-days', testo: 'Per ora non ci sono eventi per questo step.' },
        notizie: { icona: 'newspaper', testo: 'Nessuna notizia nuova, per ora.' }
      };
      return h('div', { class: 'nv-dash-vuoto' }, [
        icon(vuoti[gruppo].icona, ICO.MD),
        h('p', { text: vuoti[gruppo].testo })
      ]);
    }
    return h('div', { class: 'nv-dash-gruppo' }, voci.map(rigaPrimoPiano));
  }

  function primoPiano(screen, attuale, escluso) {
    var gruppi = gruppiPrimoPiano(attuale, escluso);
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
        NV.segmenti(opzioni, valore, disegna, 'nv-seg--piena'),
        elencoPrimoPiano(gruppi[valore], valore)
      );
    }
    disegna(iniziale);

    return h('section', { class: 'nv-section' }, [
      h('div', { class: 'nv-section__head' }, [titoloSezione(screen, 'titoloPrimoPiano', 'In primo piano')]),
      contenuto
    ]);
  }

  /* ==================================================================
     OPPORTUNITÀ PER TE — due tessere alte
     ================================================================== */

  function tessera(nome, attuale) {
    var a = NV.dati.ambiti[nome];
    return h('button', {
      class: 'nv-dash-tessera nv-dash-tessera--' + nome + ' nv-press',
      type: 'button',
      onclick: vaiAmbito(nome, attuale)
    }, [
      h('span', { class: 'nv-dash-tessera__top' }, [
        NV.icoChip(a.icona, nome === 'lavoro' ? 3 : 1, true),
        freccia()
      ]),
      h('span', { class: 'nv-dash-tessera__copy' }, [
        h('strong', { text: a.titolo }),
        h('span', { text: proposte(quanteOpportunita(nome, attuale)) })
      ])
    ]);
  }

  function opportunita(screen, attuale) {
    return h('section', { class: 'nv-section' }, [
      h('div', { class: 'nv-dash-ambiti__head' }, [
        titoloSezione(screen, 'titoloAmbiti', 'Opportunità per te'),
        NV.testo(screen, 'notaAmbiti', 'Scelte per lo step in cui sei e per arrivare al prossimo.', 'p', 'nv-dash-nota')
      ]),
      h('div', { class: 'nv-dash-tessere' }, [tessera('formazione', attuale), tessera('lavoro', attuale)])
    ]);
  }

  /* ==================================================================
     LA SCHERMATA
     ================================================================== */

  window.NavidaRender.screens.nvDashboard = function (screen) {
    var attuale = indiceAttuale();
    var m = prossimaMossa(attuale);

    if (paramProva('foglio') === 'notizia') {
      setTimeout(function () {
        var id = Object.keys(NV.dati.notizie || {})[0];
        if (id) apriNotizia(NV.dati.notizie[id]);
      }, 0);
    }

    return [
      NV.pagina('nv-dash', [
        NV.barraHome({ screen: screen }),
        promemoriaStep(attuale),
        cardMossa(screen, attuale),
        primoPiano(screen, attuale, m ? m.compito.id : null),
        opportunita(screen, attuale)
      ]),
      NV.navBasso('dashboard')
    ];
  };
})();
