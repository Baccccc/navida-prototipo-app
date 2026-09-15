/* ==========================================================================
   NAVIDA — Dettaglio dello step
   ==========================================================================
   Si apre toccando uno step nella linea di carriera. In alto dice che step
   e', a cosa serve e quanto dura; sotto elenca le attivita' da fare per
   completarlo (non corsi: i passi veri, "prendi un diploma", "fai sei mesi
   in uno studio"), ognuna con l'etichetta Obbligatoria o Facoltativa.
   Toccando un'attivita' si apre la scheda attivita' con i posti dove farla.

   Da qui si passa agli altri step con le frecce, le linguette, i pallini o
   con uno swipe orizzontale (dito o mouse). Lo swipe non blocca lo
   scorrimento verticale: la pagina ha touch-action: pan-y.

   Tre versioni (pannello "Versione"):
     base        Lista chiara: linguette degli step, testata, righe divise
                 in obbligatorie e facoltative
     checklist   Checklist: testata con la sfumatura, spunte grandi,
                 prossimo passo e filtro Tutte / Obbligatorie / Facoltative
     carosello   Carosello: gli step come carte da sfogliare di lato,
                 le attivita' sotto come tessere

   Prove:
     fase3.html?screen=step&step=2&variant=base
     fase3.html?screen=step&step=1&variant=checklist&filtro=facoltative
     fase3.html?screen=step&step=5&variant=carosello

   Stile: css/app/step.css (classi nv-step-*)
   ========================================================================== */

(function () {
  'use strict';

  var NV = window.NV, h = NV.h, icon = NV.icon, ICO = NV.ICO;

  /* Freccia doppia orizzontale per il suggerimento "scorri" (Lucide). */
  NV.icone({
    'move-horizontal': '<path d="m18 8 4 4-4 4"/><path d="M2 12h20"/><path d="m6 8-4 4 4 4"/>'
  });

  window.NAVIDA_PAGE_VARIANTS = window.NAVIDA_PAGE_VARIANTS || {};
  window.NAVIDA_PAGE_VARIANTS.step = {
    etichetta: 'Versione del dettaglio step',
    predefinita: 'base',
    options: [
      { value: 'base', label: 'Lista chiara' },
      { value: 'checklist', label: 'Checklist' },
      { value: 'carosello', label: 'Carosello' }
    ]
  };

  /* Quanti pixel di trascinamento servono per cambiare step. Sotto la
     soglia la pagina torna al suo posto; un colpo veloce basta anche piu'
     corto, come sui telefoni veri. */
  var SOGLIA = 64;
  var SOGLIA_VELOCE = 28;
  var TEMPO_VELOCE = 260;
  /* Durata dello scatto delle carte e dell'uscita del contenuto (ms). */
  var SCATTO = 300;
  var USCITA = 160;

  /* Da che lato entra lo step nuovo dopo uno swipe o una freccia:
     1 = da destra (step dopo), -1 = da sinistra (step prima), 0 = normale. */
  var entrata = 0;

  /* Filtro della checklist. Resta uguale passando da uno step all'altro.
     Per le prove: &filtro=obbligatorie */
  var FILTRI = ['tutte', 'obbligatorie', 'facoltative'];
  var filtro = 'tutte';
  try {
    var dalLink = new URLSearchParams(window.location.search).get('filtro');
    if (FILTRI.indexOf(dalLink) > -1) filtro = dalLink;
  } catch (e) {}

  /* ==================================================================
     DATI E NAVIGAZIONE
     ================================================================== */

  function totaleStep() { return NV.steps().length; }

  function indiceAperto() {
    var i = parseInt(NV.contesto().step, 10);
    return Math.max(0, Math.min(totaleStep() - 1, isNaN(i) ? 0 : i));
  }

  /** Apre un altro step ridisegnando la schermata. dir dice da che lato entra. */
  function vaiStep(j, dir) {
    var i = indiceAperto();
    if (j < 0 || j >= totaleStep() || j === i) return;
    entrata = dir || (j > i ? 1 : -1);
    NV.aggiorna({ step: j });
  }

  /**
   * Che cos'e' questo step per te. Conta la posizione rispetto allo step in
   * cui sei davvero, non solo il campo stato: cosi' uno step futuro dice
   * sempre chiaramente che non e' ancora il tuo.
   */
  function statoStep(s, j) {
    var mio = NV.stepAttuale();
    if (j === mio) return { chiave: 'attuale', etichetta: 'Sei qui', icona: 'navigation' };
    if (s.stato === 'traguardo') return { chiave: 'traguardo', etichetta: 'Traguardo', icona: 'trophy' };
    if (j < mio || s.stato === 'fatto') return { chiave: 'fatto', etichetta: 'Completato', icona: 'check' };
    return { chiave: 'da-fare', etichetta: 'Più avanti', icona: 'lock' };
  }

  function statoCompito(c) {
    return NV.STATI_COMPITO[c.stato] || NV.STATI_COMPITO['da-fare'];
  }

  /** Obbligatorie prima, nell'ordine in cui le ha messe il percorso. */
  function perObbligo(lista) {
    return lista.filter(function (c) { return c.obbligatoria; })
      .concat(lista.filter(function (c) { return !c.obbligatoria; }));
  }

  function quantiSuggerimenti(c) {
    return NV.opportunitaPer({ compito: c.id }).length;
  }

  function testoSuggerimenti(c) {
    var n = quantiSuggerimenti(c);
    if (!n) return 'Suggerimenti in arrivo';
    return n === 1 ? '1 suggerimento' : n + ' suggerimenti';
  }

  function plurale(n, uno, tanti) { return n + ' ' + (n === 1 ? uno : tanti); }

  /* ==================================================================
     SWIPE ORIZZONTALE
     ------------------------------------------------------------------
     Pointer events: valgono per il dito e per il mouse (il prototipo si
     prova anche su desktop). Si decide la direzione dopo i primi 10px:
     se il gesto e' verticale lo lascia al browser e la pagina scorre.
       azioni.muovi(dx)   mentre il dito si sposta
       azioni.lascia(dir) al rilascio: 1 step dopo, -1 step prima, 0 niente
     ================================================================== */
  function abilitaSwipe(zona, azioni) {
    var id = null, x0 = 0, y0 = 0, t0 = 0, dx = 0;
    var orizzontale = null;
    var trascinato = false;

    zona.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = Date.now();
      dx = 0; orizzontale = null; trascinato = false;
    });

    zona.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var mx = e.clientX - x0, my = e.clientY - y0;
      if (orizzontale === null) {
        if (Math.abs(mx) < 10 && Math.abs(my) < 10) return;
        orizzontale = Math.abs(mx) > Math.abs(my) * 1.2;
        if (!orizzontale) { id = null; return; }
        trascinato = true;
        zona.classList.add('is-trascina');
        try { zona.setPointerCapture(e.pointerId); } catch (err) {}
        try { window.getSelection().removeAllRanges(); } catch (err) {}
      }
      dx = mx;
      azioni.muovi(dx);
    });

    function fine(e, annullato) {
      if (e.pointerId !== id) return;
      id = null;
      if (!trascinato) return;
      zona.classList.remove('is-trascina');
      var veloce = Date.now() - t0 < TEMPO_VELOCE && Math.abs(dx) > SOGLIA_VELOCE;
      var dir = !annullato && (Math.abs(dx) > SOGLIA || veloce) ? (dx < 0 ? 1 : -1) : 0;
      azioni.lascia(dir);
    }
    zona.addEventListener('pointerup', function (e) { fine(e, false); });
    zona.addEventListener('pointercancel', function (e) { fine(e, true); });

    /* Dopo un trascinamento il rilascio non deve aprire la riga sotto al dito. */
    zona.addEventListener('click', function (e) {
      if (!trascinato) return;
      trascinato = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  /** Swipe delle versioni a pagina: il contenuto segue il dito e poi esce di lato. */
  function swipePagina(corpo, i) {
    var n = totaleStep();
    return {
      muovi: function (dx) {
        var fuori = (dx > 0 && i === 0) || (dx < 0 && i === n - 1);
        var x = dx * (fuori ? 0.15 : 0.45);
        corpo.classList.remove('is-scatta');
        corpo.style.transform = 'translateX(' + x + 'px)';
        corpo.style.opacity = String(Math.max(0.5, 1 - Math.abs(x) / 260));
      },
      lascia: function (dir) {
        var j = i + dir;
        corpo.classList.add('is-scatta');
        if (dir && j >= 0 && j < n) {
          corpo.style.transform = 'translateX(' + (-dir * 48) + 'px)';
          corpo.style.opacity = '0';
          setTimeout(function () { vaiStep(j, dir); }, USCITA);
        } else {
          corpo.style.transform = '';
          corpo.style.opacity = '';
        }
      }
    };
  }

  /* ==================================================================
     PEZZI COMUNI
     ================================================================== */

  /** Etichetta dello step: Sei qui / Più avanti / Completato / Traguardo. */
  function tagStato(st, sopraSfumatura) {
    return h('span', {
      class: 'nv-tag nv-step-tag nv-step-tag--' + st.chiave + (sopraSfumatura ? ' nv-step-tag--chiaro' : '')
    }, [icon(st.icona, ICO.SM), h('span', { text: st.etichetta })]);
  }

  /** Fatto / In corso / Da fare, piccolo e colorato. */
  function statoInRiga(c, conIcona) {
    var sc = statoCompito(c);
    return h('span', { class: 'nv-step-stato nv-step-stato--' + (c.stato || 'da-fare') }, [
      conIcona ? icon(sc.icona, ICO.SM) : null,
      h('span', { text: sc.etichetta })
    ]);
  }

  function nota(c) {
    if (!c.nota || c.stato === 'fatto') return null;
    return h('span', { class: 'nv-step-nota' }, [icon('calendar', ICO.SM), h('span', { text: c.nota })]);
  }

  /** Pulsante tondo da 44 per lo step prima o dopo. */
  function freccia(dir, i) {
    var j = i + dir;
    var ok = j >= 0 && j < totaleStep();
    var etichetta = dir < 0 ? 'Step precedente' : 'Step successivo';
    return h('button', {
      class: 'nv-iconbtn nv-step-freccia',
      type: 'button',
      'aria-label': etichetta,
      title: etichetta,
      disabled: ok ? null : true,
      onclick: ok ? function () { vaiStep(j, dir); } : null
    }, [icon(dir < 0 ? 'chevron-left' : 'chevron-right', ICO.LG)]);
  }

  /** Pallini degli step: quello aperto e' una lineetta blu, il tuo ha l'anello. */
  function pallini(i, alTocco) {
    var mio = NV.stepAttuale();
    return h('div', { class: 'nv-step-pallini', role: 'tablist', 'aria-label': 'Step del percorso' }, NV.steps().map(function (s, j) {
      var on = j === i;
      return h('button', {
        class: 'nv-step-pallini__voce' + (on ? ' is-attivo' : '') + (j === mio ? ' is-mio' : ''),
        type: 'button',
        role: 'tab',
        'aria-selected': on ? 'true' : 'false',
        'aria-label': 'Step ' + (j + 1) + ': ' + s.titolo + (j === mio ? ' (sei qui)' : ''),
        onclick: function () { if (j !== indiceAperto()) (alTocco || vaiStep)(j); }
      }, [h('span', { class: 'nv-step-pallini__segno' })]);
    }));
  }

  /** Riquadro per gli step che non sono ancora il tuo. */
  function avvisoFuturo(screen, s, i, st) {
    if (st.chiave !== 'da-fare' && st.chiave !== 'traguardo') return null;
    var mio = NV.stepAttuale();
    var traguardo = st.chiave === 'traguardo';
    var testo = traguardo
      ? 'Mancano ' + plurale(i - mio, 'step', 'step') + ' per arrivarci. Guardalo per sapere dove stai andando.'
      : 'Ci arrivi dopo “' + NV.step(i - 1).titolo + '”. Guardalo per prepararti.';
    return h('div', { class: 'nv-tile nv-step-avviso' + (traguardo ? ' nv-step-avviso--traguardo' : '') }, [
      NV.icoChip(traguardo ? 'flag' : 'lock', traguardo ? 4 : 'neutro'),
      h('div', { class: 'nv-step-avviso__copy' }, [
        traguardo
          ? NV.testo(screen, 'traguardoTitolo', 'È il tuo traguardo', 'strong', 'nv-step-avviso__titolo')
          : NV.testo(screen, 'futuroTitolo', 'Non è ancora il tuo step', 'strong', 'nv-step-avviso__titolo'),
        h('p', { class: 'nv-step-avviso__testo', text: testo }),
        h('button', { class: 'nv-link nv-step-avviso__link', type: 'button', onclick: function () { vaiStep(mio); } }, [
          NV.testo(screen, 'tornaMio', 'Torna al tuo step', 'span'),
          icon('chevron-right', ICO.SM)
        ])
      ])
    ]);
  }

  /** Chiusura dell'ultimo step: la mascotte con il trofeo. */
  function arrivo(screen, s) {
    return h('div', { class: 'nv-step-arrivo' }, [
      NV.mascotte('trofeo', 'nv-step-arrivo__mascotte'),
      h('div', { class: 'nv-step-arrivo__copy' }, [
        NV.testo(screen, 'arrivoTitolo', 'Qui arrivi dove volevi', 'strong', 'nv-step-arrivo__titolo'),
        h('p', { class: 'nv-step-arrivo__testo', text: 'Diventi ' + s.titolo + '.' }),
        s.stipendio ? NV.meta('euro', s.stipendio.replace('€ ', '')) : null
      ])
    ]);
  }

  function competenze(s) {
    if (!s.competenze || !s.competenze.length) return null;
    return h('ul', { class: 'nv-step-competenze' }, s.competenze.map(function (nome) {
      return h('li', { class: 'nv-step-competenza', text: nome });
    }));
  }

  /* ==================================================================
     VERSIONE 1 · LISTA CHIARA
     ================================================================== */

  /** Linguette degli step: numero, spunta se fatto, coppa per il traguardo. */
  function linguette(i) {
    var mio = NV.stepAttuale();
    return h('div', { class: 'nv-step-tabs', role: 'tablist', 'aria-label': 'Step del percorso' }, NV.steps().map(function (s, j) {
      var st = statoStep(s, j);
      var on = j === i;
      var segno = st.chiave === 'fatto' ? icon('check', ICO.SM)
        : st.chiave === 'traguardo' ? icon('trophy', ICO.SM)
        : h('span', { text: String(j + 1) });
      return h('button', {
        class: 'nv-step-tabs__voce is-' + st.chiave + (on ? ' is-aperta' : ''),
        type: 'button',
        role: 'tab',
        'aria-selected': on ? 'true' : 'false',
        'aria-label': 'Step ' + (j + 1) + ': ' + s.titolo + (j === mio ? ' (sei qui)' : ''),
        onclick: on ? null : function () { vaiStep(j); }
      }, [segno, j === mio ? h('span', { class: 'nv-step-tabs__qui', 'aria-hidden': 'true' }) : null]);
    }));
  }

  function dato(etichetta, valore) {
    return h('div', { class: 'nv-dato' }, [h('small', { text: etichetta }), h('strong', { text: valore })]);
  }

  function rigaBase(c) {
    var cat = NV.categoria(c.categoria);
    var fatto = c.stato === 'fatto';
    return h('button', {
      class: 'nv-row nv-press nv-step-riga is-' + (c.stato || 'da-fare'),
      type: 'button',
      onclick: function () { NV.apriCompito(c.id); }
    }, [
      fatto ? NV.icoChip('check', 'ok') : NV.icoChip(cat.icona, cat.tono),
      h('span', { class: 'nv-row__copy' }, [
        h('span', { class: 'nv-step-riga__su' }, [NV.tag(c.obbligatoria), statoInRiga(c, true)]),
        h('span', { class: 'nv-row__title', text: c.titolo }),
        h('span', { class: 'nv-step-riga__meta' }, [
          h('span', { text: cat.etichetta }),
          h('span', { text: c.durata })
        ]),
        nota(c)
      ]),
      h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.MD)])
    ]);
  }

  function gruppoBase(screen, chiave, titolo, lista) {
    if (!lista.length) return null;
    var fatti = lista.filter(function (c) { return c.stato === 'fatto'; }).length;
    return h('div', { class: 'nv-step-gruppo' }, [
      h('div', { class: 'nv-step-gruppo__testa' }, [
        NV.testo(screen, chiave, titolo, 'h3', 'nv-step-gruppo__titolo'),
        h('span', { class: 'nv-step-gruppo__conto', text: fatti + ' di ' + lista.length + (lista.length === 1 ? ' fatta' : ' fatte') })
      ]),
      h('div', { class: 'nv-list' }, lista.map(rigaBase))
    ]);
  }

  function corpoBase(screen, s, i, st) {
    var n = totaleStep();
    var k = NV.conteggio(s);
    var compiti = s.compiti || [];
    var traguardo = s.tipo === 'Traguardo';

    var dopo = null;
    if (i < n - 1) {
      var prossimo = NV.step(i + 1);
      dopo = h('button', { class: 'nv-tile nv-press nv-step-dopo', type: 'button', onclick: function () { vaiStep(i + 1, 1); } }, [
        h('span', { class: 'nv-step-dopo__copy' }, [
          NV.testo(screen, 'dopo', 'Dopo questo step', 'span', 'nv-eyebrow'),
          h('span', { class: 'nv-step-dopo__titolo', text: prossimo.titolo })
        ]),
        h('span', { class: 'nv-step-dopo__vai', 'aria-hidden': 'true' }, [icon('arrow-right', ICO.MD)])
      ]);
    }

    return h('div', { class: 'nv-step-corpo' }, [
      h('header', { class: 'nv-step-testata' }, [
        h('div', { class: 'nv-step-testata__su' }, [
          tagStato(st),
          traguardo ? null : h('span', { class: 'nv-step-testata__tipo', text: s.tipo })
        ]),
        h('h1', { class: 'nv-title', text: s.titolo }),
        h('p', { class: 'nv-lead', text: s.obiettivo })
      ]),
      avvisoFuturo(screen, s, i, st),
      h('div', { class: 'nv-tile nv-step-dati' }, [
        h('p', { class: 'nv-body', text: s.descrizione }),
        h('div', { class: 'nv-step-dati__griglia' }, [
          /* il traguardo non ha una durata: si dice quanto manca */
          traguardo ? dato('Mancano', plurale(Math.max(0, i - NV.stepAttuale()), 'step', 'step')) : dato('Durata', s.durata),
          dato('Attività fatte', k.fatti + ' di ' + k.totali),
          dato('Obbligatorie', k.obbligatorieFatte + ' di ' + k.obbligatorie)
        ]),
        !traguardo && s.stipendio ? NV.meta('euro', s.stipendio.replace('€ ', '')) : null,
        /* Le competenze qui sono una frase, non pastiglie: stanno in due
           righe e lasciano salire le attivita' sopra la piega. */
        s.competenze && s.competenze.length ? h('p', { class: 'nv-step-dati__impari' }, [
          NV.testo(screen, 'cosaImpari', 'Cosa impari', 'span', 'nv-step-dati__label'),
          h('span', { text: s.competenze.join(', ') })
        ]) : null
      ]),
      h('section', { class: 'nv-step-sezione' }, [
        h('div', { class: 'nv-step-sezione__testa' }, [
          NV.testo(screen, 'cosaFare', 'Cosa fare in questo step', 'h2', 'nv-step-sezione__titolo'),
          NV.testo(screen, 'cosaFareSub', 'Tocca un’attività per vedere dove e come farla.', 'p', 'nv-step-sezione__sub')
        ]),
        gruppoBase(screen, 'obbligatorie', 'Obbligatorie', compiti.filter(function (c) { return c.obbligatoria; })),
        gruppoBase(screen, 'facoltative', 'Facoltative', compiti.filter(function (c) { return !c.obbligatoria; }))
      ]),
      dopo || arrivo(screen, s)
    ]);
  }

  /* ==================================================================
     VERSIONE 2 · CHECKLIST CON AVANZAMENTO
     ================================================================== */

  function voceCheck(c) {
    var cat = NV.categoria(c.categoria);
    return h('button', {
      class: 'nv-press nv-step-voce is-' + (c.stato || 'da-fare'),
      type: 'button',
      onclick: function () { NV.apriCompito(c.id); }
    }, [
      h('span', { class: 'nv-step-spunta nv-step-spunta--' + (c.stato || 'da-fare'), 'aria-hidden': 'true' }, [
        c.stato === 'fatto' ? icon('check', ICO.SM) : null
      ]),
      h('span', { class: 'nv-step-voce__copy' }, [
        h('span', { class: 'nv-step-voce__titolo', text: c.titolo }),
        h('span', { class: 'nv-step-voce__meta' }, [
          icon(cat.icona, ICO.SM),
          h('span', { text: cat.etichetta + ' · ' + c.durata })
        ]),
        h('span', { class: 'nv-step-voce__tags' }, [NV.tag(c.obbligatoria), statoInRiga(c, false)]),
        nota(c)
      ]),
      h('span', { class: 'nv-row__chev' }, [icon('chevron-right', ICO.MD)])
    ]);
  }

  function gruppoCheck(screen, chiave, titolo, lista) {
    return h('div', { class: 'nv-step-gruppo' }, [
      h('div', { class: 'nv-step-gruppo__testa' }, [
        NV.testo(screen, chiave, titolo, 'h3', 'nv-step-gruppo__titolo'),
        h('span', { class: 'nv-step-gruppo__conto', text: String(lista.length) })
      ]),
      h('div', { class: 'nv-step-check' }, lista.map(voceCheck))
    ]);
  }

  /** La prima obbligatoria in corso, altrimenti la prima da fare. */
  function prossimoPasso(s) {
    var aperti = (s.compiti || []).filter(function (c) { return c.stato !== 'fatto'; });
    var ordine = { 'in-corso': 0, 'da-fare': 1 };
    aperti.sort(function (a, b) {
      return (b.obbligatoria - a.obbligatoria) || ((ordine[a.stato] || 0) - (ordine[b.stato] || 0));
    });
    return aperti[0] || null;
  }

  function cartaPasso(screen, c) {
    var n = quantiSuggerimenti(c);
    return h('section', { class: 'nv-card nv-step-passo' }, [
      h('div', { class: 'nv-step-passo__su' }, [
        NV.testo(screen, 'passoOcchiello', 'Il tuo prossimo passo', 'span', 'nv-eyebrow'),
        NV.tag(c.obbligatoria)
      ]),
      h('strong', { class: 'nv-step-passo__titolo', text: c.titolo }),
      c.nota ? nota(c) : h('p', { class: 'nv-body', text: c.descrizione }),
      NV.pulsante(n ? (n === 1 ? 'Vedi il suggerimento' : 'Vedi i ' + n + ' suggerimenti') : 'Apri l’attività', {
        iconaDopo: 'arrow-right',
        onclick: function () { NV.apriCompito(c.id); }
      })
    ]);
  }

  function corpoChecklist(screen, s, i, st) {
    var n = totaleStep();
    var k = NV.conteggio(s);
    var compiti = s.compiti || [];
    var sfumatura = st.chiave === 'attuale' || st.chiave === 'traguardo';
    var traguardo = s.tipo === 'Traguardo';

    var testa = h('section', { class: 'nv-step-testa' + (sfumatura ? ' nv-hero' : ' nv-step-testa--spenta') }, [
      h('div', { class: 'nv-step-testa__su' }, [
        tagStato(st, sfumatura),
        h('div', { class: 'nv-step-testa__frecce' }, [freccia(-1, i), freccia(1, i)])
      ]),
      h('span', { class: 'nv-step-testa__occhiello', text: 'Step ' + (i + 1) + ' di ' + n + (traguardo ? '' : ' · ' + s.tipo + ' · ' + s.durata) }),
      h('h1', { class: 'nv-step-testa__titolo', text: s.titolo }),
      h('p', { class: 'nv-step-testa__obiettivo', text: s.obiettivo }),
      h('div', { class: 'nv-step-testa__conto' }, [
        h('span', {}, [h('strong', { text: k.fatti + ' di ' + k.totali }), ' attività fatte']),
        h('span', { text: 'Obbligatorie ' + k.obbligatorieFatte + ' di ' + k.obbligatorie })
      ]),
      NV.avanzamento(k.fatti, k.totali, sfumatura)
    ]);

    var filtroBox = h('div', { class: 'nv-step-filtro' });
    var listaBox = h('div', { class: 'nv-step-liste' });

    /* Il filtro ridisegna solo l'elenco: niente salto in cima alla pagina. */
    function disegna() {
      filtroBox.innerHTML = '';
      filtroBox.appendChild(NV.segmenti([
        { value: 'tutte', label: 'Tutte' },
        { value: 'obbligatorie', label: 'Obbligatorie' },
        { value: 'facoltative', label: 'Facoltative' }
      ], filtro, function (val) { filtro = val; disegna(); }, 'nv-seg--piena'));

      listaBox.innerHTML = '';
      var scelti = compiti.filter(function (c) {
        return filtro === 'tutte' || (filtro === 'obbligatorie') === !!c.obbligatoria;
      });
      var ordine = { 'in-corso': 0, 'da-fare': 1, 'fatto': 2 };
      scelti.sort(function (a, b) {
        return ((ordine[a.stato] || 0) - (ordine[b.stato] || 0)) || (b.obbligatoria - a.obbligatoria);
      });
      var aperti = scelti.filter(function (c) { return c.stato !== 'fatto'; });
      var chiusi = scelti.filter(function (c) { return c.stato === 'fatto'; });

      if (!scelti.length) {
        listaBox.appendChild(h('p', {
          class: 'nv-tile nv-step-vuoto',
          text: 'In questo step non ci sono attività ' + (filtro === 'facoltative' ? 'facoltative' : 'obbligatorie') + '.'
        }));
      }
      if (aperti.length) listaBox.appendChild(gruppoCheck(screen, 'daFare', 'Da fare', aperti));
      if (chiusi.length) listaBox.appendChild(gruppoCheck(screen, 'fatte', 'Fatte', chiusi));
    }
    disegna();

    var passo = st.chiave === 'attuale' ? prossimoPasso(s) : null;

    return h('div', { class: 'nv-step-corpo' }, [
      testa,
      avvisoFuturo(screen, s, i, st),
      passo ? cartaPasso(screen, passo) : null,
      h('section', { class: 'nv-step-sezione' }, [
        h('div', { class: 'nv-step-sezione__testa' }, [
          NV.testo(screen, 'checklistTitolo', 'Le attività dello step', 'h2', 'nv-step-sezione__titolo'),
          h('p', { class: 'nv-step-sezione__sub', text: s.descrizione })
        ]),
        filtroBox,
        listaBox
      ]),
      i === n - 1 ? arrivo(screen, s) : null
    ]);
  }

  /* ==================================================================
     VERSIONE 3 · CAROSELLO DI STEP
     ================================================================== */

  function cartaStep(s, j, i, alTocco) {
    var st = statoStep(s, j);
    var k = NV.conteggio(s);
    var sfumatura = st.chiave === 'attuale';
    var aperta = j === i;
    return h('button', {
      class: 'nv-step-carta is-' + st.chiave + (aperta ? ' is-aperta' : '') + (sfumatura ? ' nv-hero' : ''),
      type: 'button',
      'aria-current': aperta ? 'true' : null,
      'aria-label': 'Step ' + (j + 1) + ': ' + s.titolo + ', ' + st.etichetta,
      onclick: aperta ? null : alTocco
    }, [
      h('span', { class: 'nv-step-carta__su' }, [
        h('span', { class: 'nv-step-carta__num', text: String(j + 1) }),
        tagStato(st, sfumatura),
        h('span', { class: 'nv-step-carta__ico', 'aria-hidden': 'true' }, [icon(s.icona, ICO.MD)])
      ]),
      h('span', { class: 'nv-step-carta__titolo', text: s.titolo }),
      h('span', { class: 'nv-step-carta__meta', text: s.tipo === 'Traguardo' ? 'Il lavoro che hai scelto' : s.tipo + ' · ' + s.durata }),
      h('span', { class: 'nv-step-carta__giu' }, [
        h('span', { class: 'nv-step-carta__conto', text: k.fatti + ' di ' + k.totali + ' attività fatte' }),
        NV.avanzamento(k.fatti, k.totali, sfumatura)
      ])
    ]);
  }

  function tessera(c) {
    var cat = NV.categoria(c.categoria);
    return h('button', {
      class: 'nv-press nv-step-tessera is-' + (c.stato || 'da-fare'),
      type: 'button',
      onclick: function () { NV.apriCompito(c.id); }
    }, [
      h('span', { class: 'nv-step-tessera__su' }, [
        c.stato === 'fatto' ? NV.icoChip('check', 'ok') : NV.icoChip(cat.icona, cat.tono),
        statoInRiga(c, false)
      ]),
      h('span', { class: 'nv-step-tessera__titolo', text: c.titolo }),
      h('span', { class: 'nv-step-tessera__meta', text: cat.etichetta + ' · ' + c.durata }),
      NV.tag(c.obbligatoria)
    ]);
  }

  function corpoCarosello(screen, s, i, st) {
    var n = totaleStep();
    var k = NV.conteggio(s);
    var inViaggio = false;
    var traccia, sotto, puntini;

    /* Le carte scattano sullo step scelto, poi la schermata si ridisegna
       gia' ferma su quello: la traccia nuova parte nella stessa posizione. */
    function scorriA(j, dir) {
      if (inViaggio) return;
      if (j < 0 || j >= n || j === i) { rimbalza(); return; }
      inViaggio = true;
      traccia.classList.add('is-scatta');
      traccia.style.setProperty('--nv-step-i', String(j));
      traccia.style.setProperty('--nv-step-dx', '0px');
      sotto.style.opacity = '';
      sotto.classList.add('is-via');
      Array.prototype.forEach.call(puntini.children, function (b, x) { b.classList.toggle('is-attivo', x === j); });
      setTimeout(function () { vaiStep(j, dir || (j > i ? 1 : -1)); }, SCATTO);
    }
    function rimbalza() {
      traccia.classList.add('is-scatta');
      traccia.style.setProperty('--nv-step-dx', '0px');
      sotto.style.opacity = '';
    }

    traccia = h('div', { class: 'nv-step-traccia', style: '--nv-step-i:' + i }, NV.steps().map(function (sj, j) {
      return cartaStep(sj, j, i, function () { scorriA(j); });
    }));
    puntini = pallini(i, function (j) { scorriA(j); });

    var extra = h('div', { class: 'nv-step-extra', hidden: true }, [
      h('p', { class: 'nv-body', text: s.descrizione }),
      competenze(s)
    ]);
    var leggiTesto = h('span', { text: 'Leggi tutto' });
    var leggi = h('button', {
      class: 'nv-link nv-step-leggi',
      type: 'button',
      'aria-expanded': 'false',
      onclick: function () {
        var apri = extra.hidden;
        extra.hidden = !apri;
        leggi.setAttribute('aria-expanded', apri ? 'true' : 'false');
        leggiTesto.textContent = apri ? 'Mostra meno' : 'Leggi tutto';
      }
    }, [leggiTesto, icon('chevron-down', ICO.SM)]);

    var facoltative = k.totali - k.obbligatorie;
    var conto = [plurale(k.obbligatorie, 'obbligatoria', 'obbligatorie')];
    if (facoltative) conto.push(plurale(facoltative, 'facoltativa', 'facoltative'));

    sotto = h('div', { class: 'nv-step-sotto' }, [
      h('div', { class: 'nv-step-intro' }, [
        h('p', { class: 'nv-lead nv-step-intro__obiettivo', text: s.obiettivo }),
        extra,
        leggi
      ]),
      avvisoFuturo(screen, s, i, st),
      h('section', { class: 'nv-step-sezione' }, [
        h('div', { class: 'nv-step-sezione__testa nv-step-sezione__testa--riga' }, [
          NV.testo(screen, 'caroselloTitolo', 'Cosa fare', 'h2', 'nv-step-sezione__titolo'),
          h('span', { class: 'nv-step-gruppo__conto', text: conto.join(' · ') })
        ]),
        h('div', { class: 'nv-step-tessere' }, perObbligo(s.compiti || []).map(tessera))
      ]),
      i === n - 1 ? arrivo(screen, s) : null
    ]);

    var nodo = h('div', { class: 'nv-step-corpo' }, [
      h('div', { class: 'nv-step-giostra' }, [
        h('div', { class: 'nv-step-vista' }, [traccia]),
        h('div', { class: 'nv-step-guida' }, [
          puntini,
          h('span', { class: 'nv-step-guida__testo' }, [
            icon('move-horizontal', ICO.SM),
            NV.testo(screen, 'scorri', 'Scorri per cambiare step', 'span')
          ])
        ])
      ]),
      sotto
    ]);

    return {
      nodo: nodo,
      swipe: {
        muovi: function (dx) {
          if (inViaggio) return;
          var fuori = (dx > 0 && i === 0) || (dx < 0 && i === n - 1);
          traccia.classList.remove('is-scatta');
          traccia.style.setProperty('--nv-step-dx', (fuori ? dx * 0.3 : dx) + 'px');
          sotto.style.opacity = String(Math.max(0.3, 1 - Math.abs(dx) / 240));
        },
        lascia: function (dir) {
          if (inViaggio) return;
          if (dir) scorriA(i + dir, dir);
          else rimbalza();
        }
      }
    };
  }

  /* ==================================================================
     PROVA DELLO SWIPE (per le catture senza dito)
     ------------------------------------------------------------------
       &swipe=-140     trascina di 140px verso sinistra e rilascia: step dopo
       &trascina=-90   trascina e resta fermo: si vede il contenuto a meta'
     Parte una volta sola, altrimenti ogni ridisegno rifarebbe lo swipe.
     ================================================================== */
  var provaFatta = false;
  function provaSwipe(pagina) {
    if (provaFatta) return;
    var qs;
    try { qs = new URLSearchParams(window.location.search); } catch (e) { return; }
    var rilascia = qs.has('swipe');
    var dx = parseInt(qs.get(rilascia ? 'swipe' : 'trascina'), 10);
    if (isNaN(dx)) return;
    provaFatta = true;
    setTimeout(function () {
      function evento(tipo, x) {
        pagina.dispatchEvent(new PointerEvent(tipo, {
          bubbles: true, cancelable: true, pointerId: 7, pointerType: 'mouse', button: 0, clientX: x, clientY: 400
        }));
      }
      evento('pointerdown', 200);
      [0.1, 0.3, 0.6, 1].forEach(function (f) { evento('pointermove', 200 + dx * f); });
      if (rilascia) evento('pointerup', 200 + dx);
    }, 300);
  }

  /* ==================================================================
     LA SCHERMATA
     ================================================================== */

  window.NavidaRender.screens.nvStep = function (screen) {
    var v = NV.variante(screen.id) || 'base';
    var n = totaleStep();
    var i = indiceAperto();
    var s = NV.step(i);
    var st = statoStep(s, i);
    var dir = entrata;
    entrata = 0;

    var classi = 'nv-step nv-step--' + v +
      (dir ? ' nv-step--entra nv-step--da-' + (dir > 0 ? 'destra' : 'sinistra') : '');
    var titoloBarra = 'Step ' + (i + 1) + ' di ' + n;
    var pagina, corpo;

    if (v === 'carosello') {
      var c = corpoCarosello(screen, s, i, st);
      pagina = NV.pagina(classi, [NV.barra({ indietro: 'percorso', titolo: titoloBarra }), c.nodo]);
      abilitaSwipe(pagina, c.swipe);
      provaSwipe(pagina);
      return [pagina];
    }

    if (v === 'checklist') {
      corpo = corpoChecklist(screen, s, i, st);
      /* Nella checklist i pallini stanno nella barra, al posto del titolo. */
      var barra = NV.barra({ indietro: 'percorso' });
      var spazio = barra.querySelector('.nv-bar__spazio');
      if (spazio) barra.replaceChild(pallini(i), spazio);
      pagina = NV.pagina(classi, [barra, corpo]);
    } else {
      corpo = corpoBase(screen, s, i, st);
      pagina = NV.pagina(classi, [NV.barra({ indietro: 'percorso', titolo: titoloBarra }), linguette(i), corpo]);
    }

    abilitaSwipe(pagina, swipePagina(corpo, i));
    provaSwipe(pagina);
    return [pagina];
  };
})();
