/* ==========================================================================
   NAVIDA — Scheda info
   ==========================================================================
   L'ultima pagina del flusso: tocchi un elemento nella scheda attività e
   arrivi qui. Può essere una scuola, un corso, un workshop o un evento, un
   libro o un'offerta di lavoro. Deve dire in poco spazio quello che serve
   per decidere (quanto costa, quanto dura, dove, quando, se è valido) e
   aiutare davvero a raggiungere chi lo offre (sito, telefono, email,
   messaggio già pronto, candidatura, prenotazione).

   Tre versioni (pannello "Versione" della barra di modifica):
     base    Copertina   grafica grande in alto, pagina lunga che si scorre
     schede  Schede      testata compatta e contenuto diviso in schede
     luogo   Luogo       come la scheda di un posto sulle mappe

   La scheda si adatta al tipo e ai dati che ci sono: una sezione senza dati
   non si disegna proprio, così le schede con pochi campi non hanno buchi.

   Prove dall'indirizzo:
     ?screen=scheda&opp=sid&variant=luogo
     &tab=programma     apre una scheda della versione "schede"
     &foglio=contatta   apre un pannello (contatta | menu | condividi | azione | fatto)

   Stile: css/app/scheda.css (prefisso nv-info-).
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV, h = NV.h, icon = NV.icon, ICO = NV.ICO;
  var D = NV.dati;

  /* Icone Lucide che mancano nella base (geometria originale). */
  NV.icone({
    'bookmark-check': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/><path d="m9 10 2 2 4-4"/>',
    'hourglass': '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    'chart-no-axes-column-increasing': '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    /* per i prezzi: il testo ha già il simbolo "€", l'icona non lo ripete */
    'wallet': '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'
  });

  window.NAVIDA_PAGE_VARIANTS = window.NAVIDA_PAGE_VARIANTS || {};
  window.NAVIDA_PAGE_VARIANTS.scheda = {
    etichetta: 'Versione della scheda info',
    predefinita: 'base',
    options: [
      { value: 'base', label: 'Copertina' },
      { value: 'schede', label: 'Schede' },
      { value: 'luogo', label: 'Luogo' }
    ]
  };

  /* ==================================================================
     IL TIPO DI SCHEDA
     Ogni categoria diventa uno di cinque tipi. Il tipo decide l'azione
     principale, i nomi delle sezioni e cosa conviene chiedere a chi lo offre.
     ================================================================== */
  var TIPI = { scuole: 'scuola', corsi: 'corso', workshop: 'evento', eventi: 'evento', libri: 'libro', lavoro: 'lavoro' };

  var PER_TIPO = {
    scuola: {
      azione: 'Iscriviti',
      fatto: ['Segna come fatto', 'Fatto'],
      punti: 'Perché sceglierla', programma: 'Il piano di studi', docenti: 'Alcuni docenti',
      descrizione: 'Di cosa si tratta', sede: 'Dove si trova',
      domande: ['Quando c’è il prossimo open day?', 'Ci sono borse di studio o rate?', 'Quante ore di stage si fanno?'],
      messaggio: function (o) {
        return 'Buongiorno, sono ' + D.utente.nome + '. Vorrei informazioni su “' + o.nome + '”: come ci si iscrive, quando c’è il prossimo open day e se ci sono borse di studio. Grazie!';
      }
    },
    corso: {
      azione: 'Iscriviti',
      fatto: ['Segna come completato', 'Completato'],
      punti: 'Cosa impari', programma: 'Programma', docenti: 'Chi insegna',
      descrizione: 'Di cosa si tratta', sede: 'Dove si tiene',
      domande: ['Il certificato è riconosciuto dalle aziende?', 'Quante ore servono a settimana?', 'Si può provare gratis?'],
      messaggio: function (o) {
        return 'Buongiorno, sono ' + D.utente.nome + '. Prima di iscrivermi a “' + o.nome + '” vorrei sapere quante ore servono a settimana e se il certificato è riconosciuto. Grazie!';
      }
    },
    evento: {
      azione: 'Prenota il posto',
      fatto: ['Segna come fatto', 'Fatto'],
      punti: 'Cosa porti a casa', programma: 'Programma', docenti: 'Chi lo guida',
      descrizione: 'Di cosa si tratta', sede: 'Dove',
      domande: ['Serve portare il portatile?', 'C’è una lista d’attesa?', 'Rilasciate un attestato?'],
      messaggio: function (o) {
        return 'Ciao, sono ' + D.utente.nome + '. Vorrei partecipare a “' + o.nome + '”: c’è ancora posto? Devo portare qualcosa? Grazie!';
      }
    },
    libro: {
      azione: 'Vai al sito',
      fatto: ['Segna come letto', 'Letto'],
      punti: 'Cosa ti lascia', programma: 'Indice', docenti: 'Autori',
      descrizione: 'Di cosa parla', sede: 'Dove trovarlo',
      domande: null,
      messaggio: null
    },
    lavoro: {
      azione: 'Candidati',
      fatto: ['Segna come fatto', 'Fatto'],
      punti: 'Cosa offrono', programma: 'Come funziona', docenti: 'Con chi lavori',
      descrizione: 'Il lavoro', sede: 'Dove lavorerai',
      domande: ['Com’è fatto il colloquio?', 'Chi mi affiancherà nei primi mesi?', 'C’è la possibilità di essere assunti?'],
      messaggio: function (o) {
        return 'Buongiorno, sono ' + D.utente.nome + ', studente di design. Vorrei candidarmi per “' + o.nome + '”: vi allego curriculum e portfolio. Resto a disposizione per un colloquio.';
      }
    }
  };

  /* ==================================================================
     STATO DELLA SESSIONE
     Salvataggi e compiti spuntati da questa pagina. Restano finché non
     ricarichi: è un prototipo, non tocchiamo i dati condivisi.
     ================================================================== */
  var salvati = {};
  var spuntati = {};
  var tabScelta = {};

  function parametro(nome) {
    try { return new URLSearchParams(window.location.search).get(nome); } catch (e) { return null; }
  }

  /* ==================================================================
     DATI PRONTI PER LA SCHEDA
     ================================================================== */

  /** Il compito a cui serve: quello aperto prima, se c'è, altrimenti il primo. */
  function compitoDi(o) {
    var ids = (o.compiti || []).filter(function (id) { return !!NV.cercaCompito(id); });
    if (!ids.length) return null;
    var aperto = NV.contesto().compito;
    var scelto = ids.indexOf(aperto) > -1 ? aperto : ids[0];
    var t = NV.cercaCompito(scelto);
    return {
      id: scelto,
      compito: t.compito,
      step: t.step,
      stepIndice: t.stepIndice,
      altri: ids.filter(function (id) { return id !== scelto; }).map(NV.compito)
    };
  }

  /** "Donald A. Norman · Giunti" -> { prima: 'Donald A. Norman', dopo: 'Giunti' } */
  function dividiEnte(o) {
    var parti = String(o.ente || '').split(' · ');
    return { prima: parti[0] || '', dopo: parti.slice(1).join(' · ') };
  }

  function iconaModalita(m) {
    if (m === 'Online') return 'laptop';
    if (m === 'Ibrido') return 'repeat';
    return 'building-2';
  }

  /** Città e distanza, oppure "Online". */
  function luogo(o) {
    if (o.modalita === 'Online') return 'Online';
    if (o.modalita === 'Libro') return '';
    return [o.citta, o.distanza].filter(Boolean).join(' · ');
  }

  function persone(n) {
    if (n == null) return '';
    return (n >= 1000 ? NV.numeroCorto(n) : String(n)) + ' iscritti';
  }

  /** "88k recensioni", "1 recensione" */
  function contaRecensioni(n) {
    if (!n) return '';
    return NV.numeroCorto(n) + (n === 1 ? ' recensione' : ' recensioni');
  }

  /**
   * I dati chiave, nell'ordine giusto per il tipo. Solo quelli che ci sono.
   * Ogni voce: { chiave, icona, etichetta, valore }
   */
  function datiChiave(s) {
    var o = s.o, l = [];
    function add(chiave, icona, etichetta, valore) {
      if (valore) l.push({ chiave: chiave, icona: icona, etichetta: etichetta, valore: String(valore) });
    }
    var ente = dividiEnte(o);
    switch (s.tipo) {
      case 'scuola':
        add('durata', 'clock', 'Durata', o.durata);
        add('prezzo', 'wallet','Costo', o.prezzo);
        add('inizio', 'calendar', 'Inizio', o.inizio);
        add('modalita', iconaModalita(o.modalita), 'Frequenza', o.modalita);
        add('certificazione', 'award', 'Titolo', o.certificazione);
        add('lingua', 'languages', 'Lingua', o.lingua);
        break;
      case 'corso':
        add('durata', 'clock', 'Durata', o.durata);
        add('prezzo', 'wallet','Prezzo', o.prezzo);
        add('livello', 'chart-no-axes-column-increasing', 'Livello', o.livello);
        add('modalita', iconaModalita(o.modalita), 'Modalità', o.modalita);
        add('certificazione', 'award', 'Certificato', o.certificazione);
        add('inizio', 'calendar', 'Inizio', o.inizio);
        add('lingua', 'languages', 'Lingua', o.lingua);
        add('studenti', 'users', 'Iscritti', o.studenti);
        break;
      case 'evento':
        add('inizio', 'calendar', 'Quando', o.inizio);
        add('durata', 'clock', 'Durata', o.durata);
        add('prezzo', 'ticket', 'Ingresso', o.prezzo);
        add('posti', 'hourglass', 'Posti', o.posti);
        add('partecipanti', 'users', 'Partecipanti', persone(o.partecipanti));
        add('lingua', 'languages', 'Lingua', o.lingua);
        break;
      case 'libro':
        add('autore', 'user-round', 'Autore', ente.prima);
        add('editore', 'book-open', 'Editore', ente.dopo);
        add('durata', 'file-text', 'Lunghezza', o.durata);
        add('prezzo', 'wallet','Prezzo', o.prezzo);
        add('lingua', 'languages', 'Lingua', o.lingua);
        break;
      default: /* lavoro */
        add('contratto', 'file-text', 'Contratto', o.contratto);
        add('prezzo', 'wallet','Compenso', o.prezzo);
        add('durata', 'clock', 'Impegno', o.durata);
        add('inizio', 'calendar', 'Inizio', o.inizio);
        add('modalita', iconaModalita(o.modalita), 'Modalità', o.modalita);
        add('lingua', 'languages', 'Lingua', o.lingua);
    }
    return l;
  }

  function dato(s, chiave) {
    var trovato = datiChiave(s).filter(function (d) { return d.chiave === chiave; })[0];
    return trovato ? trovato.valore : '';
  }

  function haContatti(o) { var c = o.contatti || {}; return !!(c.email || c.telefono); }
  function haSito(o) { return !!(o.contatti && o.contatti.sito); }

  function etichettaAzione(s) {
    if (s.tipo === 'corso' && s.o.completato) return 'Vai al corso';
    return PER_TIPO[s.tipo].azione;
  }

  /* ---- stato "fatto" e "salvato" ------------------------------------ */
  function eFatto(s) {
    if (spuntati[s.o.id] != null) return spuntati[s.o.id];
    return !!(s.o.completato || s.o.letto || (s.compito && s.compito.compito.stato === 'fatto'));
  }
  function eSalvato(s) { return !!salvati[s.o.id]; }

  /* ==================================================================
     PEZZI PICCOLI
     ================================================================== */
  function sigla(o) { return o.sigla || String(o.ente || o.nome || '?').charAt(0); }

  /** "Sara T." -> "ST", "Giulia Ferraro" -> "GF" */
  function iniziali(nome) {
    return String(nome || '').replace(/\./g, '').split(/\s+/).filter(Boolean).slice(0, 2)
      .map(function (p) { return p.charAt(0).toUpperCase(); }).join('');
  }

  /** Pastiglia della categoria: icona nel suo colore, testo scuro
      (così si legge anche con la coppia gialla dei libri). */
  function categoriaEtichetta(s) {
    return h('span', { class: 'nv-info-cat nv-tono-' + (s.cat.tono || 1) }, [
      icon(s.cat.icona, ICO.SM),
      h('span', { text: s.cat.singolare })
    ]);
  }

  /** Le etichette di stato che contano per decidere. */
  function etichetteStato(s) {
    var o = s.o;
    return [
      o.sponsorizzato ? NV.sponsor() : null,
      etichettaFatto(s),
      /* "Compatibile con lo studio" è una buona notizia; "Per lo step 2" è solo un'informazione */
      o.adatto ? (/compatibile/i.test(o.adatto) ? NV.etichetta(o.adatto, 'ok', 'circle-check') : NV.etichetta(o.adatto, 'neutra', 'route')) : null,
      o.posti ? NV.etichetta(o.posti, 'neutra', 'hourglass') : null
    ];
  }

  /** "Completato" / "Letto": compare e sparisce con la spunta. */
  function etichettaFatto(s) {
    var nodo = NV.etichetta(PER_TIPO[s.tipo].fatto[1], 'ok', 'check');
    function aggiorna() { nodo.hidden = !eFatto(s); }
    aggiorna();
    s.suFatto.push(aggiorna);
    return nodo;
  }

  function stelline(voto) {
    var piene = Math.round(voto || 0);
    return h('span', { class: 'nv-info-stelle', role: 'img', 'aria-label': NV.voto(voto) + ' su 5' },
      [1, 2, 3, 4, 5].map(function (i) {
        return h('span', { class: 'nv-info-stella' + (i <= piene ? ' is-piena' : '') }, [icon('star', ICO.SM)]);
      }));
  }

  function titoloSezione(s, chiave, testo) {
    return NV.testo(s.screen, 'sez.' + chiave, testo, 'h2', 'nv-section__title');
  }
  function sezione(s, chiave, testo, figli, opts) {
    opts = opts || {};
    return NV.sezione(titoloSezione(s, chiave, testo), figli, {
      azione: opts.azione,
      classe: 'nv-info-sez' + (opts.classe ? ' ' + opts.classe : '')
    });
  }

  /* ==================================================================
     LA GRAFICA
     La foto se c'è. Altrimenti una copertina pulita nel colore dell'ente:
     il libro disegnato per i libri, il foglio del calendario per gli
     eventi, la sigla per tutto il resto. Niente foto finte.
     ================================================================== */
  function copertina(s, classe) {
    var o = s.o;
    var box = h('div', { class: 'nv-info-cover nv-info-t' + (o.tono || 1) + (classe ? ' ' + classe : '') });
    if (o.immagine) {
      box.classList.add('nv-info-cover--foto');
      box.appendChild(h('img', { src: o.immagine, alt: '' }));
      if (o.data) {
        box.appendChild(h('span', { class: 'nv-info-cover__data' }, [
          icon('calendar', ICO.SM),
          h('span', { text: o.data.giorno + ' ' + o.data.mese + ' · ' + o.data.ora })
        ]));
      }
    } else if (s.tipo === 'libro') {
      var ente = dividiEnte(o);
      box.appendChild(h('div', { class: 'nv-info-libro', 'aria-hidden': 'true' }, [
        h('span', { class: 'nv-info-libro__autore', text: ente.prima }),
        h('strong', { class: 'nv-info-libro__titolo', text: o.nome }),
        h('span', { class: 'nv-info-libro__editore', text: ente.dopo })
      ]));
    } else if (o.data) {
      box.appendChild(h('div', { class: 'nv-info-giorno', 'aria-hidden': 'true' }, [
        h('span', { class: 'nv-info-giorno__mese', text: o.data.mese }),
        h('strong', { class: 'nv-info-giorno__n', text: o.data.giorno }),
        h('span', { class: 'nv-info-giorno__ora', text: o.data.ora })
      ]));
    } else {
      box.appendChild(h('span', { class: 'nv-info-cover__sigla', 'aria-hidden': 'true', text: sigla(o) }));
    }
    return box;
  }

  /* ==================================================================
     SALVA E FATTO
     Lo stesso stato può comparire in più punti (barra, menu, azioni
     rapide): ogni pezzo si iscrive e si ridisegna da solo.
     ================================================================== */

  /** forma: 'barra' (tondo in alto) | 'rapida' (tondo con etichetta) | 'pulsante' */
  function bottoneSalva(s, forma) {
    var btn = h('button', { type: 'button' });
    function aggiorna() {
      var on = eSalvato(s);
      var ico = icon(on ? 'bookmark-check' : 'bookmark', forma === 'barra' ? ICO.LG : ICO.MD);
      btn.innerHTML = '';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Salvato' : 'Salva');
      btn.title = on ? 'Salvato' : 'Salva';
      if (forma === 'barra') {
        btn.className = 'nv-iconbtn nv-info-salva' + (on ? ' is-on' : '');
        btn.appendChild(ico);
      } else if (forma === 'rapida') {
        btn.className = 'nv-info-rapida' + (on ? ' is-on' : '');
        btn.appendChild(h('span', { class: 'nv-info-rapida__tondo' }, [ico]));
        btn.appendChild(h('span', { class: 'nv-info-rapida__label', text: on ? 'Salvato' : 'Salva' }));
      } else {
        btn.className = 'btn nv-btn btn--passivo nv-info-cta__sec' + (on ? ' is-on' : '');
        btn.appendChild(ico);
        btn.appendChild(h('span', { text: on ? 'Salvato' : 'Salva' }));
      }
    }
    btn.addEventListener('click', function () { cambiaSalvato(s); });
    aggiorna();
    s.suSalva.push(aggiorna);
    return btn;
  }

  function cambiaSalvato(s) {
    salvati[s.o.id] = !eSalvato(s);
    s.suSalva.forEach(function (fn) { fn(); });
    NV.avviso(salvati[s.o.id] ? 'Salvato nei preferiti' : 'Tolto dai preferiti');
  }

  /** forma: 'pieno' (pastiglia larga con testo) | 'tondo' (44px con la spunta) */
  function bottoneFatto(s, forma) {
    var testi = PER_TIPO[s.tipo].fatto;
    var btn = h('button', { type: 'button' });
    function aggiorna() {
      var on = eFatto(s);
      btn.innerHTML = '';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? testi[1] : testi[0]);
      btn.title = on ? testi[1] : testi[0];
      if (forma === 'tondo') {
        btn.className = 'nv-info-spunta' + (on ? ' is-on' : '');
        btn.appendChild(icon('check', ICO.MD));
      } else {
        btn.className = 'nv-info-fatto' + (on ? ' is-on' : '');
        btn.appendChild(icon(on ? 'circle-check' : 'circle', ICO.MD));
        btn.appendChild(h('span', { text: on ? testi[1] : testi[0] }));
      }
    }
    btn.addEventListener('click', function () { cambiaFatto(s); });
    aggiorna();
    s.suFatto.push(aggiorna);
    return btn;
  }

  function cambiaFatto(s, valore) {
    var nuovo = valore != null ? !!valore : !eFatto(s);
    spuntati[s.o.id] = nuovo;
    s.suFatto.forEach(function (fn) { fn(); });
    if (nuovo && s.compito) festeggia(s);
    else NV.avviso(nuovo ? 'Segnato come fatto' : 'Non è più segnato come fatto');
  }

  /* ==================================================================
     SEZIONI
     Ognuna restituisce null se non ha dati: la pagina salta il buco.
     ================================================================== */

  /** A quale compito serve, con la spunta. forma: 'blocco' | 'riga' */
  function compitoBlocco(s, forma) {
    var c = s.compito;
    if (!c) return null;
    var stato = NV.STATI_COMPITO[c.compito.stato] || NV.STATI_COMPITO['da-fare'];
    var copy = h('div', { class: 'nv-info-compito__copy' }, [
      NV.testo(s.screen, 'tiServe', 'Ti serve per', 'span', 'nv-info-compito__occhiello'),
      h('strong', { class: 'nv-info-compito__titolo', text: c.compito.titolo }),
      h('div', { class: 'nv-info-compito__meta' }, [
        NV.tag(c.compito.obbligatoria),
        h('span', { text: 'Step ' + (c.stepIndice + 1) + ' · ' + stato.etichetta })
      ])
    ]);
    if (forma === 'riga') {
      return h('div', { class: 'nv-info-compito nv-info-compito--riga' }, [copy, bottoneFatto(s, 'tondo')]);
    }
    var altri = c.altri.map(function (x) { return x.breve || x.titolo; });
    return h('div', { class: 'nv-info-compito' }, [
      h('div', { class: 'nv-info-compito__testa' }, [NV.icoChip('route', 1), copy]),
      altri.length ? h('p', { class: 'nv-info-compito__altri', text: 'Utile anche per: ' + altri.join(', ') }) : null,
      bottoneFatto(s, 'pieno')
    ]);
  }

  /** Quanto è in linea con te e perché te lo consigliamo. */
  function affinita(s) {
    var o = s.o;
    if (!o.affinita && !o.perche) return null;
    return h('div', { class: 'nv-info-match' }, [
      o.affinita ? h('div', { class: 'nv-info-match__n' }, [
        h('strong', { text: o.affinita + '%' }),
        NV.testo(s.screen, 'match', 'in linea con te', 'span')
      ]) : null,
      o.perche ? h('p', { class: 'nv-info-match__perche', text: o.perche }) : null
    ]);
  }

  function grigliaDati(s, max) {
    /* per gli eventi la data sta già sotto il titolo */
    var l = datiChiave(s).filter(function (d) { return !(s.tipo === 'evento' && d.chiave === 'inizio'); }).slice(0, max || 6);
    if (!l.length) return null;
    return h('dl', { class: 'nv-info-dati' }, l.map(function (d) {
      return h('div', { class: 'nv-info-dato' }, [
        icon(d.icona, ICO.MD),
        h('dt', { text: d.etichetta }),
        h('dd', { text: d.valore })
      ]);
    }));
  }

  function descrizione(s) {
    if (!s.o.descrizione) return null;
    return sezione(s, 'descrizione.' + s.tipo, PER_TIPO[s.tipo].descrizione, [
      h('p', { class: 'nv-body nv-info-testo', text: s.o.descrizione })
    ]);
  }

  /** forma: 'lista' (spunte verdi) | 'pastiglie' */
  function punti(s, forma) {
    var l = s.o.punti;
    if (!l || !l.length) return null;
    var corpo = forma === 'pastiglie'
      ? h('div', { class: 'nv-info-pastiglie' }, l.map(function (p) {
          return h('span', { class: 'nv-info-pastiglia' }, [icon('check', ICO.SM), h('span', { text: p })]);
        }))
      : h('ul', { class: 'nv-info-punti' }, l.map(function (p) {
          return h('li', {}, [h('span', { class: 'nv-info-punti__ico' }, [icon('check', ICO.SM)]), h('span', { text: p })]);
        }));
    return sezione(s, 'punti.' + s.tipo, PER_TIPO[s.tipo].punti, [corpo]);
  }

  /** Moduli numerati; per gli eventi diventa l'agenda con gli orari.
      max: quante voci mostrare prima di "Mostra tutto". */
  function programma(s, max) {
    var l = s.o.programma;
    if (!l || !l.length) return null;
    var agenda = s.tipo === 'evento';
    var chiusa = !!max && l.length > max + 1;
    var ol = h('ol', { class: 'nv-info-prog' + (agenda ? ' nv-info-prog--agenda' : '') }, l.map(function (m, i) {
      return h('li', { class: 'nv-info-prog__voce', hidden: chiusa && i >= max ? true : null }, [
        agenda
          ? h('span', { class: 'nv-info-prog__ora', text: m.durata })
          : h('span', { class: 'nv-info-prog__n', text: String(i + 1) }),
        h('div', { class: 'nv-info-prog__copy' }, [
          h('strong', { text: m.titolo }),
          agenda ? null : h('span', { text: m.durata })
        ])
      ]);
    }));
    var figli = [ol];
    if (chiusa) {
      var altro = h('button', { class: 'nv-info-altro', type: 'button' }, [
        h('span', { text: 'Mostra tutto (' + l.length + ')' }), icon('chevron-down', ICO.SM)
      ]);
      altro.addEventListener('click', function () {
        Array.prototype.forEach.call(ol.children, function (li) { li.hidden = false; });
        altro.remove();
      });
      figli.push(altro);
    }
    return sezione(s, 'programma.' + s.tipo, PER_TIPO[s.tipo].programma, figli);
  }

  function avatar(nome, tono) {
    return h('span', { class: 'nv-info-avatar nv-tono-' + tono, 'aria-hidden': 'true', text: iniziali(nome) });
  }

  function docenti(s) {
    var l = s.o.docenti;
    if (!l || !l.length) return null;
    var tono = s.o.tono || 1;
    return sezione(s, 'docenti.' + s.tipo, PER_TIPO[s.tipo].docenti, [
      h('ul', { class: 'nv-info-persone' }, l.map(function (p, i) {
        return h('li', { class: 'nv-info-persona' }, [
          avatar(p.nome, ((tono - 1 + i) % 5) + 1),
          h('div', { class: 'nv-info-persona__copy' }, [h('strong', { text: p.nome }), h('span', { text: p.ruolo })])
        ]);
      }))
    ]);
  }

  function galleria(s) {
    var l = s.o.galleria;
    if (!l || !l.length) return null;
    return sezione(s, 'galleria', 'Foto', [
      h('div', { class: 'nv-info-galleria' }, l.map(function (src) { return h('img', { src: src, alt: '' }); }))
    ]);
  }

  /* ---- dove si trova -------------------------------------------------- */

  /* Una pianta disegnata, con le stesse posizioni in % della mappa vera. */
  var PIANTA =
    '<rect class="nv-info-mappa__fondo" width="100" height="100"/>' +
    '<path class="nv-info-mappa__parco" d="M6 66c6-9 20-10 26-2s1 20-10 22S0 76 6 66z"/>' +
    '<path class="nv-info-mappa__parco" d="M80 70c5-5 14-4 16 3s-4 14-11 12-10-9-5-15z"/>' +
    '<path class="nv-info-mappa__fiume" d="M-4 30C18 24 30 46 50 40s32-24 56-14"/>' +
    '<path class="nv-info-mappa__strada" d="M0 54h100M38 0v100M74 0v100M0 16l100 10M12 100 60 0M0 84l100-6"/>';

  function vediMappa(s) { NV.apriMappa({ selezionata: s.o.id, categoria: s.o.categoria }); }
  function indicazioni(s) { NV.avviso('Apriamo le indicazioni per ' + s.o.indirizzo); }
  function apriSito(s) { NV.avviso('Apriamo ' + ((s.o.contatti && s.o.contatti.sito) || 'il sito di ' + s.o.ente)); }

  function miniMappa(s, classe) {
    var o = s.o;
    if (!o.pos) return null;
    var tu = D.mappa && D.mappa.tu;
    return h('button', {
      class: 'nv-info-mappa' + (classe ? ' ' + classe : ''),
      type: 'button',
      'aria-label': 'Vedi sulla mappa',
      onclick: function () { vediMappa(s); }
    }, [
      h('span', { class: 'nv-info-mappa__disegno', html: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + PIANTA + '</svg>' }),
      tu ? h('span', { class: 'nv-info-mappa__tu', style: 'left:' + tu.x + '%;top:' + tu.y + '%' }) : null,
      h('span', { class: 'nv-info-mappa__pin', style: 'left:' + o.pos.x + '%;top:' + o.pos.y + '%' }, [icon(s.cat.icona, ICO.SM)]),
      h('span', { class: 'nv-info-mappa__apri' }, [icon('map', ICO.SM), h('span', { text: 'Apri la mappa' })])
    ]);
  }

  function sede(s) {
    var o = s.o;
    if (!o.indirizzo) return null;
    var dist = o.distanza ? 'A ' + o.distanza + ' da te' : o.citta;
    var pulsanti = [
      o.pos ? NV.pulsante('Sulla mappa', { variante: 'secondario', icona: 'map', piccolo: true, onclick: function () { vediMappa(s); } }) : null,
      NV.pulsante('Indicazioni', { variante: 'secondario', icona: 'navigation', piccolo: true, onclick: function () { indicazioni(s); } })
    ];
    return sezione(s, 'sede.' + s.tipo, PER_TIPO[s.tipo].sede, [
      miniMappa(s),
      h('div', { class: 'nv-info-indirizzo' }, [
        NV.icoChip('map-pin', 'neutro'),
        h('div', { class: 'nv-row__copy' }, [
          h('strong', { class: 'nv-row__title', text: o.indirizzo }),
          dist ? h('span', { class: 'nv-row__sub', text: dist }) : null
        ])
      ]),
      h('div', { class: o.pos ? 'nv-btns' : 'nv-info-btn1' }, pulsanti)
    ]);
  }

  /* ---- voti e recensioni ---------------------------------------------- */

  /* Quote plausibili di 5..1 stelle a partire dal voto medio (prototipo). */
  function quote(voto) {
    var p5 = Math.max(0.2, Math.min(0.95, (voto - 3.2) / 1.9));
    var r = 1 - p5;
    return [p5, r * 0.68, r * 0.18, r * 0.08, r * 0.06];
  }

  function riepilogoVoti(s, barre) {
    var o = s.o;
    return h('div', { class: 'nv-info-voti' + (barre ? ' nv-info-voti--barre' : '') }, [
      h('div', { class: 'nv-info-voti__media' }, [
        h('strong', { text: NV.voto(o.rating) }),
        stelline(o.rating),
        h('span', { class: 'nv-info-voti__conta', text: contaRecensioni(o.recensioni) })
      ]),
      barre ? h('div', { class: 'nv-info-voti__barre', 'aria-hidden': 'true' }, quote(o.rating).map(function (q, i) {
        return h('div', { class: 'nv-info-voti__riga' }, [
          h('span', { text: String(5 - i) }),
          h('span', { class: 'nv-info-voti__traccia' }, [h('span', { style: 'width:' + Math.max(2, Math.round(q * 100)) + '%' })])
        ]);
      })) : null
    ]);
  }

  function listaRecensioni(s, max) {
    var l = (s.o.recensioniLista || []).slice(0, max || 99);
    if (!l.length) return null;
    return h('ul', { class: 'nv-info-recensioni' }, l.map(function (r, i) {
      return h('li', { class: 'nv-info-recensione' }, [
        h('div', { class: 'nv-info-recensione__testa' }, [
          avatar(r.nome, (i % 5) + 1),
          h('div', { class: 'nv-info-persona__copy' }, [h('strong', { text: r.nome }), h('span', { text: r.quando })]),
          stelline(r.voto)
        ]),
        h('p', { class: 'nv-body', text: r.testo })
      ]);
    }));
  }

  /** opts: barre (distribuzione delle stelle), max (recensioni scritte) */
  function recensioni(s, opts) {
    var o = s.o;
    opts = opts || {};
    if (o.rating == null) return null;
    var scritte = (o.recensioniLista || []).length;
    var lista = listaRecensioni(s, opts.max);
    return sezione(s, 'recensioni', 'Recensioni', [riepilogoVoti(s, opts.barre), lista], {
      classe: 'nv-info-sez--recensioni',
      azione: lista && o.recensioni > Math.min(scritte, opts.max || scritte) ? {
        label: 'Vedi tutte',
        onclick: function () { NV.avviso('Qui si aprirà l’elenco completo delle recensioni'); }
      } : null
    });
  }

  /* ---- contatti --------------------------------------------------------- */

  function righeContatto(s, conIndirizzo) {
    var o = s.o, c = o.contatti || {}, l = [];
    function riga(icona, titolo, valore, fn, dopo) {
      return h('button', { class: 'nv-info-riga', type: 'button', onclick: fn }, [
        NV.icoChip(icona, 'neutro'),
        h('span', { class: 'nv-row__copy' }, [
          h('span', { class: 'nv-row__title', text: titolo }),
          h('span', { class: 'nv-row__sub', text: valore })
        ]),
        h('span', { class: 'nv-row__chev' }, [icon(dopo || 'chevron-right', ICO.MD)])
      ]);
    }
    if (c.telefono) l.push(riga('phone', 'Chiama', c.telefono, function () { NV.avviso('Chiamata a ' + c.telefono); }));
    if (c.email) l.push(riga('mail', 'Scrivi un’email', c.email, function () { NV.avviso('Apriamo la tua email per ' + c.email); }));
    if (c.sito) l.push(riga('globe', 'Vai al sito', c.sito, function () { apriSito(s); }, 'arrow-up-right'));
    if (conIndirizzo && o.indirizzo) l.push(riga('navigation', 'Indicazioni', o.indirizzo, function () { indicazioni(s); }));
    return l;
  }

  function contatti(s) {
    var righe = righeContatto(s);
    if (!righe.length) return null;
    return sezione(s, 'contatti', 'Contatti', [h('div', { class: 'nv-info-righe' }, righe)]);
  }

  function pieDiPagina() {
    return h('p', { class: 'nv-info-piede' }, [
      h('span', { text: 'Un’informazione non è corretta? ' }),
      h('button', {
        class: 'nv-info-piede__link',
        type: 'button',
        text: 'Segnalacelo',
        onclick: function () { NV.avviso('Grazie: controlliamo la scheda entro 48 ore'); }
      })
    ]);
  }

  /* ---- azione principale ---------------------------------------------- */

  function azionePrincipale(s) {
    if (s.tipo === 'evento') return foglioPrenota(s);
    if (s.tipo === 'lavoro') return foglioCandidatura(s);
    var sito = haSito(s.o) ? s.o.contatti.sito : 'il sito di ' + s.o.ente;
    if (s.tipo === 'libro') return NV.avviso('Apriamo ' + sito + ' per comprarlo');
    NV.avviso(s.o.completato ? 'Apriamo ' + sito + ' per riprendere il corso' : 'Apriamo ' + sito + ': lì trovi come iscriverti');
  }

  function minuscola(t) { return t ? t.charAt(0).toLowerCase() + t.slice(1) : ''; }

  /** forma: 'doppia' (contatta + principale) | 'prezzo' (prezzo + principale) | 'piena' */
  function barraAzioni(s, forma) {
    var o = s.o;
    var principale = NV.pulsante(etichettaAzione(s), { onclick: function () { azionePrincipale(s); } });
    var sinistra = null;
    if (forma === 'doppia') {
      sinistra = haContatti(o)
        ? NV.pulsante('Contatta', { variante: 'secondario', icona: 'message-circle', classe: 'nv-info-cta__sec', onclick: function () { foglioContatta(s); } })
        : bottoneSalva(s, 'pulsante');
    } else if (forma === 'prezzo' && o.prezzo) {
      var sotto = s.tipo === 'evento' ? o.inizio
        : s.tipo === 'lavoro' ? o.contratto
        : s.tipo === 'libro' ? o.durata
        : o.inizio === 'Quando vuoi' ? 'Inizi quando vuoi'
        : o.inizio ? 'Inizio ' + minuscola(o.inizio) : '';
      sinistra = h('div', { class: 'nv-info-cta__prezzo' }, [h('strong', { text: o.prezzo }), sotto ? h('span', { text: sotto }) : null]);
    }
    return h('div', { class: 'nv-info-cta nv-info-cta--' + forma }, [sinistra, principale]);
  }

  /* ==================================================================
     PANNELLI
     ================================================================== */

  function occhiello(testo) { return h('p', { class: 'nv-eyebrow nv-info-occhiello', text: testo }); }

  function voceFoglio(icona, tono, titolo, sotto, onclick, dopo, classe) {
    return h('button', { class: 'nv-info-voce' + (classe ? ' ' + classe : ''), type: 'button', onclick: onclick }, [
      NV.icoChip(icona, tono),
      h('span', { class: 'nv-row__copy' }, [
        h('span', { class: 'nv-row__title', text: titolo }),
        sotto ? h('span', { class: 'nv-row__sub', text: sotto }) : null
      ]),
      dopo || null
    ]);
  }

  /** Riga con logo e nome: dice di che cosa si parla dentro un pannello. */
  function anteprima(s) {
    return h('div', { class: 'nv-info-anteprima' }, [
      NV.logo(s.o, 'sm'),
      h('span', { class: 'nv-row__copy' }, [
        h('span', { class: 'nv-row__title', text: s.o.nome }),
        h('span', { class: 'nv-row__sub', text: s.o.ente })
      ])
    ]);
  }

  /** Riga di informazione con icona (pannelli e versione Luogo). */
  function rigaInfo(icona, etichetta, valore, onclick) {
    if (!valore) return null;
    return h(onclick ? 'button' : 'div', { class: 'nv-info-info', type: onclick ? 'button' : null, onclick: onclick || null }, [
      icon(icona, ICO.MD),
      h('span', { class: 'nv-info-info__copy' }, [
        h('span', { class: 'nv-info-info__valore', text: valore }),
        etichetta ? h('span', { class: 'nv-info-info__etichetta', text: etichetta }) : null
      ]),
      onclick ? h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.MD)]) : null
    ]);
  }

  function copia(testo, conferma) {
    try { if (navigator.clipboard) navigator.clipboard.writeText(testo); } catch (e) {}
    NV.avviso(conferma);
  }

  /** Il messaggio già scritto: il primo contatto non parte da un foglio bianco. */
  function messaggioPronto(s, soloCopia) {
    var conf = PER_TIPO[s.tipo];
    if (!conf.messaggio) return null;
    var testo = conf.messaggio(s.o);
    var email = !soloCopia && s.o.contatti && s.o.contatti.email;
    return h('div', { class: 'nv-info-messaggio' }, [
      h('div', { class: 'nv-info-messaggio__testa' }, [icon('sparkles', ICO.SM), h('span', { text: 'Messaggio già pronto' })]),
      h('p', { class: 'nv-info-messaggio__testo', text: testo }),
      h('div', { class: 'nv-info-messaggio__azioni' }, [
        NV.pulsante('Copia', { variante: 'bianco', icona: 'copy', piccolo: true, onclick: function () { copia(testo, 'Messaggio copiato'); } }),
        email ? NV.pulsante('Invia', { icona: 'mail', piccolo: true, onclick: function () { NV.chiudiFoglio(); NV.avviso('Apriamo la tua email con il messaggio per ' + email); } }) : null
      ])
    ]);
  }

  function cosaChiedere(s) {
    var l = PER_TIPO[s.tipo].domande;
    if (!l) return null;
    return h('div', { class: 'nv-info-domande' }, [
      occhiello('Cosa chiedere'),
      h('ul', {}, l.map(function (d) { return h('li', {}, [icon('circle-help', ICO.SM), h('span', { text: d })]); }))
    ]);
  }

  function foglioContatta(s) {
    var righe = righeContatto(s, true);
    NV.apriFoglio({
      titolo: 'Contatta',
      sottotitolo: s.o.ente,
      classe: 'nv-info-foglio',
      contenuto: [
        righe.length ? h('div', { class: 'nv-info-righe' }, righe) : null,
        messaggioPronto(s),
        cosaChiedere(s)
      ]
    });
  }

  /** "⋯": le impostazioni del contenuto. */
  function foglioMenu(s) {
    var testi = PER_TIPO[s.tipo].fatto;
    var salvato = eSalvato(s);
    function e(fn) { return function () { NV.chiudiFoglio(); fn(); }; }
    NV.apriFoglio({
      titolo: 'Impostazioni contenuto',
      sottotitolo: 'Personalizza la tua esperienza',
      classe: 'nv-info-foglio',
      contenuto: [
        h('div', { class: 'nv-info-voce nv-info-voce--switch' }, [
          NV.icoChip('circle-check', 'ok'),
          h('span', { class: 'nv-row__copy' }, [
            h('span', { class: 'nv-row__title', text: testi[0] }),
            h('span', { class: 'nv-row__sub', text: s.compito ? 'Spunta anche “' + (s.compito.compito.breve || s.compito.compito.titolo) + '”' : 'Lo ritrovi tra le cose fatte' })
          ]),
          NV.interruttore(eFatto(s), function (on) { cambiaFatto(s, on); }, testi[0])
        ]),
        h('div', { class: 'nv-info-gruppo' }, [
          occhiello('Gestione'),
          voceFoglio('share-2', 1, 'Condividi', 'Invia a un amico o sui social', function () { foglioCondividi(s); }),
          voceFoglio(salvato ? 'bookmark-check' : 'bookmark', 'neutro', salvato ? 'Togli dai preferiti' : 'Aggiungi ai preferiti', 'Salva per dopo', e(function () { cambiaSalvato(s); })),
          voceFoglio('eye-off', 'neutro', 'Nascondi elemento', 'Non mostrarlo più nei suggerimenti', e(function () { NV.avviso('Non te lo mostreremo più nei suggerimenti'); }))
        ]),
        h('div', { class: 'nv-info-gruppo' }, [
          occhiello('Supporto'),
          voceFoglio('circle-help', 'neutro', 'Contatta il supporto', 'Hai bisogno di aiuto?', e(function () { NV.avviso('Il supporto ti risponde in chat entro un’ora'); })),
          voceFoglio('flag', 'neutro', 'Segnala un problema', 'Contenuto non appropriato o errori', e(function () { NV.avviso('Grazie: controlliamo la scheda entro 48 ore'); }), null, 'nv-info-voce--rischio')
        ])
      ]
    });
  }

  function foglioCondividi(s) {
    var link = 'navida.app/s/' + s.o.id;
    function azione(icona, label, fn) {
      return h('button', { class: 'nv-info-rapida', type: 'button', onclick: function () { NV.chiudiFoglio(); fn(); } }, [
        h('span', { class: 'nv-info-rapida__tondo' }, [icon(icona, ICO.MD)]),
        h('span', { class: 'nv-info-rapida__label', text: label })
      ]);
    }
    NV.apriFoglio({
      titolo: 'Condividi',
      classe: 'nv-info-foglio',
      contenuto: [
        anteprima(s),
        h('div', { class: 'nv-info-rapide' }, [
          azione('copy', 'Copia link', function () { copia(link, 'Link copiato'); }),
          azione('message-circle', 'Messaggio', function () { NV.avviso('Apriamo i messaggi con il link'); }),
          azione('mail', 'Email', function () { NV.avviso('Apriamo la tua email con il link'); }),
          azione('share-2', 'Altre app', function () { NV.avviso('Scegli l’app con cui condividere'); })
        ])
      ]
    });
  }

  function foglioPrenota(s) {
    var o = s.o;
    NV.apriFoglio({
      titolo: 'Prenota il posto',
      sottotitolo: o.nome,
      classe: 'nv-info-foglio',
      contenuto: [
        h('div', { class: 'nv-info-infos' }, [
          rigaInfo('calendar', 'Quando', o.inizio),
          rigaInfo('map-pin', 'Dove', o.indirizzo),
          rigaInfo('ticket', 'Ingresso', o.prezzo),
          rigaInfo('hourglass', 'Posti', o.posti)
        ]),
        h('p', { class: 'nv-info-nota', text: 'Ti mandiamo la conferma per email e un promemoria il giorno prima.' })
      ],
      azioni: [NV.pulsante('Conferma la prenotazione', { onclick: function () {
        NV.chiudiFoglio();
        NV.avviso('Posto prenotato: ti ricordiamo l’evento il giorno prima');
      } })]
    });
  }

  /** Candidatura con quello che Navida sa già di te: niente moduli da rifare. */
  function foglioCandidatura(s) {
    var o = s.o, cv = D.curriculum || {};
    var pronto = NV.etichetta('Pronto', 'ok', 'check');
    NV.apriFoglio({
      titolo: 'Candidati',
      sottotitolo: o.ente,
      classe: 'nv-info-foglio',
      contenuto: [
        h('div', { class: 'nv-info-gruppo' }, [
          occhiello('Cosa mandiamo'),
          h('div', { class: 'nv-info-righe' }, [
            voceFoglio('file-text', 1, 'Curriculum', cv.cvCaricato ? 'Il file che hai caricato' : 'Creato dal tuo profilo Navida', null, pronto),
            voceFoglio('layers', 2, 'Portfolio', cv.portfolio ? 'Il link che hai aggiunto' : 'Non l’hai ancora aggiunto',
              function () { NV.avviso('Qui aggiungi il link al tuo portfolio'); },
              cv.portfolio ? NV.etichetta('Pronto', 'ok', 'check') : h('span', { class: 'nv-link', text: 'Aggiungi' }))
          ])
        ]),
        messaggioPronto(s, true)
      ],
      azioni: [NV.pulsante('Invia la candidatura', { onclick: function () {
        NV.chiudiFoglio();
        NV.avviso('Candidatura inviata a ' + o.ente);
      } })]
    });
  }

  /** Il momento di completamento: la mascotte festeggia con te. */
  function festeggia(s) {
    var c = s.compito, conta = NV.conteggio(c.step);
    var fatti = Math.min(conta.totali, conta.fatti + (c.compito.stato === 'fatto' ? 0 : 1));
    NV.apriFoglio({
      centrato: true,
      classe: 'nv-info-foglio nv-info-festa',
      contenuto: [
        NV.mascotte('festeggiare', 'nv-info-festa__mascotte'),
        h('h2', { class: 'nv-info-festa__titolo', text: 'Un passo avanti!' }),
        h('p', { class: 'nv-info-festa__testo', text: '“' + c.compito.titolo + '” è fatto. Nello step ' + (c.stepIndice + 1) + ' sei a ' + fatti + ' compiti su ' + conta.totali + '.' })
      ],
      azioni: [
        NV.pulsante('Chiudi', { variante: 'secondario', onclick: function () { NV.chiudiFoglio(); } }),
        NV.pulsante('Vai allo step', { onclick: function () { NV.chiudiFoglio(); NV.apriStep(c.stepIndice); } })
      ]
    });
  }

  /* i pannelli che si possono aprire dall'indirizzo (&foglio=...) */
  var FOGLI = {
    contatta: foglioContatta,
    menu: foglioMenu,
    condividi: foglioCondividi,
    azione: azionePrincipale,
    fatto: function (s) { if (s.compito) festeggia(s); }
  };

  /* ==================================================================
     VERSIONE 1 · COPERTINA
     La grafica a tutta larghezza, il corpo della pagina che ci sale
     sopra e tutte le informazioni in fila, dalla più utile per decidere
     alla meno. In basso, ferme: Contatta e l'azione principale.
     ================================================================== */

  function vaiARecensioni(e) {
    var pagina = e.currentTarget.closest('.nv-page');
    var sez = pagina && pagina.querySelector('.nv-info-sez--recensioni');
    if (sez) sez.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function testataCopertina(s) {
    var o = s.o;
    var sotto = [luogo(o), s.tipo === 'lavoro' && o.pubblicato ? 'Pubblicato ' + o.pubblicato : ''].filter(Boolean).join(' · ');
    return h('div', { class: 'nv-info-titolo' }, [
      h('div', { class: 'nv-info-etichette' }, [categoriaEtichetta(s)].concat(etichetteStato(s))),
      h('h1', { class: 'nv-title', text: o.nome }),
      s.tipo === 'evento' && o.inizio
        ? h('p', { class: 'nv-info-quando' }, [icon('calendar', ICO.MD), h('span', { text: o.inizio })])
        : null,
      h('div', { class: 'nv-info-ente' }, [
        NV.logo(o, 'sm'),
        h('div', { class: 'nv-row__copy' }, [
          h('span', { class: 'nv-info-ente__nome', text: o.ente }),
          sotto ? h('span', { class: 'nv-row__sub', text: sotto }) : null
        ]),
        o.rating != null ? h('button', {
          class: 'nv-info-ente__voto',
          type: 'button',
          'aria-label': 'Voto ' + NV.voto(o.rating) + ', vai alle recensioni',
          onclick: vaiARecensioni
        }, [
          h('span', { class: 'nv-info-ente__stella' }, [icon('star', ICO.SM), h('strong', { text: NV.voto(o.rating) })]),
          h('span', { text: contaRecensioni(o.recensioni) })
        ]) : null
      ])
    ]);
  }

  function versioneCopertina(s) {
    var o = s.o;
    var cover = copertina(s, 'nv-info-cover--hero');
    var pagina = NV.pagina('nv-page--piena nv-info nv-info--base', [
      cover,
      h('div', { class: 'nv-info-corpo nv-gutter' }, [
        testataCopertina(s),
        /* prima i numeri per decidere, poi il perché, poi il compito */
        grigliaDati(s, 6),
        affinita(s),
        compitoBlocco(s, 'blocco'),
        descrizione(s),
        punti(s, 'lista'),
        programma(s, 4),
        docenti(s),
        galleria(s),
        sede(s),
        recensioni(s, { max: 3 }),
        contatti(s),
        pieDiPagina()
      ])
    ]);
    var barra = NV.barra({
      indietro: 'attivita',
      sopraFoto: true,
      titolo: o.nome,
      classe: 'nv-info-barra',
      azioni: [
        bottoneSalva(s, 'barra'),
        NV.iconBtn('share-2', 'Condividi', function () { foglioCondividi(s); }),
        NV.iconBtn('ellipsis', 'Altre opzioni', function () { foglioMenu(s); })
      ]
    });
    /* quando la copertina esce di vista la barra diventa bianca */
    pagina.addEventListener('scroll', function () {
      barra.classList.toggle('is-solida', pagina.scrollTop > cover.offsetHeight - barra.offsetHeight - 8);
    }, { passive: true });
    return [pagina, barra, barraAzioni(s, 'doppia')];
  }

  /* ==================================================================
     VERSIONE 2 · SCHEDE
     Testata compatta (grafica piccola, nome, dati in pastiglie) e un
     interruttore che divide il contenuto in schede corte: Panoramica,
     Programma, Recensioni, Contatti. Compaiono solo le schede che hanno
     qualcosa dentro. In basso, fermi: il prezzo e l'azione principale.
     ================================================================== */

  /* "Info" e non "Panoramica": con quattro schede la parola lunga non ci sta in 341px */
  var TAB = { panoramica: 'Info', programma: 'Programma', recensioni: 'Recensioni', contatti: 'Contatti' };

  function pastiglia(icona, testo) {
    return h('span', { class: 'nv-info-pill' }, [icon(icona, ICO.SM), h('span', { text: testo })]);
  }

  function testataCompatta(s) {
    var o = s.o, pills = [];
    if (o.rating != null) {
      pills.push(h('span', { class: 'nv-info-pill nv-info-pill--voto' }, [
        icon('star', ICO.SM), h('strong', { text: NV.voto(o.rating) }), h('span', { text: '(' + NV.numeroCorto(o.recensioni) + ')' })
      ]));
    }
    var dove = luogo(o);
    if (dove) pills.push(pastiglia(o.modalita === 'Online' ? 'laptop' : 'map-pin', dove));
    if (s.tipo === 'evento' && o.data) pills.push(pastiglia('calendar', o.data.giorno + ' ' + o.data.mese.toLowerCase() + ' · ' + o.data.ora));
    else if (o.durata) pills.push(pastiglia(s.tipo === 'libro' ? 'file-text' : 'clock', o.durata));
    if (o.livello) pills.push(pastiglia('chart-no-axes-column-increasing', o.livello));

    return h('div', { class: 'nv-info-testa' }, [
      h('div', { class: 'nv-info-testa__riga' }, [
        copertina(s, 'nv-info-cover--mini'),
        h('div', { class: 'nv-info-testa__copy' }, [
          h('div', { class: 'nv-info-etichette' }, [categoriaEtichetta(s)].concat(etichetteStato(s))),
          h('h1', { class: 'nv-info-testa__nome', text: o.nome }),
          h('span', { class: 'nv-info-testa__ente', text: o.ente })
        ])
      ]),
      pills.length ? h('div', { class: 'nv-info-pills' }, pills) : null
    ]);
  }

  /** Tutti i dati chiave in un elenco etichetta / valore. */
  function elencoDati(s) {
    var l = datiChiave(s);
    if (!l.length) return null;
    return sezione(s, 'dettagli', 'In breve', [
      h('dl', { class: 'nv-info-elenco' }, l.map(function (d) {
        return h('div', { class: 'nv-info-elenco__riga' }, [
          h('dt', {}, [icon(d.icona, ICO.SM), h('span', { text: d.etichetta })]),
          h('dd', { text: d.valore })
        ]);
      }))
    ]);
  }

  /** Dentro una scheda il titolo della sezione ripeterebbe il nome della
      scheda: al suo posto va un riassunto (o niente). */
  function senzaTitolo(sez, riassunto) {
    if (!sez) return null;
    var testa = sez.querySelector('.nv-section__head');
    if (testa && riassunto) testa.replaceWith(h('p', { class: 'nv-info-riassunto', text: riassunto }));
    else if (testa) testa.remove();
    return sez;
  }

  function tabDisponibili(s) {
    var o = s.o, l = ['panoramica'];
    if (o.programma && o.programma.length) l.push('programma');
    if (o.recensioniLista && o.recensioniLista.length) l.push('recensioni');
    if (o.indirizzo || haContatti(o) || haSito(o)) l.push('contatti');
    return l;
  }

  function contenutoTab(s, tab) {
    var o = s.o;
    if (tab === 'programma') {
      var n = o.programma.length;
      return [senzaTitolo(programma(s), n + (s.tipo === 'evento' ? ' momenti' : ' moduli') + (o.durata ? ' · ' + o.durata : ''))];
    }
    if (tab === 'recensioni') return [senzaTitolo(recensioni(s, { barre: true }))];
    if (tab === 'contatti') {
      var righe = righeContatto(s);
      return [
        sede(s),
        righe.length ? sezione(s, 'recapiti', 'Recapiti', [h('div', { class: 'nv-info-righe' }, righe)]) : null,
        PER_TIPO[s.tipo].messaggio ? sezione(s, 'primoPasso', 'Scrivi per primo', [messaggioPronto(s), cosaChiedere(s)]) : null
      ];
    }
    return [affinita(s), elencoDati(s), descrizione(s), punti(s, 'lista'), galleria(s), docenti(s)];
  }

  function versioneSchede(s) {
    var o = s.o;
    var tabs = tabDisponibili(s);
    var attiva = tabScelta[o.id] || parametro('tab');
    if (tabs.indexOf(attiva) === -1) attiva = 'panoramica';

    var interruttore = h('div', { class: 'nv-info-tabs' });
    var corpo = h('div', { class: 'nv-info-tab', role: 'tabpanel' });
    var pagina = NV.pagina('nv-info nv-info--schede', [
      testataCompatta(s),
      compitoBlocco(s, 'riga'),
      tabs.length > 1 ? interruttore : null,
      corpo
    ]);

    function mostra(tab) {
      tabScelta[o.id] = tab;
      interruttore.innerHTML = '';
      interruttore.appendChild(NV.segmenti(tabs.map(function (t) { return { value: t, label: TAB[t] }; }), tab, mostra, 'nv-seg--piena'));
      corpo.innerHTML = '';
      contenutoTab(s, tab).forEach(function (n) { if (n) corpo.appendChild(n); });
      /* se eri già sceso, la scheda nuova parte sotto l'interruttore */
      var inizio = corpo.offsetTop - interruttore.offsetHeight - 24;
      if (pagina.scrollTop > inizio) pagina.scrollTop = inizio;
    }
    mostra(attiva);

    var barra = NV.barra({
      indietro: 'attivita',
      titolo: s.cat.singolare,
      classe: 'nv-info-barra--fissa',
      azioni: [bottoneSalva(s, 'barra'), NV.iconBtn('ellipsis', 'Altre opzioni', function () { foglioMenu(s); })]
    });
    return [barra, pagina, barraAzioni(s, 'prezzo')];
  }

  /* ==================================================================
     VERSIONE 3 · LUOGO
     Come la scheda di un posto sulle mappe: striscia di immagini, nome e
     voto, una fila di azioni tonde (sito, chiama, indicazioni, salva,
     condividi) e poi un elenco di informazioni, una per riga con la sua
     icona. Recensioni in fondo. In basso, ferma: l'azione principale.
     ================================================================== */

  function striscia(s) {
    var o = s.o, pezzi = [copertina(s, 'nv-info-striscia__prima')];
    (o.galleria || []).forEach(function (src) {
      pezzi.push(h('img', { class: 'nv-info-striscia__foto', src: src, alt: '' }));
    });
    var mappa = miniMappa(s, 'nv-info-striscia__mappa');
    if (mappa) pezzi.push(mappa);
    return h('div', { class: 'nv-info-striscia' + (pezzi.length === 1 ? ' is-sola' : '') }, pezzi);
  }

  /** La riga di stato, come "Aperto" sulle mappe: quando parte, da quando c'è. */
  function statoLuogo(s) {
    var o = s.o;
    if (s.tipo === 'evento') return o.inizio || '';
    if (s.tipo === 'lavoro') return o.pubblicato ? 'Pubblicato ' + o.pubblicato : '';
    if (s.tipo === 'libro' || !o.inizio) return '';
    if (o.inizio === 'Quando vuoi') return 'Inizi quando vuoi';
    return (/^\d/.test(o.inizio) ? 'Inizia il ' : 'Inizia a ') + minuscola(o.inizio);
  }

  function titoloLuogo(s) {
    var o = s.o;
    var riga = [s.cat.singolare, o.modalita !== 'Libro' ? o.modalita : '', o.distanza].filter(Boolean).join(' · ');
    var stato = statoLuogo(s);
    return h('div', { class: 'nv-info-luogo' }, [
      h('h1', { class: 'nv-title nv-title--md', text: o.nome }),
      h('span', { class: 'nv-info-luogo__ente', text: o.ente }),
      o.rating != null ? h('div', { class: 'nv-info-luogo__voto' }, [
        h('strong', { text: NV.voto(o.rating) }),
        stelline(o.rating),
        h('span', { text: '(' + NV.numeroCorto(o.recensioni) + ')' })
      ]) : null,
      h('span', { class: 'nv-info-luogo__riga', text: riga }),
      stato ? h('span', { class: 'nv-info-luogo__stato', text: stato }) : null,
      h('div', { class: 'nv-info-etichette' }, etichetteStato(s))
    ]);
  }

  function azioniRapide(s) {
    var o = s.o, c = o.contatti || {}, l = [];
    function rapida(icona, label, fn) {
      return h('button', { class: 'nv-info-rapida', type: 'button', onclick: fn }, [
        h('span', { class: 'nv-info-rapida__tondo' }, [icon(icona, ICO.MD)]),
        h('span', { class: 'nv-info-rapida__label', text: label })
      ]);
    }
    if (c.sito) l.push(rapida('globe', 'Sito', function () { apriSito(s); }));
    if (c.telefono) l.push(rapida('phone', 'Chiama', function () { NV.avviso('Chiamata a ' + c.telefono); }));
    else if (c.email) l.push(rapida('mail', 'Scrivi', function () { foglioContatta(s); }));
    if (o.indirizzo) l.push(rapida('navigation', 'Indicazioni', function () { indicazioni(s); }));
    l.push(bottoneSalva(s, 'rapida'));
    l.push(rapida('share-2', 'Condividi', function () { foglioCondividi(s); }));
    return h('div', { class: 'nv-info-rapide nv-info-rapide--luogo' }, l);
  }

  /** Un'informazione per riga, con la sua icona. */
  function elencoLuogo(s) {
    var o = s.o, c = o.contatti || {}, stato = statoLuogo(s), righe = [];
    if (o.indirizzo) {
      righe.push(rigaInfo('map-pin', o.distanza ? 'A ' + o.distanza + ' da te' : 'Indirizzo', o.indirizzo,
        o.pos ? function () { vediMappa(s); } : function () { indicazioni(s); }));
    }
    datiChiave(s).forEach(function (d) {
      /* la modalità si capisce dall'indirizzo, l'inizio sta già nella riga di stato */
      if (d.chiave === 'modalita' && o.indirizzo) return;
      if (d.chiave === 'inizio' && stato) return;
      righe.push(rigaInfo(d.icona, d.etichetta, d.valore));
    });
    if (c.sito) righe.push(rigaInfo('globe', 'Sito', c.sito, function () { apriSito(s); }));
    if (c.telefono) righe.push(rigaInfo('phone', 'Telefono', c.telefono, function () { NV.avviso('Chiamata a ' + c.telefono); }));
    if (c.email) righe.push(rigaInfo('mail', 'Email · c’è un messaggio già pronto', c.email, function () { foglioContatta(s); }));
    if (o.affinita) righe.push(rigaInfo('sparkles', o.perche, o.affinita + '% in linea con te'));
    return h('div', { class: 'nv-info-infos nv-info-infos--luogo' }, righe);
  }

  function versioneLuogo(s) {
    var pagina = NV.pagina('nv-info nv-info--luogo', [
      striscia(s),
      titoloLuogo(s),
      azioniRapide(s),
      compitoBlocco(s, 'riga'),
      elencoLuogo(s),
      descrizione(s),
      punti(s, 'pastiglie'),
      programma(s, 3),
      docenti(s),
      recensioni(s, { barre: true, max: 2 }),
      pieDiPagina()
    ]);
    var barra = NV.barra({
      indietro: 'attivita',
      classe: 'nv-info-barra--fissa',
      azioni: [NV.iconBtn('ellipsis', 'Altre opzioni', function () { foglioMenu(s); })]
    });
    return [barra, pagina, barraAzioni(s, 'piena')];
  }

  /* ==================================================================
     IL RENDERER
     ================================================================== */
  window.NavidaRender.screens.nvScheda = function (screen) {
    var o = NV.opportunita(NV.contesto().opportunita) || NV.opportunita('googleux');
    var s = {
      screen: screen,
      o: o,
      cat: NV.categoria(o.categoria),
      tipo: TIPI[o.categoria] || 'corso',
      compito: compitoDi(o),
      /* chi deve ridisegnarsi quando cambia "fatto" o "salvato" */
      suFatto: [],
      suSalva: []
    };
    var v = NV.variante(screen.id);
    var nodi = v === 'schede' ? versioneSchede(s) : v === 'luogo' ? versioneLuogo(s) : versioneCopertina(s);

    /* pannello di prova aperto da solo: &foglio=contatta */
    var foglio = parametro('foglio');
    if (foglio && FOGLI[foglio]) setTimeout(function () { FOGLI[foglio](s); }, 0);
    return nodi;
  };
})();
